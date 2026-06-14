import { useEffect, useState, useCallback } from 'react';
import { Wallet, TrendingDown, DollarSign, CheckCircle, Clock, Share, Leaf } from 'lucide-react';
import { toPng } from 'html-to-image';
import { motion } from 'framer-motion';
import { getWallet, type WalletState } from '../api/client';

export default function GreenWallet() {
  const [wallet,  setWallet]  = useState<WalletState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getWallet();
      setWallet(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load wallet');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) return (
    <div className="page">
      <div className="container">
        <WalletSkeleton />
      </div>
    </div>
  );

  if (error) return (
    <div className="page">
      <div className="container">
        <p role="alert" style={{ color: 'var(--color-red)' }}>⚠️ {error}</p>
        <button className="btn btn--outline btn--sm" onClick={load} style={{ marginTop: 12 }}>Retry</button>
      </div>
    </div>
  );

  if (!wallet) return null;

  const handleExport = async () => {
    const node = document.getElementById('wallet-export-node');
    if (!node) return;
    try {
      const dataUrl = await toPng(node, { cacheBust: true, backgroundColor: 'var(--color-bg)' });
      const link = document.createElement('a');
      link.download = 'carboniq-impact.png';
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to export image', err);
    }
  };

  const progressToNext = wallet.milestone.next
    ? Math.max(0, 1 - (wallet.milestone.next.amountToGo / wallet.milestone.next.threshold))
    : 1;

  const treesPlanted = Math.round(wallet.totalCO2SavedKg / 22.6); // avg tree absorbs ~22.6 kg/yr

  return (
    <motion.div 
      className="page"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
    >
      <div className="container">
        <header className="animate-fade-up" style={{ marginBottom: 'var(--space-8)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              <h1 style={{ fontSize: '2.5rem', color: 'var(--color-primary)', margin: 0 }}>Green Wallet 💚</h1>
              <p style={{ fontSize: '1.125rem', color: 'var(--color-text-secondary)', maxWidth: '600px', margin: 0 }}>
                Every swap you take earns savings. Milestones unlock real rewards from sustainability-aligned brands.
              </p>
            </div>
            <button className="btn btn--primary" onClick={handleExport} style={{ borderRadius: '16px' }}>
              <Share size={16} /> Share Impact
            </button>
          </div>
        </header>

        {/* Main stats wrapper for export */}
        <div id="wallet-export-node" style={{ padding: 'var(--space-4)', background: 'var(--color-bg)', borderRadius: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-4)', paddingLeft: 'var(--space-2)' }}>
            <Leaf size={20} style={{ color: 'var(--color-accent)' }} />
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--color-accent)' }}>CarbonIQ Impact</span>
          </div>
          <div className="grid-2 animate-fade-up delay-100" style={{ marginBottom: 'var(--space-2)' }}>
            <div className="card card--glass hover-lift" style={{ borderRadius: '24px', padding: 'var(--space-6)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'var(--color-accent-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <DollarSign size={20} style={{ color: 'var(--color-accent)' }} aria-hidden="true" />
                </div>
                <span style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--color-primary)' }}>Money Saved</span>
              </div>
              <div style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--color-primary)' }} className="animate-count-up">₹{wallet.totalMoneySavedINR.toLocaleString('en-IN')}</div>
              <div style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginTop: 'var(--space-1)' }}>since you started</div>
            </div>
            <div className="card card--glass hover-lift" style={{ borderRadius: '24px', padding: 'var(--space-6)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'var(--color-accent-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <TrendingDown size={20} style={{ color: 'var(--color-accent)' }} aria-hidden="true" />
                </div>
                <span style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--color-primary)' }}>CO₂ Avoided</span>
              </div>
              <div style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--color-primary)' }} className="animate-count-up delay-100">{wallet.totalCO2SavedKg.toFixed(1)} <span style={{ fontSize: '1.25rem', fontWeight: 500 }}>kg</span></div>
              <div style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginTop: 'var(--space-1)' }}>≈ {treesPlanted} tree{treesPlanted !== 1 ? 's' : ''} planted equivalent</div>
            </div>
          </div>
        </div>

        <div className="grid-2 animate-fade-up delay-200" style={{ marginBottom: 'var(--space-6)' }}>
          <div className="card card--glass" style={{ textAlign: 'center', borderRadius: '24px', padding: 'var(--space-6)' }}>
            <div className="animate-count-up" style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--color-primary)' }}>{wallet.swapsCompleted}</div>
            <div style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginTop: 'var(--space-1)' }}>swaps completed</div>
          </div>
          <div className="card card--glass" style={{ textAlign: 'center', borderRadius: '24px', padding: 'var(--space-6)' }}>
            <div className="animate-count-up delay-100" style={{ fontSize: '2.5rem', color: 'var(--color-amber)' }}>
              🌱
            </div>
            <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-primary)', marginTop: 'var(--space-1)' }}>
              {wallet.milestone.current ? wallet.milestone.current.name : 'Getting started'}
            </div>
          </div>
        </div>

        {/* Milestone progress */}
        <div className="card card--glass animate-fade-up delay-300" style={{ marginBottom: 'var(--space-6)', borderRadius: '24px', padding: 'var(--space-6)' }}>
          <h2 style={{ fontSize: '1.25rem', color: 'var(--color-primary)', marginBottom: 'var(--space-5)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <Wallet size={20} style={{ color: 'var(--color-accent)' }} aria-hidden="true" />
            Milestone progress
          </h2>

          {wallet.milestone.current && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-5)', padding: 'var(--space-3)', background: 'var(--color-accent-dim)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border-hover)' }}>
              <span style={{ fontSize: '1.5rem' }}>{wallet.milestone.current.badge}</span>
              <div>
                <div style={{ fontWeight: 600 }}>{wallet.milestone.current.name} — Unlocked!</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>{wallet.milestone.current.reward}</div>
              </div>
              <CheckCircle size={20} style={{ color: 'var(--color-accent)', marginLeft: 'auto' }} aria-hidden="true" />
            </div>
          )}

          {wallet.milestone.next && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: 'var(--space-2)' }}>
                <span style={{ color: 'var(--color-text-muted)' }}>Next: {wallet.milestone.next.badge} {wallet.milestone.next.name}</span>
                <span style={{ color: 'var(--color-accent)', fontWeight: 600 }}>₹{wallet.milestone.next.amountToGo.toLocaleString('en-IN')} to go</span>
              </div>
              <div className="progress-track" role="progressbar" aria-valuenow={wallet.totalMoneySavedINR} aria-valuemax={wallet.milestone.next.threshold} aria-label={`Progress to next milestone: ${wallet.milestone.next.name}`}>
                <div className="progress-fill" style={{ width: `${progressToNext * 100}%` }} />
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--color-text-faint)', marginTop: 'var(--space-2)' }}>
                Reward: {wallet.milestone.next.reward}
              </p>
            </div>
          )}

          {!wallet.milestone.current && !wallet.milestone.next && (
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
              Complete your first swap to start earning rewards!
            </p>
          )}
        </div>

        {/* Swap history */}
        {wallet.swapHistory.length > 0 && (
          <div className="card card--glass animate-fade-up delay-400" style={{ borderRadius: '24px', padding: 'var(--space-6)' }}>
            <h2 style={{ fontSize: '1.25rem', color: 'var(--color-primary)', marginBottom: 'var(--space-5)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <Clock size={20} style={{ color: 'var(--color-accent)' }} aria-hidden="true" />
              Recent swaps
            </h2>
            {[...wallet.swapHistory].reverse().slice(0, 10).map((entry, i) => (
              <div key={i} className="history-row animate-slide-in" style={{ animationDelay: `${i * 0.05}s` }}>
                <CheckCircle size={14} style={{ color: 'var(--color-accent)', flexShrink: 0 }} aria-hidden="true" />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.9rem' }}>{entry.label || entry.swapId}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-faint)' }}>
                    {new Date(entry.completedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
                <div style={{ textAlign: 'right', fontSize: '0.85rem' }}>
                  <div style={{ color: 'var(--color-accent)', fontWeight: 600 }}>+₹{entry.moneySavedINR}</div>
                  <div style={{ color: 'var(--color-text-faint)' }}>-{entry.carbonSavedKg} kg CO₂</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        .history-row {
          display: flex; align-items: center; gap: var(--space-3);
          padding: var(--space-3) 0;
          border-bottom: 1px solid var(--color-border);
        }
        .history-row:last-child { border-bottom: none; }
      `}</style>
    </motion.div>
  );
}

function WalletSkeleton() {
  return (
    <div className="stack stack-lg">
      <div className="skeleton" style={{ height: 40, width: 300, borderRadius: 8 }} />
      <div className="grid-2">
        <div className="skeleton" style={{ height: 120, borderRadius: 16 }} />
        <div className="skeleton" style={{ height: 120, borderRadius: 16 }} />
      </div>
      <div className="skeleton" style={{ height: 200, borderRadius: 16 }} />
    </div>
  );
}
