import { query } from '../config/db.js';

export async function getDashboardStats(req, res, next) {
  try {
    const userId = req.user.id;

    // Total matters
    const mattersCountRes = await query('SELECT COUNT(*)::int AS count FROM matters WHERE user_id = $1', [userId]);
    const totalMatters = mattersCountRes.rows[0]?.count || 0;

    // Total documents & status breakdown
    const docStatsRes = await query(
      `SELECT 
         COUNT(*)::int AS total,
         COUNT(CASE WHEN processing_status = 'PROCESSING' THEN 1 END)::int AS processing,
         COUNT(CASE WHEN processing_status = 'READY' THEN 1 END)::int AS ready,
         COUNT(CASE WHEN processing_status = 'FAILED' THEN 1 END)::int AS failed
       FROM documents 
       WHERE user_id = $1`,
      [userId]
    );
    const docStats = docStatsRes.rows[0] || { total: 0, processing: 0, ready: 0, failed: 0 };

    // Total chunks
    const chunkStatsRes = await query(
      `SELECT COUNT(dc.id)::int AS count
       FROM document_chunks dc
       JOIN documents d ON d.id = dc.document_id
       WHERE d.user_id = $1`,
      [userId]
    );
    const totalChunks = chunkStatsRes.rows[0]?.count || 0;

    // Recent matters
    const recentMattersRes = await query(
      `SELECT m.*, COUNT(d.id)::int AS document_count
       FROM matters m
       LEFT JOIN documents d ON d.matter_id = m.id
       WHERE m.user_id = $1
       GROUP BY m.id
       ORDER BY m.updated_at DESC
       LIMIT 5`,
      [userId]
    );

    // Recent analyses
    const recentAnalysesRes = await query(
      `SELECT ar.id, ar.analysis_type, ar.created_at, m.id AS matter_id, m.matter_name
       FROM analysis_results ar
       JOIN matters m ON m.id = ar.matter_id
       WHERE ar.user_id = $1
       ORDER BY ar.created_at DESC
       LIMIT 6`,
      [userId]
    );

    // Recent audit activity
    const recentActivityRes = await query(
      `SELECT id, action, metadata, created_at
       FROM audit_logs
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT 8`,
      [userId]
    );

    res.json({
      success: true,
      stats: {
        totalMatters,
        totalDocuments: docStats.total,
        documentsProcessing: docStats.processing,
        documentsReady: docStats.ready,
        documentsFailed: docStats.failed,
        totalIndexedChunks: totalChunks
      },
      recentMatters: recentMattersRes.rows,
      recentAnalyses: recentAnalysesRes.rows,
      recentActivity: recentActivityRes.rows
    });
  } catch (error) {
    next(error);
  }
}
