import { z } from 'zod';

export const citationSchema = z.object({
  documentId: z.string().optional().default(''),
  documentName: z.string().optional().default(''),
  page: z.number().int().optional().default(1),
  chunkId: z.string().optional().default(''),
  quotedEvidence: z.string().optional().default('')
});

export const researchRequestSchema = z.object({
  query: z.string().trim().min(3, 'Query must be at least 3 characters').max(2000),
  selectedDocuments: z.array(z.string().uuid()).optional().default([]),
  searchDepth: z.number().int().min(1).max(20).optional().default(5),
  analysisType: z.enum([
    'precedent_search',
    'argument_analysis',
    'fact_extraction',
    'contract_analysis',
    'legal_issue_analysis',
    'summary'
  ]).optional().default('precedent_search')
});

export const findingItemSchema = z.object({
  claim: z.string(),
  explanation: z.string(),
  citations: z.array(citationSchema).default([])
});

export const aiResearchResponseSchema = z.object({
  answer: z.string(),
  findings: z.array(findingItemSchema).default([]),
  conflicts: z.array(z.string()).default([]),
  evidenceGaps: z.array(z.string()).default([]),
  confidence: z.enum(['high', 'medium', 'low']).default('medium')
});
