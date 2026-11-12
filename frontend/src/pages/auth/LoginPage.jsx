import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth, DEMO_CREDENTIALS } from '../../context/AuthContext';
import { Pill, Shield, Lock, Mail, ArrowRight, UserCheck } from 'lucide-react';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, quickLogin } = useAuth();
  const navigate = useNavigate();

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await login(email, password);
      redirectByRole(data.user.role);
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (roleKey) => {
    setError('');
    setLoading(true);
    try {
      const data = await quickLogin(roleKey);
      redirectByRole(data.user.role);
    } catch (err) {
      setError(err.response?.data?.message || 'Quick login failed');
    } finally {
      setLoading(false);
    }
  };

  const redirectByRole = (role) => {
    if (role === 'admin') navigate('/admin/dashboard');
    else if (role === 'pharmacist') navigate('/pharmacist/dashboard');
    else if (role === 'delivery') navigate('/delivery/dashboard');
    else navigate('/customer/dashboard');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #f0fdf4 0%, #f0f9ff 100%)', padding: '2rem' }}>
      <div style={{ maxWidth: '960px', width: '100%', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', background: '#fff', borderRadius: '24px', boxShadow: '0 20px 40px -15px rgba(2, 132, 199, 0.15)', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        
        {/* Left Information Panel */}
        <div style={{ padding: '3rem 2.5rem', background: 'linear-gradient(160deg, #0284c7 0%, #0d9488 100%)', color: '#fff', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.6rem', padding: '0.5rem 1rem', background: 'rgba(255,255,255,0.15)', borderRadius: '9999px', backdropFilter: 'blur(10px)', marginBottom: '2rem' }}>
              <Pill size={20} />
              <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>MediPharm Enterprise</span>
            </div>
            <h1 style={{ fontSize: '2.2rem', fontWeight: 800, lineHeight: 1.2, marginBottom: '1rem', letterSpacing: '-0.02em' }}>
              Smart Medicine Ordering & Pharmacy System
            </h1>
            <p style={{ opacity: 0.9, fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '2rem' }}>
              Next-generation clinical pharmacy operations with role-based governance, doctor prescription verification, FEFO batch tracking, and real-time delivery logistics.
            </p>
          </div>

          {/* Quick Demo Switcher Panel */}
          <div>
            <div style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700, opacity: 0.8, marginBottom: '0.75rem' }}>
              1-Click Academic Evaluation Credentials
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
              <button
                type="button"
                onClick={() => handleQuickLogin('admin')}
                style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', color: '#fff', padding: '0.6rem', borderRadius: '10px', fontSize: '0.75rem', cursor: 'pointer', textAlign: 'left', fontWeight: 600 }}
              >
                🛡️ Admin <br /><span style={{ opacity: 0.8, fontSize: '0.65rem' }}>Executive Control</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('pharmacist')}
                style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', color: '#fff', padding: '0.6rem', borderRadius: '10px', fontSize: '0.75rem', cursor: 'pointer', textAlign: 'left', fontWeight: 600 }}
              >
                💊 Pharmacist <br /><span style={{ opacity: 0.8, fontSize: '0.65rem' }}>Rx & Inventory</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('customer')}
                style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', color: '#fff', padding: '0.6rem', borderRadius: '10px', fontSize: '0.75rem', cursor: 'pointer', textAlign: 'left', fontWeight: 600 }}
              >
                🧑‍⚕️ Customer <br /><span style={{ opacity: 0.8, fontSize: '0.65rem' }}>Cart & Tracking</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('delivery')}
                style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', color: '#fff', padding: '0.6rem', borderRadius: '10px', fontSize: '0.75rem', cursor: 'pointer', textAlign: 'left', fontWeight: 600 }}
              >
                🚚 Delivery <br /><span style={{ opacity: 0.8, fontSize: '0.65rem' }}>Live Routing</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Form Panel */}
        <div style={{ padding: '3.5rem 3rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.4rem' }}>Welcome Back</h2>
            <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Sign in with your registered pharmacy credentials</p>
          </div>

          {error && (
            <div style={{ padding: '0.75rem 1rem', background: '#fee2e2', border: '1px solid #fca5a5', color: '#991b1b', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '1.5rem', fontWeight: 500 }}>
              {error}
            </div>
          )}

          <form onSubmit={handleLoginSubmit}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input
                  type="email"
                  className="form-control"
                  style={{ paddingLeft: '2.5rem' }}
                  placeholder="name@medipharm.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Account Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input
                  type="password"
                  className="form-control"
                  style={{ paddingLeft: '2.5rem' }}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg"
              style={{ width: '100%', marginTop: '0.75rem' }}
              disabled={loading}
            >
              {loading ? 'Authenticating...' : 'Sign In to Portal'}
              <ArrowRight size={18} />
            </button>
          </form>

          <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.875rem', color: '#64748b' }}>
            New patient or customer?{' '}
            <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 700 }}>
              Create an account
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};

export default LoginPage;

