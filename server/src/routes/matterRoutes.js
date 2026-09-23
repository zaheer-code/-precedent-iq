import { Router } from 'express';
import {
  getMatters,
  createMatter,
  getMatterById,
  updateMatter,
  deleteMatter
} from '../controllers/matterController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { requireMatterOwnership } from '../middleware/ownershipMiddleware.js';
import { validate } from '../middleware/validate.js';
import { createMatterSchema, updateMatterSchema } from '../schemas/matterSchemas.js';

// Sub-resource routers
import documentRouter from './documentRoutes.js';
import researchRouter from './researchRoutes.js';
import vulnerabilityRouter from './vulnerabilityRoutes.js';
import clauseRouter from './clauseRoutes.js';
import briefRouter from './briefRoutes.js';
import { getMatterEvidence } from '../controllers/evidenceController.js';

const router = Router();

// Matter CRUD
router.use(authenticateToken);

router.get('/', getMatters);
router.post('/', validate(createMatterSchema), createMatter);
router.get('/:matterId', requireMatterOwnership, getMatterById);
router.patch('/:matterId', requireMatterOwnership, validate(updateMatterSchema), updateMatter);
router.delete('/:matterId', requireMatterOwnership, deleteMatter);

// Nested sub-routes for matters
router.use('/:matterId/documents', requireMatterOwnership, documentRouter);
router.use('/:matterId/research', requireMatterOwnership, researchRouter);
router.use('/:matterId/vulnerabilities', requireMatterOwnership, vulnerabilityRouter);
router.use('/:matterId/clauses', requireMatterOwnership, clauseRouter);
router.use('/:matterId/brief', requireMatterOwnership, briefRouter);
router.get('/:matterId/evidence', requireMatterOwnership, getMatterEvidence);

export default router;
