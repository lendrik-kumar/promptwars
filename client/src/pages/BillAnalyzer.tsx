import React, { useState } from 'react';
import { BarChart2, Zap } from 'lucide-react';
import { analyzeBill, type BillAnalysis } from '../api/client';

const INDIAN_STATES = [
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat',
  'Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh',
  'Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab','Rajasthan',
  'Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh','Uttarakhand','West Bengal',
  'Delhi','Puducherry','Chandigarh','Jammu and Kashmir','Ladakh',
];

const APPLIANCE_ICONS: Record<string, string> = {
  AC: '❄️', 'Air Conditioner': '❄️', 'Water Heater': '🚿', Geyser: '🚿',
  Refrigerator: '🧊', Lighting: '💡', Fan: '🌀', TV: '📺',
  'Washing Machine': '🫧', Pump: '💧', default: '⚡',
};

export default function BillAnalyzer() {
  const [units,       setUnits]       = useState('');
  const [state,       setState]       = useState('Maharashtra');
  const [billingDays, setBillingDays] = useState('30');
  const [amount,      setAmount]      = useState('');
  const [result,      setResult]      = useState<BillAnalysis | null>(null);
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const u = parseFloat(units);
    if (!u || u <= 0) { setError('Please enter valid units'); return; }
    setLoading(true);
    setResult(null);
    setError('');
    try {
      const data = await analyzeBill({
        units: u,
        state,
        billingDays: parseInt(billingDays) || 30,
        amount: parseFloat(amount) || undefined,
      });
      setResult(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Analysis failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="container">
        <header className="animate-fade-up" style={{ marginBottom: 'var(--space-8)' }}>
          <p className="section-heading">Bill Shock Translator</p>
          <h1>Electricity Bill Analyser ⚡</h1>
          <p style={{ color: 'var(--color-text-muted)', marginTop: 'var(--space-3)', maxWidth: '52ch' }}>
            Enter your electricity bill details. CarbonIQ breaks down which appliances are driving your footprint and gives you one specific action.
          </p>
        </header>

        <div className="bill-layout">
          {/* Form */}
          <section className="card animate-fade-up delay-100" aria-labelledby="bill-form-heading">
            <h2 id="bill-form-heading" style={{ fontSize: '1rem', marginBottom: 'var(--space-4)' }}>
              Bill details
            </h2>
            <form onSubmit={handleSubmit} noValidate className="stack stack-md">
              <div>
                <label className="input-label" htmlFor="units-input">Units consumed (kWh) *</label>
                <input
                  id="units-input"
                  className="input"
                  type="number"
                  min="1"
                  max="10000"
                  step="0.1"
                  value={units}
                  onChange={(e) => { setUnits(e.target.value); setError(''); }}
                  placeholder="e.g. 186"
                  required
                  aria-describedby={error ? 'bill-error' : undefined}
                />
              </div>

              <div>
                <label className="input-label" htmlFor="state-select">State *</label>
                <select
                  id="state-select"
                  className="input"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  style={{ cursor: 'pointer' }}
                >
                  {INDIAN_STATES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="input-label" htmlFor="days-input">Billing period (days)</label>
                <input
                  id="days-input"
                  className="input"
                  type="number"
                  min="1"
                  max="90"
                  value={billingDays}
                  onChange={(e) => setBillingDays(e.target.value)}
                />
              </div>

              <div>
                <label className="input-label" htmlFor="amount-input">Bill amount (₹) — optional</label>
                <input
                  id="amount-input"
                  className="input"
                  type="number"
                  min="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="e.g. 1,480"
                />
              </div>

              {error && (
                <p id="bill-error" role="alert" style={{ color: 'var(--color-red)', fontSize: '0.875rem' }}>
                  ⚠️ {error}
                </p>
              )}

              <button
                id="btn-analyze-bill"
                type="submit"
                className="btn btn--primary"
                disabled={loading || !units}
                aria-busy={loading}
              >
                {loading
                  ? <><span className="spinner" aria-hidden="true" />Analysing…</>
                  : <><BarChart2 size={16} aria-hidden="true" />Analyse Bill</>
                }
              </button>
            </form>
          </section>

          {/* Results */}
          <div>
            {!result && !loading && (
              <div className="result-placeholder">
                <Zap size={48} style={{ color: 'var(--color-text-faint)', marginBottom: 16 }} aria-hidden="true" />
                <p style={{ color: 'var(--color-text-faint)' }}>Your breakdown will appear here</p>
              </div>
            )}
            {loading && (
              <div className="stack stack-md">
                {[100, 240, 160].map((h, i) => (
                  <div key={i} className="skeleton" style={{ height: h, borderRadius: 16 }} />
                ))}
              </div>
            )}
            {result && <BillResult result={result} />}
          </div>
        </div>
      </div>

      <style>{`
        .bill-layout {
          display: grid;
          grid-template-columns: 340px 1fr;
          gap: var(--space-6);
          align-items: start;
        }
        @media (max-width: 768px) { .bill-layout { grid-template-columns: 1fr; } }
        .result-placeholder {
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          padding: var(--space-12); border: 1px dashed var(--color-border);
          border-radius: var(--radius-lg); text-align: center; min-height: 300px;
        }
        .spinner {
          display: inline-block; width: 16px; height: 16px;
          border: 2px solid rgba(16, 185, 129, 0.2); border-top-color: var(--color-accent);
          border-radius: 50%; animation: spin 0.7s linear infinite; margin-right: 8px;
        }
        select.input option { background: var(--color-surface); color: var(--color-text); }

        .appliance-bar {
          margin-bottom: var(--space-4);
        }
        .appliance-bar__header {
          display: flex; justify-content: space-between; font-size: 0.875rem;
          margin-bottom: var(--space-1);
        }
        .appliance-bar__name { font-weight: 500; }
        .appliance-bar__pct  { color: var(--color-text-muted); }
        .appliance-bar__track {
          height: 8px; background: var(--color-surface-2);
          border-radius: var(--radius-full); overflow: hidden;
        }
        .appliance-bar__fill {
          height: 100%; border-radius: var(--radius-full);
          background: linear-gradient(90deg, var(--color-accent), var(--color-accent-light));
          transition: width 0.8s cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow: 0 0 6px rgba(34,197,94,0.4);
        }

        .top-action {
          background: var(--color-amber-dim);
          border: 1px solid var(--color-amber);
          border-radius: var(--radius-md);
          padding: var(--space-4);
        }
      `}</style>
    </div>
  );
}

function BillResult({ result }: { result: BillAnalysis }) {
  return (
    <div className="stack stack-lg animate-fade-up">
      {/* Overview */}
      <div className="card card--accent">
        <div className="grid-3" style={{ gap: 'var(--space-5)' }}>
          <div>
            <p className="section-heading">Daily usage</p>
            <div className="stat-value" style={{ fontSize: '2rem' }}>{result.dailyUnits}</div>
            <div className="stat-label">kWh/day</div>
          </div>
          <div>
            <p className="section-heading">Daily CO₂</p>
            <div className="stat-value" style={{ fontSize: '2rem', color: 'var(--color-amber)' }}>{result.dailyCO2Kg}</div>
            <div className="stat-label">kg CO₂/day</div>
          </div>
          <div>
            <p className="section-heading">Grid factor</p>
            <div className="stat-value" style={{ fontSize: '2rem', color: 'var(--color-blue)' }}>{result.gridFactor}</div>
            <div className="stat-label">kg CO₂/kWh — {result.state}</div>
          </div>
        </div>

        <hr className="divider" />

        <div className="grid-2" style={{ gap: 'var(--space-6)' }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
            <strong style={{ color: 'var(--color-text)' }}>Total this bill:</strong>{' '}
            {result.totalCO2Kg.toFixed(1)} kg CO₂ over {result.billingDays} days
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
            Equivalent to not driving <strong style={{ color: 'var(--color-text)' }}>{result.equivalents.kmsNotDriven.toLocaleString('en-IN')} km</strong> by car
          </div>
        </div>
      </div>

      {/* Top action */}
      <div className="top-action animate-fade-up delay-100" role="note" aria-label="Top energy saving action">
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
          <Zap size={16} style={{ color: 'var(--color-amber)' }} aria-hidden="true" />
          <strong style={{ color: 'var(--color-amber)', fontSize: '0.85rem' }}>Top Action</strong>
        </div>
        <p style={{ fontSize: '0.95rem' }}>{result.topAction}</p>
      </div>

      {/* Appliance breakdown */}
      <div className="card animate-fade-up delay-200">
        <h3 style={{ fontSize: '1rem', marginBottom: 'var(--space-5)' }}>Estimated appliance breakdown</h3>
        {result.breakdown.map((row, i) => {
          const icon = APPLIANCE_ICONS[row.appliance] ?? APPLIANCE_ICONS.default;
          return (
            <div key={i} className="appliance-bar">
              <div className="appliance-bar__header">
                <span className="appliance-bar__name">{icon} {row.appliance}</span>
                <span className="appliance-bar__pct">{row.percentage}% · {row.kgCO2.toFixed(1)} kg CO₂</span>
              </div>
              <div className="appliance-bar__track" role="progressbar" aria-valuenow={row.percentage} aria-valuemax={100} aria-label={`${row.appliance}: ${row.percentage}% of usage`}>
                <div
                  className="appliance-bar__fill"
                  style={{ width: `${row.percentage}%` }}
                />
              </div>
            </div>
          );
        })}
        <p style={{ fontSize: '0.75rem', color: 'var(--color-text-faint)', marginTop: 'var(--space-3)' }}>
          Estimates based on typical Indian household appliance patterns. Actual usage may vary.
        </p>
      </div>
    </div>
  );
}
