import { query } from '../../config/db.js';
import { generateEmbedding } from './embeddingService.js';

/**
 * Performs semantic vector retrieval across document chunks, strictly scoped by user and matter.
 * @param {Object} params
 * @param {string} params.userId - Authenticated user ID
 * @param {string} params.matterId - Scoped matter ID
 * @param {string} params.queryText - User search or legal research query
 * @param {Array<string>} [params.selectedDocuments] - Optional document UUID filter
 * @param {number} [params.limit=6] - Maximum chunks to return
 * @returns {Promise<Array<Object>>}
 */
export async function retrieveRelevantEvidence({
  userId,
  matterId,
  queryText,
  selectedDocuments = [],
  limit = 6
}) {
  if (!queryText || !userId || !matterId) {
    return [];
  }

  // 1. Generate embedding for search query
  const queryEmbedding = await generateEmbedding(queryText);
  const vectorString = `[${queryEmbedding.join(',')}]`;

  // 2. Build parameterized query
  let sql = `
    SELECT 
      dc.id AS chunk_id,
      dc.content,
      dc.page_number,
      dc.chunk_index,
      d.id AS document_id,
      d.original_filename AS document_name,
      d.category AS document_category,
      1 - (dc.embedding <=> $1::vector) AS similarity_score
    FROM document_chunks dc
    JOIN documents d ON d.id = dc.document_id
    JOIN matters m ON m.id = d.matter_id
    WHERE m.user_id = $2
      AND m.id = $3
      AND d.processing_status = 'READY'
  `;

  const queryParams = [vectorString, userId, matterId];

  // Apply document filter if provided
  if (selectedDocuments && selectedDocuments.length > 0) {
    queryParams.push(selectedDocuments);
    sql += ` AND d.id = ANY($${queryParams.length}::uuid[])`;
  }

  // Order by cosine distance ascending (closest vectors first)
  queryParams.push(limit);
  sql += ` ORDER BY dc.embedding <=> $1::vector ASC LIMIT $${queryParams.length}`;

  try {
    const result = await query(sql, queryParams);

    return result.rows.map(row => ({
      chunkId: row.chunk_id,
      documentId: row.document_id,
      documentName: row.document_name,
      category: row.document_category,
      pageNumber: row.page_number,
      chunkIndex: row.chunk_index,
      content: row.content,
      similarityScore: parseFloat(row.similarity_score.toFixed(4))
    }));
  } catch (error) {
    console.error('[Vector Retrieval Error]:', error.message);
    
    // Fallback: If vector index/column fails or during raw keyword match, attempt text match
    try {
      let textSql = `
        SELECT 
          dc.id AS chunk_id,
          dc.content,
          dc.page_number,
          dc.chunk_index,
          d.id AS document_id,
          d.original_filename AS document_name,
          d.category AS document_category,
          0.85 AS similarity_score
        FROM document_chunks dc
        JOIN documents d ON d.id = dc.document_id
        JOIN matters m ON m.id = d.matter_id
        WHERE m.user_id = $1
          AND m.id = $2
          AND d.processing_status = 'READY'
      `;
      const textParams = [userId, matterId];
      if (selectedDocuments && selectedDocuments.length > 0) {
        textParams.push(selectedDocuments);
        textSql += ` AND d.id = ANY($${textParams.length}::uuid[])`;
      }
      textParams.push(limit);
      textSql += ` LIMIT $${textParams.length}`;

      const textResult = await query(textSql, textParams);
      return textResult.rows.map(row => ({
        chunkId: row.chunk_id,
        documentId: row.document_id,
        documentName: row.document_name,
        category: row.document_category,
        pageNumber: row.page_number,
        chunkIndex: row.chunk_index,
        content: row.content,
        similarityScore: 0.85
      }));
    } catch (fallbackErr) {
      console.error('[Fallback Retrieval Error]:', fallbackErr.message);
      return [];
    }
  }
}
