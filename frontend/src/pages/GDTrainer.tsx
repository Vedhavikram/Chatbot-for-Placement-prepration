import React, { useState } from 'react';
import GlassCard from '../components/GlassCard';
import { interviewApi } from '../services/api';

interface GDSession { topic: string; sessionId: string; aiOpener: string; }
interface GDFeedback {
  overallScore: number;
  categories: { contentQuality: number; communication: number; leadership: number; teamwork: number; factUsage: number; };
  summary: string;
  improvements: string[];
  strongPoints: string[];
}

const AI_RESPONSES = [
  "That's an interesting perspective! Building on that, I'd like to add that...",
  "I partially agree, but we should also consider the other side...",
  "You've raised a valid point. However, the data suggests...",
  "Excellent argument! Let me bring in another dimension...",
  "While that's true, we shouldn't overlook the economic implications...",
];

const GDTrainer: React.FC = () => {
  const [session, setSession] = useState<GDSession | null>(null);
  const [points, setPoints] = useState<string[]>([]);
  const [input, setInput] = useState('');
  const [chat, setChat] = useState<Array<{ from: string; msg: string }>>([]);
  const [feedback, setFeedback] = useState<GDFeedback | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [finished, setFinished] = useState(false);
  const [timer, setTimer] = useState(0);

  React.useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (session && !finished) {
      interval = setInterval(() => setTimer(t => t + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [session, finished]);

  const startGD = async () => {
    setLoading(true);
    try {
      const res = await interviewApi.startGD();
      setSession(res.data);
      setChat([{ from: 'AI Participant 1', msg: res.data.aiOpener }]);
      setPoints([]);
      setFeedback(null);
      setFinished(false);
      setTimer(0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const addPoint = () => {
    if (!input.trim() || !session) return;
    const newPoint = input.trim();
    setInput('');
    setPoints(p => [...p, newPoint]);
    setChat(c => [...c, { from: 'You', msg: newPoint }]);

    // AI responds after a short delay
    setTimeout(() => {
      const aiMsg = AI_RESPONSES[Math.floor(Math.random() * AI_RESPONSES.length)];
      const aiName = `AI Participant ${Math.floor(Math.random() * 3) + 1}`;
      setChat(c => [...c, { from: aiName, msg: aiMsg }]);
    }, 1200);
  };

  const finishGD = async () => {
    if (!session || submitting) return;
    setSubmitting(true);
    setFinished(true);
    try {
      const res = await interviewApi.submitGD({ topic: session.topic, points });
      setFeedback(res.data.feedback);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <h1 className="page-title">🗣️ Group Discussion Trainer</h1>
        <p className="page-subtitle">Simulate real GD sessions with AI participants, get scored on communication, leadership, and content quality</p>
      </div>

      {!session ? (
        <GlassCard className="p-8" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '70px', marginBottom: '20px' }}>🎤</div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 700, marginBottom: '12px' }}>
            Group Discussion Practice
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '28px', maxWidth: '500px', margin: '0 auto 24px' }}>
            A random current affairs / business topic will be assigned. AI participants will engage in discussion.
            You'll be evaluated on content, communication, leadership, and teamwork.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '28px' }}>
            {['Content Quality', 'Communication', 'Leadership', 'Teamwork', 'Fact Usage'].map(t => (
              <span key={t} className="badge badge-purple">{t}</span>
            ))}
          </div>
          <button id="start-gd-btn" className="btn btn-primary btn-lg" onClick={startGD} disabled={loading}>
            {loading ? <><div className="spinner" style={{ width: '18px', height: '18px' }} /> Setting up...</> : '🚀 Start GD Session'}
          </button>
        </GlassCard>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '20px' }}>
          {/* GD Chat */}
          <GlassCard>
            {/* Header */}
            <div style={{
              padding: '14px 20px', borderBottom: '1px solid var(--border-color)',
              background: 'rgba(124,58,237,0.08)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '15px' }}>📌 {session.topic}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                    4 Participants · {points.length} points made
                  </div>
                </div>
                <div style={{
                  padding: '6px 14px', background: timer > 600 ? 'rgba(244,63,94,0.15)' : 'rgba(6,182,212,0.1)',
                  border: `1px solid ${timer > 600 ? 'rgba(244,63,94,0.3)' : 'rgba(6,182,212,0.3)'}`,
                  borderRadius: '8px', color: timer > 600 ? '#fb7185' : '#22d3ee',
                  fontSize: '14px', fontWeight: 600, fontFamily: 'var(--font-mono)',
                }}>
                  ⏱ {formatTime(timer)}
                </div>
              </div>
            </div>

            {/* Messages */}
            <div style={{ padding: '16px 20px', height: '380px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {chat.map((c, i) => (
                <div key={i} className={`animate-fade-in ${c.from === 'You' ? 'chat-bubble user' : 'chat-bubble ai'}`}>
                  <div style={{ fontSize: '11px', fontWeight: 700, marginBottom: '5px', color: c.from === 'You' ? 'var(--text-accent)' : '#fbbf24' }}>
                    {c.from === 'You' ? '🙋 You' : `🤖 ${c.from}`}
                  </div>
                  <div style={{ lineHeight: 1.7 }}>{c.msg}</div>
                </div>
              ))}
            </div>

            {/* Input */}
            {!finished && (
              <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <input
                    id="gd-input"
                    className="input-field"
                    placeholder="State your point clearly..."
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') addPoint(); }}
                    style={{ flex: 1 }}
                  />
                  <button className="btn btn-primary" onClick={addPoint} disabled={!input.trim()} id="add-point-btn">
                    Speak ↗
                  </button>
                  <button className="btn btn-danger btn-sm" onClick={finishGD} disabled={submitting || points.length < 2} id="end-gd-btn">
                    End GD
                  </button>
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '6px' }}>
                  Make at least 2-3 points before ending. Press Enter to speak.
                </div>
              </div>
            )}
          </GlassCard>

          {/* Sidebar: feedback */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {submitting && (
              <GlassCard className="p-4" style={{ textAlign: 'center' }}>
                <div className="spinner" style={{ width: '32px', height: '32px', margin: '0 auto 12px' }} />
                <div style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Evaluating your GD performance...</div>
              </GlassCard>
            )}

            {feedback && (
              <GlassCard className="p-4 animate-fade-in">
                <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginBottom: '4px' }}>Overall Score</div>
                  <div style={{
                    fontSize: '48px', fontWeight: 900, fontFamily: 'var(--font-display)',
                    background: feedback.overallScore >= 70 ? 'var(--grad-success)' : 'var(--grad-danger)',
                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                  }}>
                    {feedback.overallScore}
                  </div>
                </div>

                {Object.entries(feedback.categories).map(([key, val]) => (
                  <div key={key} style={{ marginBottom: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '3px' }}>
                      <span style={{ color: 'var(--text-secondary)', textTransform: 'capitalize' }}>{key.replace(/([A-Z])/g, ' $1')}</span>
                      <span style={{ fontWeight: 600 }}>{val}/10</span>
                    </div>
                    <div className="progress-bar" style={{ height: '4px' }}>
                      <div className="progress-fill" style={{ width: `${(val as number / 10) * 100}%` }} />
                    </div>
                  </div>
                ))}

                <div style={{ marginTop: '14px', fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  {feedback.summary}
                </div>
              </GlassCard>
            )}

            {feedback && (
              <GlassCard className="p-4 animate-fade-in">
                <div style={{ fontWeight: 600, fontSize: '13px', marginBottom: '10px', color: '#34d399' }}>💪 Strengths</div>
                {feedback.strongPoints.map((s, i) => (
                  <div key={i} style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px', paddingLeft: '8px', borderLeft: '2px solid #10b981' }}>
                    {s}
                  </div>
                ))}
                <div style={{ fontWeight: 600, fontSize: '13px', margin: '12px 0 10px', color: '#fbbf24' }}>🔧 Improvements</div>
                {feedback.improvements.map((s, i) => (
                  <div key={i} style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px', paddingLeft: '8px', borderLeft: '2px solid #f59e0b' }}>
                    {s}
                  </div>
                ))}
                <button className="btn btn-primary btn-sm w-full" style={{ marginTop: '12px' }} onClick={startGD} id="restart-gd-btn">
                  🔄 New GD Topic
                </button>
              </GlassCard>
            )}

            {!feedback && (
              <GlassCard className="p-4">
                <div style={{ fontWeight: 600, fontSize: '13px', marginBottom: '10px' }}>💡 GD Tips</div>
                {[
                  'Open with a clear, confident statement',
                  'Use facts and statistics when possible',
                  'Build on others\' points constructively',
                  'Don\'t monopolize — give others space',
                  'Summarize your points clearly at the end',
                ].map((tip, i) => (
                  <div key={i} style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px', display: 'flex', gap: '8px' }}>
                    <span style={{ color: 'var(--text-accent)', flexShrink: 0 }}>•</span>
                    {tip}
                  </div>
                ))}
              </GlassCard>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default GDTrainer;
