import { Router } from 'express';
import { analyzeCareer, getCompanyInfo, getAllCompanies } from '../controllers/tracker.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.post('/analyze', authMiddleware, analyzeCareer);
router.get('/companies', authMiddleware, getAllCompanies);
router.get('/companies/:company', authMiddleware, getCompanyInfo);

export default router;
