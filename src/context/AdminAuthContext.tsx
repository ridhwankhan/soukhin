import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { fetchMyAdminProfileWithRetry, signInAdmin, signOutAdmin } from '../lib/adminService';
import { hasPermission } from '../config/roles';
import { AdminUser, Permission } from '../types';
import { clearSessionMarkers, touchSession } from '../lib/sessionManager';
import { withTimeout } from '../lib/asyncUtils';
import { useSessionManager } from '../hooks/useSessionManager';
import SessionTimeoutWarning from '../components/auth/SessionTimeoutWarning';

interface AdminAuthContextType {
  user: User | null;
  session: Session | null;
  admin: AdminUser | null;
  adminError: string | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  can: (permission: Permission) => boolean;
  refreshAdmin: () => Promise<void>;
  setAdminProfile: (profile: AdminUser | null) => void;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const isOnAdminRoute = location.pathname.startsWith('/admin');
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [adminError, setAdminError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadAdmin = useCallback(async (options?: { preserveOnFailure?: boolean }) => {
    const result = await withTimeout(fetchMyAdminProfileWithRetry(3), 15_000, {
      admin: null,
      error: 'Profile load timed out',
    });

    if (result.admin) {
      setAdmin(result.admin);
      setAdminError(null);
      return result.admin;
    }

    if (options?.preserveOnFailure) {
      setAdmin((prev) => prev);
      if (result.error) setAdminError(result.error);
      return null;
    }

    setAdmin(null);
    setAdminError(result.error ?? null);
    return null;
  }, []);

  const setAdminProfile = useCallback((profile: AdminUser | null) => {
    setAdmin(profile);
  }, []);

  useEffect(() => {
    let mounted = true;

    const bootstrap = async () => {
      try {
        const { data } = await withTimeout(supabase.auth.getSession(), 10_000, {
          data: { session: null },
          error: null,
        });

        if (!mounted) return;

        setSession(data.session);
        setUser(data.session?.user ?? null);

        if (data.session?.user) {
          await loadAdmin();
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    void bootstrap();

    const { data: listener } = supabase.auth.onAuthStateChange((event, nextSession) => {
      if (!mounted) return;

      setSession(nextSession);
      setUser(nextSession?.user ?? null);

      if (event === 'INITIAL_SESSION') return;

      if (event === 'SIGNED_IN' && nextSession?.user) {
        setLoading(true);
        window.setTimeout(() => {
          void loadAdmin().finally(() => {
            if (mounted) setLoading(false);
          });
        }, 0);
        return;
      }

      if (nextSession?.user) {
        window.setTimeout(() => {
          void loadAdmin();
        }, 0);
      } else {
        setAdmin(null);
      }

      setLoading(false);
    });

    const onVisible = () => {
      if (document.visibilityState !== 'visible' || !mounted) return;

      // On admin pages, only extend idle timer — do not re-fetch session (tab blur
      // often times out getSession and was wiping admin state + closing open forms).
      if (window.location.pathname.startsWith('/admin')) {
        touchSession('admin');
        return;
      }

      void withTimeout(supabase.auth.getUser(), 8_000, null).then((result) => {
        if (!mounted || result === null) return;

        const { data, error } = result;
        if (error || !data.user) return;

        setUser(data.user);
        void withTimeout(supabase.auth.getSession(), 8_000, { data: { session: null }, error: null }).then(
          ({ data: sessionData }) => {
            if (sessionData.session) setSession(sessionData.session);
          }
        );
        void loadAdmin({ preserveOnFailure: true });
      });
    };

    document.addEventListener('visibilitychange', onVisible);

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [loadAdmin]);

  const signIn = useCallback(async (email: string, password: string) => {
    const result = await signInAdmin(email, password);
    if (result.error) return { error: result.error };
    setAdmin(result.admin ?? null);
    return {};
  }, []);

  const signOut = useCallback(async () => {
    clearSessionMarkers('admin');
    await withTimeout(signOutAdmin(), 5_000, undefined);
    setSession(null);
    setUser(null);
    setAdmin(null);
    setLoading(false);
    navigate('/');
  }, [navigate]);

  const { showWarning, idleRemainingMs, extendSession } = useSessionManager({
    scope: 'admin',
    // Only track admin idle timeout while on dashboard — not while staff is shopping
    isAuthenticated: Boolean(admin) && isOnAdminRoute,
    onExpire: () => {
      void signOut();
    },
  });

  const can = useCallback(
    (permission: Permission) => {
      if (!admin) return false;
      return hasPermission(admin.role, permission);
    },
    [admin]
  );

  const value = useMemo(
    () => ({
      user,
      session,
      admin,
      adminError,
      loading,
      signIn,
      signOut,
      can,
      refreshAdmin: loadAdmin,
      setAdminProfile,
    }),
    [user, session, admin, adminError, loading, signIn, signOut, can, loadAdmin, setAdminProfile]
  );

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
      <SessionTimeoutWarning
        scope="admin"
        open={showWarning}
        remainingMs={idleRemainingMs}
        onExtend={extendSession}
        onSignOut={signOut}
      />
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within AdminAuthProvider');
  }
  return context;
}
