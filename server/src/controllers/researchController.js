import { query } from '../config/db.js';
import { performLegalResearch } from '../services/ai/aiService.js';

export async function runResearch(req, res, next) {
  try {
    const userId = req.user.id;
    const { matterId } = req.params;
    const { query: queryText, selectedDocuments, searchDepth, analysisType } = req.body;

    const result = await performLegalResearch({
      userId,
      matterId,
      queryText,
      selectedDocuments,
      searchDepth,
      analysisType
    });

    res.json({
      success: true,
      result
    });
  } catch (error) {
    next(error);
  }
}

export async function getMatterResearchHistory(req, res, next) {
  try {
    const userId = req.user.id;
    const { matterId } = req.params;

    const result = await query(
      `SELECT 
         rq.id AS query_id,
         rq.query,
         rq.analysis_type,
         rq.created_at,
         ar.id AS analysis_id,
         ar.result_json
       FROM research_queries rq
       LEFT JOIN analysis_results ar ON ar.research_query_id = rq.id
       WHERE rq.matter_id = $1 AND rq.user_id = $2
       ORDER BY rq.created_at DESC
       LIMIT 50`,
      [matterId, userId]
    );

    res.json({
      success: true,
      history: result.rows
    });
  } catch (error) {
    next(error);
  }
}

export async function getResearchById(req, res, next) {
  try {
    const userId = req.user.id;
    const { researchId } = req.params;

    const result = await query(
      `SELECT ar.*, rq.query, rq.analysis_type
       FROM analysis_results ar
       LEFT JOIN research_queries rq ON rq.id = ar.research_query_id
       WHERE ar.id = $1 AND ar.user_id = $2`,
      [researchId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Research record not found'
      });
    }

    res.json({
      success: true,
      analysis: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
}
