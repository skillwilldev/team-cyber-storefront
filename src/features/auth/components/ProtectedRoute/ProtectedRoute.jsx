import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { IconLoader } from '@shared/ui';
import { useTranslation } from 'react-i18next';
import './ProtectedRoute.css';


/**
 * ProtectedRoute — wraps pages that require authentication.
 *
 * - If loading (checking token) → shows spinner (no flash!)
 * - If unauthenticated → redirects to /login, saving current location
 * - If authenticated → renders children
 *
 * After login, user is redirected back to where they came from.
 */
export default function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <div className="auth-loading">
        <IconLoader size={32} />
        <p className="auth-loading__text">{t('auth.checkingSession')}</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Save where user was trying to go — we'll redirect back after login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
