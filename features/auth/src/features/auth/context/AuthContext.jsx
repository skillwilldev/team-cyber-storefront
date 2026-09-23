import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { apiRequest, getToken, setToken, removeToken } from '@shared/api/apiClient';

/**
 * Auth Context — three states:
 *   1. loading — checking token on startup (GET /auth/me)
 *   2. authenticated — user data available
 *   3. unauthenticated — no token or invalid
 *
 * This prevents login screen flash on page refresh.
 */

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check session on app startup
  useEffect(() => {
    const token = getToken();
    if (!token) {
      setIsLoading(false);
      return;
    }

    apiRequest('/auth/me')
      .then((data) => {
        setUser(data.user);
      })
      .catch(() => {
        // Token invalid/expired — clean up
        removeToken();
        setUser(null);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  // Login: save token + set user
  const login = useCallback((accessToken, userData) => {
    setToken(accessToken);
    setUser(userData);
  }, []);

  // Logout: remove token + clear user
  const logout = useCallback(() => {
    removeToken();
    setUser(null);
  }, []);

  const value = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    setUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook to access auth context.
 * Throws if used outside AuthProvider.
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
