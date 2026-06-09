import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { query } from '../config/db';
import { evaluateTechAnswer, evaluateHRAnswer, evaluateGDPerformance } from '../services/ai.service';
import { awardXP } from '../services/game.service';
import crypto from 'crypto';

const uuid = () => crypto.randomUUID();

const TECH_QUESTIONS = [
  'Explain the difference between a process and a thread.',
  'What is a deadlock and how can it be prevented?',
  'Explain normalization in databases. What are 1NF, 2NF, 3NF?',
  'What is the difference between TCP and UDP?',
  'Explain the concept of virtual memory.',
  'What are RESTful APIs? Describe the HTTP methods.',
  'Explain time and space complexity. What is Big O notation?',
  'What is the difference between SQL and NoSQL databases?',
  'Explain the concept of Object-Oriented Programming with examples.',
  'What is a binary search tree? Describe insert and search operations.',
];

const HR_QUESTIONS = [
  'Tell me about yourself.',
  'Why do you want to work for our company?',
  'What are your strengths and weaknesses?',
  'Tell me about a challenging project you worked on.',
  'Where do you see yourself in 5 years?',
  'How do you handle pressure and tight deadlines?',
  'Describe a time you worked in a team and resolved a conflict.',
  'What motivates you to work hard?',
  'Why should we hire you over other candidates?',
  'What salary are you expecting?',
];

const GD_TOPICS = [
  'Artificial Intelligence: Boon or Bane for Humanity?',
  'Work from Home vs Office — Which is more productive?',
  'Climate Change: Is India doing enough?',
  'Should social media be regulated by governments?',
  'Electric vehicles: The future of transportation in India',
  'Brain drain: Is India losing its best talent?',
  'Is campus placement the right measure of education quality?',
  'Cryptocurrency: The future of finance or a risky gamble?',
];

// ─── Technical Interview ─────────────────────────────────────────────────────

export const startTechInterview = async (req: AuthRequest, res: Response) => {
  try {
    const firstQuestion = TECH_QUESTIONS[Math.floor(Math.random() * TECH_QUESTIONS.length)];
    return res.json({
      sessionId: uuid(),
      question: firstQuestion,
      round: 1,
      totalRounds: 5,
      message: 'Technical interview started! Answer each question clearly and concisely.',
    });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to start interview' });
  }
};

export const respondTech = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { question, answer, round } = req.body;

    if (!question || !answer) {
      return res.status(400).json({ error: 'question and answer are required' });
    }

    const evaluation = await evaluateTechAnswer(question, answer, round || 1);

    if (evaluation.finished) {
      // Save session
      const score = evaluation.evaluation?.score || 70;
      await query(
        'INSERT INTO mock_sessions (id, user_id, type, score, feedback_json) VALUES ($1, $2, $3, $4, $5)',
        [uuid(), userId, 'technical', score, JSON.stringify(evaluation)]
      );
      await awardXP(userId, 'interview_completed');
    }

    return res.json(evaluation);
  } catch (err: any) {
    console.error('[Interview] respondTech error:', err);
    return res.status(500).json({ error: 'Failed to evaluate answer' });
  }
};

// ─── HR Interview ────────────────────────────────────────────────────────────

export const startHRInterview = async (req: AuthRequest, res: Response) => {
  try {
    const { targetCompany } = req.body;
    const firstQuestion = HR_QUESTIONS[0];
    return res.json({
      sessionId: uuid(),
      question: firstQuestion,
      round: 1,
      totalRounds: 6,
      targetCompany: targetCompany || 'Top companies',
      message: `HR interview for ${targetCompany || 'general placement'}. Use the STAR method for behavioral questions.`,
    });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to start HR interview' });
  }
};

export const respondHR = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { question, answer, round, finished } = req.body;

    if (!question || !answer) {
      return res.status(400).json({ error: 'question and answer are required' });
    }

    const evaluation = await evaluateHRAnswer(question, answer);

    if (finished) {
      const score = evaluation.feedback?.score || 70;
      await query(
        'INSERT INTO mock_sessions (id, user_id, type, score, feedback_json) VALUES ($1, $2, $3, $4, $5)',
        [uuid(), userId, 'hr', score, JSON.stringify(evaluation)]
      );
      await awardXP(userId, 'interview_completed');
    }

    return res.json(evaluation);
  } catch (err: any) {
    console.error('[Interview] respondHR error:', err);
    return res.status(500).json({ error: 'Failed to evaluate HR answer' });
  }
};

// ─── Group Discussion ─────────────────────────────────────────────────────────

export const startGD = async (req: AuthRequest, res: Response) => {
  try {
    const topic = GD_TOPICS[Math.floor(Math.random() * GD_TOPICS.length)];
    return res.json({
      sessionId: uuid(),
      topic,
      duration: 10, // minutes
      participants: ['You', 'AI Participant 1', 'AI Participant 2', 'AI Participant 3'],
      message: 'Group discussion started! State your points clearly, refer to facts, and engage with other participants.',
      aiOpener: `I believe the topic "${topic}" is extremely relevant today. Let me begin by stating that...`,
    });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to start GD session' });
  }
};

export const submitGDPoints = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { topic, points } = req.body;

    if (!topic || !points) {
      return res.status(400).json({ error: 'topic and points array are required' });
    }

    const feedback = await evaluateGDPerformance(topic, points);

    await query(
      'INSERT INTO mock_sessions (id, user_id, type, score, feedback_json) VALUES ($1, $2, $3, $4, $5)',
      [uuid(), userId, 'gd', feedback.overallScore || 70, JSON.stringify(feedback)]
    );
    await awardXP(userId, 'gd_session');

    return res.json({ feedback });
  } catch (err: any) {
    console.error('[Interview] submitGDPoints error:', err);
    return res.status(500).json({ error: 'Failed to evaluate GD session' });
  }
};

export const getInterviewHistory = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { type } = req.query;

    let whereClause = 'WHERE user_id = $1';
    const params: any[] = [userId];

    if (type) {
      params.push(type);
      whereClause += ` AND type = $${params.length}`;
    }

    const result = await query(
      `SELECT id, type, score, feedback_json, created_at FROM mock_sessions ${whereClause} ORDER BY created_at DESC LIMIT 20`,
      params
    );

    return res.json({
      sessions: result.rows.map((r: any) => ({
        id: r.id,
        type: r.type,
        score: r.score,
        feedback: JSON.parse(r.feedback_json),
        date: r.created_at,
      })),
    });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch interview history' });
  }
};
