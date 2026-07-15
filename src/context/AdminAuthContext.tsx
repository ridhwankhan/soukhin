import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  ReactNode,
} from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { fetchMyAdminProfileWithRetry, signInAdmin, signOutAdmin } from '../lib/adminService';
import { hasAnyPermission } from '../config/roles';
import { AdminUser, Permission } from '../types';
import { clearSessionMarkers, touchSession } from '../lib/sessionManager';
import {
  cacheAdminProfile,
  clearCachedAdminProfile,
  clearStaffAccessGranted,
  markStaffAccessGranted,
  readCachedAdminProfile,
  hasStaffAccessGranted,
  clearLastAdminPath,
} from '../lib/adminSessionCache';
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
  const [admin, setAdmin] = useState<AdminUser | null>(() => readCachedAdminProfile());
  const [adminError, setAdminError] = useState<string | null>(null);
  const [loading, setLoading] = useState(
    () => !(readCachedAdminProfile() || hasStaffAccessGranted())
  );
  const adminRef = useRef(admin);
  adminRef.current = admin;

  const loadAdmin = useCallback(async (options?: { preserveOnFailure?: boolean }) => {
    const result = await withTimeout(fetchMyAdminProfileWithRetry(3), 15_000, {
      admin: null,
      error: 'Profile load timed out',
    });

    if (result.admin) {
      setAdmin(result.admin);
      cacheAdminProfile(result.admin);
      markStaffAccessGranted();
      setAdminError(null);
      return result.admin;
    }

    // Never wipe a working admin session on background refresh / tab focus timeouts.
    if (options?.preserveOnFailure || adminRef.current) {
      if (result.error) setAdminError(result.error);
      return adminRef.current;
    }

    setAdmin(null);
    clearCachedAdminProfile();
    setAdminError(result.error ?? null);
    return null;
  }, []);

  const setAdminProfile = useCallback((profile: AdminUser | null) => {
    setAdmin(profile);
    if (profile) cacheAdminProfile(profile);
    else clearCachedAdminProfile();
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

      if (event === 'SIGNED_OUT' || !nextSession?.user) {
        setAdmin(null);
        clearCachedAdminProfile();
        clearStaffAccessGranted();
        clearLastAdminPath();
        setLoading(false);
        return;
      }

      // Token refresh on tab focus — update session only, never re-bootstrap admin.
      if (event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
        setLoading(false);
        return;
      }

      if (event === 'SIGNED_IN' && nextSession?.user) {
        if (adminRef.current || hasStaffAccessGranted() || readCachedAdminProfile()) {
          setLoading(false);
          return;
        }
        setLoading(true);
        window.setTimeout(() => {
          void loadAdmin().finally(() => {
            if (mounted) setLoading(false);
          });
        }, 0);
        return;
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
    clearCachedAdminProfile();
    clearStaffAccessGranted();
    clearLastAdminPath();
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
      const profile = adminRef.current ?? readCachedAdminProfile();
      if (!profile) return false;
      const roles = [profile.role, ...(profile.additionalRoles ?? [])];
      return hasAnyPermission(roles, permission);
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
      refreshAdmin: () => loadAdmin({ preserveOnFailure: true }),
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
