import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { query } from '../config/db';
import { executeCode } from '../services/sandbox.service';
import { reviewCode } from '../services/ai.service';
import { awardXP } from '../services/game.service';
import crypto from 'crypto';

const uuid = () => crypto.randomUUID();

export const getCodingQuestion = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { difficulty, topic } = req.query;

    const attemptedRes = await query(
      'SELECT question_id FROM question_attempts WHERE user_id = $1',
      [userId]
    );
    const attemptedIds = attemptedRes.rows.map((r: any) => r.question_id);

    let whereClause = `WHERE q.module = 'coding'`;
    const params: any[] = [];

    if (difficulty) {
      params.push(difficulty);
      whereClause += ` AND q.difficulty = $${params.length}`;
    }
    if (topic) {
      params.push(topic);
      whereClause += ` AND q.topic = $${params.length}`;
    }

    const questionRes = await query(
      `SELECT q.* FROM questions q ${whereClause} ORDER BY RANDOM() LIMIT 10`,
      params
    );

    const unattempted = questionRes.rows.filter((q: any) => !attemptedIds.includes(q.id));
    const selected = unattempted.length > 0 ? unattempted[0] : questionRes.rows[0];

    if (!selected) {
      return res.status(404).json({ error: 'No coding problems found' });
    }

    const testCases = selected.test_cases ? JSON.parse(selected.test_cases) : [];

    return res.json({
      question: {
        id: selected.id,
        topic: selected.topic,
        difficulty: selected.difficulty,
        content: selected.content,
        companyTags: selected.company_tags ? JSON.parse(selected.company_tags) : [],
        codingTemplate: selected.coding_template ? JSON.parse(selected.coding_template) : {},
        visibleTestCases: testCases.filter((tc: any) => !tc.is_hidden),
        hiddenTestCaseCount: testCases.filter((tc: any) => tc.is_hidden).length,
      },
    });
  } catch (err: any) {
    console.error('[Coding] getCodingQuestion error:', err);
    return res.status(500).json({ error: 'Failed to fetch problem' });
  }
};

export const submitCode = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { questionId, code, language } = req.body;

    if (!questionId || !code || !language) {
      return res.status(400).json({ error: 'questionId, code, and language are required' });
    }

    const qRes = await query('SELECT * FROM questions WHERE id = $1', [questionId]);
    const question = qRes.rows[0];
    if (!question) return res.status(404).json({ error: 'Question not found' });

    const result = executeCode(code, language, question.test_cases || '[]');

    await query(
      'INSERT INTO question_attempts (id, user_id, question_id, is_correct, time_taken) VALUES ($1, $2, $3, $4, $5)',
      [uuid(), userId, questionId, result.passed ? 1 : 0, result.executionTime]
    );

    const xpResult = await awardXP(userId, result.passed ? 'coding_solved' : 'coding_attempted');

    return res.json({
      ...result,
      xpEarned: result.passed ? 50 : 10,
      ...xpResult,
    });
  } catch (err: any) {
    console.error('[Coding] submitCode error:', err);
    return res.status(500).json({ error: 'Code execution failed' });
  }
};

export const reviewCodeHandler = async (req: AuthRequest, res: Response) => {
  try {
    const { code, language, problem } = req.body;
    if (!code || !language) return res.status(400).json({ error: 'code and language are required' });

    const review = await reviewCode(code, language, problem || 'Unknown problem');
    return res.json({ review });
  } catch (err: any) {
    console.error('[Coding] reviewCode error:', err);
    return res.status(500).json({ error: 'Code review failed' });
  }
};
