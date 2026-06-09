import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const NAV_ITEMS = [
  { path: '/dashboard', label: 'Dashboard', icon: '🏠' },
  { path: '/career-advisor', label: 'Career Advisor', icon: '🧭' },
  { path: '/aptitude', label: 'Aptitude', icon: '🧮' },
  { path: '/coding', label: 'Coding Prep', icon: '💻' },
  { path: '/tech-interview', label: 'Tech Interview', icon: '🔬' },
  { path: '/hr-interview', label: 'HR Interview', icon: '🤝' },
  { path: '/gd-trainer', label: 'GD Trainer', icon: '🗣️' },
  { path: '/communication', label: 'Communication', icon: '📢' },
  { path: '/resume', label: 'Resume Analyzer', icon: '📄' },
  { path: '/company-hub', label: 'Company Hub', icon: '🏢' },
  { path: '/tracker', label: 'Study Tracker', icon: '📅' },
];

const PAGE_TITLES: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/career-advisor': 'Career Advisor',
  '/aptitude': 'Aptitude Training',
  '/coding': 'Coding Preparation',
  '/tech-interview': 'Technical Interview',
  '/hr-interview': 'HR Interview',
  '/gd-trainer': 'Group Discussion',
  '/communication': 'Communication',
  '/resume': 'Resume Analyzer',
  '/company-hub': 'Company Hub',
  '/tracker': 'Study Tracker',
};

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useAuth();
  const { toggleTheme, isDark } = useTheme();
  const location = useLocation();

  const currentTitle = PAGE_TITLES[location.pathname] || 'PlaceMentor AI';

  return (
    <>
      <div className="app-bg" />

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 99 }}
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">🎓</div>
          {!collapsed && (
            <div>
              <div className="sidebar-logo-text">PlaceMentor</div>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>AI Campus Coach</div>
            </div>
          )}
        </div>

        <nav className="sidebar-nav">
          {!collapsed && <div className="nav-section-title">Navigation</div>}
          {NAV_ITEMS.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setMobileOpen(false)}
              title={collapsed ? item.label : undefined}
            >
              <span className="nav-icon">{item.icon}</span>
              {!collapsed && <span className="nav-label">{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          {!collapsed && user && (
            <div style={{
              padding: '12px',
              background: 'var(--bg-card)',
              borderRadius: '10px',
              marginBottom: '10px',
              border: '1px solid var(--border-color)',
            }}>
              <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '2px' }}>
                {user.name}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{user.email}</div>
              {user.branch && (
                <div style={{ fontSize: '11px', color: 'var(--text-accent)', marginTop: '4px' }}>
                  {user.branch} · {user.skillLevel || 'Beginner'}
                </div>
              )}
            </div>
          )}
          <button
            className="btn btn-ghost btn-sm w-full"
            onClick={logout}
            title="Logout"
            style={{ justifyContent: collapsed ? 'center' : 'flex-start' }}
          >
            <span>🚪</span>
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className={`main-content ${collapsed ? 'sidebar-collapsed' : ''}`}>
        {/* Topbar */}
        <header className="topbar">
          <div className="topbar-left">
            <button
              className="btn btn-ghost btn-icon"
              onClick={() => { setCollapsed(c => !c); setMobileOpen(false); }}
              id="sidebar-toggle"
            >
              <span style={{ fontSize: '18px' }}>{collapsed ? '▶' : '◀'}</span>
            </button>
            <div className="topbar-breadcrumb">
              <span>PlaceMentor</span>
              <span>›</span>
              <span className="current">{currentTitle}</span>
            </div>
          </div>

          <div className="topbar-right">
            <button className="btn btn-ghost btn-icon" onClick={toggleTheme} id="theme-toggle" title="Toggle theme">
              <span style={{ fontSize: '16px' }}>{isDark ? '☀️' : '🌙'}</span>
            </button>

            {user && (
              <div style={{
                width: '36px',
                height: '36px',
                background: 'var(--grad-primary)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '14px',
                fontWeight: 700,
                color: '#fff',
                cursor: 'pointer',
                flexShrink: 0,
              }}
                title={user.name}
              >
                {user.name.charAt(0).toUpperCase()}
              </div>
            )}

            {/* Mobile menu button */}
            <button
              className="btn btn-ghost btn-icon"
              style={{ display: 'none' }}
              onClick={() => setMobileOpen(o => !o)}
              id="mobile-menu-btn"
            >
              ☰
            </button>
          </div>
        </header>

        {/* Page content */}
        <main style={{ flex: 1 }}>
          {children}
        </main>
      </div>
    </>
  );
};

export default Layout;
