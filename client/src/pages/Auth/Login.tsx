import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Leaf, LogIn } from 'lucide-react';
import api from '../../api/client';
import { useAuth } from '../../contexts/AuthContext';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const { data } = await api.post('/auth/login', { email, password });
      if (data.success) {
        setUser(data.user);
        toast.success('Welcome back!');
        navigate('/dashboard');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to login');
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
              <Leaf size={16} /> Welcome Back
            </div>
            <h2>Log in to CarbonIQ</h2>
            <p className="sidebar__nav-title" style={{ padding: 0 }}>Continue your zero-input journey.</p>
          </div>

          <form onSubmit={handleLogin} className="stack stack-md">
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
                aria-required="true"
              />
            </div>
            <div>
              <label className="input-label">Password</label>
              <input
                type="password"
                required
                className="input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                aria-required="true"
              />
            </div>
            <button type="submit" className="btn btn--primary" style={{ width: '100%', marginTop: 'var(--space-2)' }} disabled={isLoading}>
              {isLoading ? 'Logging in...' : <><LogIn size={18} /> Log In</>}
            </button>
          </form>

          <p style={{ textAlign: 'center', fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
            Don't have an account? <Link to="/register" style={{ fontWeight: 600 }}>Sign up</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
