import { useEffect, useState, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, CheckCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { getStaffPostLoginPath } from '../../lib/staffAuth';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { CONTACT_EMAIL } from '../../config';
import PasswordOtpForm from '../../components/auth/PasswordOtpForm';

type AuthMode = 'login' | 'register' | 'verify' | 'forgot';

export default function AuthPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const mode = (searchParams.get('mode') as AuthMode) || 'login';
  const returnTo = searchParams.get('returnTo') || '/';
  const justVerified = searchParams.get('verified') === '1';

  const { user, profile, loading, isEmailVerified, signIn, signUp, resendVerificationEmail } = useAuth();
  const { admin, loading: adminLoading, setAdminProfile } = useAdminAuth();

  const [activeMode, setActiveMode] = useState<AuthMode>(mode);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const loginHandledRef = useRef(false);

  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    password: '',
    confirmPassword: '',
  });

  useEffect(() => {
    setActiveMode(mode);
  }, [mode]);

  // Redirect already-signed-in visitors (not during an active login submit)
  useEffect(() => {
    if (loading || adminLoading || submitting || loginHandledRef.current) return;
    if (!user || !isEmailVerified) {
      if (user && !isEmailVerified) setActiveMode('verify');
      return;
    }

    const safeReturn = returnTo.startsWith('/') ? returnTo : '/';

    if (admin) {
      navigate(getStaffPostLoginPath(admin.role, safeReturn), { replace: true });
      return;
    }

    // Signed in but staff profile not ready — never bounce to /admin (prevents redirect loop)
    if (safeReturn.startsWith('/admin')) {
      return;
    }

    if (profile) {
      navigate(safeReturn, { replace: true });
      return;
    }

    if (activeMode !== 'register') {
      navigate(safeReturn === '/' ? '/account' : safeReturn, { replace: true });
    }
  }, [loading, adminLoading, submitting, user, isEmailVerified, profile, admin, navigate, returnTo, activeMode]);

  useEffect(() => {
    if (justVerified) {
      setSuccess('Email verified successfully. You can now sign in.');
      setActiveMode('login');
    }
  }, [justVerified]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);
    loginHandledRef.current = true;

    const result = await signIn(loginForm.email, loginForm.password);
    setSubmitting(false);

    if (result.error) {
      loginHandledRef.current = false;
      setError(result.error);
      return;
    }

    const safeReturn = returnTo.startsWith('/') ? returnTo : '/';

    if (result.isStaff && result.staffRole) {
      if (result.adminProfile) {
        setAdminProfile(result.adminProfile);
      }
      const dest = getStaffPostLoginPath(result.staffRole, safeReturn);
      navigate(dest, { replace: true });
      return;
    }

    navigate(safeReturn, { replace: true });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (registerForm.password !== registerForm.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setSubmitting(true);
    const result = await signUp({
      name: registerForm.name,
      email: registerForm.email,
      phone: registerForm.phone,
      address: registerForm.address,
      password: registerForm.password,
    });
    setSubmitting(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    if (result.needsEmailVerification) {
      setActiveMode('verify');
      setSuccess(`We sent a verification link to ${registerForm.email}. Please confirm your email to continue shopping.`);
      return;
    }

    navigate(returnTo.startsWith('/') ? returnTo : '/', { replace: true });
  };

  const handleResend = async () => {
    setError('');
    setSubmitting(true);
    const result = await resendVerificationEmail();
    setSubmitting(false);

    if (result.error) {
      setError(result.error);
      return;
    }
    setSuccess('Verification email sent. Please check your inbox.');
  };

  if (loading && !user) {
    return (
      <div className="min-h-screen bg-canvas flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-canvas py-12 px-4">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 bg-accent rounded-sm flex items-center justify-center">
              <span className="text-white font-serif text-xl font-bold">শ</span>
            </div>
          </Link>
          <h1 className="text-2xl font-serif font-semibold text-ink">
            {activeMode === 'register'
              ? 'Create Your Account'
              : activeMode === 'verify'
              ? 'Verify Your Email'
              : activeMode === 'forgot'
              ? 'Reset Password'
              : 'Welcome Back'}
          </h1>
          <p className="text-sm text-ink-secondary mt-2">
            {activeMode === 'register'
              ? 'Sign up to shop, track orders, and manage your details.'
              : activeMode === 'verify'
              ? 'Confirm your email to start shopping with Soukhin.'
              : activeMode === 'forgot'
              ? 'Enter your email — we will send a PIN to set a new password.'
              : 'Sign in to shop — staff emails go to the dashboard automatically.'}
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-elevated rounded-lg shadow-sm p-6"
        >
          {activeMode !== 'verify' && activeMode !== 'forgot' && (
            <div className="flex border border-line rounded-sm mb-6 overflow-hidden">
              <button
                type="button"
                onClick={() => { setActiveMode('login'); setError(''); }}
                className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
                  activeMode === 'login' ? 'bg-accent text-white' : 'bg-elevated text-ink-secondary'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => { setActiveMode('register'); setError(''); }}
                className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
                  activeMode === 'register' ? 'bg-accent text-white' : 'bg-elevated text-ink-secondary'
                }`}
              >
                Register
              </button>
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-sm text-sm text-red-700">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-sm text-sm text-green-700 flex items-start gap-2">
              <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{success}</span>
            </div>
          )}

          {activeMode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <Input
                label="Email"
                type="email"
                value={loginForm.email}
                onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                placeholder="your@email.com"
                required
              />
              <Input
                label="Password"
                type="password"
                value={loginForm.password}
                onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                placeholder="Your password"
                required
                minLength={8}
              />
              <Button type="submit" className="w-full" size="lg" loading={submitting}>
                Sign In
              </Button>
              <button
                type="button"
                onClick={() => { setActiveMode('forgot'); setError(''); setSuccess(''); }}
                className="w-full text-sm text-accent hover:underline"
              >
                Forgot password?
              </button>
            </form>
          )}

          {activeMode === 'forgot' && (
            <PasswordOtpForm
              purpose="forgot"
              defaultEmail={loginForm.email}
              onSuccess={(msg) => {
                setSuccess(msg);
                setActiveMode('login');
              }}
              onCancel={() => setActiveMode('login')}
            />
          )}

          {activeMode === 'register' && (
            <form onSubmit={handleRegister} className="space-y-4">
              <Input
                label="Full Name"
                value={registerForm.name}
                onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
                placeholder="Your full name"
                required
              />
              <Input
                label="Email"
                type="email"
                value={registerForm.email}
                onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                placeholder="your@email.com"
                required
              />
              <Input
                label="Phone Number"
                type="tel"
                value={registerForm.phone}
                onChange={(e) => setRegisterForm({ ...registerForm, phone: e.target.value })}
                placeholder="01XXXXXXXXX"
                required
              />
              <div>
                <label className="block text-sm font-medium text-ink mb-1.5">Address (Optional)</label>
                <textarea
                  value={registerForm.address}
                  onChange={(e) => setRegisterForm({ ...registerForm, address: e.target.value })}
                  placeholder="House, road, area..."
                  rows={2}
                  className="w-full px-4 py-2.5 border border-line rounded-sm focus:outline-none focus:ring-2 focus:ring-accent resize-none"
                />
              </div>
              <Input
                label="Password"
                type="password"
                value={registerForm.password}
                onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                placeholder="At least 8 characters"
                required
                minLength={8}
              />
              <Input
                label="Confirm Password"
                type="password"
                value={registerForm.confirmPassword}
                onChange={(e) => setRegisterForm({ ...registerForm, confirmPassword: e.target.value })}
                placeholder="Repeat password"
                required
                minLength={8}
              />
              <Button type="submit" className="w-full" size="lg" loading={submitting}>
                Create Account
              </Button>
            </form>
          )}

          {activeMode === 'verify' && (
            <div className="space-y-4 text-center">
              <div className="w-14 h-14 bg-accent/10 rounded-full flex items-center justify-center mx-auto">
                <Mail className="w-7 h-7 text-accent" />
              </div>
              <p className="text-sm text-ink-secondary">
                We sent a verification link to your email. Click the link to activate your account, then sign in to continue.
              </p>
              <p className="text-xs text-ink-secondary">
                Store contact: <a href={`mailto:${CONTACT_EMAIL}`} className="text-accent underline">{CONTACT_EMAIL}</a>
              </p>
              {user && (
                <Button onClick={handleResend} variant="outline" className="w-full" loading={submitting}>
                  Resend Verification Email
                </Button>
              )}
              <Button onClick={() => setActiveMode('login')} className="w-full">
                Back to Sign In
              </Button>
            </div>
          )}

          {activeMode !== 'verify' && activeMode !== 'forgot' && (
            <p className="mt-6 text-xs text-center text-ink-secondary">
              Need help? Email us at{' '}
              <a href={`mailto:${CONTACT_EMAIL}`} className="text-accent underline">
                {CONTACT_EMAIL}
              </a>
            </p>
          )}
        </motion.div>

        <p className="text-center mt-6">
          <Link to="/" className="text-sm text-accent hover:underline">
            ← Back to shopping
          </Link>
        </p>
      </div>
    </div>
  );
}
