import { Router } from 'express';
import { getCodingQuestion, submitCode, reviewCodeHandler } from '../controllers/coding.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.get('/question', authMiddleware, getCodingQuestion);
router.post('/submit', authMiddleware, submitCode);
router.post('/review', authMiddleware, reviewCodeHandler);

export default router;
