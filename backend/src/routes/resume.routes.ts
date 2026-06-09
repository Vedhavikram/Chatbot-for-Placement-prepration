import { Router } from 'express';
import multer from 'multer';
import { uploadResume, getResumeHistory } from '../controllers/resume.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

router.post('/upload', authMiddleware, upload.single('resume'), uploadResume);
router.get('/history', authMiddleware, getResumeHistory);

export default router;
