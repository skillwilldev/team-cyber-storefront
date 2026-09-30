import { useState, useEffect, useCallback } from 'react';
import { apiRequest, getToken, setToken, removeToken } from '@shared/api/apiClient';
import { AuthContext } from './AuthContext';

/**
 * Auth Context — three states:
 *   1. loading — checking token on startup (GET /auth/me)
 *   2. authenticated — user data available
 *   3. unauthenticated — no token or invalid
 *
 * This prevents login screen flash on page refresh.
 */

// export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(() => !!getToken());

  // Check session on app startup
  useEffect(() => {
    const token = getToken();
    if (!token) {
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
  const logout = useCallback(async () => {
    if (!getToken()) {
      removeToken();
      setUser(null);
      return;
    }
    try {
      await apiRequest('/auth/logout', {
        method: 'POST',
        body: JSON.stringify({
          logoutAt: new Date().toISOString(),
        }),
      });
    } catch (error) {
      console.error('err logout', error);
    } finally {
      removeToken();
      setUser(null);
    }
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
