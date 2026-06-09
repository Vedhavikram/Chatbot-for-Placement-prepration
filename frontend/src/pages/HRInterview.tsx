import React, { useState } from 'react';
import GlassCard from '../components/GlassCard';
import { interviewApi } from '../services/api';

const COMPANIES = ['TCS', 'Infosys', 'Wipro', 'Zoho', 'Accenture', 'Cognizant', 'HCL', 'Capgemini'];

interface Message { role: 'ai' | 'user'; content: string; }
interface Feedback { score: number; starMethod: boolean; fillerWords: string[]; sentimentScore: string; suggestions: string; }

const HRInterview: React.FC = () => {
  const [session, setSession] = useState<any>(null);
  const [company, setCompany] = useState('TCS');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [round, setRound] = useState(1);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const startInterview = async () => {
    setLoading(true);
    try {
      const res = await interviewApi.startHR({ targetCompany: company });
      setSession(res.data);
      setMessages([{ role: 'ai', content: res.data.question }]);
      setRound(1);
      setFeedback(null);
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
    const newRound = round + 1;
    const isFinished = newRound > (session.totalRounds || 6);

    try {
      const res = await interviewApi.respondHR({
        question: messages[messages.length - 1]?.content || '',
        answer: userAnswer,
        round,
        finished: isFinished,
      });

      const data = res.data;
      setFeedback(data.feedback);
      setRound(newRound);

      if (!isFinished) {
        setMessages(m => [...m, { role: 'ai', content: data.nextQuestion }]);
      } else {
        setMessages(m => [...m, { role: 'ai', content: '✅ HR Interview completed! Great job. Your performance has been saved.' }]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const isFinished = session && round > (session?.totalRounds || 6);

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <h1 className="page-title">🤝 HR Interview</h1>
        <p className="page-subtitle">Practice behavioral questions using STAR method, get filler word detection and sentiment analysis</p>
      </div>

      {!session ? (
        <GlassCard className="p-8" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '70px', marginBottom: '20px' }}>👔</div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 700, marginBottom: '12px' }}>
            HR Interview Practice
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '28px', maxWidth: '480px', margin: '0 auto 24px' }}>
            Select your target company and practice behavioral questions. AI will evaluate your answers for STAR method usage,
            filler words, and overall sentiment.
          </p>
          <div style={{ marginBottom: '24px' }}>
            <div className="label" style={{ marginBottom: '12px' }}>Select Target Company</div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
              {COMPANIES.map(c => (
                <button
                  key={c}
                  className={`btn btn-sm ${company === c ? 'btn-primary' : 'btn-ghost'}`}
                  onClick={() => setCompany(c)}
                  id={`company-${c.toLowerCase()}`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
          <button id="start-hr-interview" className="btn btn-primary btn-lg" onClick={startInterview} disabled={loading}>
            {loading ? <><div className="spinner" style={{ width: '18px', height: '18px' }} /> Preparing...</> : '🚀 Start HR Interview'}
          </button>
        </GlassCard>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '20px' }}>
          {/* Chat */}
          <GlassCard>
            <div style={{
              padding: '16px 20px', borderBottom: '1px solid var(--border-color)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <div>
                <div style={{ fontWeight: 600 }}>HR Panel · {company}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  Question {Math.min(round, session.totalRounds)} of {session.totalRounds}
                </div>
              </div>
              <span className="badge badge-amber">Behavioral</span>
            </div>

            <div style={{ padding: '20px', height: '400px', overflowY: 'auto' }} className="chat-container">
              {messages.map((msg, i) => (
                <div key={i} className={`chat-bubble ${msg.role} animate-fade-in`}>
                  {msg.role === 'ai' && (
                    <div style={{ fontSize: '11px', fontWeight: 600, color: '#fbbf24', marginBottom: '6px' }}>
                      👔 HR Panel · {company}
                    </div>
                  )}
                  <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>{msg.content}</div>
                </div>
              ))}
              {submitting && (
                <div className="chat-bubble ai">
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    <div className="spinner" style={{ width: '14px', height: '14px' }} />
                    <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Analyzing your response...</span>
                  </div>
                </div>
              )}
            </div>

            {!isFinished && (
              <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>
                  💡 Use the <strong style={{ color: 'var(--text-accent)' }}>STAR method</strong>: Situation → Task → Action → Result
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <textarea
                    id="hr-answer-input"
                    className="input-field"
                    placeholder="Type your answer..."
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submitAnswer(); } }}
                    rows={3}
                    disabled={submitting}
                    style={{ resize: 'none', flex: 1 }}
                  />
                  <button className="btn btn-primary" onClick={submitAnswer} disabled={!input.trim() || submitting} id="submit-hr-answer" style={{ alignSelf: 'flex-end' }}>
                    Send ↗
                  </button>
                </div>
              </div>
            )}

            {isFinished && (
              <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border-color)', textAlign: 'center' }}>
                <button className="btn btn-primary" onClick={startInterview} id="restart-hr-interview">
                  🔄 Start New Session
                </button>
              </div>
            )}
          </GlassCard>

          {/* Feedback sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {feedback && (
              <GlassCard className="p-4 animate-fade-in">
                <div style={{ fontWeight: 600, fontSize: '13px', marginBottom: '12px' }}>📊 Answer Analysis</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Score</span>
                  <span style={{
                    fontSize: '22px', fontWeight: 800,
                    color: feedback.score >= 70 ? '#34d399' : feedback.score >= 50 ? '#fbbf24' : '#fb7185',
                  }}>{feedback.score}%</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>STAR Method</span>
                    <span style={{ color: feedback.starMethod ? '#34d399' : '#fb7185' }}>
                      {feedback.starMethod ? '✅ Used' : '❌ Not used'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Sentiment</span>
                    <span className={`badge ${feedback.sentimentScore === 'Positive' ? 'badge-emerald' : 'badge-amber'}`} style={{ fontSize: '10px' }}>
                      {feedback.sentimentScore}
                    </span>
                  </div>
                </div>

                {feedback.fillerWords.length > 0 && (
                  <div style={{ marginBottom: '10px' }}>
                    <div style={{ fontSize: '11px', color: '#fb7185', marginBottom: '4px' }}>⚠️ Filler Words Detected:</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                      {feedback.fillerWords.map(w => (
                        <span key={w} style={{ padding: '2px 8px', background: 'rgba(244,63,94,0.1)', borderRadius: '4px', fontSize: '11px', color: '#fb7185' }}>{w}</span>
                      ))}
                    </div>
                  </div>
                )}

                {feedback.suggestions && (
                  <div style={{
                    fontSize: '12px', lineHeight: 1.6, color: 'var(--text-secondary)',
                    padding: '8px', background: 'rgba(124,58,237,0.08)', borderRadius: '8px',
                    borderLeft: '2px solid var(--accent-primary)',
                  }}>
                    {feedback.suggestions}
                  </div>
                )}
              </GlassCard>
            )}

            <GlassCard className="p-4">
              <div style={{ fontWeight: 600, fontSize: '13px', marginBottom: '10px' }}>🌟 STAR Tips</div>
              {[
                { label: 'Situation', color: '#06b6d4', tip: 'Set the context' },
                { label: 'Task', color: '#a855f7', tip: 'Describe your role' },
                { label: 'Action', color: '#10b981', tip: 'What did you do?' },
                { label: 'Result', color: '#f59e0b', tip: 'Quantify the outcome' },
              ].map(s => (
                <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: s.color, flexShrink: 0 }} />
                  <div>
                    <span style={{ fontWeight: 600, fontSize: '12px', color: s.color }}>{s.label}</span>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginLeft: '6px' }}>{s.tip}</span>
                  </div>
                </div>
              ))}
            </GlassCard>
          </div>
        </div>
      )}
    </div>
  );
};

export default HRInterview;
