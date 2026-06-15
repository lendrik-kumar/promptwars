import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Leaf, MessageSquare, Wallet, Zap, Receipt, Map, Home, Users, LogOut, User } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import api from './api/client';

import ErrorBoundary from './components/ErrorBoundary';
import { AuthProvider, useAuth } from './contexts/AuthContext';

const Landing        = React.lazy(() => import('./pages/Landing'));
const Dashboard      = React.lazy(() => import('./pages/Dashboard'));
const TravelScanner  = React.lazy(() => import('./pages/TravelScanner'));
const SmsScorer      = React.lazy(() => import('./pages/SmsScorer'));
const Mohalla        = React.lazy(() => import('./pages/Mohalla'));
const ReceiptScanner = React.lazy(() => import('./pages/ReceiptScanner'));
const GreenWallet    = React.lazy(() => import('./pages/GreenWallet'));
const BillAnalyzer   = React.lazy(() => import('./pages/BillAnalyzer'));
const Copilot        = React.lazy(() => import('./pages/Copilot'));
const Login          = React.lazy(() => import('./pages/Auth/Login'));
const Register       = React.lazy(() => import('./pages/Auth/Register'));

interface NavItem {
  to:    string;
  label: string;
  icon:  React.ReactNode;
  id:    string;
}

const NAV_ITEMS: NavItem[] = [
  { to: '/dashboard', label: 'Dashboard',       icon: <Home size={18} />,    id: 'nav-dashboard'},
  { to: '/wallet',    label: 'Green Wallet',    icon: <Wallet size={18} />,  id: 'nav-wallet'  },
  { to: '/sms',       label: 'SMS Scorer',      icon: <Zap size={18} />,     id: 'nav-sms'     },
  { to: '/receipt',   label: 'Receipt Scanner', icon: <Receipt size={18} />, id: 'nav-receipt' },
  { to: '/travel',    label: 'Travel Scanner',  icon: <Map size={18} />,     id: 'nav-travel'  },
  { to: '/mohalla',   label: 'Mohalla Mode',    icon: <Users size={18} />,   id: 'nav-mohalla' },
  { to: '/copilot',   label: 'Copilot',         icon: <MessageSquare size={18} />, id: 'nav-copilot' },
];

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div className="page row-center"><div className="loading-spinner" /></div>;
  }

  if (!user) {
    return (
      <div className="page row-center" style={{ flexDirection: 'column', textAlign: 'center' }}>
        <Leaf size={48} color="var(--color-primary)" style={{ marginBottom: 'var(--space-4)' }} />
        <h2 style={{ marginBottom: 'var(--space-2)' }}>Login Required</h2>
        <p style={{ color: 'var(--color-text-muted)', marginBottom: 'var(--space-6)', maxWidth: '400px' }}>
          Please log in or sign up to access the CarbonIQ product dashboard and save your progress.
        </p>
        <div className="stack row-center" style={{ flexDirection: 'row', gap: 'var(--space-4)' }}>
          <NavLink to="/login" className="btn btn--outline">Log In</NavLink>
          <NavLink to="/register" className="btn btn--primary">Sign Up</NavLink>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/travel"    element={<ProtectedRoute><TravelScanner /></ProtectedRoute>} />
        <Route path="/sms"       element={<ProtectedRoute><SmsScorer /></ProtectedRoute>} />
        <Route path="/mohalla"   element={<ProtectedRoute><Mohalla /></ProtectedRoute>} />
        <Route path="/receipt"   element={<ProtectedRoute><ReceiptScanner /></ProtectedRoute>} />
        <Route path="/wallet"    element={<ProtectedRoute><GreenWallet /></ProtectedRoute>} />
        <Route path="/bill"      element={<ProtectedRoute><BillAnalyzer /></ProtectedRoute>} />
        <Route path="/copilot"   element={<ProtectedRoute><Copilot /></ProtectedRoute>} />
      </Routes>
    </AnimatePresence>
  );
}

function UserProfileBadge() {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
      setUser(null);
      navigate('/');
    } catch (err) {
      console.error('Failed to log out', err);
    }
  };

  if (user) {
    return (
      <div className="sidebar__user">
        <div className="sidebar__user-info">
          <div className="sidebar__user-avatar"><User size={16} /></div>
          <div className="sidebar__user-details">
            <span className="sidebar__user-name">{user.name || 'User'}</span>
            <span className="sidebar__user-email">{user.email}</span>
          </div>
        </div>
        <button onClick={handleLogout} className="btn btn--icon" title="Log Out" style={{ padding: '8px' }}>
          <LogOut size={16} />
        </button>
      </div>
    );
  }

  return (
    <div className="sidebar__auth stack stack-sm">
      <NavLink to="/login" className="btn btn--outline" style={{ width: '100%', textAlign: 'center' }}>Log In</NavLink>
      <NavLink to="/register" className="btn btn--primary" style={{ width: '100%', textAlign: 'center' }}>Sign Up</NavLink>
    </div>
  );
}

function AppLayout() {
  return (
    <div className="app-layout">
      <aside className="app-layout__sidebar">
        <div className="sidebar__header">
          <Leaf className="sidebar__logo" size={28} />
          <h2>CarbonIQ</h2>
        </div>
        <nav className="sidebar__nav">
          <p className="sidebar__nav-title">Menu</p>
          <ul className="sidebar__menu" role="list">
            {NAV_ITEMS.map(item => (
              <li key={item.to}>
                <NavLink 
                  to={item.to} 
                  className={({ isActive }) => `sidebar__link ${isActive ? 'active' : ''}`}
                  id={item.id}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
        
        <div style={{ marginTop: 'auto', paddingTop: 'var(--space-4)', borderTop: '1px solid var(--color-border)' }}>
          <UserProfileBadge />
        </div>
      </aside>
      <main className="app-layout__content" id="main-content">
        <ErrorBoundary>
          <Suspense fallback={<div className="page" style={{ padding: 'var(--space-6)' }}><div className="skeleton" style={{ height: '200px', borderRadius: 'var(--radius-lg)' }} /></div>}>
            <AnimatedRoutes />
          </Suspense>
        </ErrorBoundary>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <BrowserRouter>
          <Toaster position="top-center" toastOptions={{ style: { borderRadius: '12px', background: '#333', color: '#fff' } }} />
          <a href="#main-content" className="skip-link">Skip to main content</a>
          <Routes>
            <Route path="/" element={
              <>
                <nav className="navbar" aria-label="Primary navigation">
                  <div className="navbar__inner">
                    <NavLink to="/" className="navbar__logo" aria-label="CarbonIQ home">
                      <Leaf size={20} className="navbar__logo-icon" />
                      <span className="navbar__logo-text">CarbonIQ</span>
                    </NavLink>
                    <ul className="navbar__links" role="list">
                      <li>
                        <NavLink to="/dashboard" className="navbar__link">
                          <Home size={16} /><span>Dashboard</span>
                        </NavLink>
                      </li>
                    </ul>
                  </div>
                </nav>
                <main id="main-content">
                  <ErrorBoundary>
                    <Suspense fallback={<div className="page" />}>
                      <Landing />
                    </Suspense>
                  </ErrorBoundary>
                </main>
              </>
            } />
            <Route path="/login" element={
              <Suspense fallback={<div className="page" />}><Login /></Suspense>
            } />
            <Route path="/register" element={
              <Suspense fallback={<div className="page" />}><Register /></Suspense>
            } />
            <Route path="*" element={<AppLayout />} />
          </Routes>

          <style>{`
            .skip-link {
              position: absolute;
              top: -40px;
              left: 0;
              background: var(--color-accent);
              color: #ffffff;
              padding: var(--space-2) var(--space-4);
              z-index: 9999;
              font-weight: 600;
              border-radius: 0 0 var(--radius-sm) 0;
              transition: top 0.2s;
            }
            .skip-link:focus { top: 0; }

            .navbar {
              position: fixed;
              top: 0; left: 0; right: 0;
              height: var(--nav-height);
              z-index: 100;
              background: rgba(255, 255, 255, 0.85);
              backdrop-filter: blur(16px);
              -webkit-backdrop-filter: blur(16px);
              border-bottom: 1px solid var(--color-border);
            }
            .navbar__inner {
              max-width: var(--max-width);
              margin-inline: auto;
              padding-inline: var(--space-6);
              height: 100%;
              display: flex;
              align-items: center;
              justify-content: space-between;
            }
            .navbar__logo {
              display: flex;
              align-items: center;
              gap: var(--space-2);
              text-decoration: none;
              color: var(--color-text);
              font-weight: 800;
              font-size: 1.25rem;
              letter-spacing: -0.02em;
            }
            .navbar__logo-icon {
              color: var(--color-primary);
            }
            .navbar__links {
              display: flex;
              gap: var(--space-6);
              list-style: none;
              margin: 0; padding: 0;
            }
            .navbar__link {
              display: flex;
              align-items: center;
              gap: var(--space-2);
              text-decoration: none;
              color: var(--color-text-muted);
              font-weight: 500;
              font-size: 0.95rem;
              transition: color 0.2s;
            }
            .navbar__link:hover { color: var(--color-primary); }

            .sidebar__user {
              display: flex;
              align-items: center;
              justify-content: space-between;
              padding: var(--space-3);
              background: var(--color-bg-card);
              border-radius: var(--radius-md);
              border: 1px solid var(--color-border);
            }
            .sidebar__user-info {
              display: flex;
              align-items: center;
              gap: var(--space-3);
              overflow: hidden;
            }
            .sidebar__user-avatar {
              width: 32px;
              height: 32px;
              border-radius: 50%;
              background: var(--color-primary-light);
              color: var(--color-primary);
              display: flex;
              align-items: center;
              justify-content: center;
              flex-shrink: 0;
            }
            .sidebar__user-details {
              display: flex;
              flex-direction: column;
              overflow: hidden;
            }
            .sidebar__user-name {
              font-weight: 600;
              font-size: 0.9rem;
              color: var(--color-text);
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
            }
            .sidebar__user-email {
              font-size: 0.75rem;
              color: var(--color-text-muted);
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
            }
          `}</style>
        </BrowserRouter>
      </AuthProvider>
    </ErrorBoundary>
  );
}
