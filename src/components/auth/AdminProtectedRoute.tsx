import { useEffect, useRef, useState } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { Shield, RefreshCw } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { useStaffAccess } from '../../hooks/useStaffAccess';
import {
  hasStaffAccessGranted,
  markStaffAccessGranted,
  readCachedAdminProfile,
} from '../../lib/adminSessionCache';
import { Permission } from '../../types';
import { getUnifiedLoginPath } from '../../lib/staffAuth';
import { CONTACT_EMAIL } from '../../config';
import Button from '../ui/Button';

interface AdminProtectedRouteProps {
  children: React.ReactNode;
  permission?: Permission;
}

function StaffAccessPending() {
  const { user } = useAuth();
  const { refreshAdmin, adminError } = useAdminAuth();
  const { needsStaffSetup } = useStaffAccess();
  const [retrying, setRetrying] = useState(false);
  const signedInEmail = user?.email ?? CONTACT_EMAIL;

  const handleRetry = async () => {
    setRetrying(true);
    await refreshAdmin();
    setRetrying(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-canvas px-4">
      <div className="bg-elevated rounded-lg shadow-sm p-8 max-w-lg w-full text-center">
        <div className="w-14 h-14 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Shield className="w-7 h-7 text-accent" />
        </div>
        <h2 className="text-xl font-semibold text-ink mb-2">Staff profile not linked yet</h2>
        <p className="text-sm text-ink-secondary mb-4">
          You are signed in as <strong className="text-ink">{signedInEmail}</strong>, but the dashboard
          could not load your staff profile from the database.
        </p>
        {adminError && (
          <p className="text-xs text-red-600 mb-4 text-left bg-red-50 p-3 rounded-sm border border-red-200">
            {adminError}
          </p>
        )}
        {needsStaffSetup && (
          <p className="text-xs text-ink-muted mb-4 text-left bg-canvas p-3 rounded-sm border border-line">
            Run this once in Supabase → SQL Editor (project{' '}
            <strong>yxctdtihkmslpidscfph</strong>), then click Retry:
            <code className="block mt-2 text-[11px] whitespace-pre-wrap break-all">
              {`-- Paste full file: supabase/migrations/20260626233000_011_fix_staff_profile_link.sql`}
            </code>
          </p>
        )}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={handleRetry} loading={retrying}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
          <Link to="/account">
            <Button variant="outline" className="w-full">Back to My Account</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

function hasTrustedStaffSession(): boolean {
  return hasStaffAccessGranted() || Boolean(readCachedAdminProfile());
}

export default function AdminProtectedRoute({ children, permission }: AdminProtectedRouteProps) {
  const { user, loading: authLoading } = useAuth();
  const { admin, loading: adminLoading, refreshAdmin, can } = useAdminAuth();
  const { isStaffEmail, isOwnerEmail, showDashboard } = useStaffAccess();
  const location = useLocation();
  const [staffCheckDone, setStaffCheckDone] = useState(() => hasTrustedStaffSession());

  const trustedRef = useRef(hasTrustedStaffSession());

  if (admin) {
    trustedRef.current = true;
    markStaffAccessGranted();
  }

  const effectiveAdmin = admin ?? readCachedAdminProfile();
  const sessionTrusted = trustedRef.current || hasTrustedStaffSession();

  useEffect(() => {
    if (sessionTrusted) {
      setStaffCheckDone(true);
      return;
    }

    if (authLoading || adminLoading) return;

    if (admin || !user) {
      setStaffCheckDone(true);
      return;
    }

    let mounted = true;
    setStaffCheckDone(false);
    void refreshAdmin().finally(() => {
      if (mounted) setStaffCheckDone(true);
    });

    return () => {
      mounted = false;
    };
  }, [admin, user, authLoading, adminLoading, refreshAdmin, sessionTrusted]);

  const isFirstVisitVerify =
    !sessionTrusted &&
    ((authLoading && !user) ||
      (adminLoading && !effectiveAdmin) ||
      (Boolean(user) && !effectiveAdmin && !staffCheckDone));

  // Trusted session: never kick the user out or unmount the dashboard on tab focus.
  if (sessionTrusted || effectiveAdmin) {
    if (permission && effectiveAdmin && !can(permission)) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-canvas px-4">
          <div className="bg-elevated rounded-lg shadow-sm p-8 max-w-md text-center">
            <h2 className="text-xl font-semibold text-ink mb-2">Access Denied</h2>
            <p className="text-sm text-ink-secondary mb-4">
              Your role ({effectiveAdmin.role}) does not have permission for this section.
            </p>
            <a href="/admin" className="text-accent hover:underline text-sm">Back to dashboard</a>
          </div>
        </div>
      );
    }

    return <>{children}</>;
  }

  if (!user && !authLoading) {
    return <Navigate to={getUnifiedLoginPath(location.pathname)} replace />;
  }

  if (!effectiveAdmin && !isFirstVisitVerify) {
    if (showDashboard || isStaffEmail || isOwnerEmail) {
      return <StaffAccessPending />;
    }
    if (!authLoading) {
      return <Navigate to="/account" replace />;
    }
  }

  if (permission && effectiveAdmin && !can(permission)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-canvas px-4">
        <div className="bg-elevated rounded-lg shadow-sm p-8 max-w-md text-center">
          <h2 className="text-xl font-semibold text-ink mb-2">Access Denied</h2>
          <p className="text-sm text-ink-secondary mb-4">
            Your role ({effectiveAdmin.role}) does not have permission for this section.
          </p>
          <a href="/admin" className="text-accent hover:underline text-sm">Back to dashboard</a>
        </div>
      </div>
    );
  }

  return (
    <>
      {effectiveAdmin ? children : null}
      {isFirstVisitVerify && (
        <div className="min-h-screen flex items-center justify-center bg-canvas">
          <div className="text-center">
            <div className="w-10 h-10 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm text-ink-secondary">Verifying staff access...</p>
          </div>
        </div>
      )}
    </>
  );
}
