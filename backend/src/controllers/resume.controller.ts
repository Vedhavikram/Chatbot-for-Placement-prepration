import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { query } from '../config/db';
import { analyzeResume } from '../services/ai.service';
import { awardXP } from '../services/game.service';
import crypto from 'crypto';
import path from 'path';
import fs from 'fs';

const uuid = () => crypto.randomUUID();

export const uploadResume = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    if (!req.file) {
      return res.status(400).json({ error: 'Please upload a PDF or DOCX file' });
    }

    const fileName = req.file.originalname;
    
    // Extract text from file (simplified — read as buffer, extract metadata)
    let extractedText = '';
    try {
      if (req.file.mimetype === 'text/plain') {
        extractedText = req.file.buffer.toString('utf-8');
      } else {
        // For PDF/DOCX in demo mode, use filename-based mock extraction
        extractedText = `Resume file: ${fileName}. Size: ${req.file.size} bytes. Contains experience, skills, and education sections.`;
      }
    } catch {
      extractedText = `Resume: ${fileName}`;
    }

    // Clean up temp file if saved to disk
    if (req.file.path) {
      try { fs.unlinkSync(req.file.path); } catch {}
    }

    const analysis = await analyzeResume(fileName, extractedText);

    await query(
      'INSERT INTO resume_analyses (id, user_id, file_name, ats_score, feedback_json) VALUES ($1, $2, $3, $4, $5)',
      [uuid(), userId, fileName, analysis.atsScore, JSON.stringify(analysis)]
    );

    await awardXP(userId, 'resume_uploaded');

    return res.json({ analysis, fileName });
  } catch (err: any) {
    console.error('[Resume] upload error:', err);
    return res.status(500).json({ error: 'Resume analysis failed' });
  }
};

export const getResumeHistory = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const result = await query(
      'SELECT id, file_name, ats_score, feedback_json, created_at FROM resume_analyses WHERE user_id = $1 ORDER BY created_at DESC LIMIT 10',
      [userId]
    );

    return res.json({
      analyses: result.rows.map((r: any) => ({
        id: r.id,
        fileName: r.file_name,
        atsScore: r.ats_score,
        analysis: JSON.parse(r.feedback_json),
        date: r.created_at,
      })),
    });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch resume history' });
  }
};
