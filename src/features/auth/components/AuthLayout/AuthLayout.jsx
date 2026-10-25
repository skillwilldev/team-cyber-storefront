import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { IconLoader } from '@shared/ui';
import './AuthLayout.css';

/**
 * Centered card for the auth screens (login / register / forgot password).
 * Signed-in users are redirected away: they have nothing to do on these pages.
 */
export default function AuthLayout() {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="auth-loading">
        <IconLoader size={32} />
      </div>
    );
  }

  if (isAuthenticated) {
    const fromLocation = location.state?.from;
    const to = fromLocation
      ? `${fromLocation.pathname}${fromLocation.search ?? ''}${fromLocation.hash ?? ''}`
      : '/';
    return <Navigate to={to} replace />;
  }

  return (
    <div className="auth-shell">
      <div className="auth-shell__card">
        <Outlet />
      </div>
    </div>
  );
}