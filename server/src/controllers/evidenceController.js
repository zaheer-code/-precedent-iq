import { query } from '../config/db.js';

export async function getEvidenceChunk(req, res, next) {
  try {
    const userId = req.user.id;
    const { chunkId } = req.params;

    const result = await query(
      `SELECT 
         dc.id AS chunk_id,
         dc.content,
         dc.page_number,
         dc.chunk_index,
         dc.token_count,
         dc.created_at,
         d.id AS document_id,
         d.original_filename AS document_name,
         d.category,
         m.id AS matter_id,
         m.matter_name
       FROM document_chunks dc
       JOIN documents d ON d.id = dc.document_id
       JOIN matters m ON m.id = d.matter_id
       WHERE dc.id = $1 AND m.user_id = $2`,
      [chunkId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Evidence chunk not found or access denied'
      });
    }

    res.json({
      success: true,
      evidence: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
}

export async function getMatterEvidence(req, res, next) {
  try {
    const userId = req.user.id;
    const { matterId } = req.params;
    const { documentId, search, page = 1, limit = 20 } = req.query;

    const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    let sql = `
      SELECT 
        dc.id AS chunk_id,
        dc.content,
        dc.page_number,
        dc.chunk_index,
        dc.token_count,
        d.id AS document_id,
        d.original_filename AS document_name,
        d.category
      FROM document_chunks dc
      JOIN documents d ON d.id = dc.document_id
      JOIN matters m ON m.id = d.matter_id
      WHERE m.user_id = $1 AND m.id = $2
    `;

    const params = [userId, matterId];

    if (documentId) {
      params.push(documentId);
      sql += ` AND d.id = $${params.length}`;
    }

    if (search) {
      params.push(`%${search}%`);
      sql += ` AND dc.content ILIKE $${params.length}`;
    }

    sql += ` ORDER BY d.original_filename ASC, dc.page_number ASC, dc.chunk_index ASC`;
    params.push(parseInt(limit, 10));
    sql += ` LIMIT $${params.length}`;
    params.push(offset);
    sql += ` OFFSET $${params.length}`;

    const result = await query(sql, params);

    // Get total count
    let countSql = `
      SELECT COUNT(dc.id)::int AS total
      FROM document_chunks dc
      JOIN documents d ON d.id = dc.document_id
      JOIN matters m ON m.id = d.matter_id
      WHERE m.user_id = $1 AND m.id = $2
    `;
    const countParams = [userId, matterId];
    if (documentId) {
      countParams.push(documentId);
      countSql += ` AND d.id = $${countParams.length}`;
    }
    if (search) {
      countParams.push(`%${search}%`);
      countSql += ` AND dc.content ILIKE $${countParams.length}`;
    }
    const countRes = await query(countSql, countParams);

    res.json({
      success: true,
      total: countRes.rows[0]?.total || 0,
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      chunks: result.rows
    });
  } catch (error) {
    next(error);
  }
}
