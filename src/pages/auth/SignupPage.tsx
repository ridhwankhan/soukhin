import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, ArrowLeft, Check } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { BRAND_CONFIG } from '../../config';

export default function SignupPage() {
  const { signupCustomer, customer } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirm: '' });
  const [showPw, setShowPw] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (customer) navigate('/profile', { replace: true });
  }, [customer, navigate]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.email.trim()) e.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter a valid email';
    if (form.phone && !/^01[3-9]\d{8}$/.test(form.phone)) e.phone = 'Enter a valid BD phone number';
    if (form.password.length < 6) e.password = 'Password must be at least 6 characters';
    if (form.password !== form.confirm) e.confirm = 'Passwords do not match';
    if (!agreed) e.agree = 'You must agree to the terms';
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);
    const result = await signupCustomer(form.name, form.email, form.password, form.phone || undefined);
    setLoading(false);
    if (!result.success) setErrors({ global: result.error ?? 'Signup failed' });
    else navigate('/profile');
  };

  const Field = ({ id, label, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { id: keyof typeof form; label: string }) => (
    <div>
      <label className="block text-xs font-semibold uppercase tracking-wide text-ink-secondary mb-2">{label}</label>
      <input
        {...props}
        value={form[id]}
        onChange={e => setForm(f => ({ ...f, [id]: e.target.value }))}
        className="w-full px-4 py-3 border border-line text-sm text-ink bg-elevated focus:outline-none focus:border-accent transition-colors"
      />
      {errors[id] && <p className="mt-1.5 text-xs text-red-600">{errors[id]}</p>}
    </div>
  );

  return (
    <div className="min-h-screen bg-canvas flex flex-col">
      <div className="flex items-center justify-between px-6 py-5 border-b border-line bg-elevated">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-accent flex items-center justify-center">
            <span className="text-white font-serif font-bold leading-none">শ</span>
          </div>
          <span className="font-serif text-base font-semibold text-ink">{BRAND_CONFIG.name}</span>
        </Link>
        <Link to="/" className="flex items-center gap-1.5 text-sm text-ink-muted hover:text-ink transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to store
        </Link>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="w-full max-w-md"
        >
          <div className="bg-elevated border border-line p-8 md:p-10">
            <div className="mb-8">
              <h1 className="font-serif text-2xl font-medium text-ink mb-1.5">Create account</h1>
              <p className="text-sm text-ink-muted">Join {BRAND_CONFIG.name} for exclusive benefits</p>
            </div>

            {errors.global && (
              <div className="mb-5 px-4 py-3 bg-red-50 border border-red-200 text-sm text-red-700">
                {errors.global}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <Field id="name" label="Full name" type="text" autoComplete="name" placeholder="Fatima Rahman" />
              <Field id="email" label="Email address" type="email" autoComplete="email" placeholder="you@example.com" />
              <Field id="phone" label="Phone (optional)" type="tel" autoComplete="tel" placeholder="01XXXXXXXXX" />

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-ink-secondary mb-2">Password</label>
                <div className="relative">
                  <input
                    type={showPw ? 'text' : 'password'}
                    value={form.password}
                    autoComplete="new-password"
                    onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                    className="w-full px-4 py-3 pr-11 border border-line text-sm text-ink bg-elevated focus:outline-none focus:border-accent transition-colors"
                    placeholder="Min. 6 characters"
                  />
                  <button type="button" onClick={() => setShowPw(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-ink-muted hover:text-ink-secondary">
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && <p className="mt-1.5 text-xs text-red-600">{errors.password}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-ink-secondary mb-2">Confirm password</label>
                <input
                  type={showPw ? 'text' : 'password'}
                  value={form.confirm}
                  autoComplete="new-password"
                  onChange={e => setForm(f => ({ ...f, confirm: e.target.value }))}
                  className="w-full px-4 py-3 border border-line text-sm text-ink bg-elevated focus:outline-none focus:border-accent transition-colors"
                  placeholder="••••••••"
                />
                {errors.confirm && <p className="mt-1.5 text-xs text-red-600">{errors.confirm}</p>}
              </div>

              <div className="pt-1">
                <label className="flex items-start gap-3 cursor-pointer">
                  <button
                    type="button"
                    onClick={() => setAgreed(v => !v)}
                    className={`flex-shrink-0 w-5 h-5 border-2 flex items-center justify-center transition-colors mt-0.5 ${
                      agreed ? 'bg-accent border-accent' : 'border-line'
                    }`}
                  >
                    {agreed && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                  </button>
                  <span className="text-sm text-ink-muted">
                    I agree to the{' '}
                    <Link to="/terms" className="text-accent hover:underline">Terms of Service</Link>
                    {' '}and{' '}
                    <Link to="/privacy" className="text-accent hover:underline">Privacy Policy</Link>
                  </span>
                </label>
                {errors.agree && <p className="mt-1.5 text-xs text-red-600">{errors.agree}</p>}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-accent text-white text-sm font-semibold tracking-wide hover:bg-accent-hover disabled:opacity-60 transition-colors mt-2"
              >
                {loading ? 'Creating account…' : 'Create Account'}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-[#F0EBE3] text-center">
              <p className="text-sm text-ink-muted">
                Already have an account?{' '}
                <Link to="/login" className="text-accent font-semibold hover:underline">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
