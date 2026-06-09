import React, { useEffect, useState } from 'react';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import GlassCard from '../components/GlassCard';
import { dashboardApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

interface DashboardData {
  user: any;
  streak: { current: number; longest: number };
  xpProgress: { current: number; next: number; progress: number };
  radarData: Array<{ subject: string; score: number; fullMark: number }>;
  weeklyActivity: Array<{ day: string; questions: number }>;
  recentAchievements: Array<{ badge_name: string; earned_at: string }>;
  stats: { questionsAttempted: number; correctAnswers: number; mockInterviews: number };
}

const MODULE_LINKS = [
  { path: '/career-advisor', label: 'Career Advisor', icon: '🧭', color: '#7c3aed', desc: 'Get personalized roadmap' },
  { path: '/aptitude', label: 'Aptitude', icon: '🧮', color: '#06b6d4', desc: 'MCQ practice & quizzes' },
  { path: '/coding', label: 'Coding', icon: '💻', color: '#10b981', desc: 'Solve DSA problems' },
  { path: '/tech-interview', label: 'Tech Interview', icon: '🔬', color: '#f59e0b', desc: 'AI-powered mock rounds' },
  { path: '/hr-interview', label: 'HR Interview', icon: '🤝', color: '#f43f5e', desc: 'Behavioral Q&A practice' },
  { path: '/gd-trainer', label: 'GD Trainer', icon: '🗣️', color: '#a855f7', desc: 'Group discussion sessions' },
  { path: '/resume', label: 'Resume', icon: '📄', color: '#6366f1', desc: 'ATS score & feedback' },
  { path: '/company-hub', label: 'Companies', icon: '🏢', color: '#ec4899', desc: 'Company prep guides' },
  { path: '/tracker', label: 'Tracker', icon: '📅', color: '#14b8a6', desc: 'Daily study goals' },
];

const Dashboard: React.FC = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    dashboardApi.get()
      .then(res => setData(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="page-wrapper">
        <div className="loading-full">
          <div className="spinner" style={{ width: '40px', height: '40px' }} />
          <span>Loading your dashboard...</span>
        </div>
      </div>
    );
  }

  const stats = data?.stats || { questionsAttempted: 0, correctAnswers: 0, mockInterviews: 0 };
  const streak = data?.streak || { current: 0, longest: 0 };
  const xp = data?.xpProgress || { current: 0, next: 100, progress: 0 };
  const userInfo = data?.user || user;

  const accuracy = stats.questionsAttempted > 0
    ? Math.round((stats.correctAnswers / stats.questionsAttempted) * 100)
    : 0;

  return (
    <div className="page-wrapper">
      {/* Header */}
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1 className="page-title">
              Good {new Date().getHours() < 12 ? '🌅 Morning' : new Date().getHours() < 17 ? '☀️ Afternoon' : '🌙 Evening'},{' '}
              <span style={{ background: 'var(--grad-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                {user?.name?.split(' ')[0]}!
              </span>
            </h1>
            <p className="page-subtitle">
              {userInfo?.branch && `${userInfo.branch} · `}
              {userInfo?.college && `${userInfo.college} · `}
              Level {userInfo?.level || 1} Placement Warrior
            </p>
          </div>
          <div style={{
            textAlign: 'right',
            padding: '12px 20px',
            background: 'rgba(245,158,11,0.1)',
            border: '1px solid rgba(245,158,11,0.25)',
            borderRadius: '12px',
          }}>
            <div style={{ fontSize: '28px', fontWeight: 800, color: '#fbbf24' }}>
              🔥 {streak.current}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>Day Streak</div>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Best: {streak.longest}</div>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid-4 mb-6">
        {[
          { label: 'Total XP', value: (userInfo?.xp || 0).toLocaleString(), icon: '⚡', color: '#a855f7', sub: `Level ${userInfo?.level || 1}` },
          { label: 'Readiness', value: `${userInfo?.readinessScore || 0}%`, icon: '🎯', color: '#10b981', sub: 'Placement ready' },
          { label: 'Questions', value: stats.questionsAttempted, icon: '📝', color: '#06b6d4', sub: `${accuracy}% accuracy` },
          { label: 'Mock Sessions', value: stats.mockInterviews, icon: '🤖', color: '#f59e0b', sub: 'Interviews done' },
        ].map((kpi, i) => (
          <GlassCard key={kpi.label} className={`kpi-card animate-fade-up stagger-${i + 1}`}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span className="kpi-label">{kpi.label}</span>
              <span style={{ fontSize: '24px' }}>{kpi.icon}</span>
            </div>
            <div className="kpi-value" style={{ color: kpi.color }}>{kpi.value}</div>
            <div className="kpi-change">{kpi.sub}</div>
          </GlassCard>
        ))}
      </div>

      {/* XP Progress */}
      <GlassCard className="p-5 mb-6 animate-fade-up">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <div>
            <div style={{ fontWeight: 600, marginBottom: '2px' }}>⚡ XP Progress to Level {(userInfo?.level || 1) + 1}</div>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
              {xp.current.toLocaleString()} / {xp.next.toLocaleString()} XP
            </div>
          </div>
          <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-accent)' }}>{xp.progress}%</div>
        </div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${xp.progress}%` }} />
        </div>
      </GlassCard>

      {/* Charts Row */}
      <div className="grid-2 mb-6">
        {/* Radar */}
        <GlassCard className="p-5 animate-fade-up stagger-2">
          <div style={{ fontWeight: 600, marginBottom: '16px' }}>📊 Performance Radar</div>
          {data?.radarData && data.radarData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <RadarChart data={data.radarData}>
                <PolarGrid stroke="rgba(255,255,255,0.1)" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
                <Radar name="Score" dataKey="score" stroke="#7c3aed" fill="rgba(124,58,237,0.3)" strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          ) : (
            <div className="loading-full" style={{ minHeight: '180px' }}>
              <span style={{ fontSize: '40px' }}>📭</span>
              <span style={{ color: 'var(--text-muted)' }}>Start practicing to see your radar chart!</span>
            </div>
          )}
        </GlassCard>

        {/* Weekly Activity */}
        <GlassCard className="p-5 animate-fade-up stagger-3">
          <div style={{ fontWeight: 600, marginBottom: '16px' }}>📅 Weekly Activity</div>
          {data?.weeklyActivity ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={data.weeklyActivity} barSize={28}>
                <XAxis dataKey="day" tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip
                  contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)' }}
                  formatter={(v) => [`${v} questions`, 'Activity']}
                />
                <Bar dataKey="questions" fill="url(#barGrad)" radius={[6, 6, 0, 0]} />
                <defs>
                  <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#7c3aed" />
                    <stop offset="100%" stopColor="#4c1d95" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          ) : null}
        </GlassCard>
      </div>

      {/* Module Grid */}
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
          🚀 Preparation Modules
        </h2>
        <div className="grid-3">
          {MODULE_LINKS.map((mod, i) => (
            <Link
              key={mod.path}
              to={mod.path}
              style={{ textDecoration: 'none' }}
            >
              <GlassCard
                className={`animate-fade-up stagger-${Math.min(i + 1, 5)}`}
                style={{ padding: '18px', cursor: 'pointer' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '44px', height: '44px',
                    background: `${mod.color}22`,
                    border: `1px solid ${mod.color}44`,
                    borderRadius: '10px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '20px', flexShrink: 0,
                  }}>
                    {mod.icon}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--text-primary)', marginBottom: '2px' }}>
                      {mod.label}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{mod.desc}</div>
                  </div>
                </div>
              </GlassCard>
            </Link>
          ))}
        </div>
      </div>

      {/* Achievements */}
      {data?.recentAchievements && data.recentAchievements.length > 0 && (
        <GlassCard className="p-5 animate-fade-up">
          <div style={{ fontWeight: 600, marginBottom: '14px' }}>🏆 Recent Achievements</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            {data.recentAchievements.map((a, i) => (
              <div key={i} style={{
                padding: '8px 14px',
                background: 'rgba(245,158,11,0.1)',
                border: '1px solid rgba(245,158,11,0.25)',
                borderRadius: '999px',
                fontSize: '13px',
                color: '#fbbf24',
              }}>
                {a.badge_name}
              </div>
            ))}
          </div>
        </GlassCard>
      )}
    </div>
  );
};

export default Dashboard;
