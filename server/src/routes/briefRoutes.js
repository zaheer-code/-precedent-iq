import { Router } from 'express';
import { runBriefGeneration } from '../controllers/briefController.js';
import { validate } from '../middleware/validate.js';
import { briefRequestSchema } from '../schemas/briefSchemas.js';
import { aiLimiter } from '../middleware/rateLimiter.js';

const router = Router({ mergeParams: true });
router.post('/', aiLimiter, validate(briefRequestSchema), runBriefGeneration);

export default router;
