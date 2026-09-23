import { z } from 'zod';
import { citationSchema } from './researchSchemas.js';

export const clauseCompareRequestSchema = z.object({
  documentAId: z.string().uuid('Document A ID must be a valid UUID'),
  documentBId: z.string().uuid('Document B ID must be a valid UUID'),
  clauseDescription: z.string().trim().max(500).optional().default('')
});

export const clauseDetailSchema = z.object({
  text: z.string(),
  citation: citationSchema.optional().default({})
});

export const comparisonItemSchema = z.object({
  topic: z.string(),
  clauseA: clauseDetailSchema,
  clauseB: clauseDetailSchema,
  difference: z.string(),
  conflict: z.boolean().default(false),
  significance: z.string()
});

export const aiClauseResponseSchema = z.object({
  summary: z.string(),
  comparisons: z.array(comparisonItemSchema).default([]),
  ambiguities: z.array(z.string()).default([]),
  missingProvisions: z.array(z.string()).default([])
});
