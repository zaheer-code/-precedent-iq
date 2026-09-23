import { query } from '../config/db.js';

export async function getAuditLogs(req, res, next) {
  try {
    const userId = req.user.id;
    const { limit = 50, page = 1 } = req.query;
    const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);

    const result = await query(
      `SELECT 
         al.id, 
         al.action, 
         al.metadata, 
         al.created_at,
         m.matter_name
       FROM audit_logs al
       LEFT JOIN matters m ON m.id = al.matter_id
       WHERE al.user_id = $1
       ORDER BY al.created_at DESC
       LIMIT $2 OFFSET $3`,
      [userId, parseInt(limit, 10), offset]
    );

    const countRes = await query('SELECT COUNT(*)::int AS total FROM audit_logs WHERE user_id = $1', [userId]);

    res.json({
      success: true,
      total: countRes.rows[0]?.total || 0,
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      logs: result.rows
    });
  } catch (error) {
    next(error);
  }
}
