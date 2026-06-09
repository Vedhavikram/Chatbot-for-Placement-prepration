import { Router } from 'express';
import { getQuestion, submitAnswer, getTopics } from '../controllers/aptitude.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.get('/question', authMiddleware, getQuestion);
router.post('/submit', authMiddleware, submitAnswer);
router.get('/topics', authMiddleware, getTopics);

export default router;
