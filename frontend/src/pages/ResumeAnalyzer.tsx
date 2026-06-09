import React, { useState, useRef } from 'react';
import GlassCard from '../components/GlassCard';
import { resumeApi } from '../services/api';

const ResumeAnalyzer: React.FC = () => {
  const [analysis, setAnalysis] = useState<any>(null);
  const [fileName, setFileName] = useState('');
  const [loading, setLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const processFile = async (file: File) => {
    if (!file) return;
    setLoading(true);
    setFileName(file.name);
    try {
      const res = await resumeApi.upload(file);
      setAnalysis(res.data.analysis);
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.error || 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) processFile(e.target.files[0]);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files?.[0]) processFile(e.dataTransfer.files[0]);
  };

  const scoreColor = (s: number) => s >= 80 ? '#34d399' : s >= 60 ? '#fbbf24' : '#fb7185';
  const sectionIcon: Record<string, string> = {
    contactInfo: '📞', summary: '📝', skills: '🛠️', experience: '💼', education: '🎓', projects: '🚀',
  };

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <h1 className="page-title">📄 Resume Analyzer</h1>
        <p className="page-subtitle">Upload your resume for ATS scoring, keyword gap analysis, and AI-powered improvement suggestions</p>
      </div>

      {/* Upload Zone */}
      {!analysis && !loading && (
        <GlassCard
          className="p-8 animate-fade-up"
          style={{ textAlign: 'center', borderStyle: 'dashed', cursor: 'pointer', borderColor: dragOver ? 'var(--accent-primary)' : undefined }}
          onDragOver={e => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileRef.current?.click()}
        >
          <input ref={fileRef} type="file" accept=".pdf,.docx,.doc,.txt" style={{ display: 'none' }} onChange={handleFileChange} id="resume-upload" />
          <div style={{ fontSize: '70px', marginBottom: '20px' }}>{dragOver ? '📥' : '📄'}</div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 700, marginBottom: '10px' }}>
            {dragOver ? 'Drop your resume here!' : 'Upload Your Resume'}
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
            Drag & drop or click to upload PDF, DOCX, or TXT files (max 5MB)
          </p>
          <button className="btn btn-primary btn-lg" id="choose-file-btn">
            📁 Choose File
          </button>
          <div style={{ marginTop: '20px', display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            {['ATS Score', 'Keyword Analysis', 'Section Feedback', 'Rewrite Suggestions', 'Missing Keywords'].map(f => (
              <span key={f} className="badge badge-purple">{f}</span>
            ))}
          </div>
        </GlassCard>
      )}

      {loading && (
        <GlassCard className="p-8" style={{ textAlign: 'center' }}>
          <div className="spinner" style={{ width: '48px', height: '48px', margin: '0 auto 20px' }} />
          <h3 style={{ fontWeight: 600, marginBottom: '8px' }}>Analyzing {fileName}...</h3>
          <p style={{ color: 'var(--text-muted)' }}>AI is parsing your resume for ATS compatibility and improvements</p>
        </GlassCard>
      )}

      {analysis && (
        <div className="animate-fade-in">
          {/* Score Hero */}
          <div className="grid-3 mb-6">
            <GlassCard className="p-6" style={{ textAlign: 'center', gridColumn: '1' }}>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>ATS Score</div>
              <div style={{ fontSize: '64px', fontWeight: 900, fontFamily: 'var(--font-display)', color: scoreColor(analysis.atsScore) }}>
                {analysis.atsScore}
              </div>
              <div style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '4px' }}>{fileName}</div>
              <div style={{ marginTop: '12px' }}>
                <span className={`badge badge-${analysis.grade === 'A' ? 'emerald' : analysis.grade === 'B' ? 'amber' : 'rose'}`} style={{ fontSize: '14px', padding: '6px 14px' }}>
                  Grade {analysis.grade}
                </span>
              </div>
              <div className="progress-bar" style={{ marginTop: '16px' }}>
                <div className="progress-fill" style={{ width: `${analysis.atsScore}%` }} />
              </div>
            </GlassCard>

            <div style={{ gridColumn: '2 / 4' }}>
              <div className="grid-2" style={{ height: '100%' }}>
                <GlassCard className="p-4">
                  <div style={{ fontWeight: 600, marginBottom: '12px', fontSize: '13px', color: '#34d399' }}>✅ Keywords Found ({analysis.keywords?.found?.length || 0})</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {(analysis.keywords?.found || []).map((kw: string) => (
                      <span key={kw} className="badge badge-emerald">{kw}</span>
                    ))}
                  </div>
                </GlassCard>
                <GlassCard className="p-4">
                  <div style={{ fontWeight: 600, marginBottom: '12px', fontSize: '13px', color: '#fb7185' }}>❌ Keywords Missing ({analysis.keywords?.missing?.length || 0})</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {(analysis.keywords?.missing || []).map((kw: string) => (
                      <span key={kw} className="badge badge-rose">{kw}</span>
                    ))}
                  </div>
                </GlassCard>
              </div>
            </div>
          </div>

          {/* Section Scores */}
          <div className="grid-2 mb-6">
            <GlassCard className="p-5">
              <div style={{ fontWeight: 600, marginBottom: '16px' }}>📋 Section Analysis</div>
              {Object.entries(analysis.sections || {}).map(([key, val]: [string, any]) => (
                <div key={key} style={{ marginBottom: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <span style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {sectionIcon[key] || '📌'}
                      <span style={{ textTransform: 'capitalize', color: 'var(--text-primary)' }}>{key.replace(/([A-Z])/g, ' $1')}</span>
                    </span>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: scoreColor(val.score) }}>{val.score}%</span>
                  </div>
                  <div className="progress-bar" style={{ height: '4px' }}>
                    <div className="progress-fill" style={{ width: `${val.score}%`, background: `linear-gradient(90deg, ${scoreColor(val.score)}, ${scoreColor(val.score)}88)` }} />
                  </div>
                  {val.issues?.length > 0 && (
                    <div style={{ marginTop: '4px' }}>
                      {val.issues.map((issue: string, i: number) => (
                        <div key={i} style={{ fontSize: '11px', color: '#fbbf24', marginTop: '2px' }}>⚠️ {issue}</div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </GlassCard>

            <GlassCard className="p-5">
              <div style={{ fontWeight: 600, marginBottom: '14px' }}>💡 Improvement Actions</div>
              {(analysis.improvements || []).map((imp: string, i: number) => (
                <div key={i} style={{
                  display: 'flex', gap: '10px', padding: '10px',
                  background: 'rgba(255,255,255,0.03)', borderRadius: '8px',
                  marginBottom: '8px', border: '1px solid var(--border-color)',
                }}>
                  <span style={{ color: 'var(--accent-secondary)', flexShrink: 0 }}>{i + 1}.</span>
                  <span style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{imp}</span>
                </div>
              ))}
            </GlassCard>
          </div>

          {/* Rewritten summary */}
          {analysis.rewrittenSummary && (
            <GlassCard className="p-5 mb-6">
              <div style={{ fontWeight: 600, marginBottom: '12px' }}>✨ AI-Improved Summary</div>
              <div style={{
                padding: '14px 18px', background: 'rgba(124,58,237,0.08)',
                border: '1px solid rgba(124,58,237,0.2)', borderRadius: '10px',
                fontSize: '14px', lineHeight: 1.8, color: 'var(--text-primary)',
                fontStyle: 'italic',
              }}>
                "{analysis.rewrittenSummary}"
              </div>
            </GlassCard>
          )}

          <div style={{ display: 'flex', gap: '12px' }}>
            <button className="btn btn-primary" onClick={() => { setAnalysis(null); setFileName(''); }} id="upload-new-resume-btn">
              📁 Analyze Another Resume
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResumeAnalyzer;
