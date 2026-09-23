import { query } from '../../config/db.js';
import { retrieveRelevantEvidence } from '../rag/retrievalService.js';
import { sanitizeAndVerifyCitations } from '../rag/citationValidator.js';
import { generateLegalJSON } from './geminiClient.js';
import {
  buildResearchPrompt,
  buildVulnerabilityPrompt,
  buildClauseComparisonPrompt,
  buildTrialBriefPrompt
} from './prompts.js';
import { aiResearchResponseSchema } from '../../schemas/researchSchemas.js';
import { aiVulnerabilityResponseSchema } from '../../schemas/vulnerabilitySchemas.js';
import { aiClauseResponseSchema } from '../../schemas/clauseSchemas.js';
import { aiBriefResponseSchema } from '../../schemas/briefSchemas.js';
import { logAudit } from '../audit/auditService.js';

/**
 * 1. Perform grounded legal research with RAG and citation verification.
 */
export async function performLegalResearch({ userId, matterId, queryText, selectedDocuments = [], searchDepth = 6, analysisType = 'precedent_search' }) {
  // 1. Retrieve relevant evidence chunks from pgvector
  const evidenceChunks = await retrieveRelevantEvidence({
    userId,
    matterId,
    queryText,
    selectedDocuments,
    limit: searchDepth
  });

  // 2. Build prompt
  const prompt = buildResearchPrompt({
    query: queryText,
    analysisType,
    evidenceChunks
  });

  // 3. Call Gemini
  const rawAiResult = await generateLegalJSON(prompt);

  // 4. Validate with Zod
  const parsedResult = aiResearchResponseSchema.parse(rawAiResult);

  // 5. Sanitize & verify citations against retrieved chunks
  const verifiedResult = sanitizeAndVerifyCitations(parsedResult, evidenceChunks);

  // 6. Persist query & result to DB
  let queryId = null;
  try {
    const qRes = await query(
      `INSERT INTO research_queries (user_id, matter_id, query, analysis_type, created_at)
       VALUES ($1, $2, $3, $4, NOW())
       RETURNING id`,
      [userId, matterId, queryText, analysisType]
    );
    queryId = qRes.rows[0].id;

    await query(
      `INSERT INTO analysis_results (user_id, matter_id, research_query_id, analysis_type, result_json, created_at)
       VALUES ($1, $2, $3, $4, $5, NOW())`,
      [userId, matterId, queryId, 'research', JSON.stringify(verifiedResult)]
    );
  } catch (dbErr) {
    console.error('[DB Analysis Save Warning]:', dbErr.message);
  }

  // 7. Audit log
  await logAudit({
    userId,
    matterId,
    action: 'AI_RESEARCH',
    metadata: { query: queryText, analysisType, evidenceCount: evidenceChunks.length }
  });

  return {
    ...verifiedResult,
    retrievedEvidence: evidenceChunks
  };
}

/**
 * 2. Opposing argument vulnerability detector.
 */
export async function detectVulnerabilities({ userId, matterId, opposingArgument, selectedDocuments = [], focusAreas = [] }) {
  // Retrieve evidence relevant to the argument
  const evidenceChunks = await retrieveRelevantEvidence({
    userId,
    matterId,
    queryText: opposingArgument.slice(0, 500),
    selectedDocuments,
    limit: 8
  });

  const prompt = buildVulnerabilityPrompt({
    opposingArgument,
    focusAreas: focusAreas.length > 0 ? focusAreas : ['precedent', 'facts', 'contract', 'logic', 'citations', 'consistency'],
    evidenceChunks
  });

  const rawAiResult = await generateLegalJSON(prompt);
  const parsedResult = aiVulnerabilityResponseSchema.parse(rawAiResult);
  const verifiedResult = sanitizeAndVerifyCitations(parsedResult, evidenceChunks);

  try {
    await query(
      `INSERT INTO analysis_results (user_id, matter_id, analysis_type, result_json, created_at)
       VALUES ($1, $2, $3, $4, NOW())`,
      [userId, matterId, 'vulnerabilities', JSON.stringify(verifiedResult)]
    );
  } catch (dbErr) {
    console.error('[DB Analysis Save Warning]:', dbErr.message);
  }

  await logAudit({
    userId,
    matterId,
    action: 'VULNERABILITY_ANALYSIS',
    metadata: { argumentLength: opposingArgument.length, focusAreas }
  });

  return {
    ...verifiedResult,
    retrievedEvidence: evidenceChunks
  };
}

/**
 * 3. Dynamic clause comparison matrix.
 */
export async function compareClauses({ userId, matterId, documentAId, documentBId, clauseDescription = '' }) {
  // Get document names
  const docResult = await query(
    `SELECT id, original_filename FROM documents WHERE id IN ($1, $2) AND user_id = $3`,
    [documentAId, documentBId, userId]
  );

  const docA = docResult.rows.find(d => d.id === documentAId) || { original_filename: 'Document A' };
  const docB = docResult.rows.find(d => d.id === documentBId) || { original_filename: 'Document B' };

  // Retrieve evidence from Doc A and Doc B
  const querySearch = clauseDescription || 'contractual obligations warranties liability indemnification termination';
  const evidenceA = await retrieveRelevantEvidence({
    userId,
    matterId,
    queryText: querySearch,
    selectedDocuments: [documentAId],
    limit: 6
  });

  const evidenceB = await retrieveRelevantEvidence({
    userId,
    matterId,
    queryText: querySearch,
    selectedDocuments: [documentBId],
    limit: 6
  });

  const allEvidence = [...evidenceA, ...evidenceB];

  const prompt = buildClauseComparisonPrompt({
    docAName: docA.original_filename,
    docBName: docB.original_filename,
    clauseDescription,
    evidenceChunksA: evidenceA,
    evidenceChunksB: evidenceB
  });

  const rawAiResult = await generateLegalJSON(prompt);
  const parsedResult = aiClauseResponseSchema.parse(rawAiResult);
  const verifiedResult = sanitizeAndVerifyCitations(parsedResult, allEvidence);

  try {
    await query(
      `INSERT INTO analysis_results (user_id, matter_id, analysis_type, result_json, created_at)
       VALUES ($1, $2, $3, $4, NOW())`,
      [userId, matterId, 'clause_comparison', JSON.stringify(verifiedResult)]
    );
  } catch (dbErr) {
    console.error('[DB Analysis Save Warning]:', dbErr.message);
  }

  await logAudit({
    userId,
    matterId,
    action: 'CLAUSE_COMPARISON',
    metadata: { documentAId, documentBId, clauseDescription }
  });

  return {
    ...verifiedResult,
    retrievedEvidence: allEvidence
  };
}

/**
 * 4. Interactive trial brief outline generator.
 */
export async function generateTrialBrief({ userId, matterId, briefTitle, court, jurisdiction, issues, selectedDocuments = [], desiredSections = [] }) {
  // Retrieve evidence across all issues
  const combinedIssueText = issues.join(' ');
  const evidenceChunks = await retrieveRelevantEvidence({
    userId,
    matterId,
    queryText: `${briefTitle} ${combinedIssueText}`,
    selectedDocuments,
    limit: 10
  });

  const prompt = buildTrialBriefPrompt({
    briefTitle,
    court,
    jurisdiction,
    issues,
    desiredSections: desiredSections.length > 0 ? desiredSections : [
      'Case Background',
      'Questions Presented',
      'Statement of Facts',
      'Applicable Rules',
      'Argument & Legal Analysis',
      'Counterarguments & Rebuttals',
      'Evidence Gaps & Vulnerabilities',
      'Conclusion'
    ],
    evidenceChunks
  });

  const rawAiResult = await generateLegalJSON(prompt);
  const parsedResult = aiBriefResponseSchema.parse(rawAiResult);
  const verifiedResult = sanitizeAndVerifyCitations(parsedResult, evidenceChunks);

  try {
    await query(
      `INSERT INTO analysis_results (user_id, matter_id, analysis_type, result_json, created_at)
       VALUES ($1, $2, $3, $4, NOW())`,
      [userId, matterId, 'trial_brief', JSON.stringify(verifiedResult)]
    );
  } catch (dbErr) {
    console.error('[DB Analysis Save Warning]:', dbErr.message);
  }

  await logAudit({
    userId,
    matterId,
    action: 'BRIEF_GENERATION',
    metadata: { briefTitle, issuesCount: issues.length }
  });

  return {
    ...verifiedResult,
    retrievedEvidence: evidenceChunks
  };
}
