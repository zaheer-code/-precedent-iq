import { Router } from 'express';
import { runResearch, getMatterResearchHistory, getResearchById } from '../controllers/researchController.js';
import { validate } from '../middleware/validate.js';
import { researchRequestSchema } from '../schemas/researchSchemas.js';
import { aiLimiter } from '../middleware/rateLimiter.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

// Nested under /api/matters/:matterId/research
const nestedRouter = Router({ mergeParams: true });
nestedRouter.post('/', aiLimiter, validate(researchRequestSchema), runResearch);
nestedRouter.get('/', getMatterResearchHistory);

// Direct /api/research/:researchId
export const directResearchRouter = Router();
directResearchRouter.use(authenticateToken);
directResearchRouter.get('/:researchId', getResearchById);

export default nestedRouter;
