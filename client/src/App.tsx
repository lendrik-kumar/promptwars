import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, NavLink, useLocation } from 'react-router-dom';
import { Leaf, MessageSquare, Wallet, Zap, Receipt, Map, Home, Users } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';

import ErrorBoundary from './components/ErrorBoundary';

const Landing        = React.lazy(() => import('./pages/Landing'));
const Dashboard      = React.lazy(() => import('./pages/Dashboard'));
const TravelScanner  = React.lazy(() => import('./pages/TravelScanner'));
const SmsScorer      = React.lazy(() => import('./pages/SmsScorer'));
const Mohalla        = React.lazy(() => import('./pages/Mohalla'));
const ReceiptScanner = React.lazy(() => import('./pages/ReceiptScanner'));
const GreenWallet    = React.lazy(() => import('./pages/GreenWallet'));
const BillAnalyzer   = React.lazy(() => import('./pages/BillAnalyzer'));
const Copilot        = React.lazy(() => import('./pages/Copilot'));

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

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/travel"    element={<TravelScanner />} />
        <Route path="/sms"       element={<SmsScorer />} />
        <Route path="/mohalla"   element={<Mohalla />} />
        <Route path="/receipt"   element={<ReceiptScanner />} />
        <Route path="/bill"      element={<BillAnalyzer />} />
        <Route path="/wallet"    element={<GreenWallet />} />
        <Route path="/copilot"   element={<Copilot />} />
      </Routes>
    </AnimatePresence>
  );
}

function AppLayout() {
  return (
    <div className="app-layout">
      <aside className="app-layout__sidebar" aria-label="Sidebar navigation">
        <NavLink to="/" className="sidebar__logo" aria-label="CarbonIQ home">
          <Leaf size={28} />
          <span>CarbonIQ</span>
        </NavLink>
        
        <nav style={{ flex: 1, marginTop: 'var(--space-4)' }}>
          <div className="sidebar__nav-title">Menu</div>
          <ul className="sidebar__nav" role="list">
            {NAV_ITEMS.map((item) => (
              <li key={item.to}>
                <NavLink
                  id={item.id}
                  to={item.to}
                  className={({ isActive }) => `sidebar__link${isActive ? ' sidebar__link--active' : ''}`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
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
    <BrowserRouter>
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
          gap: var(--space-8);
        }
        .navbar__logo {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          font-family: var(--font-display);
          font-weight: 800;
          font-size: 1.2rem;
          color: var(--color-accent);
          text-decoration: none;
          flex-shrink: 0;
        }
        .navbar__logo-icon { color: var(--color-accent); }
        .navbar__links {
          display: flex;
          align-items: center;
          gap: var(--space-1);
          list-style: none;
          overflow-x: auto;
          flex: 1;
          justify-content: flex-end;
          scrollbar-width: none;
        }
        .navbar__links::-webkit-scrollbar { display: none; }
        .navbar__link {
          display: flex;
          align-items: center;
          gap: var(--space-1);
          padding: var(--space-2) var(--space-3);
          border-radius: var(--radius-full);
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--color-text-muted);
          text-decoration: none;
          transition: var(--transition-fast);
          white-space: nowrap;
          border: 1px solid transparent;
        }
        .navbar__link:hover {
          color: var(--color-text);
          background: var(--color-surface);
        }
        @media (max-width: 600px) {
          .navbar__logo-text { display: none; }
          .navbar__inner { gap: var(--space-4); }
          .navbar__link span { display: none; }
          .navbar__link { padding: var(--space-2); }
        }
      `}</style>
    </BrowserRouter>
  );
}
