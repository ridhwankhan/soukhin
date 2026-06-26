import { useState } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Shield } from 'lucide-react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

export default function AdminLoginPage() {
  const location = useLocation();
  const { admin, loading, signIn } = useAdminAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const from = (location.state as { from?: string } | null)?.from || '/admin';

  if (!loading && admin) {
    return <Navigate to={from} replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    const result = await signIn(email, password);
    setSubmitting(false);

    if (result.error) {
      setError(result.error);
      return;
    }
  };

  return (
    <div className="min-h-screen bg-[#1B4332] flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg shadow-xl w-full max-w-md p-8"
      >
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-[#1B4332] rounded-sm flex items-center justify-center mx-auto mb-4">
            <Shield className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-serif font-semibold text-[#2D2D2D]">Soukhin Staff Login</h1>
          <p className="text-sm text-[#666666] mt-2">Authorized personnel only</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-sm text-sm text-red-700">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Staff Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="owner@soukhin.com"
            required
            autoComplete="username"
          />
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
          <Button type="submit" className="w-full" size="lg" loading={submitting}>
            <Lock className="w-4 h-4 mr-2" />
            Sign In to Dashboard
          </Button>
        </form>

        <p className="text-center mt-6">
          <Link to="/" className="text-sm text-[#666666] hover:text-[#1B4332]">
            ← Back to store
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
