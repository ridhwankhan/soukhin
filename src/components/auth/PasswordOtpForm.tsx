import { useState } from 'react';
import { KeyRound, Mail } from 'lucide-react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { requestPasswordOtp, verifyPasswordOtp, PasswordOtpPurpose } from '../../lib/passwordOtpService';

interface PasswordOtpFormProps {
  purpose: PasswordOtpPurpose;
  defaultEmail?: string;
  emailLocked?: boolean;
  onSuccess?: (message: string) => void;
  onCancel?: () => void;
}

export default function PasswordOtpForm({
  purpose,
  defaultEmail = '',
  emailLocked = false,
  onSuccess,
  onCancel,
}: PasswordOtpFormProps) {
  const [step, setStep] = useState<'request' | 'verify'>('request');
  const [email, setEmail] = useState(defaultEmail);
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [info, setInfo] = useState('');
  const [devOtp, setDevOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const title = purpose === 'forgot' ? 'Forgot password' : 'Change password';
  const subtitle =
    purpose === 'forgot'
      ? 'We will email you a 6-digit PIN to set a new password.'
      : 'We will email a PIN to confirm it is really you.';

  const handleRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setInfo('');
    setDevOtp('');
    setLoading(true);
    try {
      const result = await requestPasswordOtp(email, purpose);
      setInfo(result.message);
      if (result.devOtp) setDevOtp(result.devOtp);
      setStep('verify');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not send PIN.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    setLoading(true);
    try {
      const result = await verifyPasswordOtp(email, otp, newPassword);
      onSuccess?.(result.message);
      setInfo(result.message);
      setStep('request');
      setOtp('');
      setNewPassword('');
      setConfirmPassword('');
      setDevOtp('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not update password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
          <KeyRound className="w-5 h-5 text-accent" />
        </div>
        <div>
          <h3 className="font-semibold text-ink">{title}</h3>
          <p className="text-sm text-ink-secondary mt-0.5">{subtitle}</p>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-sm text-sm text-red-700">{error}</div>
      )}
      {info && step === 'verify' && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-sm text-sm text-blue-900">
          <p>{info}</p>
          {devOtp && (
            <p className="mt-2 font-mono text-lg font-bold tracking-widest text-accent">
              Your PIN: {devOtp}
            </p>
          )}
        </div>
      )}

      {step === 'request' ? (
        <form onSubmit={(e) => void handleRequest(e)} className="space-y-4">
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            required
            disabled={emailLocked}
          />
          <div className="flex flex-wrap gap-2">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
            <Button type="submit" loading={loading}>
              <Mail className="w-4 h-4 mr-1" />
              Send PIN to email
            </Button>
          </div>
        </form>
      ) : (
        <form onSubmit={(e) => void handleVerify(e)} className="space-y-4">
          <Input
            label="6-digit PIN from email"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="123456"
            required
            inputMode="numeric"
            autoComplete="one-time-code"
          />
          <Input
            label="New password"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="At least 8 characters"
            required
            minLength={8}
            autoComplete="new-password"
          />
          <Input
            label="Confirm new password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Repeat new password"
            required
            minLength={8}
            autoComplete="new-password"
          />
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" onClick={() => setStep('request')}>
              Resend PIN
            </Button>
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
            <Button type="submit" loading={loading}>
              Update password
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
