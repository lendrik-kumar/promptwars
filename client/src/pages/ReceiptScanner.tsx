import React, { useState, useRef } from 'react';
import { Upload, Image as ImageIcon, ArrowRight, AlertTriangle, CheckCircle } from 'lucide-react';
import { analyzeReceipt, type ReceiptResult, type ReceiptItem } from '../api/client';

const FLAG_CONFIG = {
  low:      { color: '#4ade80', bg: 'rgba(34,197,94,0.15)',  icon: <CheckCircle size={14} />,    label: 'Low impact'     },
  moderate: { color: '#fbbf24', bg: 'rgba(245,158,11,0.15)', icon: <AlertTriangle size={14} />,  label: 'Moderate'       },
  high:     { color: '#f87171', bg: 'rgba(239,68,68,0.15)',  icon: <AlertTriangle size={14} />,  label: 'High impact'    },
  unknown:  { color: '#9ca3af', bg: 'rgba(75,85,99,0.2)',    icon: null,                          label: 'Unknown'        },
};

export default function ReceiptScanner() {
  const [file,     setFile]     = useState<File | null>(null);
  const [preview,  setPreview]  = useState<string | null>(null);
  const [result,   setResult]   = useState<ReceiptResult | null>(null);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (f: File) => {
    setFile(f);
    setResult(null);
    setError('');
    const url = URL.createObjectURL(f);
    setPreview(url);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f && f.type.startsWith('image/')) handleFile(f);
    else setError('Please drop an image file (JPEG, PNG, or WebP)');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) handleFile(f);
  };

  const handleAnalyze = async () => {
    if (!file) return;
    setLoading(true);
    setResult(null);
    setError('');
    try {
      const data = await analyzeReceipt(file);
      setResult(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to analyze receipt');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="container">
        <header className="animate-fade-up" style={{ marginBottom: 'var(--space-8)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            <h1 style={{ fontSize: '2.5rem', color: 'var(--color-primary)', margin: 0 }}>Receipt Scanner 🧾</h1>
            <p style={{ fontSize: '1.125rem', color: 'var(--color-text-secondary)', maxWidth: '600px', margin: 0 }}>
              Upload a grocery or restaurant receipt. CarbonIQ scores each line item using Indian supply chain data and flags high-impact choices.
            </p>
          </div>
        </header>

        <div className="receipt-layout">
          {/* Upload */}
          <section className="card card--glass stack stack-md animate-fade-up delay-100" style={{ borderRadius: '24px', padding: 'var(--space-6)' }} aria-labelledby="upload-heading">
            <h2 id="upload-heading" style={{ fontSize: '1.25rem', color: 'var(--color-primary)' }}>Upload your receipt</h2>

            <div
              className={`drop-zone${dragOver ? ' drop-zone--active' : ''}`}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => inputRef.current?.click()}
              role="button"
              tabIndex={0}
              aria-label="Drop receipt image here or click to browse"
              onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
            >
              {preview ? (
                <img src={preview} alt="Receipt preview" className="preview-img" />
              ) : (
                <>
                  <Upload size={32} className={`upload-icon${dragOver ? ' upload-icon--active' : ''}`} aria-hidden="true" />
                  <p style={{ color: dragOver ? 'var(--color-accent)' : 'var(--color-text-muted)', fontSize: '0.9rem', textAlign: 'center', transition: 'var(--transition-fast)' }}>
                    {dragOver ? 'Drop it like it\'s hot!' : 'Drop receipt image here'}<br />
                    <span style={{ color: 'var(--color-text-faint)', fontSize: '0.8rem' }}>JPEG, PNG, WebP — max 10 MB</span>
                  </p>
                </>
              )}
            </div>

            <input
              ref={inputRef}
              id="receipt-file-input"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleInputChange}
              style={{ display: 'none' }}
              aria-label="Select receipt image"
            />

            {file && (
              <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                <ImageIcon size={12} style={{ verticalAlign: 'middle', marginRight: 4 }} aria-hidden="true" />
                {file.name} · {(file.size / 1024).toFixed(0)} KB
              </p>
            )}

            {error && (
              <p role="alert" aria-live="polite" style={{ color: 'var(--color-red)', fontSize: '0.875rem' }}>
                ⚠️ {error}
              </p>
            )}

            <button
              id="btn-analyze-receipt"
              className="btn btn--primary"
              onClick={handleAnalyze}
              disabled={!file || loading}
              style={{ width: '100%', borderRadius: '16px', padding: 'var(--space-4)' }}
              aria-busy={loading}
            >
              {loading
                ? <><span className="spinner" aria-hidden="true" />Analysing receipt…</>
                : <><ImageIcon size={20} aria-hidden="true" />Analyse Receipt</>
              }
            </button>

            {preview && !loading && (
              <button className="btn btn--ghost btn--sm" onClick={() => { setFile(null); setPreview(null); setResult(null); }}>
                Clear
              </button>
            )}
          </section>

          {/* Results */}
          <div>
            {!result && !loading && (
              <div className="result-placeholder">
                <ImageIcon size={48} style={{ color: 'var(--color-text-faint)', marginBottom: 16 }} aria-hidden="true" />
                <p style={{ color: 'var(--color-text-faint)' }}>Line-item carbon scores will appear here</p>
              </div>
            )}
            {loading && <ReceiptSkeletons />}
            {result && <ReceiptResultView result={result} />}
          </div>
        </div>
      </div>

      <style>{`
        .receipt-layout {
          display: grid;
          grid-template-columns: 340px 1fr;
          gap: var(--space-6);
          align-items: start;
        }
        @media (max-width: 768px) { .receipt-layout { grid-template-columns: 1fr; } }

        .drop-zone {
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          gap: var(--space-3);
          padding: var(--space-8);
          border: 2px dashed var(--color-border);
          border-radius: var(--radius-lg);
          cursor: pointer;
          transition: var(--transition-fast);
          min-height: 180px;
          background: var(--color-surface-2);
        }
        .drop-zone:hover, .drop-zone--active {
          border-color: var(--color-accent);
          background: var(--color-accent-dim);
          transform: scale(1.02);
        }
        .upload-icon { color: var(--color-text-faint); transition: var(--transition-fast); }
        .upload-icon--active { color: var(--color-accent); transform: translateY(-4px) scale(1.1); }
        .preview-img { max-height: 240px; max-width: 100%; border-radius: var(--radius-md); object-fit: contain; }

        .result-placeholder {
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          padding: var(--space-12);
          border: 1px dashed var(--color-border); border-radius: var(--radius-lg);
          text-align: center; min-height: 300px;
        }
        .spinner {
          display: inline-block; width: 16px; height: 16px;
          border: 2px solid rgba(16, 185, 129, 0.2); border-top-color: var(--color-accent);
          border-radius: 50%; animation: spin 0.7s linear infinite; margin-right: 8px;
        }

        .item-row {
          display: flex; align-items: center; gap: var(--space-3);
          padding: var(--space-3) 0;
          border-bottom: 1px solid var(--color-border);
          animation: slideIn 0.3s ease both;
        }
        .item-row:last-of-type { border-bottom: none; }
        .item-flag-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
        .item-name { flex: 1; font-size: 0.9rem; }
        .item-price { font-size: 0.8rem; color: var(--color-text-faint); }
        .item-co2   { font-weight: 600; font-size: 0.9rem; }
        .item-note  { font-size: 0.75rem; color: var(--color-text-faint); margin-top: 2px; }

        .swap-box {
          background: var(--color-accent-dim);
          border: 1px solid var(--color-border-hover);
          border-radius: var(--radius-md);
          padding: var(--space-4);
          margin-top: var(--space-4);
        }
      `}</style>
    </div>
  );
}

function ReceiptResultView({ result }: { result: ReceiptResult }) {
  const sortedItems = [...result.items].sort((a, b) => b.carbonKg - a.carbonKg);

  return (
    <div className="stack stack-lg animate-fade-up">
      {/* Summary */}
      <div className="card card--glass animate-fade-up delay-200" style={{ borderRadius: '24px', padding: 'var(--space-6)', background: 'linear-gradient(135deg, rgba(255,255,255,0.8) 0%, rgba(16,185,129,0.05) 100%)' }}>
        <div className="row-between" style={{ flexWrap: 'wrap', gap: 'var(--space-4)' }}>
          <div>
            <p className="section-heading" style={{ color: 'var(--color-primary)' }}>{result.storeName}</p>
            <div className="stat-value" style={{ fontSize: '2.5rem', color: 'var(--color-primary)' }}>{result.totalCarbon.toFixed(2)} <span style={{ fontSize: '1.25rem', fontWeight: 500 }}>kg CO₂</span></div>
            <p className="stat-label">total for this receipt</p>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.6)', padding: 'var(--space-4)', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.8)' }}>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-1)' }}>Highest impact</p>
            <p style={{ fontWeight: 700, color: 'var(--color-red)', fontSize: '1.125rem' }}>⚠️ {result.highestImpactItem}</p>
          </div>
        </div>
      </div>

      {/* Line items */}
      <div className="card card--glass animate-fade-up delay-300" style={{ borderRadius: '24px', padding: 'var(--space-6)' }}>
        <h3 style={{ fontSize: '1.25rem', color: 'var(--color-primary)', marginBottom: 'var(--space-4)' }}>Item-level carbon scores</h3>
        <div role="list" aria-label="Receipt items with carbon scores">
          {sortedItems.map((item, i) => (
            <ItemRow key={i} item={item} index={i} />
          ))}
        </div>

        {result.swap && (
          <div className="swap-box" aria-label="Recommended swap">
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
              <ArrowRight size={16} style={{ color: 'var(--color-accent)' }} aria-hidden="true" />
              <strong style={{ fontSize: '0.85rem', color: 'var(--color-accent)' }}>One Swap</strong>
            </div>
            <p style={{ fontSize: '0.95rem' }}>
              Swap <strong>{result.swap.fromItem}</strong> → <strong style={{ color: 'var(--color-accent-light)' }}>{result.swap.toItem}</strong>
            </p>
            <div style={{ display: 'flex', gap: 'var(--space-6)', marginTop: 'var(--space-3)', flexWrap: 'wrap' }}>
              {result.swap.moneySavedINR > 0 && (
                <div style={{ fontSize: '0.85rem' }}>Save <strong style={{ color: 'var(--color-accent)' }}>₹{result.swap.moneySavedINR}</strong>/week</div>
              )}
              {result.swap.carbonSavedKg > 0 && (
                <div style={{ fontSize: '0.85rem' }}>Avoid <strong style={{ color: 'var(--color-accent)' }}>{result.swap.carbonSavedKg} kg CO₂</strong>/week</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ItemRow({ item, index }: { item: ReceiptItem; index: number }) {
  const cfg = FLAG_CONFIG[item.flag] ?? FLAG_CONFIG.unknown;
  return (
    <div className="item-row" role="listitem" style={{ animationDelay: `${index * 0.05}s` }}>
      <div className="item-flag-dot" style={{ background: cfg.color, boxShadow: `0 0 6px ${cfg.color}` }} aria-hidden="true" />
      <div style={{ flex: 1 }}>
        <div className="item-name">{item.name}</div>
        {item.note && <div className="item-note">{item.note}</div>}
      </div>
      <div style={{ textAlign: 'right' }}>
        <div className="item-co2" style={{ color: cfg.color }}>{item.carbonKg.toFixed(3)} kg</div>
        {item.priceINR > 0 && <div className="item-price">₹{item.priceINR}</div>}
      </div>
      <span className="badge" style={{ background: cfg.bg, color: cfg.color, fontSize: '0.7rem' }}>
        {cfg.label}
      </span>
    </div>
  );
}

function ReceiptSkeletons() {
  return (
    <div className="stack stack-md">
      <div className="skeleton" style={{ height: 120, borderRadius: 16 }} />
      <div className="card">
        {Array.from({ length: 5 }, (_, i) => (
          <div key={i} style={{ display: 'flex', gap: 12, padding: '12px 0', borderBottom: '1px solid var(--color-border)' }}>
            <div className="skeleton" style={{ width: 10, height: 10, borderRadius: '50%', flexShrink: 0, marginTop: 4 }} />
            <div className="skeleton" style={{ flex: 1, height: 16, borderRadius: 4 }} />
            <div className="skeleton" style={{ width: 60, height: 16, borderRadius: 4 }} />
          </div>
        ))}
      </div>
    </div>
  );
}
