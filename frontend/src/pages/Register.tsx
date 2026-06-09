import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const BRANCHES = ['CSE', 'ECE', 'EEE', 'ME', 'CE', 'IT', 'AIDS', 'AIML', 'Other'];
const SKILL_LEVELS = ['Beginner', 'Intermediate', 'Advanced'];

const Register: React.FC = () => {
  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    branch: 'CSE', college: '', cgpa: '', skillLevel: 'Beginner',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirmPassword) {
      return setError('Passwords do not match');
    }
    if (form.password.length < 6) {
      return setError('Password must be at least 6 characters');
    }

    setLoading(true);
    try {
      await register({
        name: form.name,
        email: form.email,
        password: form.password,
        branch: form.branch,
        college: form.college,
        cgpa: form.cgpa ? parseFloat(form.cgpa) : undefined,
        skillLevel: form.skillLevel,
      });
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card animate-fade-up" style={{ maxWidth: '520px' }}>
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            width: '56px', height: '56px',
            background: 'var(--grad-primary)',
            borderRadius: '14px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '26px', margin: '0 auto 14px',
            boxShadow: '0 8px 25px rgba(124,58,237,0.4)',
          }}>🚀</div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '26px', fontWeight: 800, marginBottom: '6px' }}>
            Start your journey
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
            Create your PlaceMentor AI account
          </p>
        </div>

        {error && (
          <div style={{
            padding: '12px 16px', borderRadius: '10px', marginBottom: '20px',
            background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.3)',
            color: '#fb7185', fontSize: '14px',
          }}>
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid-2" style={{ marginBottom: '16px' }}>
            <div>
              <label className="label">Full Name *</label>
              <input className="input-field" name="name" placeholder="Your full name" value={form.name} onChange={handleChange} required />
            </div>
            <div>
              <label className="label">Email *</label>
              <input className="input-field" type="email" name="email" placeholder="you@college.edu" value={form.email} onChange={handleChange} required />
            </div>
          </div>

          <div className="grid-2" style={{ marginBottom: '16px' }}>
            <div>
              <label className="label">Password *</label>
              <input className="input-field" type="password" name="password" placeholder="Min 6 characters" value={form.password} onChange={handleChange} required />
            </div>
            <div>
              <label className="label">Confirm Password *</label>
              <input className="input-field" type="password" name="confirmPassword" placeholder="Re-enter password" value={form.confirmPassword} onChange={handleChange} required />
            </div>
          </div>

          <div className="grid-2" style={{ marginBottom: '16px' }}>
            <div>
              <label className="label">Branch</label>
              <select className="input-field" name="branch" value={form.branch} onChange={handleChange} style={{ cursor: 'pointer' }}>
                {BRANCHES.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Skill Level</label>
              <select className="input-field" name="skillLevel" value={form.skillLevel} onChange={handleChange} style={{ cursor: 'pointer' }}>
                {SKILL_LEVELS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div className="grid-2" style={{ marginBottom: '24px' }}>
            <div>
              <label className="label">College / University</label>
              <input className="input-field" name="college" placeholder="Your college name" value={form.college} onChange={handleChange} />
            </div>
            <div>
              <label className="label">CGPA</label>
              <input className="input-field" type="number" name="cgpa" placeholder="e.g. 8.5" step="0.1" min="0" max="10" value={form.cgpa} onChange={handleChange} />
            </div>
          </div>

          <button id="register-btn" className="btn btn-primary w-full btn-lg" type="submit" disabled={loading}>
            {loading ? (
              <><div className="spinner" style={{ width: '18px', height: '18px' }} /> Creating account...</>
            ) : (
              '✨ Create Account'
            )}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px', color: 'var(--text-secondary)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--text-accent)', fontWeight: 600, textDecoration: 'none' }}>
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
