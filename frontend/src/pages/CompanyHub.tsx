import React, { useState, useEffect } from 'react';
import GlassCard from '../components/GlassCard';
import { advisorApi } from '../services/api';

const CompanyHub: React.FC = () => {
  const [companies, setCompanies] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [detail, setDetail] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    advisorApi.getCompanies()
      .then(res => setCompanies(res.data.companies))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const selectCompany = async (name: string) => {
    setDetailLoading(true);
    setSelected(name);
    try {
      const res = await advisorApi.getCompany(name);
      setDetail(res.data.company);
    } catch (err) {
      console.error(err);
    } finally {
      setDetailLoading(false);
    }
  };

  if (loading) return <div className="page-wrapper"><div className="loading-full"><div className="spinner" style={{ width: '40px', height: '40px' }} /></div></div>;

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <h1 className="page-title">🏢 Company Hub</h1>
        <p className="page-subtitle">Explore placement details, interview rounds, and preparation tips for top companies</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '20px' }}>
        {/* Company List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {companies.map(company => (
            <GlassCard
              key={company.name}
              className={`cursor-pointer ${selected === company.name ? 'glass-card-active' : ''}`}
              style={{ padding: '14px 18px', transition: 'all 0.2s' }}
              onClick={() => selectCompany(company.name)}
              id={`company-card-${company.name.toLowerCase()}`}
            >
              <div style={{ fontWeight: 600, marginBottom: '4px' }}>{company.name}</div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>{company.fullName}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="badge badge-emerald" style={{ fontSize: '10px' }}>{company.ctc}</span>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{company.roundCount} rounds</span>
              </div>
            </GlassCard>
          ))}
        </div>

        {/* Detail */}
        <div>
          {!selected ? (
            <GlassCard className="p-8" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '60px', marginBottom: '16px' }}>🏢</div>
              <h3 style={{ fontWeight: 700, marginBottom: '8px' }}>Select a Company</h3>
              <p style={{ color: 'var(--text-muted)' }}>Click on a company to see detailed preparation guide, round breakdown, and tips</p>
            </GlassCard>
          ) : detailLoading ? (
            <GlassCard className="p-8" style={{ textAlign: 'center' }}>
              <div className="spinner" style={{ width: '40px', height: '40px', margin: '0 auto' }} />
            </GlassCard>
          ) : detail ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }} className="animate-fade-in">
              {/* Header */}
              <GlassCard className="p-6">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 800, marginBottom: '4px' }}>
                      {detail.fullName}
                    </h2>
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                      <span className="badge badge-emerald">💰 {detail.ctc}</span>
                      <span className="badge badge-purple">{detail.rounds.length} Interview Rounds</span>
                    </div>
                  </div>
                </div>
              </GlassCard>

              {/* Rounds */}
              <GlassCard className="p-5">
                <div style={{ fontWeight: 600, marginBottom: '16px' }}>📋 Interview Process</div>
                <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '8px' }}>
                  {detail.rounds.map((round: string, i: number) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                      <div style={{
                        width: '36px', height: '36px', borderRadius: '50%',
                        background: 'var(--grad-primary)', color: '#fff',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '14px', fontWeight: 700, flexShrink: 0,
                      }}>
                        {i + 1}
                      </div>
                      <div style={{ padding: '8px 14px', background: 'rgba(124,58,237,0.1)', borderRadius: '8px', fontSize: '13px', color: 'var(--text-primary)', border: '1px solid rgba(124,58,237,0.2)', whiteSpace: 'nowrap' }}>
                        {round}
                      </div>
                      {i < detail.rounds.length - 1 && <span style={{ color: 'var(--text-muted)', fontSize: '20px' }}>→</span>}
                    </div>
                  ))}
                </div>
              </GlassCard>

              <div className="grid-2">
                {/* Key Topics */}
                <GlassCard className="p-5">
                  <div style={{ fontWeight: 600, marginBottom: '14px' }}>📚 Key Topics to Prepare</div>
                  {detail.keyTopics.map((topic: string, i: number) => (
                    <div key={i} style={{
                      display: 'flex', alignItems: 'center', gap: '10px',
                      padding: '8px 12px', background: 'rgba(6,182,212,0.05)',
                      borderRadius: '8px', marginBottom: '6px', border: '1px solid rgba(6,182,212,0.15)',
                    }}>
                      <span style={{ color: '#22d3ee' }}>▸</span>
                      <span style={{ fontSize: '13px', color: 'var(--text-primary)' }}>{topic}</span>
                    </div>
                  ))}
                </GlassCard>

                {/* Tips */}
                <GlassCard className="p-5">
                  <div style={{ fontWeight: 600, marginBottom: '14px' }}>💡 Preparation Tips</div>
                  {detail.tips.map((tip: string, i: number) => (
                    <div key={i} style={{
                      display: 'flex', gap: '10px', padding: '8px 12px',
                      background: 'rgba(16,185,129,0.05)', borderRadius: '8px',
                      marginBottom: '6px', border: '1px solid rgba(16,185,129,0.15)',
                    }}>
                      <span style={{ color: '#34d399', flexShrink: 0 }}>✓</span>
                      <span style={{ fontSize: '13px', color: 'var(--text-primary)', lineHeight: 1.5 }}>{tip}</span>
                    </div>
                  ))}
                </GlassCard>
              </div>

              {/* Eligibility */}
              <GlassCard className="p-4" style={{ background: 'rgba(245,158,11,0.05)', borderColor: 'rgba(245,158,11,0.2)' }}>
                <div style={{ fontWeight: 600, fontSize: '13px', color: '#fbbf24', marginBottom: '6px' }}>⚠️ Eligibility Criteria</div>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{detail.cutoff}</div>
              </GlassCard>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default CompanyHub;
