import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { NavLink } from 'react-router-dom';
import { Leaf, Zap, Receipt, Map, Wallet, ChevronRight } from 'lucide-react';
import { getWallet, type WalletState } from '../api/client';


const TOOLS = [
  { to: '/sms',     icon: <Zap size={20} />,     title: 'SMS Scorer',      desc: 'Parse bank SMS for carbon cost', color: 'var(--color-amber)' },
  { to: '/receipt', icon: <Receipt size={20} />, title: 'Receipt Scanner', desc: 'Scan grocery bills for swaps',   color: 'var(--color-blue)' },
  { to: '/travel',  icon: <Map size={20} />,     title: 'Travel Scanner',  desc: 'Offset flights and train trips', color: 'var(--color-red)' },
  { to: '/mohalla', icon: <Leaf size={20} />,    title: 'Mohalla Mode',    desc: 'Compare footprints locally',     color: 'var(--color-accent)' },
];

export default function Dashboard() {
  const [wallet, setWallet] = useState<WalletState | null>(null);

  useEffect(() => {
    getWallet().then(setWallet).catch(() => {});
  }, []);

  return (
    <motion.div 
      className="page"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
    >
      <div className="container">
        {/* Header Section */}
        <div style={{ marginBottom: 'var(--space-8)', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          <h1 style={{ fontSize: '2.5rem', color: 'var(--color-primary)', margin: 0 }}>Your Carbon Dashboard</h1>
          <p style={{ fontSize: '1.125rem', color: 'var(--color-text-secondary)', maxWidth: '600px', margin: 0 }}>
            Welcome back, Pioneer. Your sustainable choices have kept {wallet ? wallet.totalCO2SavedKg.toFixed(1) : 0}kg of CO2 out of the atmosphere.
          </p>
        </div>

        {/* 2-Column Responsive Layout */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--space-6)', alignItems: 'start' }}>
          
          {/* Left Column: Daily Action Widget */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
            <div className="card card--glass animate-fade-up delay-100" style={{ padding: 'var(--space-6)', borderRadius: '32px', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: '-80px', right: '-80px', width: '250px', height: '250px', background: 'var(--color-accent-glow)', borderRadius: '50%', filter: 'blur(60px)' }}></div>
              <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-6)' }}>
                  <span style={{ padding: 'var(--space-2) var(--space-4)', background: 'var(--color-primary)', color: 'white', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                    Daily Action
                  </span>
                  <Leaf size={24} style={{ color: 'var(--color-accent)' }} />
                </div>
                
                <h2 style={{ fontSize: '1.5rem', color: 'var(--color-primary)', marginBottom: 'var(--space-3)' }}>Smart Swap</h2>
                <p style={{ fontSize: '1.125rem', color: 'var(--color-text-secondary)', lineHeight: 1.6, marginBottom: 'var(--space-5)' }}>
                  Switch your morning milk to <strong style={{ color: 'var(--color-accent)' }}>Oat milk</strong> to save <strong style={{ color: 'var(--color-accent)' }}>1.2kg CO₂</strong> per latte.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                  <div style={{ background: 'rgba(255,255,255,0.6)', padding: 'var(--space-4)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--color-accent-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-accent)' }}>
                      <Leaf size={24} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontWeight: 600, margin: 0, color: 'var(--color-text-primary)' }}>Apply Swap Now</p>
                      <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', margin: 0 }}>Automate your grocery list</p>
                    </div>
                    <ChevronRight size={20} style={{ color: 'var(--color-text-faint)' }} />
                  </div>
                  <button className="btn btn--primary" style={{ width: '100%', padding: 'var(--space-4)', borderRadius: '16px' }}>
                    Confirm Action
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Wallet & Tools */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
            
            {/* Green Wallet Snapshot */}
            <NavLink to="/wallet" style={{ textDecoration: 'none' }}>
              <motion.div 
                whileHover={{ y: -4 }}
                className="card card--glass animate-fade-up delay-200" 
                style={{ padding: 'var(--space-6)', borderRadius: '32px', background: 'linear-gradient(135deg, rgba(255,255,255,0.6) 0%, rgba(16,185,129,0.05) 100%)' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-6)' }}>
                  <h3 style={{ fontSize: '1.25rem', color: 'var(--color-primary)', margin: 0 }}>Green Wallet Snapshot</h3>
                  <Wallet size={24} style={{ color: 'var(--color-accent)' }} />
                </div>
                
                <div className="grid-2">
                  <div style={{ background: 'rgba(255,255,255,0.4)', padding: 'var(--space-4)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.6)' }}>
                    <p style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-secondary)', margin: '0 0 var(--space-2) 0' }}>Money Saved</p>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--space-2)' }}>
                      <span style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--color-primary)' }}>₹{wallet ? wallet.totalMoneySavedINR.toLocaleString('en-IN') : '0'}</span>
                    </div>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.4)', padding: 'var(--space-4)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.6)' }}>
                    <p style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-secondary)', margin: '0 0 var(--space-2) 0' }}>CO₂ Avoided</p>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--space-2)' }}>
                      <span style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--color-primary)' }}>{wallet ? wallet.totalCO2SavedKg.toFixed(1) : '0'} <span style={{ fontSize: '1.25rem' }}>kg</span></span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </NavLink>

            {/* Tools Grid */}
            <div>
              <h3 style={{ fontSize: '1.25rem', color: 'var(--color-primary)', marginBottom: 'var(--space-4)', paddingLeft: 'var(--space-2)' }}>Essential Tools</h3>
              <div className="grid-2">
                {TOOLS.map((t, i) => (
                  <NavLink key={t.to} to={t.to} style={{ textDecoration: 'none', color: 'inherit' }}>
                    <motion.div 
                      className={`card card--glass animate-fade-up delay-${300 + (i * 100)} hover-lift`}
                      whileHover={{ y: -4 }}
                      style={{ padding: 'var(--space-5)', borderRadius: '24px' }}
                    >
                      <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'var(--color-accent-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 'var(--space-4)', color: t.color }}>
                        {t.icon}
                      </div>
                      <h4 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 'var(--space-1)' }}>{t.title}</h4>
                      <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', margin: 0, lineHeight: 1.4 }}>{t.desc}</p>
                    </motion.div>
                  </NavLink>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </motion.div>
  );
}
