import { useState, useEffect, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { PRIVATE_QUERY_KEYS } from '@api/queryKeys';
import { apiRequest, getToken, setToken, removeToken, isTokenExpired } from '@shared/api/apiClient';
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

// One startup check at a time: React StrictMode (dev) runs effects twice, which sent GET /auth/me twice.
let sessionCheck = null;
const checkSession = () => {
  sessionCheck ??= apiRequest('/auth/me').finally(() => {
    sessionCheck = null;
  });
  return sessionCheck;
};

export function AuthProvider({ children }) {
  const queryClient = useQueryClient();

  // cart, addresses, checkout and orders are private to one account — the next person of this browser must not see them
  const forgetPrivateData = useCallback(() => {
    PRIVATE_QUERY_KEYS.forEach((queryKey) => queryClient.removeQueries({ queryKey }));
  }, [queryClient]);

  const [user, setUser] = useState(null);
  // an already expired token needs no check at all — the effect below just drops it
  const [isLoading, setIsLoading] = useState(() => {
    const token = getToken();
    return !!token && !isTokenExpired(token);
  });

  // Check session on app startup
  useEffect(() => {
    const token = getToken();
    if (!token) {
      return;
    }
    if (isTokenExpired(token)) {
      // expired while the user was away: no request, no 401 in the console
      removeToken();
      return;
    }

    checkSession()
      .then((data) => {
        setUser(data.user);
      })
      .catch((error) => {
        // Only a 401 means "the token is bad". A network error / 5xx (e.g. the free server is waking up)
        // must not sign the user out: the token stays and the next page load checks it again.
        if (error?.status === 401) removeToken();
        setUser(null);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  // Login: save token + set user
  // The cart, addresses and orders are the user's private data: never let one account see the cache of another one.
  const login = useCallback(
    (accessToken, userData) => {
      forgetPrivateData();
      setToken(accessToken);
      setUser(userData);
    },
    [forgetPrivateData],
  );

  // Logout: remove token + clear user
  const logout = useCallback(async () => {
    if (!getToken()) {
      removeToken();
      setUser(null);
      forgetPrivateData();
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
      // the data stays on the server; the browser must forget it (the next person may use this browser)
      forgetPrivateData();
    }
  }, [forgetPrivateData]);

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
