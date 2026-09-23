import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@features/auth/context/AuthContext';
import { IconLoader } from '@shared/ui';

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

  if (isLoading) {
    return (
      <div className="auth-loading">
        <IconLoader size={32} />
        <p className="auth-loading__text">Checking session...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Save where user was trying to go — we'll redirect back after login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
