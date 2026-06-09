import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { query } from '../config/db';
import { updateStreak } from '../services/game.service';

const uuid = () => crypto.randomUUID();

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password, branch, college, cgpa, skillLevel, targetCompanies } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email and password are required' });
    }

    const existing = await query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const userId = uuid();

    await query(
      `INSERT INTO users (id, name, email, password_hash, branch, college, cgpa, skill_level, target_companies)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [userId, name, email, passwordHash, branch || null, college || null, cgpa || null,
       skillLevel || 'Beginner', targetCompanies ? JSON.stringify(targetCompanies) : null]
    );

    // Initialize progress and streak records
    await query(
      'INSERT INTO user_progress (id, user_id, xp_total, level, readiness_score) VALUES ($1, $2, 0, 1, 0)',
      [uuid(), userId]
    );
    await query(
      'INSERT INTO streaks (id, user_id, current_streak, longest_streak) VALUES ($1, $2, 0, 0)',
      [uuid(), userId]
    );

    const token = jwt.sign(
      { id: userId, email, name },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' }
    );

    return res.status(201).json({
      token,
      user: { id: userId, name, email, branch, college, skillLevel: skillLevel || 'Beginner' },
    });
  } catch (err: any) {
    console.error('[Auth] Register error:', err);
    return res.status(500).json({ error: 'Registration failed' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const result = await query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];

    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) return res.status(401).json({ error: 'Invalid credentials' });

    // Update streak on login
    await updateStreak(user.id);

    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' }
    );

    return res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        branch: user.branch,
        college: user.college,
        skillLevel: user.skill_level,
        cgpa: user.cgpa,
      },
    });
  } catch (err: any) {
    console.error('[Auth] Login error:', err);
    return res.status(500).json({ error: 'Login failed' });
  }
};

export const getProfile = async (req: any, res: Response) => {
  try {
    const userId = req.user.id;
    const result = await query('SELECT id, name, email, branch, college, cgpa, skill_level, target_companies, created_at FROM users WHERE id = $1', [userId]);
    if (!result.rows[0]) return res.status(404).json({ error: 'User not found' });

    return res.json({ user: result.rows[0] });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch profile' });
  }
};
