import React, { useState, useEffect } from 'react';
import GlassCard from '../components/GlassCard';
import { advisorApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

const CareerAdvisor: React.FC = () => {
  const { user } = useAuth();
  const [roadmap, setRoadmap] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    targets: user?.branch === 'CSE' ? 'Zoho, Google, Microsoft' : 'TCS, Infosys, Wipro',
    interests: 'Full Stack Development, AI/ML',
    currentSkills: 'Python, JavaScript',
    weakAreas: 'DSA, System Design',
  });

  const generateRoadmap = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await advisorApi.analyze({
        targets: form.targets,
        interests: form.interests.split(',').map(s => s.trim()),
        currentSkills: form.currentSkills.split(',').map(s => s.trim()),
        weakAreas: form.weakAreas.split(',').map(s => s.trim()),
      });
      setRoadmap(res.data.roadmap);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const phaseColor = { phase30: '#06b6d4', phase60: '#a855f7', phase90: '#10b981' };

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <h1 className="page-title">🧭 Career Advisor</h1>
        <p className="page-subtitle">Get a personalized 30/60/90-day placement preparation roadmap powered by AI</p>
      </div>

      {/* Profile Form */}
      <GlassCard className="p-6 mb-6">
        <div style={{ fontWeight: 600, fontSize: '16px', marginBottom: '20px' }}>📋 Your Placement Profile</div>
        <form onSubmit={generateRoadmap}>
          <div className="grid-2" style={{ gap: '16px', marginBottom: '16px' }}>
            <div>
              <label className="label">Target Companies *</label>
              <input
                className="input-field"
                placeholder="e.g. TCS, Zoho, Infosys"
                value={form.targets}
                onChange={e => setForm(f => ({ ...f, targets: e.target.value }))}
                required
                id="target-companies-input"
              />
            </div>
            <div>
              <label className="label">Areas of Interest</label>
              <input
                className="input-field"
                placeholder="e.g. Full Stack, AI/ML, DevOps"
                value={form.interests}
                onChange={e => setForm(f => ({ ...f, interests: e.target.value }))}
                id="interests-input"
              />
            </div>
            <div>
              <label className="label">Current Skills</label>
              <input
                className="input-field"
                placeholder="e.g. Python, React, SQL"
                value={form.currentSkills}
                onChange={e => setForm(f => ({ ...f, currentSkills: e.target.value }))}
                id="skills-input"
              />
            </div>
            <div>
              <label className="label">Weak Areas</label>
              <input
                className="input-field"
                placeholder="e.g. DSA, System Design, DBMS"
                value={form.weakAreas}
                onChange={e => setForm(f => ({ ...f, weakAreas: e.target.value }))}
                id="weak-areas-input"
              />
            </div>
          </div>
          <button type="submit" className="btn btn-primary btn-lg" disabled={loading} id="generate-roadmap-btn">
            {loading ? <><div className="spinner" style={{ width: '18px', height: '18px' }} /> Generating...</> : '🤖 Generate My Roadmap'}
          </button>
        </form>
      </GlassCard>

      {/* Roadmap Result */}
      {roadmap && (
        <div className="animate-fade-in">
          {/* Summary */}
          {roadmap.summary && (
            <GlassCard className="p-5 mb-6" style={{ background: 'rgba(124,58,237,0.06)', borderColor: 'rgba(124,58,237,0.2)' }}>
              <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '32px' }}>🎯</span>
                <div>
                  <div style={{ fontWeight: 600, marginBottom: '6px' }}>Your Personalized Strategy</div>
                  <div style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.7 }}>{roadmap.summary}</div>
                </div>
              </div>
            </GlassCard>
          )}

          {/* 3 Phases */}
          <div className="grid-3 mb-6">
            {[
              { key: 'phase30', label: '30 Days', icon: '🚀', color: phaseColor.phase30 },
              { key: 'phase60', label: '60 Days', icon: '⚡', color: phaseColor.phase60 },
              { key: 'phase90', label: '90 Days', icon: '🏆', color: phaseColor.phase90 },
            ].map(({ key, label, icon, color }) => {
              const phase = roadmap[key];
              if (!phase) return null;
              return (
                <GlassCard key={key} className="p-5" style={{ borderTop: `3px solid ${color}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                    <span style={{ fontSize: '22px' }}>{icon}</span>
                    <div>
                      <div style={{ fontWeight: 700, color }}>Day 1 – {label}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{phase.title}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {(phase.tasks || []).map((task: string, i: number) => (
                      <div key={i} style={{ display: 'flex', gap: '8px', fontSize: '13px', lineHeight: 1.5 }}>
                        <span style={{ color, flexShrink: 0, marginTop: '1px' }}>▸</span>
                        <span style={{ color: 'var(--text-secondary)' }}>{task}</span>
                      </div>
                    ))}
                  </div>
                </GlassCard>
              );
            })}
          </div>

          <div className="grid-2 mb-6">
            {/* Daily Goals */}
            {roadmap.dailyGoals && (
              <GlassCard className="p-5">
                <div style={{ fontWeight: 600, marginBottom: '14px' }}>📅 Daily Study Routine</div>
                {roadmap.dailyGoals.map((goal: string, i: number) => (
                  <div key={i} style={{
                    display: 'flex', gap: '10px', padding: '10px 12px',
                    background: 'rgba(16,185,129,0.06)', borderRadius: '8px',
                    marginBottom: '8px', border: '1px solid rgba(16,185,129,0.15)',
                  }}>
                    <span style={{ color: '#34d399', fontWeight: 700 }}>D{i + 1}</span>
                    <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{goal}</span>
                  </div>
                ))}
              </GlassCard>
            )}

            {/* Skill Gaps */}
            {roadmap.skillGaps && (
              <GlassCard className="p-5">
                <div style={{ fontWeight: 600, marginBottom: '14px' }}>🔧 Identified Skill Gaps</div>
                {roadmap.skillGaps.map((gap: string, i: number) => (
                  <div key={i} style={{
                    display: 'flex', gap: '10px', padding: '10px 12px',
                    background: 'rgba(244,63,94,0.06)', borderRadius: '8px',
                    marginBottom: '8px', border: '1px solid rgba(244,63,94,0.15)',
                    alignItems: 'center',
                  }}>
                    <span style={{ color: '#fb7185' }}>⚠</span>
                    <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{gap}</span>
                  </div>
                ))}
                <div style={{ marginTop: '12px' }}>
                  <button className="btn btn-primary btn-sm" onClick={generateRoadmap} id="regenerate-roadmap-btn">
                    🔄 Regenerate Roadmap
                  </button>
                </div>
              </GlassCard>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CareerAdvisor;
