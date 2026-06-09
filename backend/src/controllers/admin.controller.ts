import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { query } from '../config/db';
import crypto from 'crypto';

const uuid = () => crypto.randomUUID();

export const getGoals = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { date } = req.query;
    const targetDate = date || new Date().toISOString().split('T')[0];

    const result = await query(
      'SELECT * FROM tracker_goals WHERE user_id = $1 AND target_date = $2 ORDER BY created_at ASC',
      [userId, targetDate]
    );

    return res.json({
      goals: result.rows.map((r: any) => ({
        id: r.id,
        title: r.title,
        isCompleted: r.is_completed === 1 || r.is_completed === true,
        targetDate: r.target_date,
      })),
      date: targetDate,
    });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch goals' });
  }
};

export const addGoal = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { title, targetDate } = req.body;

    if (!title) return res.status(400).json({ error: 'Title is required' });

    const date = targetDate || new Date().toISOString().split('T')[0];
    const id = uuid();

    await query(
      'INSERT INTO tracker_goals (id, user_id, title, is_completed, target_date) VALUES ($1, $2, $3, 0, $4)',
      [id, userId, title, date]
    );

    return res.status(201).json({ goal: { id, title, isCompleted: false, targetDate: date } });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to add goal' });
  }
};

export const toggleGoal = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { goalId } = req.params;

    const existing = await query('SELECT * FROM tracker_goals WHERE id = $1 AND user_id = $2', [goalId, userId]);
    if (!existing.rows[0]) return res.status(404).json({ error: 'Goal not found' });

    const current = existing.rows[0];
    const newStatus = current.is_completed === 1 || current.is_completed === true ? 0 : 1;

    await query('UPDATE tracker_goals SET is_completed = $1 WHERE id = $2', [newStatus, goalId]);

    return res.json({ isCompleted: newStatus === 1 });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to toggle goal' });
  }
};

export const deleteGoal = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { goalId } = req.params;

    await query('DELETE FROM tracker_goals WHERE id = $1 AND user_id = $2', [goalId, userId]);
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to delete goal' });
  }
};
