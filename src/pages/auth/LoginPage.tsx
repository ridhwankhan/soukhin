import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { BRAND_CONFIG } from '../../config';

export default function LoginPage() {
  const { loginCustomer, customer } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string })?.from ?? '/profile';

  const [form, setForm] = useState({ email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (customer) navigate(from, { replace: true });
  }, [customer, navigate, from]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await loginCustomer(form.email, form.password);
    setLoading(false);
    if (!result.success) setError(result.error ?? 'Login failed');
  };

  return (
    <div className="min-h-screen bg-[#F9F7F4] flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-[#E2D9CF] bg-white">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-[#1B4332] flex items-center justify-center">
            <span className="text-white font-serif font-bold leading-none">শ</span>
          </div>
          <span className="font-serif text-base font-semibold text-[#1A1A1A]">{BRAND_CONFIG.name}</span>
        </Link>
        <Link to="/" className="flex items-center gap-1.5 text-sm text-[#7A7A7A] hover:text-[#1A1A1A] transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to store
        </Link>
      </div>

      {/* Form */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="w-full max-w-md"
        >
          <div className="bg-white border border-[#E2D9CF] p-8 md:p-10">
            <div className="mb-8">
              <h1 className="font-serif text-2xl font-medium text-[#1A1A1A] mb-1.5">Sign in</h1>
              <p className="text-sm text-[#7A7A7A]">Welcome back to Soukhin</p>
            </div>

            {error && (
              <div className="mb-5 px-4 py-3 bg-red-50 border border-red-200 text-sm text-red-700">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-[#4A4A4A] mb-2">
                  Email address
                </label>
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  className="w-full px-4 py-3 border border-[#E2D9CF] text-sm text-[#1A1A1A] bg-white focus:outline-none focus:border-[#1B4332] transition-colors"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-semibold uppercase tracking-wide text-[#4A4A4A]">
                    Password
                  </label>
                  <button
                    type="button"
                    className="text-xs text-[#9A7535] hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPw ? 'text' : 'password'}
                    required
                    autoComplete="current-password"
                    value={form.password}
                    onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                    className="w-full px-4 py-3 pr-11 border border-[#E2D9CF] text-sm text-[#1A1A1A] bg-white focus:outline-none focus:border-[#1B4332] transition-colors"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#9A9A9A] hover:text-[#4A4A4A] transition-colors"
                  >
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-[#1B4332] text-white text-sm font-semibold tracking-wide hover:bg-[#163828] disabled:opacity-60 transition-colors"
              >
                {loading ? 'Signing in…' : 'Sign In'}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-[#F0EBE3] text-center">
              <p className="text-sm text-[#7A7A7A]">
                New to {BRAND_CONFIG.name}?{' '}
                <Link to="/signup" className="text-[#1B4332] font-semibold hover:underline">
                  Create an account
                </Link>
              </p>
            </div>
          </div>

          <p className="text-center text-xs text-[#9A9A9A] mt-5">
            Are you an admin?{' '}
            <Link to="/admin/login" className="text-[#9A7535] hover:underline">
              Admin sign in
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
