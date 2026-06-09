import React, { useState, useEffect } from 'react';
import GlassCard from '../components/GlassCard';
import { trackerApi } from '../services/api';

interface Goal { id: string; title: string; isCompleted: boolean; targetDate: string; }

const Tracker: React.FC = () => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [newGoal, setNewGoal] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  const fetchGoals = async (d: string) => {
    setLoading(true);
    try {
      const res = await trackerApi.getGoals(d);
      setGoals(res.data.goals);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchGoals(date); }, [date]);

  const addGoal = async () => {
    if (!newGoal.trim() || adding) return;
    setAdding(true);
    try {
      const res = await trackerApi.addGoal({ title: newGoal.trim(), targetDate: date });
      setGoals(g => [...g, res.data.goal]);
      setNewGoal('');
    } catch (err) {
      console.error(err);
    } finally {
      setAdding(false);
    }
  };

  const toggleGoal = async (id: string) => {
    try {
      await trackerApi.toggleGoal(id);
      setGoals(g => g.map(goal => goal.id === id ? { ...goal, isCompleted: !goal.isCompleted } : goal));
    } catch (err) {
      console.error(err);
    }
  };

  const deleteGoal = async (id: string) => {
    try {
      await trackerApi.deleteGoal(id);
      setGoals(g => g.filter(goal => goal.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const completed = goals.filter(g => g.isCompleted).length;
  const progress = goals.length > 0 ? Math.round((completed / goals.length) * 100) : 0;

  const SUGGESTED_GOALS = [
    '📖 Solve 2 LeetCode problems',
    '🧮 Complete 10 aptitude questions',
    '🤝 Practice 1 HR interview question',
    '📄 Update resume with recent project',
    '🗣️ Read 1 current affairs article for GD',
    '💻 Review yesterday\'s notes on DSA',
  ];

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <h1 className="page-title">📅 Study Tracker</h1>
        <p className="page-subtitle">Plan and track your daily placement preparation goals</p>
      </div>

      {/* Date picker + Progress */}
      <div className="grid-2 mb-6">
        <GlassCard className="p-5">
          <div style={{ fontWeight: 600, marginBottom: '14px' }}>📆 Select Date</div>
          <input
            type="date"
            className="input-field"
            value={date}
            onChange={e => setDate(e.target.value)}
            id="tracker-date"
          />
          <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
            <button
              className="btn btn-sm btn-ghost"
              onClick={() => {
                const d = new Date();
                d.setDate(d.getDate() - 1);
                setDate(d.toISOString().split('T')[0]);
              }}
            >
              ← Yesterday
            </button>
            <button
              className="btn btn-sm btn-ghost"
              onClick={() => setDate(new Date().toISOString().split('T')[0])}
            >
              Today
            </button>
          </div>
        </GlassCard>

        <GlassCard className="p-5">
          <div style={{ fontWeight: 600, marginBottom: '12px' }}>📊 Today's Progress</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '36px', fontWeight: 900, color: progress >= 80 ? '#34d399' : progress >= 50 ? '#fbbf24' : 'var(--text-primary)' }}>
                {progress}%
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Complete</div>
            </div>
            <div style={{ flex: 1 }}>
              <div className="progress-bar" style={{ height: '10px', marginBottom: '8px' }}>
                <div className="progress-fill" style={{ width: `${progress}%` }} />
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                {completed} of {goals.length} goals done
                {progress === 100 && goals.length > 0 && <span style={{ color: '#34d399' }}> 🎉 All done!</span>}
              </div>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Add Goal */}
      <GlassCard className="p-5 mb-6">
        <div style={{ fontWeight: 600, marginBottom: '14px' }}>➕ Add Goal</div>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '12px' }}>
          <input
            className="input-field"
            placeholder="Enter a study goal for today..."
            value={newGoal}
            onChange={e => setNewGoal(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addGoal()}
            id="new-goal-input"
          />
          <button className="btn btn-primary" onClick={addGoal} disabled={adding || !newGoal.trim()} id="add-goal-btn">
            {adding ? <div className="spinner" style={{ width: '16px', height: '16px' }} /> : '+ Add'}
          </button>
        </div>
        <div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>💡 Quick add suggested goals:</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {SUGGESTED_GOALS.map(g => (
              <button
                key={g}
                className="btn btn-ghost btn-sm"
                style={{ fontSize: '12px' }}
                onClick={() => setNewGoal(g)}
              >
                {g}
              </button>
            ))}
          </div>
        </div>
      </GlassCard>

      {/* Goal List */}
      <GlassCard className="p-5">
        <div style={{ fontWeight: 600, marginBottom: '16px' }}>
          📋 Goals for {new Date(date + 'T12:00:00').toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric' })}
        </div>

        {loading ? (
          <div className="loading-full" style={{ minHeight: '200px' }}>
            <div className="spinner" style={{ width: '32px', height: '32px' }} />
          </div>
        ) : goals.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>📭</div>
            <div>No goals for this day yet. Add some goals to get started!</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {goals.map(goal => (
              <div
                key={goal.id}
                className={`animate-fade-in`}
                style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  padding: '14px 16px',
                  background: goal.isCompleted ? 'rgba(16,185,129,0.06)' : 'rgba(255,255,255,0.03)',
                  borderRadius: '10px',
                  border: `1px solid ${goal.isCompleted ? 'rgba(16,185,129,0.2)' : 'var(--border-color)'}`,
                  transition: 'all 0.2s',
                }}
              >
                <button
                  onClick={() => toggleGoal(goal.id)}
                  style={{
                    width: '24px', height: '24px', borderRadius: '6px', flexShrink: 0,
                    background: goal.isCompleted ? '#10b981' : 'rgba(255,255,255,0.08)',
                    border: `2px solid ${goal.isCompleted ? '#10b981' : 'rgba(255,255,255,0.2)'}`,
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff', fontSize: '13px', transition: 'all 0.2s',
                  }}
                  id={`toggle-${goal.id}`}
                >
                  {goal.isCompleted && '✓'}
                </button>
                <span style={{
                  flex: 1, fontSize: '14px',
                  color: goal.isCompleted ? 'var(--text-muted)' : 'var(--text-primary)',
                  textDecoration: goal.isCompleted ? 'line-through' : 'none',
                }}>
                  {goal.title}
                </span>
                <button
                  onClick={() => deleteGoal(goal.id)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '14px', padding: '4px' }}
                  id={`delete-${goal.id}`}
                >
                  🗑
                </button>
              </div>
            ))}
          </div>
        )}
      </GlassCard>
    </div>
  );
};

export default Tracker;
