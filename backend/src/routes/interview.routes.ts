import { Router } from 'express';
import {
  startTechInterview, respondTech,
  startHRInterview, respondHR,
  startGD, submitGDPoints,
  getInterviewHistory,
} from '../controllers/interview.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// Technical
router.post('/tech/start', authMiddleware, startTechInterview);
router.post('/tech/respond', authMiddleware, respondTech);

// HR
router.post('/hr/start', authMiddleware, startHRInterview);
router.post('/hr/respond', authMiddleware, respondHR);

// GD
router.post('/gd/start', authMiddleware, startGD);
router.post('/gd/submit', authMiddleware, submitGDPoints);

// History
router.get('/history', authMiddleware, getInterviewHistory);

export default router;
