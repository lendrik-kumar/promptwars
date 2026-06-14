import React, { useState } from 'react';
import { MapPin, TrendingUp, Users, ChevronRight, Share, Leaf } from 'lucide-react';
import { toPng } from 'html-to-image';
import { getMohallaStats, type MohallaStats } from '../api/client';

const KNOWN_PINS = [
  { pin: '110001', label: 'Delhi — CP' },
  { pin: '400001', label: 'Mumbai — Fort' },
  { pin: '560001', label: 'Bengaluru — MG Rd' },
  { pin: '600001', label: 'Chennai — Parrys' },
  { pin: '700001', label: 'Kolkata — BBD Bagh' },
  { pin: '500001', label: 'Hyderabad — Abids' },
];

export default function Mohalla() {
  const [pincode,  setPincode]  = useState('');
  const [userCO2,  setUserCO2]  = useState('8.4');
  const [data,     setData]     = useState<MohallaStats | null>(null);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');

  const lookup = async (pin?: string) => {
    const target = (pin ?? pincode).trim();
    if (!/^\d{6}$/.test(target)) {
      setError('Please enter a valid 6-digit pin code');
      return;
    }
    setLoading(true);
    setData(null);
    setError('');
    try {
      const co2 = parseFloat(userCO2) || 8.4;
      const res  = await getMohallaStats(target, co2);
      setData(res);
      if (pin) setPincode(pin);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to fetch Mohalla data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); lookup(); };

  return (
    <div className="page">
      <div className="container">
        <header className="animate-fade-up" style={{ marginBottom: 'var(--space-8)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            <h1 style={{ fontSize: '2.5rem', color: 'var(--color-primary)', margin: 0 }}>Mohalla Mode 🏘️</h1>
            <p style={{ fontSize: '1.125rem', color: 'var(--color-text-secondary)', maxWidth: '600px', margin: 0 }}>
              See how your carbon footprint compares to your neighbourhood. Enter any 6-digit Indian pin code.
            </p>
          </div>
        </header>

        <div className="mohalla-layout">
          {/* Form */}
          <section className="card card--glass animate-fade-up delay-100" style={{ borderRadius: '24px', padding: 'var(--space-6)' }} aria-labelledby="mohalla-form-heading">
            <h2 id="mohalla-form-heading" style={{ fontSize: '1.25rem', color: 'var(--color-primary)', marginBottom: 'var(--space-4)' }}>
              Enter your pin code
            </h2>
            <form onSubmit={handleSubmit} noValidate>
              <label className="input-label" htmlFor="pin-input">6-digit pin code</label>
              <input
                id="pin-input"
                className="input"
                type="text"
                inputMode="numeric"
                pattern="\d{6}"
                maxLength={6}
                value={pincode}
                onChange={(e) => { setPincode(e.target.value.replace(/\D/g, '')); setError(''); }}
                placeholder="e.g. 110001"
                aria-describedby={error ? 'pin-error' : undefined}
              />
              <label className="input-label" htmlFor="co2-input" style={{ marginTop: 'var(--space-3)' }}>
                Your estimated daily CO₂ (kg)
              </label>
              <input
                id="co2-input"
                className="input"
                type="number"
                min="1"
                max="50"
                step="0.1"
                value={userCO2}
                onChange={(e) => setUserCO2(e.target.value)}
              />
              {error && (
                <p id="pin-error" role="alert" style={{ color: 'var(--color-red)', fontSize: '0.875rem', marginTop: 'var(--space-2)' }}>
                  ⚠️ {error}
                </p>
              )}
              <button
                id="btn-lookup-mohalla"
                type="submit"
                className="btn btn--primary"
                disabled={loading || pincode.length !== 6}
                style={{ marginTop: 'var(--space-4)', width: '100%', borderRadius: '16px', padding: 'var(--space-4)' }}
                aria-busy={loading}
              >
                {loading ? <><span className="spinner" aria-hidden="true" />Loading…</> : <><MapPin size={20} aria-hidden="true" />Look up my Mohalla</>}
              </button>
            </form>

            <div style={{ marginTop: 'var(--space-5)' }}>
              <p className="section-heading">Quick picks</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', marginTop: 'var(--space-2)' }}>
                {KNOWN_PINS.map((p) => (
                  <button key={p.pin} className="sample-chip" onClick={() => lookup(p.pin)} aria-label={`Look up ${p.label}`}>
                    <ChevronRight size={12} className="chip-icon" aria-hidden="true" />
                    <span className="chip-text">{p.pin} — {p.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Results */}
          <div>
            {!data && !loading && (
              <div className="result-placeholder">
                <MapPin size={48} style={{ color: 'var(--color-text-faint)', marginBottom: 16 }} aria-hidden="true" />
                <p style={{ color: 'var(--color-text-faint)' }}>Neighbourhood data will appear here</p>
              </div>
            )}
            {loading && <MohallaSkeletons />}
            {data && <MohallaResult data={data} />}
          </div>
        </div>
      </div>

      <style>{`
        .mohalla-layout {
          display: grid;
          grid-template-columns: 380px 1fr;
          gap: var(--space-6);
          align-items: start;
        }
        @media (max-width: 768px) { .mohalla-layout { grid-template-columns: 1fr; } }

        .sample-chip {
          display: flex; align-items: center; gap: var(--space-2);
          padding: var(--space-2) var(--space-3);
          background: var(--color-surface-2);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-sm);
          cursor: pointer; text-align: left;
          transition: var(--transition-fast); width: 100%;
        }
        .sample-chip:hover { border-color: var(--color-accent); background: var(--color-accent-dim); }
        .chip-icon { color: var(--color-accent); flex-shrink: 0; }
        .chip-text { font-size: 0.82rem; color: var(--color-text-muted); }

        .result-placeholder {
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          padding: var(--space-12);
          border: 1px dashed var(--color-border);
          border-radius: var(--radius-lg);
          text-align: center; min-height: 300px;
        }
        .spinner {
          display: inline-block; width: 16px; height: 16px;
          border: 2px solid rgba(16, 185, 129, 0.2); border-top-color: var(--color-accent);
          border-radius: 50%; animation: spin 0.7s linear infinite; margin-right: 8px;
        }
        .percentile-ring {
          width: 120px; height: 120px;
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          flex-direction: column;
          font-family: var(--font-display); font-weight: 800; font-size: 2rem;
          color: var(--color-accent);
          border: 4px solid var(--color-accent);
          box-shadow: var(--shadow-glow);
          animation: countUp 0.6s cubic-bezier(0.16,1,0.3,1) both;
        }
        .percentile-ring span { font-size: 0.7rem; font-weight: 500; color: var(--color-text-muted); }

        .leaderboard-row {
          display: flex; align-items: center; gap: var(--space-4);
          padding: var(--space-3) 0;
          border-bottom: 1px solid var(--color-border);
        }
        .leaderboard-row:last-child { border-bottom: none; }
        .lb-rank { font-weight: 700; font-family: var(--font-display); font-size: 1.1rem; width: 28px; color: var(--color-text-muted); }
        .lb-name { flex: 1; font-size: 0.9rem; }
        .lb-co2  { font-weight: 600; font-size: 0.9rem; color: var(--color-accent); }
        .lb-swap { font-size: 0.78rem; color: var(--color-text-faint); }
      `}</style>
    </div>
  );
}

function MohallaResult({ data }: { data: MohallaStats }) {
  const handleExport = async () => {
    const node = document.getElementById('mohalla-export-node');
    if (!node) return;
    try {
      const dataUrl = await toPng(node, { cacheBust: true, backgroundColor: 'var(--color-bg)' });
      const link = document.createElement('a');
      link.download = `mohalla-rank-${data.pincode}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to export image', err);
    }
  };

  return (
    <div className="stack stack-lg animate-fade-up">
      {/* Hero card */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '-var(--space-4)' }}>
        <button className="btn btn--outline btn--sm" onClick={handleExport} style={{ zIndex: 10 }}>
          <Share size={14} /> Share Rank
        </button>
      </div>
      <div id="mohalla-export-node" style={{ padding: 'var(--space-4)', background: 'var(--color-bg)', borderRadius: '32px' }} className="stack stack-lg">
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', paddingLeft: 'var(--space-2)', marginTop: '-var(--space-2)' }}>
          <Leaf size={20} style={{ color: 'var(--color-accent)' }} />
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--color-accent)' }}>CarbonIQ Impact</span>
        </div>
        <div className="card card--glass animate-fade-up delay-200" style={{ borderRadius: '24px', padding: 'var(--space-6)', background: 'linear-gradient(135deg, rgba(255,255,255,0.8) 0%, rgba(16,185,129,0.05) 100%)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
            <div>
              <p className="section-heading" style={{ color: 'var(--color-primary)' }}>{data.pincode} · {data.city}</p>
              <h2 style={{ fontSize: '2rem', color: 'var(--color-primary)', marginBottom: 'var(--space-2)' }}>{data.area}</h2>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '1rem', maxWidth: '40ch', lineHeight: 1.5 }}>{data.message}</p>
              <p style={{ marginTop: 'var(--space-3)', fontSize: '0.85rem', color: 'var(--color-text-faint)' }}>
                Grid: {data.gridFactor} kg CO₂/kWh · {data.renewablePct}% renewable · {data.state}
              </p>
            </div>
            <div className="percentile-ring" aria-label={`You are in the top ${100 - data.percentile} percent of your area`}>
              {data.percentile}
              <span>percentile</span>
            </div>
          </div>
        </div>

      {/* Stats row */}
      <div className="grid-2">
        <div className="card card--glass animate-fade-up delay-300" style={{ borderRadius: '24px', padding: 'var(--space-6)' }}>
          <p className="section-heading" style={{ color: 'var(--color-primary)' }}>Your daily CO₂</p>
          <div className="stat-value animate-count-up" style={{ fontSize: '2.5rem', color: 'var(--color-primary)' }}>{data.userFootprintKg} <span style={{ fontSize: '1.25rem', fontWeight: 500 }}>kg</span></div>
          <div style={{ marginTop: 'var(--space-3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: 4 }}>
              <span style={{ color: 'var(--color-text-secondary)', fontWeight: 600 }}>You</span>
              <span style={{ color: 'var(--color-text-secondary)' }}>Area avg: {data.areaAverageKg} kg</span>
            </div>
            <div className="progress-track">
              <div
                className="progress-fill"
                style={{ width: `${Math.min(100, (data.userFootprintKg / data.areaAverageKg) * 100)}%` }}
                role="progressbar"
                aria-valuenow={data.userFootprintKg}
                aria-valuemax={data.areaAverageKg}
                aria-label="Your footprint vs area average"
              />
            </div>
          </div>
        </div>
        <div className="card card--glass animate-fade-up delay-400" style={{ borderRadius: '24px', padding: 'var(--space-6)' }}>
          <p className="section-heading" style={{ color: 'var(--color-primary)' }}>Collective impact</p>
          <div className="stat-value animate-count-up delay-100" style={{ fontSize: '2.5rem', color: 'var(--color-accent)' }}>
            {data.collectiveImpact.ifAllSwapped.toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginTop: 'var(--space-1)' }}>kg CO₂ saved this month if all {data.householdsInArea.toLocaleString('en-IN')} households swap</div>
        </div>
      </div>

      {/* Top swaps */}
      <div className="card card--glass animate-fade-up delay-500" style={{ borderRadius: '24px', padding: 'var(--space-6)' }}>
        <h3 style={{ marginBottom: 'var(--space-4)', fontSize: '1.25rem', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <TrendingUp size={20} style={{ color: 'var(--color-accent)' }} aria-hidden="true" />
          What your neighbours are doing
        </h3>
        {data.topSwaps.map((swap, i) => (
          <div key={i} className="leaderboard-row animate-slide-in" style={{ animationDelay: `${i * 0.1}s` }}>
            <div className="lb-rank">{i + 1}</div>
            <div style={{ flex: 1 }}>
              <div className="lb-name" style={{ fontWeight: 600 }}>{swap}</div>
            </div>
            <span className="badge badge--green">{data.topSwapAdoptionPcts[i]}% adopted</span>
          </div>
        ))}
      </div>

      {/* Leaderboard */}
      <div className="card card--glass animate-fade-up delay-600" style={{ borderRadius: '24px', padding: 'var(--space-6)' }}>
        <h3 style={{ marginBottom: 'var(--space-4)', fontSize: '1.25rem', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <Users size={20} style={{ color: 'var(--color-accent)' }} aria-hidden="true" />
          Area leaderboard (anonymised)
        </h3>
        {data.leaderboard.map((row) => (
          <div key={row.rank} className="leaderboard-row animate-slide-in" style={{ animationDelay: `${row.rank * 0.08}s` }}>
            <div className="lb-rank">{row.rank}</div>
            <div style={{ flex: 1 }}>
              <div className="lb-name" style={{ fontWeight: 600 }}>{row.label}</div>
              <div className="lb-swap">{row.topSwap}</div>
            </div>
            <div className="lb-co2">{row.dailyCO2Kg} kg/day</div>
          </div>
        ))}
        <p style={{ fontSize: '0.75rem', color: 'var(--color-text-faint)', marginTop: 'var(--space-4)' }}>
          All data is aggregated and anonymised. Individual households cannot be identified.
        </p>
      </div>
      </div>
    </div>
  );
}

function MohallaSkeletons() {
  return (
    <div className="stack stack-lg">
      {[200, 120, 180].map((h, i) => (
        <div key={i} className="skeleton" style={{ height: h, borderRadius: 16 }} />
      ))}
    </div>
  );
}
