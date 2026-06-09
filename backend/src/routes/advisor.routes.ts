import { Router } from 'express';
import { getDashboard, getLeaderboard } from '../controllers/dashboard.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.get('/', authMiddleware, getDashboard);
router.get('/leaderboard', authMiddleware, getLeaderboard);

export default router;
