import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { query } from '../config/db';
import { xpToNextLevel } from '../services/game.service';

export const getDashboard = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    const [userRes, progressRes, streakRes, achievementsRes, attemptsRes, sessionsRes] = await Promise.all([
      query('SELECT name, email, branch, college, skill_level FROM users WHERE id = $1', [userId]),
      query('SELECT * FROM user_progress WHERE user_id = $1', [userId]),
      query('SELECT * FROM streaks WHERE user_id = $1', [userId]),
      query('SELECT badge_name, earned_at FROM achievements WHERE user_id = $1 ORDER BY earned_at DESC LIMIT 5', [userId]),
      query('SELECT module, topic, is_correct, attempted_at FROM question_attempts WHERE user_id = $1 ORDER BY attempted_at DESC LIMIT 20', [userId]),
      query('SELECT type, score, created_at FROM mock_sessions WHERE user_id = $1 ORDER BY created_at DESC LIMIT 10', [userId]),
    ]);

    const user = userRes.rows[0];
    const progress = progressRes.rows[0] || { xp_total: 0, level: 1, readiness_score: 0 };
    const streak = streakRes.rows[0] || { current_streak: 0, longest_streak: 0 };
    const xpInfo = xpToNextLevel(progress.xp_total || 0);

    // Build radar chart data
    const moduleScores = { Aptitude: 0, Technical: 0, Coding: 0, HR: 0, GD: 0, Resume: 0 };
    
    const aptAttempts = attemptsRes.rows.filter((r: any) => r.module === 'aptitude');
    const techAttempts = attemptsRes.rows.filter((r: any) => r.module === 'technical');
    const codingAttempts = attemptsRes.rows.filter((r: any) => r.module === 'coding');
    
    if (aptAttempts.length > 0) {
      moduleScores.Aptitude = Math.round((aptAttempts.filter((r: any) => r.is_correct == 1).length / aptAttempts.length) * 100);
    }
    if (techAttempts.length > 0) {
      moduleScores.Technical = Math.round((techAttempts.filter((r: any) => r.is_correct == 1).length / techAttempts.length) * 100);
    }
    if (codingAttempts.length > 0) {
      moduleScores.Coding = Math.round((codingAttempts.filter((r: any) => r.is_correct == 1).length / codingAttempts.length) * 100);
    }

    const hrSessions = sessionsRes.rows.filter((r: any) => r.type === 'hr');
    const gdSessions = sessionsRes.rows.filter((r: any) => r.type === 'gd');
    
    if (hrSessions.length > 0) {
      moduleScores.HR = Math.round(hrSessions.reduce((s: number, r: any) => s + r.score, 0) / hrSessions.length);
    }
    if (gdSessions.length > 0) {
      moduleScores.GD = Math.round(gdSessions.reduce((s: number, r: any) => s + r.score, 0) / gdSessions.length);
    }

    const resumeRes = await query('SELECT ats_score FROM resume_analyses WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1', [userId]);
    if (resumeRes.rows[0]) {
      moduleScores.Resume = resumeRes.rows[0].ats_score;
    }

    // Weekly activity (last 7 days)
    const weeklyActivity = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      const dateStr = date.toISOString().split('T')[0];
      const dayAttempts = attemptsRes.rows.filter((r: any) => r.attempted_at?.startsWith(dateStr)).length;
      return {
        day: date.toLocaleDateString('en', { weekday: 'short' }),
        questions: dayAttempts,
      };
    });

    return res.json({
      user: { ...user, xp: progress.xp_total, level: progress.level, readinessScore: progress.readiness_score },
      streak: { current: streak.current_streak, longest: streak.longest_streak },
      xpProgress: xpInfo,
      radarData: Object.entries(moduleScores).map(([subject, score]) => ({ subject, score, fullMark: 100 })),
      weeklyActivity,
      recentAchievements: achievementsRes.rows,
      stats: {
        questionsAttempted: attemptsRes.rows.length,
        correctAnswers: attemptsRes.rows.filter((r: any) => r.is_correct == 1).length,
        mockInterviews: sessionsRes.rows.length,
      },
    });
  } catch (err: any) {
    console.error('[Dashboard] Error:', err);
    return res.status(500).json({ error: 'Failed to load dashboard' });
  }
};

export const getLeaderboard = async (req: AuthRequest, res: Response) => {
  try {
    const { filter = 'global' } = req.query;
    
    const result = await query(
      `SELECT u.id, u.name, u.branch, u.college, p.xp_total, p.level, p.readiness_score
       FROM users u JOIN user_progress p ON u.id = p.user_id
       ORDER BY p.xp_total DESC LIMIT 50`
    );

    const leaderboard = result.rows.map((r: any, i: number) => ({
      rank: i + 1,
      id: r.id,
      name: r.name,
      branch: r.branch,
      college: r.college,
      xp: r.xp_total,
      level: r.level,
      readiness: r.readiness_score,
    }));

    return res.json({ leaderboard });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to load leaderboard' });
  }
};
