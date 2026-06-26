import { Navigate, useLocation } from 'react-router-dom';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { Permission } from '../../types';
import { getUnifiedLoginPath } from '../../lib/staffAuth';

interface AdminProtectedRouteProps {
  children: React.ReactNode;
  permission?: Permission;
}

export default function AdminProtectedRoute({ children, permission }: AdminProtectedRouteProps) {
  const { admin, loading, can } = useAdminAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-canvas">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-ink-secondary">Verifying staff access...</p>
        </div>
      </div>
    );
  }

  if (!admin) {
    return <Navigate to={getUnifiedLoginPath(location.pathname)} replace />;
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
