import React, { useState } from 'react';
import GlassCard from '../components/GlassCard';
import CodeEditor from '../components/CodeEditor';
import { codingApi } from '../services/api';

interface CodingQuestion {
  id: string;
  topic: string;
  difficulty: string;
  content: string;
  companyTags: string[];
  codingTemplate: Record<string, string>;
  visibleTestCases: Array<{ input: string; output: string }>;
  hiddenTestCaseCount: number;
}

interface ExecutionResult {
  passed: boolean;
  results: Array<{ testCase: number; input: string; expected: string; actual: string; passed: boolean; hidden: boolean }>;
  error: string | null;
  executionTime: number;
  xpEarned?: number;
}

const LANGUAGES = ['javascript', 'python', 'java', 'cpp'];
const LANG_LABELS: Record<string, string> = {
  javascript: '🟨 JavaScript',
  python: '🐍 Python',
  java: '☕ Java',
  cpp: '⚙️ C++',
};

const CodingPrep: React.FC = () => {
  const [question, setQuestion] = useState<CodingQuestion | null>(null);
  const [language, setLanguage] = useState('javascript');
  const [code, setCode] = useState('');
  const [result, setResult] = useState<ExecutionResult | null>(null);
  const [review, setReview] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [running, setRunning] = useState(false);
  const [reviewing, setReviewing] = useState(false);
  const [difficulty, setDifficulty] = useState('');
  const [activeTab, setActiveTab] = useState<'problem' | 'testcases' | 'result' | 'review'>('problem');

  const fetchQuestion = async () => {
    setLoading(true);
    setResult(null);
    setReview(null);
    setActiveTab('problem');
    try {
      const res = await codingApi.getQuestion({ difficulty: difficulty || undefined });
      const q = res.data.question;
      setQuestion(q);
      setCode(q.codingTemplate?.[language] || '// Write your solution here\n');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLangChange = (lang: string) => {
    setLanguage(lang);
    if (question?.codingTemplate?.[lang]) {
      setCode(question.codingTemplate[lang]);
    }
  };

  const runCode = async () => {
    if (!question || running) return;
    setRunning(true);
    setActiveTab('result');
    try {
      const res = await codingApi.submit({ questionId: question.id, code, language });
      setResult(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setRunning(false);
    }
  };

  const reviewCode = async () => {
    if (!question || reviewing) return;
    setReviewing(true);
    setActiveTab('review');
    try {
      const res = await codingApi.review({ code, language, problem: question.content.slice(0, 100) });
      setReview(res.data.review);
    } catch (err) {
      console.error(err);
    } finally {
      setReviewing(false);
    }
  };

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <h1 className="page-title">💻 Coding Preparation</h1>
        <p className="page-subtitle">Solve DSA problems with Monaco Editor, get AI code review and analysis</p>
      </div>

      {/* Controls */}
      <GlassCard className="p-4 mb-4">
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            {['Easy', 'Medium', 'Hard'].map(d => (
              <button
                key={d}
                className={`btn btn-sm ${difficulty === d ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setDifficulty(d === difficulty ? '' : d)}
                id={`coding-diff-${d.toLowerCase()}`}
              >
                {d}
              </button>
            ))}
          </div>
          <button className="btn btn-primary" onClick={fetchQuestion} disabled={loading} id="get-problem-btn">
            {loading ? <><div className="spinner" style={{ width: '16px', height: '16px' }} /> Loading...</> : '🎲 Get Problem'}
          </button>
        </div>
      </GlassCard>

      {question ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.3fr', gap: '20px', alignItems: 'start' }}>
          {/* Left: Problem + tabs */}
          <div>
            <GlassCard>
              {/* Tabs */}
              <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)' }}>
                {(['problem', 'testcases', 'result', 'review'] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    style={{
                      flex: 1, padding: '12px 8px', fontSize: '12px', fontWeight: 600,
                      background: 'none', border: 'none', cursor: 'pointer',
                      color: activeTab === tab ? 'var(--text-accent)' : 'var(--text-muted)',
                      borderBottom: activeTab === tab ? '2px solid var(--accent-primary)' : '2px solid transparent',
                      textTransform: 'capitalize', transition: 'all 0.2s',
                    }}
                    id={`tab-${tab}`}
                  >
                    {tab === 'problem' ? '📋' : tab === 'testcases' ? '🧪' : tab === 'result' ? '⚡' : '🔍'} {tab}
                  </button>
                ))}
              </div>

              <div style={{ padding: '20px', maxHeight: '500px', overflowY: 'auto' }}>
                {activeTab === 'problem' && (
                  <div className="animate-fade-in">
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
                      <span className={`badge badge-${question.difficulty.toLowerCase()}`}>{question.difficulty}</span>
                      <span className="badge badge-cyan">{question.topic}</span>
                      {question.companyTags.slice(0, 3).map(tag => (
                        <span key={tag} className="tag">{tag}</span>
                      ))}
                    </div>
                    <div style={{ fontSize: '14px', lineHeight: 1.8, color: 'var(--text-primary)', whiteSpace: 'pre-wrap' }}>
                      {question.content}
                    </div>
                  </div>
                )}

                {activeTab === 'testcases' && (
                  <div className="animate-fade-in">
                    <div style={{ fontWeight: 600, marginBottom: '12px', color: 'var(--text-secondary)', fontSize: '13px' }}>
                      Visible Test Cases ({question.visibleTestCases.length}) + {question.hiddenTestCaseCount} Hidden
                    </div>
                    {question.visibleTestCases.map((tc, i) => (
                      <div key={i} style={{
                        marginBottom: '12px', padding: '12px',
                        background: 'rgba(255,255,255,0.03)', borderRadius: '8px',
                        border: '1px solid var(--border-color)',
                      }}>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '6px' }}>Test Case {i + 1}</div>
                        <div style={{ fontSize: '13px', fontFamily: 'var(--font-mono)' }}>
                          <span style={{ color: 'var(--text-muted)' }}>Input: </span>
                          <span style={{ color: '#22d3ee' }}>{tc.input}</span>
                        </div>
                        <div style={{ fontSize: '13px', fontFamily: 'var(--font-mono)', marginTop: '4px' }}>
                          <span style={{ color: 'var(--text-muted)' }}>Expected: </span>
                          <span style={{ color: '#34d399' }}>{tc.output}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === 'result' && (
                  <div className="animate-fade-in">
                    {running ? (
                      <div className="loading-full" style={{ minHeight: '150px' }}>
                        <div className="spinner" style={{ width: '32px', height: '32px' }} />
                        <span>Executing code...</span>
                      </div>
                    ) : result ? (
                      <div>
                        <div style={{
                          padding: '14px 18px', borderRadius: '10px', marginBottom: '16px',
                          background: result.passed ? 'rgba(16,185,129,0.1)' : 'rgba(244,63,94,0.1)',
                          border: `1px solid ${result.passed ? '#10b981' : '#f43f5e'}44`,
                        }}>
                          <div style={{ fontSize: '16px', fontWeight: 700, color: result.passed ? '#34d399' : '#fb7185' }}>
                            {result.passed ? '✅ All Tests Passed!' : '❌ Some Tests Failed'}
                          </div>
                          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                            Execution time: {result.executionTime}ms
                            {result.xpEarned && ` · +${result.xpEarned} XP earned`}
                          </div>
                        </div>
                        {result.error && (
                          <div style={{
                            padding: '10px', background: 'rgba(244,63,94,0.08)', borderRadius: '8px',
                            marginBottom: '12px', fontSize: '13px', color: '#fb7185', fontFamily: 'var(--font-mono)',
                          }}>
                            {result.error}
                          </div>
                        )}
                        {result.results.map((r, i) => (
                          <div key={i} style={{
                            display: 'flex', alignItems: 'center', gap: '10px',
                            padding: '8px 12px', borderRadius: '8px', marginBottom: '6px',
                            background: r.passed ? 'rgba(16,185,129,0.08)' : 'rgba(244,63,94,0.08)',
                          }}>
                            <span>{r.passed ? '✅' : '❌'}</span>
                            <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                              Test {r.testCase}: {r.hidden ? `[Hidden] ${r.passed ? 'Passed' : 'Failed'}` : `${r.actual}`}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="loading-full" style={{ minHeight: '150px', color: 'var(--text-muted)' }}>
                        Run your code to see results
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'review' && (
                  <div className="animate-fade-in">
                    {reviewing ? (
                      <div className="loading-full" style={{ minHeight: '150px' }}>
                        <div className="spinner" style={{ width: '32px', height: '32px' }} />
                        <span>AI analyzing your code...</span>
                      </div>
                    ) : review ? (
                      <div>
                        <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                          <div style={{ flex: 1, padding: '12px', background: 'rgba(168,85,247,0.1)', borderRadius: '8px', textAlign: 'center' }}>
                            <div style={{ fontSize: '24px', fontWeight: 800, color: '#c084fc' }}>{review.quality}%</div>
                            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Code Quality</div>
                          </div>
                          {review.complexity && (
                            <>
                              <div style={{ flex: 1, padding: '12px', background: 'rgba(6,182,212,0.1)', borderRadius: '8px', textAlign: 'center' }}>
                                <div style={{ fontSize: '18px', fontWeight: 700, color: '#22d3ee' }}>{review.complexity.time}</div>
                                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Time Complexity</div>
                              </div>
                              <div style={{ flex: 1, padding: '12px', background: 'rgba(16,185,129,0.1)', borderRadius: '8px', textAlign: 'center' }}>
                                <div style={{ fontSize: '18px', fontWeight: 700, color: '#34d399' }}>{review.complexity.space}</div>
                                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Space Complexity</div>
                              </div>
                            </>
                          )}
                        </div>

                        {review.issues && review.issues.length > 0 && (
                          <div style={{ marginBottom: '14px' }}>
                            <div style={{ fontWeight: 600, fontSize: '13px', marginBottom: '8px' }}>⚠️ Issues</div>
                            {review.issues.map((issue: any, i: number) => (
                              <div key={i} style={{
                                padding: '8px 12px', borderRadius: '8px', marginBottom: '6px', fontSize: '13px',
                                background: issue.severity === 'error' ? 'rgba(244,63,94,0.08)' : 'rgba(245,158,11,0.08)',
                                color: issue.severity === 'error' ? '#fb7185' : '#fbbf24',
                              }}>
                                {issue.message}
                              </div>
                            ))}
                          </div>
                        )}

                        {review.suggestions && (
                          <div>
                            <div style={{ fontWeight: 600, fontSize: '13px', marginBottom: '8px' }}>💡 Suggestions</div>
                            {review.suggestions.map((s: string, i: number) => (
                              <div key={i} style={{ padding: '6px 12px', fontSize: '13px', color: 'var(--text-secondary)', borderLeft: '2px solid var(--accent-primary)', marginBottom: '6px' }}>
                                {s}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="loading-full" style={{ minHeight: '150px', color: 'var(--text-muted)' }}>
                        Click "AI Review" to get feedback on your code
                      </div>
                    )}
                  </div>
                )}
              </div>
            </GlassCard>
          </div>

          {/* Right: Editor */}
          <div>
            <GlassCard className="mb-3">
              <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-color)', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {LANGUAGES.map(lang => (
                  <button
                    key={lang}
                    className={`btn btn-sm ${language === lang ? 'btn-primary' : 'btn-ghost'}`}
                    onClick={() => handleLangChange(lang)}
                    id={`lang-${lang}`}
                  >
                    {LANG_LABELS[lang]}
                  </button>
                ))}
              </div>
              <div style={{ padding: '0' }}>
                <CodeEditor
                  value={code}
                  onChange={setCode}
                  language={language === 'cpp' ? 'cpp' : language}
                  height="460px"
                />
              </div>
            </GlassCard>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button className="btn btn-success" style={{ flex: 2 }} onClick={runCode} disabled={running} id="run-code-btn">
                {running ? <><div className="spinner" style={{ width: '16px', height: '16px' }} /> Running...</> : '▶ Run & Submit'}
              </button>
              <button className="btn btn-ghost" style={{ flex: 1 }} onClick={reviewCode} disabled={reviewing} id="review-code-btn">
                {reviewing ? <><div className="spinner" style={{ width: '16px', height: '16px' }} /> Reviewing...</> : '🤖 AI Review'}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <GlassCard className="p-6" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '64px', marginBottom: '16px' }}>💻</div>
          <h3 style={{ fontWeight: 700, marginBottom: '8px', fontSize: '20px' }}>Ready to code?</h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>
            Select a difficulty level and click "Get Problem" to start solving DSA challenges with our Monaco Editor sandbox.
          </p>
          <button className="btn btn-primary btn-lg" onClick={fetchQuestion} disabled={loading}>
            🚀 Start Coding
          </button>
        </GlassCard>
      )}
    </div>
  );
};

export default CodingPrep;
