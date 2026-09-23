import { Router } from 'express';
import { runClauseComparison } from '../controllers/clauseController.js';
import { validate } from '../middleware/validate.js';
import { clauseCompareRequestSchema } from '../schemas/clauseSchemas.js';
import { aiLimiter } from '../middleware/rateLimiter.js';

const router = Router({ mergeParams: true });
router.post('/compare', aiLimiter, validate(clauseCompareRequestSchema), runClauseComparison);

export default router;
