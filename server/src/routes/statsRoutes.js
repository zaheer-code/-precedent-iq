import { Router } from 'express';
import { getDashboardStats } from '../controllers/statsController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = Router();
router.use(authenticateToken);
router.get('/dashboard', getDashboardStats);

export default router;
