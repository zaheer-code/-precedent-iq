import fs from 'fs';
import path from 'path';
import { query } from '../config/db.js';
import { ENV } from '../config/env.js';
import { processDocumentPipeline } from '../services/documents/documentPipeline.js';
import { logAudit } from '../services/audit/auditService.js';

export async function uploadDocuments(req, res, next) {
  try {
    const userId = req.user.id;
    const { matterId } = req.params;

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No files were uploaded'
      });
    }

    const createdDocs = [];

    for (const file of req.files) {
      const result = await query(
        `INSERT INTO documents (
           matter_id, user_id, original_filename, storage_filename, 
           mime_type, file_size, category, processing_status, created_at, updated_at
         )
         VALUES ($1, $2, $3, $4, $5, $6, 'Other', 'UPLOADED', NOW(), NOW())
         RETURNING *`,
        [
          matterId,
          userId,
          file.originalname,
          file.filename,
          file.mimetype,
          file.size
        ]
      );

      const doc = result.rows[0];
      createdDocs.push(doc);

      await logAudit({
        userId,
        matterId,
        action: 'DOCUMENT_UPLOADED',
        metadata: { documentId: doc.id, filename: file.originalname, size: file.size }
      });

      // Launch async processing pipeline in background without blocking response
      const filePath = path.join(ENV.UPLOAD_DIR, file.filename);
      processDocumentPipeline(doc.id, filePath, file.mimetype, userId, matterId).catch(err => {
        console.error(`[Background Processing Error] ${doc.id}:`, err);
      });
    }

    res.status(201).json({
      success: true,
      message: `Successfully uploaded ${createdDocs.length} document(s). Processing in progress.`,
      documents: createdDocs
    });
  } catch (error) {
    next(error);
  }
}

export async function getMatterDocuments(req, res, next) {
  try {
    const userId = req.user.id;
    const { matterId } = req.params;

    const result = await query(
      `SELECT 
         d.id,
         d.matter_id,
         d.original_filename,
         d.mime_type,
         d.file_size,
         d.category,
         d.page_count,
         d.processing_status,
         d.processing_error,
         d.document_hash,
         d.created_at,
         d.updated_at,
         COUNT(dc.id)::int AS chunk_count
       FROM documents d
       LEFT JOIN document_chunks dc ON dc.document_id = d.id
       WHERE d.matter_id = $1 AND d.user_id = $2
       GROUP BY d.id
       ORDER BY d.created_at DESC`,
      [matterId, userId]
    );

    res.json({
      success: true,
      documents: result.rows
    });
  } catch (error) {
    next(error);
  }
}

export async function getDocumentById(req, res, next) {
  try {
    const userId = req.user.id;
    const { documentId } = req.params;

    const docResult = await query(
      `SELECT d.*, COUNT(dc.id)::int AS chunk_count
       FROM documents d
       LEFT JOIN document_chunks dc ON dc.document_id = d.id
       WHERE d.id = $1 AND d.user_id = $2
       GROUP BY d.id`,
      [documentId, userId]
    );

    if (docResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Document not found'
      });
    }

    const document = docResult.rows[0];

    // Fetch pages
    const pagesResult = await query(
      `SELECT id, page_number, extracted_text
       FROM document_pages
       WHERE document_id = $1
       ORDER BY page_number ASC`,
      [documentId]
    );

    res.json({
      success: true,
      document: {
        ...document,
        pages: pagesResult.rows
      }
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteDocument(req, res, next) {
  try {
    const userId = req.user.id;
    const { documentId } = req.params;

    const result = await query(
      'DELETE FROM documents WHERE id = $1 AND user_id = $2 RETURNING id, matter_id, original_filename, storage_filename',
      [documentId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Document not found'
      });
    }

    const doc = result.rows[0];

    // Attempt to delete physical file from disk
    try {
      const diskPath = path.join(ENV.UPLOAD_DIR, doc.storage_filename);
      if (fs.existsSync(diskPath)) {
        fs.unlinkSync(diskPath);
      }
    } catch (fsErr) {
      console.warn('[FS Cleanup Warning]:', fsErr.message);
    }

    await logAudit({
      userId,
      matterId: doc.matter_id,
      action: 'DOCUMENT_DELETED',
      metadata: { documentId, filename: doc.original_filename }
    });

    res.json({
      success: true,
      message: 'Document deleted successfully'
    });
  } catch (error) {
    next(error);
  }
}

export async function reprocessDocument(req, res, next) {
  try {
    const userId = req.user.id;
    const { documentId } = req.params;

    const result = await query(
      'SELECT id, matter_id, storage_filename, mime_type FROM documents WHERE id = $1 AND user_id = $2',
      [documentId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Document not found'
      });
    }

    const doc = result.rows[0];
    const filePath = path.join(ENV.UPLOAD_DIR, doc.storage_filename);

    if (!fs.existsSync(filePath)) {
      return res.status(400).json({
        success: false,
        error: 'Original file no longer exists on server storage'
      });
    }

    // Launch pipeline
    processDocumentPipeline(doc.id, filePath, doc.mime_type, userId, doc.matter_id).catch(err => {
      console.error(`[Reprocess Error] ${doc.id}:`, err);
    });

    res.json({
      success: true,
      message: 'Document reprocessing initiated'
    });
  } catch (error) {
    next(error);
  }
}

export async function updateDocumentCategory(req, res, next) {
  try {
    const userId = req.user.id;
    const { documentId } = req.params;
    const { category } = req.body;

    const result = await query(
      `UPDATE documents 
       SET category = $1, updated_at = NOW() 
       WHERE id = $2 AND user_id = $3
       RETURNING id, category, original_filename`,
      [category, documentId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Document not found'
      });
    }

    res.json({
      success: true,
      message: 'Document category updated',
      document: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
}
