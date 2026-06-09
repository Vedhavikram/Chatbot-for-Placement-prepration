import { query } from '../config/db';
import crypto from 'crypto';

const uuid = () => crypto.randomUUID();

// XP values for different actions
const XP_REWARDS = {
  aptitude_correct: 15,
  aptitude_incorrect: 3,
  coding_solved: 50,
  coding_attempted: 10,
  interview_completed: 75,
  resume_uploaded: 30,
  daily_login: 20,
  gd_session: 40,
};

// Level thresholds
const LEVEL_THRESHOLDS = [0, 100, 250, 500, 900, 1400, 2000, 2800, 3700, 4800, 6200];

export const getLevel = (xp: number): number => {
  let level = 1;
  for (let i = 1; i < LEVEL_THRESHOLDS.length; i++) {
    if (xp >= LEVEL_THRESHOLDS[i]) level = i + 1;
    else break;
  }
  return level;
};

export const xpToNextLevel = (xp: number): { current: number; next: number; progress: number } => {
  const level = getLevel(xp);
  const currentThreshold = LEVEL_THRESHOLDS[level - 1] || 0;
  const nextThreshold = LEVEL_THRESHOLDS[level] || LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1] + 1000;
  return {
    current: xp - currentThreshold,
    next: nextThreshold - currentThreshold,
    progress: Math.round(((xp - currentThreshold) / (nextThreshold - currentThreshold)) * 100),
  };
};

export const awardXP = async (userId: string, action: keyof typeof XP_REWARDS): Promise<{ xp: number; level: number; newBadges: string[] }> => {
  const xpGain = XP_REWARDS[action];

  // Get current progress
  const res = await query('SELECT * FROM user_progress WHERE user_id = $1', [userId]);
  if (!res.rows[0]) {
    // Insert if not present
    await query(
      'INSERT INTO user_progress (id, user_id, xp_total, level) VALUES ($1, $2, $3, $4)',
      [uuid(), userId, xpGain, 1]
    );
    return { xp: xpGain, level: 1, newBadges: [] };
  }

  const current = res.rows[0];
  const newXp = (current.xp_total || 0) + xpGain;
  const newLevel = getLevel(newXp);

  await query('UPDATE user_progress SET xp_total = $1, level = $2 WHERE user_id = $3', [newXp, newLevel, userId]);

  // Check for new badges
  const newBadges: string[] = [];
  if (action === 'aptitude_correct') {
    const attemptsRes = await query(
      'SELECT COUNT(*) as count FROM question_attempts WHERE user_id = $1 AND is_correct = 1', [userId]
    );
    const correctCount = parseInt(attemptsRes.rows[0]?.count || '0');
    if (correctCount === 10) newBadges.push('🎯 Sharp Shooter — 10 correct answers');
    if (correctCount === 50) newBadges.push('🧠 Quiz Master — 50 correct answers');
  }

  if (action === 'coding_solved') {
    const codeRes = await query(
      'SELECT COUNT(*) as count FROM question_attempts WHERE user_id = $1 AND is_correct = 1', [userId]
    );
    const solvedCount = parseInt(codeRes.rows[0]?.count || '0');
    if (solvedCount === 1) newBadges.push('💻 First Solve — Solved your first coding problem!');
    if (solvedCount === 25) newBadges.push('🚀 Code Warrior — Solved 25 coding problems!');
  }

  if (newLevel > (current.level || 1)) {
    newBadges.push(`⬆️ Level Up! You reached Level ${newLevel}`);
  }

  // Save badges to DB
  for (const badge of newBadges) {
    await query('INSERT INTO achievements (id, user_id, badge_name) VALUES ($1, $2, $3)', [uuid(), userId, badge]);
  }

  return { xp: newXp, level: newLevel, newBadges };
};

export const updateStreak = async (userId: string): Promise<{ streak: number; xpBonus: number }> => {
  const today = new Date().toISOString().split('T')[0];

  const res = await query('SELECT * FROM streaks WHERE user_id = $1', [userId]);

  if (!res.rows[0]) {
    await query(
      'INSERT INTO streaks (id, user_id, current_streak, longest_streak, last_active_date) VALUES ($1, $2, 1, 1, $3)',
      [uuid(), userId, today]
    );
    return { streak: 1, xpBonus: 0 };
  }

  const streak = res.rows[0];
  const lastDate = streak.last_active_date;

  if (lastDate === today) return { streak: streak.current_streak, xpBonus: 0 }; // Already active today

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  let newStreak = lastDate === yesterdayStr ? streak.current_streak + 1 : 1;
  const longestStreak = Math.max(streak.longest_streak, newStreak);

  await query(
    'UPDATE streaks SET current_streak = $1, longest_streak = $2, last_active_date = $3 WHERE user_id = $4',
    [newStreak, longestStreak, today, userId]
  );

  // Bonus XP for milestone streaks
  let xpBonus = 0;
  if (newStreak === 7) xpBonus = 100;
  if (newStreak === 30) xpBonus = 500;
  if (newStreak % 10 === 0 && newStreak > 0) xpBonus = 50;

  if (xpBonus > 0) {
    await query('UPDATE user_progress SET xp_total = xp_total + $1 WHERE user_id = $2', [xpBonus, userId]);
  }

  return { streak: newStreak, xpBonus };
};

export const updateReadinessScore = async (userId: string): Promise<number> => {
  // Calculate readiness based on activity across modules
  const [aptRes, codeRes, interviewRes, resumeRes] = await Promise.all([
    query('SELECT COUNT(*) as total, SUM(CASE WHEN is_correct = 1 THEN 1 ELSE 0 END) as correct FROM question_attempts WHERE user_id = $1', [userId]),
    query('SELECT COUNT(*) as count FROM question_attempts WHERE user_id = $1', [userId]),
    query('SELECT COUNT(*) as count FROM mock_sessions WHERE user_id = $1', [userId]),
    query('SELECT COUNT(*) as count FROM resume_analyses WHERE user_id = $1', [userId]),
  ]);

  const aptTotal = parseInt(aptRes.rows[0]?.total || '0');
  const aptCorrect = parseInt(aptRes.rows[0]?.correct || '0');
  const aptScore = aptTotal > 0 ? Math.min(30, Math.round((aptCorrect / aptTotal) * 30)) : 0;

  const codeAttempts = parseInt(codeRes.rows[0]?.count || '0');
  const codeScore = Math.min(25, codeAttempts * 2);

  const interviewCount = parseInt(interviewRes.rows[0]?.count || '0');
  const interviewScore = Math.min(25, interviewCount * 5);

  const resumeUploaded = parseInt(resumeRes.rows[0]?.count || '0');
  const resumeScore = resumeUploaded > 0 ? 20 : 0;

  const readiness = aptScore + codeScore + interviewScore + resumeScore;
  await query('UPDATE user_progress SET readiness_score = $1 WHERE user_id = $2', [readiness, userId]);

  return readiness;
};
