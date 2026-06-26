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
import { fetchMyAdminProfile, signInAdmin, signOutAdmin } from '../lib/adminService';
import { hasPermission } from '../config/roles';
import { AdminUser, Permission } from '../types';
import { clearSessionMarkers } from '../lib/sessionManager';
import { useSessionManager } from '../hooks/useSessionManager';
import SessionTimeoutWarning from '../components/auth/SessionTimeoutWarning';

interface AdminAuthContextType {
  user: User | null;
  session: Session | null;
  admin: AdminUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  can: (permission: Permission) => boolean;
  refreshAdmin: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  const loadAdmin = useCallback(async () => {
    const profile = await fetchMyAdminProfile();
    setAdmin(profile);
    return profile;
  }, []);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(async ({ data }) => {
      if (!mounted) return;
      setSession(data.session);
      setUser(data.session?.user ?? null);
      if (data.session?.user) {
        await loadAdmin();
      }
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, nextSession) => {
      setSession(nextSession);
      setUser(nextSession?.user ?? null);
      if (nextSession?.user) {
        await loadAdmin();
      } else {
        setAdmin(null);
      }
      setLoading(false);
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
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
    await signOutAdmin();
    setAdmin(null);
    navigate('/admin/login');
  }, [navigate]);

  const { showWarning, idleRemainingMs, extendSession } = useSessionManager({
    scope: 'admin',
    isAuthenticated: Boolean(admin),
    onExpire: signOut,
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
      loading,
      signIn,
      signOut,
      can,
      refreshAdmin: async () => { await loadAdmin(); },
    }),
    [user, session, admin, loading, signIn, signOut, can, loadAdmin]
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
