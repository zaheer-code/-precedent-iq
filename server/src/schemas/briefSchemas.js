import { z } from 'zod';
import { citationSchema } from './researchSchemas.js';

export const briefRequestSchema = z.object({
  briefTitle: z.string().trim().min(1, 'Brief title is required').max(200),
  court: z.string().trim().max(200).optional().default(''),
  jurisdiction: z.string().trim().max(200).optional().default(''),
  issues: z.array(z.string().trim().min(1)).min(1, 'At least one issue statement is required'),
  selectedDocuments: z.array(z.string().uuid()).optional().default([]),
  desiredSections: z.array(z.string()).optional().default([
    'Case Background',
    'Questions Presented',
    'Statement of Facts',
    'Applicable Rules',
    'Argument & Legal Analysis',
    'Counterarguments & Rebuttals',
    'Evidence Gaps & Vulnerabilities',
    'Conclusion'
  ])
});

export const factItemSchema = z.object({
  statement: z.string(),
  citations: z.array(citationSchema).default([])
});

export const ruleItemSchema = z.object({
  rule: z.string(),
  citations: z.array(citationSchema).default([])
});

export const analysisItemSchema = z.object({
  issue: z.string(),
  argument: z.string(),
  counterargument: z.string().default(''),
  response: z.string().default(''),
  citations: z.array(citationSchema).default([])
});

export const aiBriefResponseSchema = z.object({
  title: z.string(),
  questionsPresented: z.array(z.string()).default([]),
  facts: z.array(factItemSchema).default([]),
  issues: z.array(z.string()).default([]),
  rules: z.array(ruleItemSchema).default([]),
  analysis: z.array(analysisItemSchema).default([]),
  evidenceGaps: z.array(z.string()).default([]),
  conclusion: z.string()
});
