import React, { useState } from 'react';
import { Plane, Train, Bus, Map, Zap } from 'lucide-react';
import { analyzeTravel, type TravelAnalysis } from '../api/client';
import { motion } from 'framer-motion';

const SAMPLES = [
  'PNR: XYZ123. Flight AI-101. DEL (New Delhi) to BOM (Mumbai). Departure 18:30.',
  'Indian Railways SMS: PNR 2456789012, Train 12951 NDLS-BCT Rajdhani Exp. Class 2A.',
  'RedBus Ticket: Bangalore to Chennai, Volvo Multi-Axle, Dep: 22:00.',
];

const ICONS: Record<string, React.ReactNode> = {
  Flight: <Plane size={24} />,
  Train: <Train size={24} />,
  Bus: <Bus size={24} />,
  Unknown: <Map size={24} />,
};

export default function TravelScanner() {
  const [itinerary, setItinerary] = useState('');
  const [result, setResult]       = useState<TravelAnalysis | null>(null);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itinerary.trim()) return;
    setLoading(true);
    setResult(null);
    setError('');
    try {
      const data = await analyzeTravel(itinerary.trim());
      setResult(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to analyze travel');
    } finally {
      setLoading(false);
    }
  };

  const handlePaste = (text: string) => {
    setItinerary(text);
    setResult(null);
    setError('');
  };

  return (
    <motion.div 
      className="page"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
    >
      <div className="container">
        <header className="animate-fade-up" style={{ marginBottom: 'var(--space-8)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            <h1 style={{ fontSize: '2.5rem', color: 'var(--color-primary)', margin: 0 }}>Travel Scanner ✈️</h1>
            <p style={{ fontSize: '1.125rem', color: 'var(--color-text-secondary)', maxWidth: '600px', margin: 0 }}>
              Paste any flight PNR, train SMS, or bus ticket. CarbonIQ parses the route, calculates the exact footprint, and suggests local offsets.
            </p>
          </div>
        </header>

        <div className="grid-2">
          {/* Input column */}
          <section className="card card--glass animate-fade-up delay-100" style={{ borderRadius: '24px', padding: 'var(--space-6)' }} aria-labelledby="travel-input-heading">
            <h2 id="travel-input-heading" style={{ fontSize: '1.25rem', color: 'var(--color-primary)', marginBottom: 'var(--space-4)' }}>
              Enter your itinerary
            </h2>
            <form onSubmit={handleSubmit} noValidate>
              <label className="input-label" htmlFor="travel-input">Itinerary snippet or PNR</label>
              <textarea
                id="travel-input"
                className="input"
                value={itinerary}
                onChange={(e) => { setItinerary(e.target.value); setResult(null); setError(''); }}
                placeholder="e.g. Flight AI-101 DEL to BOM..."
                rows={5}
              />

              {error && (
                <p role="alert" style={{ color: 'var(--color-red)', fontSize: '0.875rem', marginTop: 'var(--space-2)' }}>
                  ⚠️ {error}
                </p>
              )}

              <button
                type="submit"
                className="btn btn--primary"
                disabled={loading || !itinerary.trim()}
                style={{ marginTop: 'var(--space-4)', width: '100%', borderRadius: '16px', padding: 'var(--space-4)' }}
                aria-busy={loading}
              >
                {loading
                  ? <><span className="spinner" aria-hidden="true" />Calculating Route…</>
                  : <><Map size={20} aria-hidden="true" />Calculate Carbon</>
                }
              </button>
            </form>

            <div style={{ marginTop: 'var(--space-5)' }}>
              <p className="section-heading" style={{ marginBottom: 'var(--space-3)' }}>Try a sample</p>
              <div className="stack stack-sm">
                {SAMPLES.map((s, i) => (
                  <button
                    key={i}
                    className="sample-chip"
                    onClick={() => handlePaste(s)}
                    style={{ textAlign: 'left', background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', padding: 'var(--space-2) var(--space-3)', borderRadius: 'var(--radius-sm)', cursor: 'pointer', transition: 'var(--transition-fast)', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Result column */}
          <div>
            {!result && !loading && (
              <div className="result-placeholder" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-12)', border: '1px dashed var(--color-border)', borderRadius: 'var(--radius-lg)', textAlign: 'center', minHeight: 300 }}>
                <Plane size={48} style={{ color: 'var(--color-text-faint)', marginBottom: 16 }} />
                <p style={{ color: 'var(--color-text-faint)' }}>Route details will appear here</p>
              </div>
            )}
            {loading && (
              <div className="skeleton" style={{ height: 300, borderRadius: 'var(--radius-lg)' }} />
            )}
            {result && (
              <motion.article 
                className="card card--glass animate-fade-up delay-200"
                style={{ borderRadius: '24px', padding: 'var(--space-6)', background: 'linear-gradient(135deg, rgba(255,255,255,0.8) 0%, rgba(16,185,129,0.05) 100%)' }}
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                  <div style={{ padding: 'var(--space-3)', background: 'var(--color-surface)', borderRadius: 'var(--radius-full)', color: 'var(--color-accent)' }}>
                    {ICONS[result.mode] || ICONS.Unknown}
                  </div>
                  <div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--color-accent-light)' }}>{result.mode}</div>
                    <div style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>{result.route}</div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)', marginTop: 'var(--space-6)', marginBottom: 'var(--space-6)' }}>
                  <div style={{ background: 'rgba(255,255,255,0.5)', padding: 'var(--space-4)', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.6)' }}>
                    <p style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-secondary)', margin: '0 0 var(--space-2) 0' }}>Distance</p>
                    <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--color-primary)' }}>{result.distanceKm} <span style={{fontSize: '1rem', fontWeight: 500}}>km</span></div>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.5)', padding: 'var(--space-4)', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.6)' }}>
                    <p style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-secondary)', margin: '0 0 var(--space-2) 0' }}>Carbon Footprint</p>
                    <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--color-red)' }}>{result.carbonKg} <span style={{fontSize: '1rem', fontWeight: 500}}>kg</span></div>
                  </div>
                </div>

                <div style={{ background: 'rgba(255,255,255,0.8)', border: '1px solid rgba(255,255,255,0.6)', borderRadius: '20px', padding: 'var(--space-5)', boxShadow: 'var(--shadow-sm)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-3)' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--color-accent-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-accent)' }}>
                      <Zap size={16} />
                    </div>
                    <strong style={{ fontSize: '1rem', color: 'var(--color-primary)' }}>Suggested Offset</strong>
                  </div>
                  <p style={{ fontSize: '1.05rem', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-4)', lineHeight: 1.5 }}>{result.swap.description}</p>
                  <div style={{ display: 'flex', gap: 'var(--space-4)', fontSize: '0.875rem' }}>
                    {result.swap.moneySavedINR > 0 && <span style={{ background: 'var(--color-accent-dim)', color: 'var(--color-accent-light)', padding: '4px 12px', borderRadius: '99px', fontWeight: 600 }}>Save ₹{result.swap.moneySavedINR}</span>}
                    {result.swap.carbonSavedKg > 0 && <span style={{ background: 'rgba(16,185,129,0.1)', color: 'var(--color-accent-light)', padding: '4px 12px', borderRadius: '99px', fontWeight: 600 }}>Avoid {result.swap.carbonSavedKg} kg CO₂</span>}
                  </div>
                </div>
              </motion.article>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
