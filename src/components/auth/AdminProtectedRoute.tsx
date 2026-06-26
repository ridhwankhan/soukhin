import { useEffect, useState } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { Shield, RefreshCw } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { useStaffAccess } from '../../hooks/useStaffAccess';
import { Permission } from '../../types';
import { getUnifiedLoginPath } from '../../lib/staffAuth';
import { CONTACT_EMAIL } from '../../config';
import Button from '../ui/Button';

interface AdminProtectedRouteProps {
  children: React.ReactNode;
  permission?: Permission;
}

function StaffAccessPending() {
  const { refreshAdmin } = useAdminAuth();
  const { needsStaffSetup } = useStaffAccess();
  const [retrying, setRetrying] = useState(false);

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
          You are signed in as <strong className="text-ink">{CONTACT_EMAIL}</strong>, but the dashboard
          could not load your staff profile from the database.
        </p>
        {needsStaffSetup && (
          <p className="text-xs text-ink-muted mb-4 text-left bg-canvas p-3 rounded-sm border border-line">
            Run this once in Supabase → SQL Editor, then click Retry:
            <code className="block mt-2 text-[11px] whitespace-pre-wrap break-all">
              {`INSERT INTO admin_users (email, name, role, is_active)\nVALUES ('${CONTACT_EMAIL}', 'Soukhin Owner', 'owner', true)\nON CONFLICT (email) DO UPDATE SET role = 'owner', is_active = true;`}
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

export default function AdminProtectedRoute({ children, permission }: AdminProtectedRouteProps) {
  const { user, loading: authLoading } = useAuth();
  const { admin, loading: adminLoading, refreshAdmin, can } = useAdminAuth();
  const { isStaffEmail, isOwnerEmail, showDashboard } = useStaffAccess();
  const location = useLocation();
  const [staffCheckDone, setStaffCheckDone] = useState(false);

  useEffect(() => {
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
  }, [admin, user, authLoading, adminLoading, refreshAdmin]);

  const verifying = authLoading || adminLoading || (Boolean(user) && !admin && !staffCheckDone);

  if (verifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-canvas">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-ink-secondary">Verifying staff access...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to={getUnifiedLoginPath(location.pathname)} replace />;
  }

  if (!admin) {
    if (showDashboard || isStaffEmail || isOwnerEmail) {
      return <StaffAccessPending />;
    }
    return <Navigate to="/account" replace />;
  }

  if (permission && !can(permission)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-canvas px-4">
        <div className="bg-elevated rounded-lg shadow-sm p-8 max-w-md text-center">
          <h2 className="text-xl font-semibold text-ink mb-2">Access Denied</h2>
          <p className="text-sm text-ink-secondary mb-4">
            Your role ({admin.role}) does not have permission for this section.
          </p>
          <a href="/admin" className="text-accent hover:underline text-sm">Back to dashboard</a>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
