import React, { useState } from 'react';
import { Zap, ChevronRight, ArrowRight, Leaf } from 'lucide-react';
import { parseSMS, type SMSParseResult } from '../api/client';

const SAMPLES = [
  'HDFC Bank: UPI txn of Rs.340 to SWIGGY on 12-06. Avl Bal Rs.12,450',
  'Dear SBI Customer, Rs.220.00 debited from A/c XX1234 to VPA ola@okaxis on 12-06-26',
  'ICICI Bank: Rs 156.50 debited for UPI txn at ZOMATO. Ref 2406123456',
  'Rs.2,800 paid to INDIANOIL on 13-06. UPI Ref: 240613789012',
  'HDFC Bank: UPI txn of Rs.1,240 to BIGBASKET on 11-06. Avl Bal Rs.8,200',
];

const CATEGORY_LABELS: Record<string, string> = {
  food_delivery:    'Food Delivery',
  transport_cab:    'Cab / Ride',
  transport_train:  'Train / Rail',
  transport_flight: 'Flight',
  grocery:          'Grocery',
  fuel:             'Fuel',
  utility:          'Utility',
  shopping:         'Shopping',
  entertainment:    'Entertainment',
  health:           'Health',
  default:          'General Spend',
};

const FLAG_BADGE: Record<string, string> = {
  food_delivery:    'badge--amber',
  transport_cab:    'badge--amber',
  fuel:             'badge--red',
  transport_flight: 'badge--red',
  grocery:          'badge--green',
  utility:          'badge--blue',
  default:          'badge--muted',
};

export default function SmsScorer() {
  const [sms,     setSms]     = useState('');
  const [result,  setResult]  = useState<SMSParseResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  const handlePaste = (sample: string) => {
    setSms(sample);
    setResult(null);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sms.trim()) return;
    setLoading(true);
    setResult(null);
    setError('');
    try {
      const data = await parseSMS(sms.trim());
      setResult(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to parse SMS');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="container">
        <header className="animate-fade-up" style={{ marginBottom: 'var(--space-8)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            <h1 style={{ fontSize: '2.5rem', color: 'var(--color-primary)', margin: 0 }}>SMS Carbon Scorer</h1>
            <p style={{ fontSize: '1.125rem', color: 'var(--color-text-secondary)', maxWidth: '600px', margin: 0 }}>
              Paste any Indian bank or UPI SMS. CarbonIQ identifies the merchant, estimates the carbon footprint, and suggests a swap — in under 2 seconds.
            </p>
          </div>
        </header>

        <div className="sms-layout">
          {/* Input column */}
          <section className="card card--glass animate-fade-up delay-100" style={{ borderRadius: '24px', padding: 'var(--space-6)' }} aria-labelledby="sms-input-heading">
            <h2 id="sms-input-heading" style={{ fontSize: '1.25rem', color: 'var(--color-primary)', marginBottom: 'var(--space-4)' }}>
              Paste your SMS
            </h2>
            <form onSubmit={handleSubmit} noValidate>
              <label className="input-label" htmlFor="sms-input">SMS message</label>
              <textarea
                id="sms-input"
                className="input"
                value={sms}
                onChange={(e) => { setSms(e.target.value); setResult(null); setError(''); }}
                placeholder="HDFC Bank: UPI txn of Rs.340 to SWIGGY..."
                rows={4}
                maxLength={500}
                aria-describedby="sms-char-count"
              />
              <div id="sms-char-count" style={{ fontSize: '0.75rem', color: 'var(--color-text-faint)', textAlign: 'right', marginTop: 4 }}>
                {sms.length}/500
              </div>

              {error && (
                <p role="alert" aria-live="polite" style={{ color: 'var(--color-red)', fontSize: '0.875rem', marginTop: 'var(--space-2)' }}>
                  ⚠️ {error}
                </p>
              )}

              <button
                id="btn-parse-sms"
                type="submit"
                className="btn btn--primary"
                disabled={loading || !sms.trim()}
                style={{ marginTop: 'var(--space-4)', width: '100%', borderRadius: '16px', padding: 'var(--space-4)' }}
                aria-busy={loading}
              >
                {loading
                  ? <><span className="spinner" aria-hidden="true" />Calculating…</>
                  : <><Zap size={20} aria-hidden="true" />Calculate Carbon Score</>
                }
              </button>
            </form>

            {/* Sample SMS chips */}
            <div style={{ marginTop: 'var(--space-5)' }}>
              <p className="section-heading" style={{ marginBottom: 'var(--space-3)' }}>Try a sample</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                {SAMPLES.map((s, i) => (
                  <button
                    key={i}
                    id={`sample-sms-${i}`}
                    className="sample-chip"
                    onClick={() => handlePaste(s)}
                    aria-label={`Use sample SMS ${i + 1}`}
                  >
                    <ChevronRight size={12} className="chip-icon" aria-hidden="true" />
                    <span className="chip-text">{s}</span>
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Result column */}
          <div>
            {!result && !loading && (
              <div className="result-placeholder">
                <Leaf size={48} style={{ color: 'var(--color-text-faint)', marginBottom: 16 }} aria-hidden="true" />
                <p style={{ color: 'var(--color-text-faint)' }}>Your carbon analysis will appear here</p>
              </div>
            )}
            {loading && (
              <div className="result-placeholder" aria-busy="true">
                <div className="skeleton" style={{ width: 80, height: 80, borderRadius: '50%', marginBottom: 16 }} />
                <div className="skeleton" style={{ width: 200, height: 20, borderRadius: 6 }} />
              </div>
            )}
            {result && <ResultCard result={result} />}
          </div>
        </div>
      </div>

      <style>{`
        .sms-layout {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: var(--space-6);
          align-items: start;
        }
        @media (max-width: 768px) { .sms-layout { grid-template-columns: 1fr; } }

        .sample-chip {
          display: flex;
          align-items: flex-start;
          gap: var(--space-2);
          padding: var(--space-2) var(--space-3);
          background: var(--color-surface-2);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-sm);
          cursor: pointer;
          text-align: left;
          transition: var(--transition-fast);
          width: 100%;
        }
        .sample-chip:hover {
          border-color: var(--color-accent);
          background: var(--color-accent-dim);
        }
        .chip-icon { color: var(--color-accent); flex-shrink: 0; margin-top: 2px; }
        .chip-text { font-size: 0.78rem; color: var(--color-text-muted); line-height: 1.4; }

        .result-placeholder {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: var(--space-12);
          border: 1px dashed var(--color-border);
          border-radius: var(--radius-lg);
          text-align: center;
          min-height: 300px;
        }

        .spinner {
          display: inline-block;
          width: 16px; height: 16px;
          border: 2px solid rgba(16, 185, 129, 0.2);
          border-top-color: var(--color-accent);
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }

        /* Result card */
        .result-card {
          animation: fadeUp 0.4s ease both;
        }
        .result-score {
          font-family: var(--font-display);
          font-size: 3.5rem;
          font-weight: 800;
          color: var(--color-amber);
          line-height: 1;
          margin-bottom: 4px;
        }
        .result-score-label { color: var(--color-text-muted); font-size: 0.9rem; }

        .breakdown-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: var(--space-2) 0;
          border-bottom: 1px solid var(--color-border);
          font-size: 0.9rem;
        }
        .breakdown-row:last-child { border-bottom: none; }
        .breakdown-key { color: var(--color-text-muted); }
        .breakdown-val { font-weight: 600; }

        .swap-suggestion {
          background: var(--color-accent-dim);
          border: 1px solid var(--color-border-hover);
          border-radius: var(--radius-md);
          padding: var(--space-4);
          margin-top: var(--space-4);
        }
        .swap-suggestion p { color: var(--color-text); font-size: 0.95rem; }
        .swap-savings {
          display: flex;
          gap: var(--space-4);
          margin-top: var(--space-3);
        }
        .swap-saving { font-size: 0.85rem; }
        .swap-saving strong { color: var(--color-accent); }
      `}</style>
    </div>
  );
}

function ResultCard({ result }: { result: SMSParseResult }) {
  const badgeClass = FLAG_BADGE[result.category] ?? 'badge--muted';
  const breakdownEntries = Object.entries(result.breakdown).filter(
    ([, v]) => typeof v === 'number' && v > 0
  );

  return (
    <article className="result-card stack stack-lg" aria-label="SMS carbon analysis result">
      <div className="card card--glass" style={{ borderRadius: '24px', padding: 'var(--space-6)', background: 'linear-gradient(135deg, rgba(255,255,255,0.8) 0%, rgba(16,185,129,0.05) 100%)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-4)' }}>
          <div>
            <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: 4 }}>Merchant</p>
            <p style={{ fontWeight: 600, fontSize: '1.05rem' }}>{result.merchant}</p>
          </div>
          <span className={`badge ${badgeClass}`}>{CATEGORY_LABELS[result.category] ?? result.category}</span>
        </div>

        <div style={{ display: 'flex', gap: 'var(--space-6)', marginBottom: 'var(--space-4)', alignItems: 'flex-end' }}>
          <div>
            <div className="result-score" aria-label={`${result.carbonScore} kilograms CO2`}>
              {result.carbonScore}
            </div>
            <div className="result-score-label">kg CO₂ this transaction</div>
          </div>
          <div style={{ paddingBottom: 4 }}>
            <div style={{ fontSize: '1.4rem', fontWeight: 700 }}>₹{result.amount.toLocaleString('en-IN')}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>amount</div>
          </div>
        </div>

        {breakdownEntries.length > 0 && (
          <div>
            <p className="section-heading" style={{ marginBottom: 'var(--space-2)' }}>Breakdown</p>
            {breakdownEntries.map(([key, val]) => (
              <div key={key} className="breakdown-row">
                <span className="breakdown-key">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                <span className="breakdown-val">{Number(val).toFixed(3)} kg CO₂</span>
              </div>
            ))}
          </div>
        )}

        <div className="swap-suggestion" aria-label="Recommended swap">
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
            <ArrowRight size={16} style={{ color: 'var(--color-accent)' }} aria-hidden="true" />
            <strong style={{ fontSize: '0.85rem', color: 'var(--color-accent)' }}>One Swap</strong>
          </div>
          <p>{result.swap.description}</p>
          <div className="swap-savings">
            {result.swap.moneySaved > 0 && (
              <div className="swap-saving">Save <strong>₹{result.swap.moneySaved}</strong> {result.swap.unit}</div>
            )}
            {result.swap.carbonSaved > 0 && (
              <div className="swap-saving">Avoid <strong>{result.swap.carbonSaved} kg CO₂</strong> {result.swap.unit}</div>
            )}
          </div>
        </div>

        <p style={{ fontSize: '0.75rem', color: 'var(--color-text-faint)', marginTop: 'var(--space-3)' }}>
          Parsed by: {result.parsedBy} · Confidence: {Math.round((result.confidence ?? 0) * 100)}%
        </p>
      </div>
    </article>
  );
}
