import { generateTrialBrief } from '../services/ai/aiService.js';

export async function runBriefGeneration(req, res, next) {
  try {
    const userId = req.user.id;
    const { matterId } = req.params;
    const { briefTitle, court, jurisdiction, issues, selectedDocuments, desiredSections } = req.body;

    const result = await generateTrialBrief({
      userId,
      matterId,
      briefTitle,
      court,
      jurisdiction,
      issues,
      selectedDocuments,
      desiredSections
    });

    res.json({
      success: true,
      result
    });
  } catch (error) {
    next(error);
  }
}
