import path from 'path';
import { query, getClient } from '../../config/db.js';
import { computeFileHash } from './hasher.js';
import { parseDocument } from './parser.js';
import { chunkDocumentPages } from './chunker.js';
import { generateBatchEmbeddings } from '../rag/embeddingService.js';
import { logAudit } from '../audit/auditService.js';

/**
 * Executes the complete document processing pipeline asynchronously.
 * Upload -> Validate -> Hash -> Parse Pages -> Chunk -> Embed -> Store -> Mark READY
 * @param {string} documentId
 * @param {string} filePath
 * @param {string} mimeType
 * @param {string} userId
 * @param {string} matterId
 */
export async function processDocumentPipeline(documentId, filePath, mimeType, userId, matterId) {
  console.log(`[Document Pipeline] Starting processing for document ${documentId}...`);
  
  // Set status to PROCESSING
  await query(
    `UPDATE documents 
     SET processing_status = 'PROCESSING', updated_at = NOW() 
     WHERE id = $1`,
    [documentId]
  );

  const client = await getClient();

  try {
    // 1. Calculate document SHA-256 hash
    const fileHash = await computeFileHash(filePath);

    // 2. Parse document into pages
    const parsedPages = await parseDocument(filePath, mimeType);
    if (!parsedPages || parsedPages.length === 0) {
      throw new Error('Document produced 0 extractable pages.');
    }

    await client.query('BEGIN');

    // Clean up any existing pages and chunks if reprocessing
    await client.query('DELETE FROM document_pages WHERE document_id = $1', [documentId]);
    await client.query('DELETE FROM document_chunks WHERE document_id = $1', [documentId]);

    // 3. Store document pages and capture page IDs
    const storedPages = [];
    for (const page of parsedPages) {
      const pageResult = await client.query(
        `INSERT INTO document_pages (document_id, page_number, extracted_text)
         VALUES ($1, $2, $3)
         RETURNING id, page_number, extracted_text`,
        [documentId, page.pageNumber, page.text]
      );
      storedPages.push({
        pageId: pageResult.rows[0].id,
        pageNumber: pageResult.rows[0].page_number,
        text: pageResult.rows[0].extracted_text
      });
    }

    // 4. Chunk document pages
    const chunks = chunkDocumentPages(storedPages);
    if (chunks.length === 0) {
      throw new Error('Failed to generate chunks from document text.');
    }

    // 5. Generate embeddings for chunks
    const chunkTexts = chunks.map(c => c.content);
    const embeddings = await generateBatchEmbeddings(chunkTexts);

    // 6. Insert chunks into document_chunks
    for (let i = 0; i < chunks.length; i++) {
      const c = chunks[i];
      const embeddingArray = embeddings[i];
      const vectorString = `[${embeddingArray.join(',')}]`;

      await client.query(
        `INSERT INTO document_chunks (document_id, page_id, chunk_index, content, page_number, embedding, token_count)
         VALUES ($1, $2, $3, $4, $5, $6::vector, $7)`,
        [
          documentId,
          c.pageId,
          c.chunkIndex,
          c.content,
          c.pageNumber,
          vectorString,
          c.tokenCount
        ]
      );
    }

    // 7. Auto-suggest category if not set or set to 'Other'
    const fullText = parsedPages.map(p => p.text).join(' ').slice(0, 10000);
    const suggestedCategory = inferDocumentCategory(fullText);

    // 8. Update document as READY
    await client.query(
      `UPDATE documents 
       SET processing_status = 'READY', 
           page_count = $1, 
           document_hash = $2, 
           category = COALESCE(NULLIF(category, 'Other'), $3),
           processing_error = NULL,
           updated_at = NOW() 
       WHERE id = $4`,
      [parsedPages.length, fileHash, suggestedCategory, documentId]
    );

    await client.query('COMMIT');

    await logAudit({
      userId,
      matterId,
      action: 'DOCUMENT_PROCESSED',
      metadata: {
        documentId,
        pageCount: parsedPages.length,
        chunkCount: chunks.length,
        category: suggestedCategory
      }
    });

    console.log(`[Document Pipeline] Successfully indexed document ${documentId} (${parsedPages.length} pages, ${chunks.length} chunks).`);
    return { success: true, pageCount: parsedPages.length, chunkCount: chunks.length };
  } catch (error) {
    await client.query('ROLLBACK');
    console.error(`[Document Pipeline Error] Document ${documentId} failed:`, error.message);

    await query(
      `UPDATE documents 
       SET processing_status = 'FAILED', 
           processing_error = $1, 
           updated_at = NOW() 
       WHERE id = $2`,
      [error.message, documentId]
    );

    await logAudit({
      userId,
      matterId,
      action: 'DOCUMENT_PROCESS_FAILED',
      metadata: { documentId, error: error.message }
    });

    return { success: false, error: error.message };
  } finally {
    client.release();
  }
}

/**
 * Heuristic classifier to suggest category from initial text content.
 */
function inferDocumentCategory(text) {
  const lower = text.toLowerCase();
  if (lower.includes('agreement') || lower.includes('parties agree') || lower.includes('indemnification') || lower.includes('confidentiality agreement') || lower.includes('contract')) {
    return 'Contract';
  }
  if (lower.includes('v.') || lower.includes('appellant') || lower.includes('respondent') || lower.includes('holding') || lower.includes('opinion of the court')) {
    return 'Case Law';
  }
  if (lower.includes('statute') || lower.includes('u.s.c.') || lower.includes('revised code') || lower.includes('enacted by')) {
    return 'Statute';
  }
  if (lower.includes('regulation') || lower.includes('c.f.r.') || lower.includes('administrative rule')) {
    return 'Regulation';
  }
  if (lower.includes('deposition of') || lower.includes('q.') && lower.includes('a.') && lower.includes('sworn')) {
    return 'Deposition';
  }
  if (lower.includes('complaint') && (lower.includes('plaintiff') || lower.includes('jury trial demanded'))) {
    return 'Complaint';
  }
  if (lower.includes('motion for') || lower.includes('motion to dismiss') || lower.includes('motion for summary judgment')) {
    return 'Motion';
  }
  if (lower.includes('brief of') || lower.includes('trial brief') || lower.includes('appellate brief')) {
    return 'Brief';
  }
  if (lower.includes('memorandum of law') || lower.includes('legal memorandum')) {
    return 'Legal Memorandum';
  }
  if (lower.includes('it is hereby ordered') || lower.includes('judgment is entered')) {
    return 'Order';
  }
  return 'Other';
}
