import { Navigate } from 'react-router-dom';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { getUnifiedLoginPath } from '../../lib/staffAuth';

/** Legacy URL — redirects to the unified Sign In page. */
export default function AdminLoginPage() {
  const { admin, loading } = useAdminAuth();

  if (!loading && admin) {
    return <Navigate to="/admin" replace />;
  }

  return <Navigate to={getUnifiedLoginPath('/admin')} replace />;
}
