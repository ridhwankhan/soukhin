import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Shield } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { BRAND_CONFIG } from '../../config';

const DEMO_ACCOUNTS = [
  { email: 'owner@soukhin.com', password: 'owner123', role: 'Owner' },
  { email: 'admin@soukhin.com', password: 'admin123', role: 'Admin' },
  { email: 'mod@soukhin.com', password: 'mod123', role: 'Moderator' },
];

export default function AdminLoginPage() {
  const { loginAdmin, admin } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (admin) navigate('/admin', { replace: true });
  }, [admin, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await loginAdmin(form.email, form.password);
    setLoading(false);
    if (!result.success) setError(result.error ?? 'Login failed');
    else navigate('/admin');
  };

  const fillDemo = (email: string, password: string) => {
    setForm({ email, password });
    setError('');
  };

  return (
    <div className="min-h-screen bg-[#0F2419] flex flex-col items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-[#9A7535] flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-serif text-xl font-bold leading-none">শ</span>
          </div>
          <h1 className="font-serif text-xl font-medium text-white mb-1">{BRAND_CONFIG.name} Admin</h1>
          <p className="text-sm text-white/50">Restricted access — authorised staff only</p>
        </div>

        <div className="bg-elevated p-8">
          <div className="flex items-center gap-2 mb-6">
            <Shield className="w-4 h-4 text-accent" />
            <h2 className="text-sm font-semibold text-ink uppercase tracking-wide">Admin Sign In</h2>
          </div>

          {error && (
            <div className="mb-5 px-4 py-3 bg-red-50 border border-red-200 text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-ink-secondary mb-2">
                Email address
              </label>
              <input
                type="email"
                required
                autoComplete="email"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                className="w-full px-4 py-3 border border-line text-sm text-ink focus:outline-none focus:border-accent transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-ink-secondary mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  className="w-full px-4 py-3 pr-11 border border-line text-sm text-ink focus:outline-none focus:border-accent transition-colors"
                />
                <button type="button" onClick={() => setShowPw(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-ink-muted hover:text-ink-secondary">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-accent text-white text-sm font-semibold tracking-wide hover:bg-accent-hover disabled:opacity-60 transition-colors"
            >
              {loading ? 'Signing in…' : 'Sign In to Admin'}
            </button>
          </form>

          {/* Demo credentials */}
          <div className="mt-6 pt-5 border-t border-[#F0EBE3]">
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted mb-3">Demo accounts</p>
            <div className="space-y-1.5">
              {DEMO_ACCOUNTS.map(acc => (
                <button
                  key={acc.email}
                  type="button"
                  onClick={() => fillDemo(acc.email, acc.password)}
                  className="w-full text-left px-3 py-2.5 bg-canvas hover:bg-[#F0EBE3] transition-colors text-xs"
                >
                  <span className="font-semibold text-accent">{acc.role}</span>
                  <span className="text-ink-muted ml-2">{acc.email}</span>
                  <span className="text-[#C0B8B0] ml-1">/ {acc.password}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-white/30 mt-5">
          <Link to="/" className="hover:text-white/60 transition-colors">← Back to store</Link>
          {' · '}
          <Link to="/login" className="hover:text-white/60 transition-colors">Customer login</Link>
        </p>
      </motion.div>
    </div>
  );
}
