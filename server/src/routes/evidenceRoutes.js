import { Router } from 'express';
import { getEvidenceChunk } from '../controllers/evidenceController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = Router();

router.use(authenticateToken);
router.get('/:chunkId', getEvidenceChunk);

export default router;
