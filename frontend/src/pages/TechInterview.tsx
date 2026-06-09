import React, { useState } from 'react';
import GlassCard from '../components/GlassCard';
import { interviewApi } from '../services/api';

interface Message { role: 'ai' | 'user'; content: string; }
interface Evaluation { score: number; clarity: number; accuracy: number; depth: number; comment: string; }

const TechInterview: React.FC = () => {
  const [session, setSession] = useState<any>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [round, setRound] = useState(1);
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
  const [finalScore, setFinalScore] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const startInterview = async () => {
    setLoading(true);
    try {
      const res = await interviewApi.startTech();
      setSession(res.data);
      setMessages([{ role: 'ai', content: res.data.question }]);
      setRound(1);
      setFinalScore(null);
      setEvaluation(null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const submitAnswer = async () => {
    if (!input.trim() || submitting || !session) return;
    const userAnswer = input.trim();
    setInput('');
    setMessages(m => [...m, { role: 'user', content: userAnswer }]);
    setSubmitting(true);

    try {
      const res = await interviewApi.respondTech({
        question: messages[messages.length - 1]?.content || '',
        answer: userAnswer,
        round,
      });

      const data = res.data;
      setEvaluation(data.evaluation);
      setRound(r => r + 1);

      if (data.finished) {
        setFinalScore(data.evaluation?.score || 0);
        setMessages(m => [...m, { role: 'ai', content: data.followUp || 'Interview complete! Well done!' }]);
      } else {
        setMessages(m => [...m, { role: 'ai', content: data.followUp }]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const isFinished = finalScore !== null;

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <h1 className="page-title">🔬 Technical Interview</h1>
        <p className="page-subtitle">AI-powered mock technical interview with follow-up questions and real-time evaluation</p>
      </div>

      {!session ? (
        <GlassCard className="p-8" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '70px', marginBottom: '20px' }}>🤖</div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 700, marginBottom: '10px' }}>
            Ready for your Technical Interview?
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '28px', maxWidth: '480px', margin: '0 auto 28px' }}>
            Our AI interviewer will ask 5 technical questions covering OS, DBMS, CN, DSA, and OOP.
            Each answer is evaluated for clarity, accuracy and depth.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '28px' }}>
            {['Computer Science Fundamentals', 'Data Structures & Algorithms', 'DBMS & OS', 'Follow-up Questions', 'Real-time Scoring'].map(t => (
              <span key={t} className="badge badge-purple">{t}</span>
            ))}
          </div>
          <button id="start-tech-interview" className="btn btn-primary btn-lg" onClick={startInterview} disabled={loading}>
            {loading ? <><div className="spinner" style={{ width: '18px', height: '18px' }} /> Preparing...</> : '🚀 Start Interview'}
          </button>
        </GlassCard>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '20px' }}>
          {/* Chat area */}
          <GlassCard>
            {/* Header */}
            <div style={{
              padding: '16px 20px',
              borderBottom: '1px solid var(--border-color)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <div>
                <div style={{ fontWeight: 600 }}>AI Interviewer</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  Round {Math.min(round, 5)} of {session.totalRounds}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <div style={{
                  width: '120px', height: '6px', background: 'rgba(255,255,255,0.1)',
                  borderRadius: '999px', overflow: 'hidden',
                }}>
                  <div style={{
                    height: '100%', background: 'var(--grad-primary)', borderRadius: '999px',
                    width: `${(Math.min(round - 1, 5) / 5) * 100}%`, transition: 'width 0.5s ease',
                  }} />
                </div>
              </div>
            </div>

            {/* Messages */}
            <div style={{ padding: '20px', height: '420px', overflowY: 'auto' }} className="chat-container">
              {messages.map((msg, i) => (
                <div key={i} className={`chat-bubble ${msg.role} animate-fade-in`}>
                  {msg.role === 'ai' && (
                    <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-accent)', marginBottom: '6px' }}>
                      🤖 AI Interviewer
                    </div>
                  )}
                  <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>{msg.content}</div>
                </div>
              ))}
              {submitting && (
                <div className="chat-bubble ai animate-fade-in">
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    <div className="spinner" style={{ width: '14px', height: '14px' }} />
                    <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Evaluating your answer...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            {!isFinished && (
              <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <textarea
                    id="tech-answer-input"
                    className="input-field"
                    placeholder="Type your answer here... (Press Shift+Enter for new line)"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submitAnswer(); }
                    }}
                    rows={3}
                    disabled={submitting}
                    style={{ resize: 'none', flex: 1 }}
                  />
                  <button
                    className="btn btn-primary"
                    onClick={submitAnswer}
                    disabled={!input.trim() || submitting}
                    id="submit-tech-answer"
                    style={{ alignSelf: 'flex-end' }}
                  >
                    Send ↗
                  </button>
                </div>
              </div>
            )}

            {isFinished && (
              <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border-color)', textAlign: 'center' }}>
                <div style={{ marginBottom: '12px', color: 'var(--text-secondary)', fontSize: '14px' }}>
                  Interview completed! ✨ Your session has been saved.
                </div>
                <button className="btn btn-primary" onClick={startInterview} id="restart-tech-interview">
                  🔄 Start New Interview
                </button>
              </div>
            )}
          </GlassCard>

          {/* Sidebar scores */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {finalScore !== null && (
              <GlassCard className="p-5 animate-fade-in" style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>Final Score</div>
                <div style={{
                  fontSize: '48px', fontWeight: 900, fontFamily: 'var(--font-display)',
                  background: finalScore >= 70 ? 'var(--grad-success)' : 'var(--grad-danger)',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                }}>
                  {finalScore}
                </div>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>out of 100</div>
                <div style={{ marginTop: '12px' }}>
                  <span className={`badge ${finalScore >= 80 ? 'badge-emerald' : finalScore >= 60 ? 'badge-amber' : 'badge-rose'}`}>
                    {finalScore >= 80 ? '🏆 Excellent' : finalScore >= 60 ? '✅ Good' : '📚 Keep Practicing'}
                  </span>
                </div>
              </GlassCard>
            )}

            {evaluation && (
              <GlassCard className="p-5 animate-fade-in">
                <div style={{ fontWeight: 600, marginBottom: '14px', fontSize: '13px' }}>📊 Last Answer</div>
                {[
                  { label: 'Clarity', value: evaluation.clarity, max: 10 },
                  { label: 'Accuracy', value: evaluation.accuracy, max: 10 },
                  { label: 'Depth', value: evaluation.depth, max: 10 },
                ].map(m => (
                  <div key={m.label} style={{ marginBottom: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>{m.label}</span>
                      <span style={{ fontWeight: 600 }}>{m.value}/{m.max}</span>
                    </div>
                    <div className="progress-bar" style={{ height: '4px' }}>
                      <div className="progress-fill" style={{ width: `${(m.value / m.max) * 100}%` }} />
                    </div>
                  </div>
                ))}
                {evaluation.comment && (
                  <div style={{
                    marginTop: '10px', padding: '10px', fontSize: '12px', lineHeight: 1.6,
                    background: 'rgba(124,58,237,0.08)', borderRadius: '8px',
                    color: 'var(--text-secondary)', borderLeft: '2px solid var(--accent-primary)',
                  }}>
                    {evaluation.comment}
                  </div>
                )}
              </GlassCard>
            )}

            <GlassCard className="p-4">
              <div style={{ fontWeight: 600, fontSize: '13px', marginBottom: '10px' }}>💡 Tips</div>
              {[
                'Use STAR method for behavioral questions',
                'Write pseudocode before explaining code',
                'Mention time and space complexity',
                'Ask clarifying questions when unsure',
              ].map((tip, i) => (
                <div key={i} style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px', paddingLeft: '8px', borderLeft: '2px solid rgba(124,58,237,0.3)' }}>
                  {tip}
                </div>
              ))}
            </GlassCard>
          </div>
        </div>
      )}
    </div>
  );
};

export default TechInterview;
