import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Layout from './components/Layout';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CareerAdvisor from './pages/CareerAdvisor';
import Aptitude from './pages/Aptitude';
import CodingPrep from './pages/CodingPrep';
import TechInterview from './pages/TechInterview';
import HRInterview from './pages/HRInterview';
import GDTrainer from './pages/GDTrainer';
import Communication from './pages/Communication';
import ResumeAnalyzer from './pages/ResumeAnalyzer';
import CompanyHub from './pages/CompanyHub';
import Tracker from './pages/Tracker';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'var(--bg-primary)' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '60px', height: '60px', background: 'var(--grad-primary)',
            borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '28px', margin: '0 auto 20px',
          }}>🎓</div>
          <div style={{ width: '32px', height: '32px', border: '3px solid rgba(124,58,237,0.3)', borderTopColor: '#7c3aed', borderRadius: '50%', animation: 'spin 0.7s linear infinite', margin: '0 auto' }} />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <Layout>{children}</Layout>;
};

const AppRoutes: React.FC = () => (
  <Routes>
    <Route path="/login" element={<Login />} />
    <Route path="/register" element={<Register />} />
    <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
    <Route path="/career-advisor" element={<ProtectedRoute><CareerAdvisor /></ProtectedRoute>} />
    <Route path="/aptitude" element={<ProtectedRoute><Aptitude /></ProtectedRoute>} />
    <Route path="/coding" element={<ProtectedRoute><CodingPrep /></ProtectedRoute>} />
    <Route path="/tech-interview" element={<ProtectedRoute><TechInterview /></ProtectedRoute>} />
    <Route path="/hr-interview" element={<ProtectedRoute><HRInterview /></ProtectedRoute>} />
    <Route path="/gd-trainer" element={<ProtectedRoute><GDTrainer /></ProtectedRoute>} />
    <Route path="/communication" element={<ProtectedRoute><Communication /></ProtectedRoute>} />
    <Route path="/resume" element={<ProtectedRoute><ResumeAnalyzer /></ProtectedRoute>} />
    <Route path="/company-hub" element={<ProtectedRoute><CompanyHub /></ProtectedRoute>} />
    <Route path="/tracker" element={<ProtectedRoute><Tracker /></ProtectedRoute>} />
    <Route path="*" element={<Navigate to="/dashboard" replace />} />
  </Routes>
);

const App: React.FC = () => (
  <BrowserRouter>
    <ThemeProvider>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </ThemeProvider>
  </BrowserRouter>
);

export default App;
