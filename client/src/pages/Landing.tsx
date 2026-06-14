import { useNavigate } from 'react-router-dom';
import { Leaf, Zap, Receipt, Map, Wallet, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="page" style={{ padding: 60 }}>
      {/* Hero Section */}
      <section className="container" style={{ padding: 'var(--space-8) var(--space-4)', position: 'relative', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', top: '-10%', right: '-10%', width: '400px', height: '400px',
          background: 'var(--color-accent)', filter: 'blur(100px)', opacity: 0.1, zIndex: -1, borderRadius: '50%'
        }}></div>
        <div style={{
          position: 'absolute', bottom: '10%', left: '-10%', width: '300px', height: '300px',
          background: 'var(--color-accent-light)', filter: 'blur(100px)', opacity: 0.1, zIndex: -1, borderRadius: '50%'
        }}></div>

        <div className="grid-2" style={{ alignItems: 'center', gap: 'var(--space-6)' }}>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}
          >
            <div style={{ 
              display: 'flex', alignItems: 'center', gap: 'var(--space-2)', 
              background: 'var(--color-accent-dim)', color: 'var(--color-accent-light)',
              padding: 'var(--space-2) var(--space-3)', borderRadius: '20px', width: 'fit-content',
              fontSize: '0.875rem', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase'
            }}>
              <Leaf size={16} /> India's First Eco-Fintech
            </div>
            
            <h1 style={{ fontSize: '3.5rem', lineHeight: 1.1, fontWeight: 700, margin: 0, color: 'var(--color-text)' }}>
              Track Your Carbon,<br/>
              <span style={{ color: 'var(--color-accent-light)' }}>Shape India's Green Future.</span>
            </h1>
            
            <p style={{ fontSize: '1.25rem', color: 'var(--color-text-muted)', maxWidth: '500px', lineHeight: 1.6 }}>
              CarbonIQ automatically analyzes your spending, travel, and utility patterns to provide a real-time ESG score. 
              Empowering individuals to lead the transition to a Net Zero India.
            </p>
            
            <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-2)' }}>
              <button className="btn btn--primary" style={{ padding: 'var(--space-3) var(--space-5)', fontSize: '1.125rem' }} onClick={() => navigate('/dashboard')}>
                Go to Dashboard <ArrowRight size={20} style={{ marginLeft: 'var(--space-2)' }}/>
              </button>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            style={{ position: 'relative' }}
          >
            <div className="card card--glass" style={{ padding: 'var(--space-2)', borderRadius: '32px' }}>
              <img 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuD0eG2qKokDC0Kqtvjt79UI145rSP-sDHM9mN6EET0s_q7JcZHWI0PCNfrs0BNGZLSUN-pRCaRtjiVSWt_Cy7owUK6YuQHHWB_RAWb1CXJsSfBk5CltqKNnaGa4il6cD_hnkFkqptsyhoFfvZLh516R6-QKeeyGfYaqoq-KX8rtZKEPkA_SRhF9t-X5Jia17MplPEWzyuK2OHG0SeEfY_BDn7z9H8XA28FFigvH0ihpbukS0jHULlC05tNfG26ww5c3Yr7-caYg4m0O" 
                alt="Dashboard Mockup" 
                style={{ width: '100%', borderRadius: '24px', display: 'block' }}
              />
            </div>
            {/* Floating indicator */}
            <div className="card card--glass animate-fade-up delay-300" style={{
              position: 'absolute', bottom: '-20px', left: '-20px',
              display: 'flex', alignItems: 'center', gap: 'var(--space-3)', padding: 'var(--space-3)',
              boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
            }}>
              <div style={{ background: 'var(--color-accent)', padding: 'var(--space-2)', borderRadius: '50%', color: 'white' }}>
                <Leaf size={24} />
              </div>
              <div>
                <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>Trees Offset</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-accent-light)' }}>124 Plants</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Social Proof */}
      <section style={{ background: 'var(--color-surface)', padding: 'var(--space-6) 0', borderTop: '1px solid var(--color-border)', borderBottom: '1px solid var(--color-border)' }}>
        <div className="container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 'var(--space-2)' }}>
          <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>Our Mission</div>
          <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 600 }}>Leading India toward a Net Zero future.</h2>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container" style={{ padding: 'var(--space-8) var(--space-4)' }}>
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-6)' }}>
          <h2 style={{ fontSize: '2.5rem', color: 'var(--color-accent-light)', margin: '0 0 var(--space-3) 0' }}>Smarter Tracking, Zero Effort</h2>
          <p style={{ fontSize: '1.125rem', color: 'var(--color-text-muted)', maxWidth: '600px', margin: '0 auto' }}>
            We use advanced AI to automate your sustainability journey, so you can focus on making an impact.
          </p>
        </div>

        <div className="grid-2" style={{ gap: 'var(--space-4)' }}>
          <div className="card card--glass hover-lift" style={{ display: 'flex', flexDirection: 'column', padding: 'var(--space-4)' }}>
            <div style={{ background: 'var(--color-accent-dim)', padding: 'var(--space-3)', borderRadius: '16px', width: 'fit-content', marginBottom: 'var(--space-3)', color: 'var(--color-accent)' }}>
              <Zap size={32} />
            </div>
            <h3 style={{ fontSize: '1.5rem', margin: '0 0 var(--space-2) 0' }}>SMS Scanner</h3>
            <p style={{ color: 'var(--color-text-muted)', lineHeight: 1.5 }}>Auto-scan electricity bills and travel itineraries directly from your messages. No manual data entry required.</p>
          </div>

          <div className="card card--glass hover-lift" style={{ display: 'flex', flexDirection: 'column', padding: 'var(--space-4)' }}>
            <div style={{ background: 'var(--color-accent-dim)', padding: 'var(--space-3)', borderRadius: '16px', width: 'fit-content', marginBottom: 'var(--space-3)', color: 'var(--color-accent)' }}>
              <Receipt size={32} />
            </div>
            <h3 style={{ fontSize: '1.5rem', margin: '0 0 var(--space-2) 0' }}>Receipt Scanner</h3>
            <p style={{ color: 'var(--color-text-muted)', lineHeight: 1.5 }}>Snap grocery receipts to discover sustainable swaps and local eco-friendly products.</p>
          </div>

          <div className="card card--glass hover-lift" style={{ display: 'flex', flexDirection: 'column', padding: 'var(--space-4)' }}>
            <div style={{ background: 'var(--color-accent-dim)', padding: 'var(--space-3)', borderRadius: '16px', width: 'fit-content', marginBottom: 'var(--space-3)', color: 'var(--color-accent)' }}>
              <Map size={32} />
            </div>
            <h3 style={{ fontSize: '1.5rem', margin: '0 0 var(--space-2) 0' }}>Travel Scanner</h3>
            <p style={{ color: 'var(--color-text-muted)', lineHeight: 1.5 }}>Automated carbon calculation for flights, trains, and even your daily local rickshaw commutes.</p>
          </div>

          <div className="card card--glass hover-lift card--accent" style={{ display: 'flex', flexDirection: 'column', padding: 'var(--space-4)' }}>
            <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', padding: 'var(--space-3)', borderRadius: '16px', width: 'fit-content', marginBottom: 'var(--space-3)', color: 'var(--color-accent)' }}>
              <Wallet size={32} />
            </div>
            <h3 style={{ fontSize: '1.5rem', margin: '0 0 var(--space-2) 0', color: 'var(--color-accent-light)' }}>Green Wallet</h3>
            <p style={{ color: 'var(--color-text-muted)', opacity: 0.9, lineHeight: 1.5 }}>A dedicated wallet tracking money and carbon saved. Earn real-world rewards for green milestones.</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container" style={{ padding: '0 var(--space-4) var(--space-8) var(--space-4)', textAlign: 'center' }}>
        <div style={{ background: 'var(--color-accent-light)', borderRadius: '32px', padding: 'var(--space-8) var(--space-4)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'relative', zIndex: 1 }}>
            <h2 style={{ color: 'white', fontSize: '2.5rem', margin: '0 0 var(--space-3) 0' }}>Ready to start your Green Journey?</h2>
            <p style={{ color: 'white', opacity: 0.9, fontSize: '1.125rem', maxWidth: '600px', margin: '0 auto var(--space-5) auto' }}>
              Join over 50,000 Indians making conscious choices for a sustainable future.
            </p>
            <button className="btn" style={{ background: 'white', color: 'var(--color-accent-light)', padding: 'var(--space-3) var(--space-6)', fontSize: '1.125rem' }} onClick={() => navigate('/dashboard')}>
              Go to Dashboard
            </button>
          </div>
        </div>
      </section>

    </div>
  );
}
