import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from 'react';
import { useNavigate } from 'react-router-dom';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import {
  createCustomerProfile,
  CustomerProfile,
  ensureCustomerProfile,
  fetchCustomerProfile,
  updateCustomerProfile,
} from '../lib/customerService';
import { consumePendingAction, consumeReturnPath, PendingAction, savePendingAction } from '../lib/pendingAction';
import { checkStaffEmail, fetchMyAdminProfile } from '../lib/adminService';
import { canStaffUseStorefront } from '../lib/staffAuth';
import { isValidEmail, isValidPhone, normalizePhone } from '../lib/validators';
import { checkClientRateLimit, formatRetryAfter } from '../lib/rateLimit';
import { clearSessionMarkers } from '../lib/sessionManager';
import { useSessionManager } from '../hooks/useSessionManager';
import SessionTimeoutWarning from '../components/auth/SessionTimeoutWarning';
import { AdminRole } from '../types';

interface SignUpInput {
  name: string;
  email: string;
  phone: string;
  password: string;
  address?: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: CustomerProfile | null;
  loading: boolean;
  isEmailVerified: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string; isStaff?: boolean; staffRole?: AdminRole }>;
  signUp: (input: SignUpInput) => Promise<{ error?: string; needsEmailVerification?: boolean }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  updateProfile: (updates: Partial<Pick<CustomerProfile, 'name' | 'phone' | 'address'>>) => Promise<{ error?: string }>;
  requireAuth: (action: PendingAction, returnPath?: string) => boolean;
  resendVerificationEmail: () => Promise<{ error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const isEmailVerified = Boolean(user?.email_confirmed_at);

  const loadProfile = useCallback(async (authUser: User) => {
    try {
      const existing = await fetchCustomerProfile(authUser.id);
      if (existing) {
        setProfile(existing);
        return;
      }

      const meta = authUser.user_metadata ?? {};
      if (meta.name && meta.phone) {
        const created = await createCustomerProfile({
          userId: authUser.id,
          name: meta.name,
          email: authUser.email ?? '',
          phone: meta.phone,
          address: meta.address,
        });
        setProfile(created);
      } else {
        setProfile(null);
      }
    } catch {
      setProfile(null);
    }
  }, []);

  const handlePendingAction = useCallback(
    (action: PendingAction) => {
      const returnPath = consumeReturnPath();

      switch (action.type) {
        case 'addToCart':
          navigate(returnPath, { replace: true, state: { resumeCartAction: action } });
          break;
        case 'checkout':
          navigate('/checkout', { replace: true });
          break;
        case 'openCart':
          navigate(returnPath, { replace: true, state: { openCart: true } });
          break;
        default:
          navigate(returnPath, { replace: true });
      }
    },
    [navigate]
  );

  const completeAuthFlow = useCallback(
    async (authUser: User) => {
      const adminProfile = await fetchMyAdminProfile();

      if (adminProfile && !canStaffUseStorefront(adminProfile.role)) {
        navigate('/admin', { replace: true });
        return;
      }

      await loadProfile(authUser);
      const pending = consumePendingAction();
      if (pending) {
        handlePendingAction(pending);
        return;
      }

      if (adminProfile) {
        navigate('/admin', { replace: true });
      }
    },
    [handlePendingAction, loadProfile, navigate]
  );

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session);
      setUser(data.session?.user ?? null);
      if (data.session?.user) {
        loadProfile(data.session.user).finally(() => mounted && setLoading(false));
      } else {
        setLoading(false);
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange(async (event, nextSession) => {
      setSession(nextSession);
      setUser(nextSession?.user ?? null);

      if (event === 'SIGNED_IN' && nextSession?.user) {
        await completeAuthFlow(nextSession.user);
        setLoading(false);
        return;
      }

      if (event === 'SIGNED_OUT') {
        setProfile(null);
        setLoading(false);
        return;
      }

      if (nextSession?.user) {
        await loadProfile(nextSession.user);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, [completeAuthFlow, loadProfile]);

  const signIn = useCallback(async (email: string, password: string) => {
    if (!isValidEmail(email)) return { error: 'Please enter a valid email address.' };

    const normalizedEmail = email.trim().toLowerCase();
    const attemptLimit = checkClientRateLimit(`signin:${normalizedEmail}`, 8, 15 * 60 * 1000);
    if (!attemptLimit.allowed) {
      return { error: `Too many sign-in attempts. Try again in ${formatRetryAfter(attemptLimit.retryAfterMs)}.` };
    }

    const isStaff = await checkStaffEmail(normalizedEmail);

    const { data, error } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password,
    });

    if (error) return { error: error.message };

    if (data.user && !data.user.email_confirmed_at) {
      await supabase.auth.signOut();
      return {
        error: isStaff
          ? 'Please verify your email before signing in. Check your inbox for the confirmation link.'
          : 'Please verify your email before signing in. Check your inbox for the confirmation link.',
      };
    }

    if (isStaff) {
      const admin = await fetchMyAdminProfile();
      if (!admin) {
        await supabase.auth.signOut();
        return { error: 'Your staff account is not active. Contact the store owner.' };
      }
      return { isStaff: true, staffRole: admin.role };
    }

    return {};
  }, []);

  const signUp = useCallback(async (input: SignUpInput) => {
    const { name, email, phone, password, address } = input;

    if (!name.trim()) return { error: 'Name is required.' };
    if (!isValidEmail(email)) return { error: 'Please enter a valid email address.' };
    if (!isValidPhone(phone)) return { error: 'Please enter a valid Bangladesh phone number (01XXXXXXXXX).' };
    if (password.length < 8) return { error: 'Password must be at least 8 characters.' };

    const normalizedEmail = email.trim().toLowerCase();
    const signupLimit = checkClientRateLimit(`signup:${normalizedEmail}`, 3, 60 * 60 * 1000);
    if (!signupLimit.allowed) {
      return { error: `Too many sign-up attempts. Try again in ${formatRetryAfter(signupLimit.retryAfterMs)}.` };
    }

    if (await checkStaffEmail(normalizedEmail)) {
      return { error: 'This email is reserved for staff. Contact the store owner for admin access.' };
    }

    const { data, error } = await supabase.auth.signUp({
      email: normalizedEmail,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth?verified=1`,
        data: {
          name: name.trim(),
          phone: normalizePhone(phone),
          address: address?.trim() || '',
        },
      },
    });

    if (error) return { error: error.message };

    if (data.user && data.session) {
      try {
        await createCustomerProfile({
          userId: data.user.id,
          name: name.trim(),
          email: email.trim().toLowerCase(),
          phone,
          address,
        });
        setProfile(await fetchCustomerProfile(data.user.id));
      } catch (profileError) {
        const message = profileError instanceof Error ? profileError.message : 'Could not create your profile.';
        return { error: message };
      }
    }

    if (data.user && !data.session) {
      return { needsEmailVerification: true };
    }

    return {};
  }, []);

  const signOut = useCallback(async () => {
    clearSessionMarkers('customer');
    await supabase.auth.signOut();
    setProfile(null);
    navigate('/');
  }, [navigate]);

  const { showWarning, idleRemainingMs, extendSession } = useSessionManager({
    scope: 'customer',
    isAuthenticated: Boolean(user && isEmailVerified),
    onExpire: signOut,
  });

  const refreshProfile = useCallback(async () => {
    if (!user) return;
    await loadProfile(user);
  }, [loadProfile, user]);

  const updateProfile = useCallback(
    async (updates: Partial<Pick<CustomerProfile, 'name' | 'phone' | 'address'>>) => {
      if (!user) return { error: 'You must be signed in.' };
      if (updates.phone && !isValidPhone(updates.phone)) {
        return { error: 'Please enter a valid Bangladesh phone number (01XXXXXXXXX).' };
      }
      if (updates.name !== undefined && !updates.name.trim()) {
        return { error: 'Name is required.' };
      }

      try {
        const updated = await updateCustomerProfile(user.id, updates);
        setProfile(updated);
        return {};
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to update profile.';
        return { error: message };
      }
    },
    [user]
  );

  const requireAuth = useCallback(
    (action: PendingAction, returnPath?: string) => {
      if (user && isEmailVerified) {
        return true;
      }

      savePendingAction(action, returnPath);

      const params = new URLSearchParams();
      if (user && !isEmailVerified) {
        params.set('mode', 'verify');
      } else if (action.type === 'addToCart' || action.type === 'checkout') {
        params.set('mode', 'register');
      } else {
        params.set('mode', 'login');
      }
      if (returnPath) params.set('returnTo', returnPath);

      navigate(`/auth?${params.toString()}`);
      return false;
    },
    [isEmailVerified, navigate, user]
  );

  const resendVerificationEmail = useCallback(async () => {
    if (!user?.email) return { error: 'No email found for this account.' };

    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: user.email,
      options: { emailRedirectTo: `${window.location.origin}/auth?verified=1` },
    });

    if (error) return { error: error.message };
    return {};
  }, [user]);

  const value = useMemo(
    () => ({
      user,
      session,
      profile,
      loading,
      isEmailVerified,
      signIn,
      signUp,
      signOut,
      refreshProfile,
      updateProfile,
      requireAuth,
      resendVerificationEmail,
    }),
    [
      user,
      session,
      profile,
      loading,
      isEmailVerified,
      signIn,
      signUp,
      signOut,
      refreshProfile,
      updateProfile,
      requireAuth,
      resendVerificationEmail,
    ]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
      <SessionTimeoutWarning
        scope="customer"
        open={showWarning}
        remainingMs={idleRemainingMs}
        onExtend={extendSession}
        onSignOut={signOut}
      />
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export type { PendingAction };
