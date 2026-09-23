import { compareClauses } from '../services/ai/aiService.js';

export async function runClauseComparison(req, res, next) {
  try {
    const userId = req.user.id;
    const { matterId } = req.params;
    const { documentAId, documentBId, clauseDescription } = req.body;

    const result = await compareClauses({
      userId,
      matterId,
      documentAId,
      documentBId,
      clauseDescription
    });

    res.json({
      success: true,
      result
    });
  } catch (error) {
    next(error);
  }
}
