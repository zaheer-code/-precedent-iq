import { query } from '../config/db.js';
import { logAudit } from '../services/audit/auditService.js';

export async function getMatters(req, res, next) {
  try {
    const userId = req.user.id;

    const result = await query(
      `SELECT 
         m.id, 
         m.matter_name, 
         m.matter_number, 
         m.description, 
         m.jurisdiction, 
         m.practice_area, 
         m.status, 
         m.created_at, 
         m.updated_at,
         COUNT(DISTINCT d.id)::int AS document_count,
         COUNT(DISTINCT dc.id)::int AS chunk_count
       FROM matters m
       LEFT JOIN documents d ON d.matter_id = m.id
       LEFT JOIN document_chunks dc ON dc.document_id = d.id
       WHERE m.user_id = $1
       GROUP BY m.id
       ORDER BY m.updated_at DESC`,
      [userId]
    );

    res.json({
      success: true,
      matters: result.rows
    });
  } catch (error) {
    next(error);
  }
}

export async function createMatter(req, res, next) {
  try {
    const userId = req.user.id;
    const { matterName, matterNumber, description, jurisdiction, practiceArea } = req.body;

    const result = await query(
      `INSERT INTO matters (user_id, matter_name, matter_number, description, jurisdiction, practice_area, status, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, 'ACTIVE', NOW(), NOW())
       RETURNING *`,
      [userId, matterName, matterNumber || null, description || null, jurisdiction || null, practiceArea || null]
    );

    const newMatter = result.rows[0];

    await logAudit({
      userId,
      matterId: newMatter.id,
      action: 'MATTER_CREATED',
      metadata: { matterName, matterNumber }
    });

    res.status(201).json({
      success: true,
      message: 'Matter created successfully',
      matter: {
        ...newMatter,
        document_count: 0,
        chunk_count: 0
      }
    });
  } catch (error) {
    next(error);
  }
}

export async function getMatterById(req, res, next) {
  try {
    const userId = req.user.id;
    const { matterId } = req.params;

    const result = await query(
      `SELECT 
         m.id, 
         m.matter_name, 
         m.matter_number, 
         m.description, 
         m.jurisdiction, 
         m.practice_area, 
         m.status, 
         m.created_at, 
         m.updated_at,
         COUNT(DISTINCT d.id)::int AS document_count,
         COUNT(DISTINCT dc.id)::int AS chunk_count,
         COUNT(DISTINCT rq.id)::int AS query_count
       FROM matters m
       LEFT JOIN documents d ON d.matter_id = m.id
       LEFT JOIN document_chunks dc ON dc.document_id = d.id
       LEFT JOIN research_queries rq ON rq.matter_id = m.id
       WHERE m.id = $1 AND m.user_id = $2
       GROUP BY m.id`,
      [matterId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Matter not found'
      });
    }

    res.json({
      success: true,
      matter: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
}

export async function updateMatter(req, res, next) {
  try {
    const userId = req.user.id;
    const { matterId } = req.params;
    const { matterName, matterNumber, description, jurisdiction, practiceArea, status } = req.body;

    const result = await query(
      `UPDATE matters 
       SET matter_name = COALESCE($1, matter_name),
           matter_number = COALESCE($2, matter_number),
           description = COALESCE($3, description),
           jurisdiction = COALESCE($4, jurisdiction),
           practice_area = COALESCE($5, practice_area),
           status = COALESCE($6, status),
           updated_at = NOW()
       WHERE id = $7 AND user_id = $8
       RETURNING *`,
      [matterName, matterNumber, description, jurisdiction, practiceArea, status, matterId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Matter not found'
      });
    }

    await logAudit({
      userId,
      matterId,
      action: 'MATTER_UPDATED',
      metadata: { matterName, status }
    });

    res.json({
      success: true,
      message: 'Matter updated successfully',
      matter: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteMatter(req, res, next) {
  try {
    const userId = req.user.id;
    const { matterId } = req.params;

    const result = await query(
      'DELETE FROM matters WHERE id = $1 AND user_id = $2 RETURNING id, matter_name',
      [matterId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Matter not found'
      });
    }

    await logAudit({
      userId,
      matterId,
      action: 'MATTER_DELETED',
      metadata: { matterName: result.rows[0].matter_name }
    });

    res.json({
      success: true,
      message: 'Matter deleted successfully'
    });
  } catch (error) {
    next(error);
  }
}
