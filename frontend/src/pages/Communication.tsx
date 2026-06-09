import React, { useState, useEffect } from 'react';
import GlassCard from '../components/GlassCard';

const TIPS = [
  { icon: '🗣️', title: 'Active Listening', tip: 'Maintain eye contact, nod, and paraphrase what you hear.' },
  { icon: '🎤', title: 'Voice Modulation', tip: 'Vary pitch and pace — avoid a monotone delivery.' },
  { icon: '📖', title: 'Vocabulary Building', tip: 'Learn 5 new words daily and use them in sentences.' },
  { icon: '🤲', title: 'Body Language', tip: 'Sit straight, avoid crossing arms, use open gestures.' },
  { icon: '🌐', title: 'Fluency Practice', tip: 'Read English news aloud for 10 minutes every morning.' },
  { icon: '📞', title: 'Telephonic Skills', tip: 'Practice clear, professional phone conversations.' },
];

const EXERCISES = [
  { id: 'ex1', title: 'Mirror Practice', desc: 'Spend 5 mins daily speaking in front of a mirror on any topic.', duration: '5 min/day' },
  { id: 'ex2', title: 'JAM (Just a Minute)', desc: 'Speak on a random topic for 1 minute without pausing or repeating.', duration: '1 min' },
  { id: 'ex3', title: 'Debate Practice', desc: 'Take both sides of a controversial topic and argue each position.', duration: '10 min' },
  { id: 'ex4', title: 'Listening Comprehension', desc: 'Watch TED Talks and summarize the key points in your own words.', duration: '15 min' },
  { id: 'ex5', title: 'Vocabulary in Context', desc: 'Write 3 sentences using each new word you learn this week.', duration: '10 min' },
];

const Communication: React.FC = () => {
  const [completedExercises, setCompletedExercises] = useState<string[]>([]);

  // Load progress from local storage
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const saved = localStorage.getItem(`comm_progress_${today}`);
    if (saved) {
      try {
        setCompletedExercises(JSON.parse(saved));
      } catch (err) {
        console.error("Failed to load progress", err);
      }
    }
  }, []);

  const toggleExercise = (id: string) => {
    const today = new Date().toISOString().split('T')[0];
    let updated;
    if (completedExercises.includes(id)) {
      updated = completedExercises.filter(e => e !== id);
    } else {
      updated = [...completedExercises, id];
    }
    setCompletedExercises(updated);
    localStorage.setItem(`comm_progress_${today}`, JSON.stringify(updated));
  };

  const progress = Math.round((completedExercises.length / EXERCISES.length) * 100);

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <h1 className="page-title">📢 Communication Skills</h1>
        <p className="page-subtitle">Improve verbal fluency, body language, vocabulary, and overall professional communication</p>
      </div>

      <div className="grid-3 mb-6">
        {TIPS.map((tip, i) => (
          <GlassCard key={tip.title} className={`p-5 animate-fade-up stagger-${i + 1}`}>
            <div style={{ fontSize: '28px', marginBottom: '10px' }}>{tip.icon}</div>
            <div style={{ fontWeight: 600, marginBottom: '6px' }}>{tip.title}</div>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{tip.tip}</div>
          </GlassCard>
        ))}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 700 }}>🏋️ Daily Exercises</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '14px', fontWeight: 600, color: progress === 100 ? '#34d399' : 'var(--text-primary)' }}>
            {progress}% Completed
          </span>
          <div className="progress-bar" style={{ width: '100px', height: '8px' }}>
            <div className="progress-fill" style={{ width: `${progress}%`, background: progress === 100 ? '#34d399' : 'var(--accent-primary)' }} />
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {EXERCISES.map((ex, i) => {
          const isCompleted = completedExercises.includes(ex.id);
          return (
            <GlassCard 
              key={ex.id} 
              className={`p-5 animate-fade-up stagger-${i + 1}`}
              style={{
                cursor: 'pointer',
                border: isCompleted ? '1px solid rgba(16,185,129,0.3)' : '1px solid var(--border-color)',
                background: isCompleted ? 'rgba(16,185,129,0.05)' : undefined,
                transition: 'all 0.2s ease'
              }}
              onClick={() => toggleExercise(ex.id)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                  <button
                    style={{
                      width: '24px', height: '24px', borderRadius: '6px', flexShrink: 0,
                      background: isCompleted ? '#10b981' : 'rgba(255,255,255,0.08)',
                      border: `2px solid ${isCompleted ? '#10b981' : 'rgba(255,255,255,0.2)'}`,
                      cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#fff', fontSize: '13px', transition: 'all 0.2s',
                    }}
                  >
                    {isCompleted && '✓'}
                  </button>
                  <div>
                    <div style={{ fontWeight: 600, marginBottom: '4px', color: isCompleted ? 'var(--text-muted)' : 'var(--text-primary)', textDecoration: isCompleted ? 'line-through' : 'none' }}>
                      {ex.title}
                    </div>
                    <div style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{ex.desc}</div>
                  </div>
                </div>
                <span className="badge badge-cyan" style={{ flexShrink: 0, marginLeft: '16px', opacity: isCompleted ? 0.6 : 1 }}>⏱ {ex.duration}</span>
              </div>
            </GlassCard>
          );
        })}
      </div>
    </div>
  );
};

export default Communication;
