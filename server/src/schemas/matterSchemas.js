import { z } from 'zod';

export const createMatterSchema = z.object({
  matterName: z.string().trim().min(1, 'Matter name is required').max(200),
  matterNumber: z.string().trim().max(100).optional().default(''),
  description: z.string().trim().max(5000).optional().default(''),
  jurisdiction: z.string().trim().max(200).optional().default(''),
  practiceArea: z.string().trim().max(200).optional().default('')
});

export const updateMatterSchema = z.object({
  matterName: z.string().trim().min(1, 'Matter name cannot be empty').max(200).optional(),
  matterNumber: z.string().trim().max(100).optional(),
  description: z.string().trim().max(5000).optional(),
  jurisdiction: z.string().trim().max(200).optional(),
  practiceArea: z.string().trim().max(200).optional(),
  status: z.enum(['ACTIVE', 'ARCHIVED', 'CLOSED']).optional()
});
