import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { query } from '../config/db';
import { awardXP } from '../services/game.service';
import crypto from 'crypto';

const uuid = () => crypto.randomUUID();

export const getQuestion = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { module = 'aptitude', topic, difficulty } = req.query;

    // Get user's history to avoid repeats
    const attemptedRes = await query(
      'SELECT question_id FROM question_attempts WHERE user_id = $1',
      [userId]
    );
    const attemptedIds = attemptedRes.rows.map((r: any) => r.question_id);

    // Build adaptive query
    let whereClause = `WHERE q.module = $1`;
    const params: any[] = [module];

    if (topic) {
      params.push(topic);
      whereClause += ` AND q.topic = $${params.length}`;
    }
    if (difficulty) {
      params.push(difficulty);
      whereClause += ` AND q.difficulty = $${params.length}`;
    }

    // Prefer unattempted questions
    const questionRes = await query(
      `SELECT q.* FROM questions q ${whereClause} ORDER BY RANDOM() LIMIT 10`,
      params
    );

    const unattempted = questionRes.rows.filter((q: any) => !attemptedIds.includes(q.id));
    const selected = unattempted.length > 0 ? unattempted[0] : questionRes.rows[0];

    if (!selected) {
      return res.status(404).json({ error: 'No questions found for the given criteria' });
    }

    return res.json({
      question: {
        id: selected.id,
        module: selected.module,
        topic: selected.topic,
        difficulty: selected.difficulty,
        content: selected.content,
        options: selected.options ? JSON.parse(selected.options) : null,
        companyTags: selected.company_tags ? JSON.parse(selected.company_tags) : [],
        codingTemplate: selected.coding_template ? JSON.parse(selected.coding_template) : null,
        testCases: selected.test_cases
          ? JSON.parse(selected.test_cases).filter((tc: any) => !tc.is_hidden)
          : null,
      },
    });
  } catch (err: any) {
    console.error('[Aptitude] getQuestion error:', err);
    return res.status(500).json({ error: 'Failed to fetch question' });
  }
};

export const submitAnswer = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { questionId, answer, timeTaken } = req.body;

    const qRes = await query('SELECT * FROM questions WHERE id = $1', [questionId]);
    const question = qRes.rows[0];
    if (!question) return res.status(404).json({ error: 'Question not found' });

    const isCorrect = answer?.trim().toLowerCase() === question.answer?.trim().toLowerCase();

    await query(
      'INSERT INTO question_attempts (id, user_id, question_id, is_correct, time_taken) VALUES ($1, $2, $3, $4, $5)',
      [uuid(), userId, questionId, isCorrect ? 1 : 0, timeTaken || 0]
    );

    const xpResult = await awardXP(userId, isCorrect ? 'aptitude_correct' : 'aptitude_incorrect');

    return res.json({
      correct: isCorrect,
      correctAnswer: question.answer,
      explanation: question.explanation,
      xpEarned: isCorrect ? 15 : 3,
      ...xpResult,
    });
  } catch (err: any) {
    console.error('[Aptitude] submitAnswer error:', err);
    return res.status(500).json({ error: 'Failed to submit answer' });
  }
};

export const getTopics = async (req: AuthRequest, res: Response) => {
  try {
    const { module = 'aptitude' } = req.query;
    const result = await query(
      'SELECT DISTINCT topic FROM questions WHERE module = $1 ORDER BY topic',
      [module]
    );
    return res.json({ topics: result.rows.map((r: any) => r.topic) });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch topics' });
  }
};
