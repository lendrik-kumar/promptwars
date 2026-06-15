import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Leaf, UserPlus } from 'lucide-react';
import api from '../../api/client';
import { useAuth } from '../../contexts/AuthContext';

const Register: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const { data } = await api.post('/auth/register', { name, email, password });
      if (data.success) {
        setUser(data.user);
        toast.success('Account created! Your anonymous progress has been saved.');
        navigate('/dashboard');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to register');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="page container">
      <motion.div
        className="card"
        style={{ maxWidth: '400px', margin: '0 auto', marginTop: '10vh' }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="stack stack-xl">
          <div className="row-center stack-sm" style={{ flexDirection: 'column' }}>
            <div className="badge badge--green">
              <Leaf size={16} /> Get Started
            </div>
            <h2>Join CarbonIQ</h2>
            <p className="sidebar__nav-title" style={{ padding: 0 }}>Save your progress permanently.</p>
          </div>

          <form onSubmit={handleRegister} className="stack stack-md">
            <div>
              <label className="input-label">Name</label>
              <input
                type="text"
                required
                className="input"
                placeholder="Jane Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
              />
            </div>
            <div>
              <label className="input-label">Email</label>
              <input
                type="email"
                required
                className="input"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="username"
              />
            </div>
            <div>
              <label className="input-label">Password</label>
              <input
                type="password"
                required
                className="input"
                placeholder="••••••••"
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
              />
            </div>
            <button type="submit" className="btn btn--primary" style={{ width: '100%', marginTop: 'var(--space-2)' }} disabled={isLoading}>
              {isLoading ? 'Signing up...' : <><UserPlus size={18} /> Sign Up</>}
            </button>
          </form>

          <p style={{ textAlign: 'center', fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
            Already have an account? <Link to="/login" style={{ fontWeight: 600 }}>Log in</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
