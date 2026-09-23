import { query } from '../config/db.js';

/**
 * Ensures that the matter specified in req.params.matterId belongs to the authenticated user.
 */
export async function requireMatterOwnership(req, res, next) {
  const { matterId } = req.params;
  const userId = req.user?.id;

  if (!matterId) {
    return res.status(400).json({ success: false, error: 'Matter ID is required' });
  }

  try {
    const result = await query(
      'SELECT id, matter_name, matter_number, status FROM matters WHERE id = $1 AND user_id = $2',
      [matterId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Matter not found or access denied'
      });
    }

    req.matter = result.rows[0];
    next();
  } catch (error) {
    console.error('[Matter Ownership Check Error]:', error);
    return res.status(500).json({ success: false, error: 'Failed to verify matter access' });
  }
}

/**
 * Ensures that the document specified in req.params.documentId belongs to the authenticated user.
 */
export async function requireDocumentOwnership(req, res, next) {
  const { documentId } = req.params;
  const userId = req.user?.id;

  if (!documentId) {
    return res.status(400).json({ success: false, error: 'Document ID is required' });
  }

  try {
    const result = await query(
      `SELECT d.id, d.matter_id, d.original_filename, d.storage_filename, d.mime_type, 
              d.file_size, d.processing_status, d.page_count, d.category
       FROM documents d
       JOIN matters m ON m.id = d.matter_id
       WHERE d.id = $1 AND d.user_id = $2 AND m.user_id = $2`,
      [documentId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Document not found or access denied'
      });
    }

    req.document = result.rows[0];
    next();
  } catch (error) {
    console.error('[Document Ownership Check Error]:', error);
    return res.status(500).json({ success: false, error: 'Failed to verify document access' });
  }
}
