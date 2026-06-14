import React, { useEffect, useState, useCallback } from 'react';
import { CheckCircle, RefreshCw, Users, TrendingDown, DollarSign } from 'lucide-react';
import { getDailySwap, recordSwapAction, type DailySwap } from '../api/client';

type Status = 'idle' | 'loading' | 'done' | 'taken' | 'error';

export default function Home({ isWidget = false }: { isWidget?: boolean }) {
  const [swap, setSwap]       = useState<DailySwap | null>(null);
  const [status, setStatus]   = useState<Status>('loading');
  const [taken, setTaken]     = useState(false);
  const [error, setError]     = useState('');

  const loadSwap = useCallback(async () => {
    setStatus('loading');
    setTaken(false);
    setError('');
    try {
      const data = await getDailySwap();
      setSwap(data);
      setStatus('done');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load swap');
      setStatus('error');
    }
  }, []);

  useEffect(() => { loadSwap(); }, [loadSwap]);

  const handleTakeSwap = async () => {
    if (!swap || taken) return;
    setTaken(true);
    try {
      await recordSwapAction({
        carbonSavedKg: swap.carbonSavedKg,
        moneySavedINR: swap.moneySavedINR,
        swapId:        swap.id,
        label:         swap.suggestion,
      });
    } catch { /* silent — UI already updated */ }
  };

  return (
    <div className={isWidget ? '' : 'page'}>
      <div className={isWidget ? '' : 'container'}>
        <header className="home-header animate-fade-up">
          <p className="section-heading">Today's swap</p>
          <h1>One action.<br />Real rupees saved.</h1>
          <p className="home-subtitle">
            CarbonIQ picks the single highest-impact, lowest-friction change you can make today — based on what you actually did yesterday.
          </p>
        </header>

        {status === 'loading' && <SwapCardSkeleton />}
        {status === 'error'   && (
          <div className="error-card card animate-fade-in" role="alert" aria-live="polite">
            <p>⚠️ {error}</p>
            <button className="btn btn--outline btn--sm" onClick={loadSwap} style={{ marginTop: 12 }}>
              <RefreshCw size={14} /> Try again
            </button>
          </div>
        )}
        {status === 'done' && swap && (
          <SwapCard swap={swap} taken={taken} onTake={handleTakeSwap} onRefresh={loadSwap} />
        )}

        <div className="home-stats animate-fade-up delay-300">
          <StatPill icon={<TrendingDown size={14} />} label="Avg saving" value="0.8 kg CO₂/day" />
          <StatPill icon={<DollarSign size={14} />} label="Annual saving" value="₹18,000" />
          <StatPill icon={<Users size={14} />} label="Action rate" value="74% of users" />
        </div>
      </div>

      <style>{`
        .home-header { margin-bottom: var(--space-8); }
        .home-subtitle {
          margin-top: var(--space-3);
          color: var(--color-text-muted);
          font-size: 1.05rem;
          max-width: 52ch;
        }
        .home-stats {
          display: flex;
          flex-wrap: wrap;
          gap: var(--space-3);
          margin-top: var(--space-10);
        }
        .stat-pill {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          padding: var(--space-2) var(--space-4);
          background: var(--color-surface);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-full);
          font-size: 0.85rem;
        }
        .stat-pill__icon { color: var(--color-accent); }
        .stat-pill__value { font-weight: 600; color: var(--color-accent); }
        .stat-pill__label { color: var(--color-text-muted); }

        .error-card { border-color: var(--color-red); background: var(--color-red-dim); }

        /* ── Swap Card ───────────────────── */
        .swap-card {
          background: linear-gradient(135deg,
            #ffffff 0%,
            #ecfdf5 100%
          );
          border: 1px solid var(--color-accent);
          border-radius: var(--radius-xl);
          padding: var(--space-8);
          box-shadow: var(--shadow-glow);
          animation: pulseGlow 4s ease-in-out infinite, fadeUp 0.5s ease both;
          position: relative;
          overflow: hidden;
          max-width: 640px;
        }
        .swap-card::before {
          content: '';
          position: absolute;
          top: -60px; right: -60px;
          width: 200px; height: 200px;
          background: radial-gradient(circle, rgba(16, 185, 129, 0.08) 0%, transparent 70%);
          pointer-events: none;
        }
        .swap-card__emoji {
          font-size: 2.5rem;
          display: block;
          margin-bottom: var(--space-4);
        }
        .swap-card__trigger {
          font-size: 0.85rem;
          color: var(--color-text-muted);
          margin-bottom: var(--space-2);
        }
        .swap-card__title {
          font-family: var(--font-display);
          font-size: clamp(1.1rem, 3vw, 1.5rem);
          font-weight: 700;
          margin-bottom: var(--space-4);
          line-height: 1.3;
        }
        .swap-card__desc {
          font-size: 0.95rem;
          color: var(--color-text-muted);
          margin-bottom: var(--space-6);
        }
        .swap-card__savings {
          display: flex;
          gap: var(--space-6);
          margin-bottom: var(--space-6);
          flex-wrap: wrap;
        }
        .saving-item__amount {
          font-family: var(--font-display);
          font-size: 1.8rem;
          font-weight: 800;
          color: var(--color-accent);
          line-height: 1;
        }
        .saving-item__label {
          font-size: 0.75rem;
          color: var(--color-text-muted);
          margin-top: 2px;
        }
        .swap-card__neighbors {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          font-size: 0.85rem;
          color: var(--color-text-muted);
          margin-bottom: var(--space-6);
        }
        .swap-card__neighbors-dot {
          width: 8px; height: 8px;
          border-radius: 50%;
          background: var(--color-accent);
          box-shadow: 0 0 6px var(--color-accent);
        }
        .swap-card__actions { display: flex; gap: var(--space-3); flex-wrap: wrap; }

        .swap-taken {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          padding: var(--space-4) var(--space-5);
          background: var(--color-accent-dim);
          border: 1px solid var(--color-accent);
          border-radius: var(--radius-lg);
          color: var(--color-accent);
          font-weight: 600;
          animation: fadeIn 0.3s ease;
        }

        /* skeleton */
        .swap-skeleton {
          border-radius: var(--radius-xl);
          padding: var(--space-8);
          background: var(--color-surface);
          border: 1px solid var(--color-border);
          max-width: 640px;
          display: flex;
          flex-direction: column;
          gap: var(--space-4);
          animation: fadeIn 0.3s ease;
        }
        .skel { height: 20px; border-radius: var(--radius-sm); }
        .skel-title { height: 36px; width: 80%; }
        .skel-body  { height: 16px; width: 60%; }
        .skel-wide  { height: 16px; width: 90%; }
        .skel-btn   { height: 44px; width: 180px; border-radius: var(--radius-full); }
      `}</style>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function SwapCard({
  swap, taken, onTake, onRefresh,
}: {
  swap: DailySwap;
  taken: boolean;
  onTake: () => void;
  onRefresh: () => void;
}) {
  return (
    <article className="swap-card" aria-label="Today's carbon swap card">
      <span className="swap-card__emoji" aria-hidden="true">{swap.emoji}</span>
      <p className="swap-card__trigger">Based on: {swap.triggerBehavior}</p>
      <h2 className="swap-card__title">{swap.suggestion}</h2>
      <p className="swap-card__desc">{swap.description}</p>

      <div className="swap-card__savings" aria-label="Savings summary">
        <div>
          <div className="saving-item__amount">₹{swap.moneySavedINR.toLocaleString('en-IN')}</div>
          <div className="saving-item__label">money saved</div>
        </div>
        <div>
          <div className="saving-item__amount">{swap.carbonSavedKg} kg</div>
          <div className="saving-item__label">CO₂ avoided</div>
        </div>
      </div>

      <div className="swap-card__neighbors" aria-label="Neighbour adoption">
        <span className="swap-card__neighbors-dot" aria-hidden="true" />
        <span>{swap.neighborCount} of your neighbours already make this swap</span>
      </div>

      <div className="swap-card__actions">
        {taken ? (
          <div className="swap-taken" role="status" aria-live="polite">
            <CheckCircle size={20} aria-hidden="true" />
            Added to your Green Wallet 🎉
          </div>
        ) : (
          <button
            id="btn-take-swap"
            className="btn btn--primary btn--lg"
            onClick={onTake}
            aria-label="Mark this swap as completed"
          >
            <CheckCircle size={18} aria-hidden="true" />
            I'll try it today
          </button>
        )}
        <button
          id="btn-refresh-swap"
          className="btn btn--ghost btn--sm"
          onClick={onRefresh}
          aria-label="Load a different swap"
        >
          <RefreshCw size={14} aria-hidden="true" />
          Different swap
        </button>
      </div>
    </article>
  );
}

function SwapCardSkeleton() {
  return (
    <div className="swap-skeleton" aria-busy="true" aria-label="Loading today's swap">
      <div className="skel skeleton" style={{ width: 48, height: 48, borderRadius: 12 }} />
      <div className="skel skeleton skel-title" />
      <div className="skel skeleton skel-wide" />
      <div className="skel skeleton skel-body" />
      <div style={{ display: 'flex', gap: 32, marginTop: 8 }}>
        <div className="skeleton" style={{ width: 80, height: 48, borderRadius: 8 }} />
        <div className="skeleton" style={{ width: 80, height: 48, borderRadius: 8 }} />
      </div>
      <div className="skel skeleton skel-btn" />
    </div>
  );
}

function StatPill({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="stat-pill">
      <span className="stat-pill__icon" aria-hidden="true">{icon}</span>
      <span className="stat-pill__value">{value}</span>
      <span className="stat-pill__label">{label}</span>
    </div>
  );
}
