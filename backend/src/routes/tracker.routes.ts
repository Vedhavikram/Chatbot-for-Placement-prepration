import { Router } from 'express';
import { getGoals, addGoal, toggleGoal, deleteGoal } from '../controllers/admin.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.get('/', authMiddleware, getGoals);
router.post('/', authMiddleware, addGoal);
router.patch('/:goalId/toggle', authMiddleware, toggleGoal);
router.delete('/:goalId', authMiddleware, deleteGoal);

export default router;
