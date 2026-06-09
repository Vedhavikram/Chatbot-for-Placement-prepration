import React, { useState, useEffect } from 'react';
import GlassCard from '../components/GlassCard';
import { aptitudeApi } from '../services/api';

interface Question {
  id: string;
  module: string;
  topic: string;
  difficulty: string;
  content: string;
  options: string[] | null;
  companyTags: string[];
}

interface Result {
  correct: boolean;
  correctAnswer: string;
  explanation: string;
  xpEarned: number;
  xp: number;
  level: number;
}

const MODULES = [
  { key: 'aptitude', label: 'Aptitude', icon: '🧮' },
  { key: 'technical', label: 'Technical', icon: '🔧' },
];

const DIFFICULTIES = ['Easy', 'Medium', 'Hard'];

const Aptitude: React.FC = () => {
  const [module, setModule] = useState('aptitude');
  const [difficulty, setDifficulty] = useState('');
  const [question, setQuestion] = useState<Question | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [timer, setTimer] = useState(0);
  const [sessionStats, setSessionStats] = useState({ correct: 0, total: 0, xpEarned: 0 });

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (question && !result) {
      interval = setInterval(() => setTimer(t => t + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [question, result]);

  const fetchQuestion = async () => {
    setLoading(true);
    setSelected(null);
    setResult(null);
    setTimer(0);
    try {
      const res = await aptitudeApi.getQuestion({ module, difficulty: difficulty || undefined });
      setQuestion(res.data.question);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!selected || !question || submitting) return;
    setSubmitting(true);
    try {
      const res = await aptitudeApi.submit({ questionId: question.id, answer: selected, timeTaken: timer });
      setResult(res.data);
      setSessionStats(s => ({
        correct: s.correct + (res.data.correct ? 1 : 0),
        total: s.total + 1,
        xpEarned: s.xpEarned + res.data.xpEarned,
      }));
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const difficultyColor: Record<string, string> = { Easy: '#34d399', Medium: '#fbbf24', Hard: '#fb7185' };

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <h1 className="page-title">🧮 Aptitude Training</h1>
        <p className="page-subtitle">Practice adaptive MCQs covering Quantitative, Logical Reasoning, Verbal & Technical topics</p>
      </div>

      {/* Session Stats */}
      <div className="grid-3 mb-6">
        {[
          { label: 'Questions Today', value: sessionStats.total, icon: '📝' },
          { label: 'Correct', value: sessionStats.correct, icon: '✅', color: '#34d399' },
          { label: 'XP Earned', value: `+${sessionStats.xpEarned}`, icon: '⚡', color: '#a855f7' },
        ].map(s => (
          <GlassCard key={s.label} className="p-5">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '28px' }}>{s.icon}</span>
              <div>
                <div style={{ fontSize: '24px', fontWeight: 800, color: s.color || 'var(--text-primary)' }}>{s.value}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{s.label}</div>
              </div>
            </div>
          </GlassCard>
        ))}
      </div>

      {/* Controls */}
      <GlassCard className="p-5 mb-6">
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
          <div>
            <div className="label">Module</div>
            <div style={{ display: 'flex', gap: '8px' }}>
              {MODULES.map(m => (
                <button
                  key={m.key}
                  className={`btn btn-sm ${module === m.key ? 'btn-primary' : 'btn-ghost'}`}
                  onClick={() => setModule(m.key)}
                  id={`module-${m.key}`}
                >
                  {m.icon} {m.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <div className="label">Difficulty</div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                className={`btn btn-sm ${!difficulty ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setDifficulty('')}
              >
                All
              </button>
              {DIFFICULTIES.map(d => (
                <button
                  key={d}
                  className={`btn btn-sm ${difficulty === d ? 'btn-primary' : 'btn-ghost'}`}
                  onClick={() => setDifficulty(d)}
                  style={difficulty === d ? {} : { borderColor: difficultyColor[d] + '60', color: difficultyColor[d] }}
                  id={`diff-${d.toLowerCase()}`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>
          <div style={{ marginLeft: 'auto' }}>
            <button
              className="btn btn-primary"
              onClick={fetchQuestion}
              disabled={loading}
              id="get-question-btn"
            >
              {loading ? <><div className="spinner" style={{ width: '16px', height: '16px' }} /> Loading...</> : '🎲 Get Question'}
            </button>
          </div>
        </div>
      </GlassCard>

      {/* Question */}
      {question ? (
        <GlassCard className="p-6 animate-fade-in">
          {/* Question header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <span className={`badge badge-${question.difficulty.toLowerCase()}`}>{question.difficulty}</span>
              <span className="badge badge-cyan">{question.topic}</span>
              {question.companyTags.slice(0, 3).map(tag => (
                <span key={tag} className="tag">{tag}</span>
              ))}
            </div>
            <div style={{
              padding: '6px 14px',
              background: timer > 60 ? 'rgba(244,63,94,0.15)' : 'rgba(6,182,212,0.1)',
              border: `1px solid ${timer > 60 ? 'rgba(244,63,94,0.3)' : 'rgba(6,182,212,0.3)'}`,
              borderRadius: '8px',
              color: timer > 60 ? '#fb7185' : '#22d3ee',
              fontSize: '14px', fontWeight: 600, fontFamily: 'var(--font-mono)',
            }}>
              ⏱ {Math.floor(timer / 60)}:{String(timer % 60).padStart(2, '0')}
            </div>
          </div>

          {/* Question text */}
          <div style={{ fontSize: '16px', fontWeight: 500, lineHeight: 1.7, marginBottom: '24px', color: 'var(--text-primary)' }}>
            {question.content}
          </div>

          {/* Options */}
          {question.options && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
              {question.options.map((opt, i) => {
                let cls = 'quiz-option';
                if (result) {
                  if (opt === result.correctAnswer) cls += ' correct';
                  else if (opt === selected && !result.correct) cls += ' incorrect';
                  else cls += ' selected';
                } else if (opt === selected) {
                  cls += ' selected';
                }
                return (
                  <button
                    key={i}
                    className={cls}
                    onClick={() => !result && setSelected(opt)}
                    disabled={!!result}
                    id={`option-${i}`}
                  >
                    <span style={{
                      width: '28px', height: '28px', borderRadius: '50%',
                      background: 'rgba(255,255,255,0.05)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '12px', fontWeight: 700, flexShrink: 0,
                    }}>
                      {['A', 'B', 'C', 'D'][i]}
                    </span>
                    {opt}
                  </button>
                );
              })}
            </div>
          )}

          {/* Submit / Result */}
          {!result ? (
            <button
              className="btn btn-primary btn-lg"
              onClick={handleSubmit}
              disabled={!selected || submitting}
              id="submit-answer-btn"
            >
              {submitting ? <><div className="spinner" style={{ width: '16px', height: '16px' }} /> Checking...</> : '✓ Submit Answer'}
            </button>
          ) : (
            <div className="animate-fade-in">
              <div style={{
                padding: '16px 20px',
                background: result.correct ? 'rgba(16,185,129,0.1)' : 'rgba(244,63,94,0.1)',
                border: `1px solid ${result.correct ? 'rgba(16,185,129,0.3)' : 'rgba(244,63,94,0.3)'}`,
                borderRadius: '12px',
                marginBottom: '16px',
              }}>
                <div style={{ fontSize: '16px', fontWeight: 700, color: result.correct ? '#34d399' : '#fb7185', marginBottom: '8px' }}>
                  {result.correct ? '✅ Correct! +15 XP' : `❌ Incorrect. +3 XP`}
                </div>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  <strong>Explanation:</strong> {result.explanation}
                </div>
              </div>
              <button className="btn btn-primary" onClick={fetchQuestion} id="next-question-btn">
                ➡️ Next Question
              </button>
            </div>
          )}
        </GlassCard>
      ) : (
        <GlassCard className="p-6" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '60px', marginBottom: '16px' }}>🎯</div>
          <h3 style={{ fontWeight: 700, marginBottom: '8px' }}>Ready to Practice?</h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '20px' }}>
            Select your preferred module and difficulty, then click "Get Question" to start!
          </p>
          <button className="btn btn-primary btn-lg" onClick={fetchQuestion} disabled={loading}>
            🚀 Start Practice
          </button>
        </GlassCard>
      )}
    </div>
  );
};

export default Aptitude;
