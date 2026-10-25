/**
 * Centralized API client.
 * All requests go through apiRequest() — token handling, error parsing, TOKEN_EXPIRED redirect.
 *
 * Usage:
 *   import { apiRequest } from '../shared/api/apiClient';
 *   const data = await apiRequest('/auth/login', { method: 'POST', body: JSON.stringify({...}) });
 */

const API_URL = import.meta.env.VITE_API_URL || 'https://shop-api-kbe6.onrender.com/api';

/**
 * Custom error class for API errors.
 * Contains: status, code, message, errors (for validation).
 */
export class ApiError extends Error {
  constructor(status, data) {
    // no English fallback text here: an empty message makes the UI fall back to a translated t('…') string
    super(data.message || '');
    this.status = status;
    this.code = data.code || 'UNKNOWN_ERROR';
    this.errors = data.errors || null;
    // full error body: INSUFFICIENT_STOCK carries `available`, RESEND_TOO_SOON `retryAfterSeconds`, ...
    this.data = data;
  }
}

/**
 * Get stored access token.
 */
export function getToken() {
  return localStorage.getItem('accessToken');
}

/**
 * Save access token.
 */
export function setToken(token) {
  localStorage.setItem('accessToken', token);
}

/**
 * Remove access token (logout).
 */
export function removeToken() {
  localStorage.removeItem('accessToken');
}

/**
 * Is the JWT already expired? Reads the `exp` claim locally (no request).
 * Used at startup: an expired token is dropped without calling GET /auth/me,
 * which would only produce a 401 line in the browser console.
 * An unreadable token is NOT treated as expired — the server decides.
 */
export function isTokenExpired(token, skewSeconds = 5) {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const { exp } = JSON.parse(atob(base64));
    return typeof exp === 'number' && exp * 1000 <= Date.now() + skewSeconds * 1000;
  } catch {
    return false;
  }
}

/**
 * Central fetch wrapper.
 * - Automatically attaches Bearer token if present
 * - Parses JSON response
 * - Throws ApiError on non-ok responses
 * - Handles TOKEN_EXPIRED centrally (except for auth endpoints)
 *
 * @param {string} endpoint - e.g. '/auth/login'
 * @param {RequestInit & { auth?: boolean }} [options={}] - `signal` is supported (TanStack Query cancels requests with it)
 * @returns {Promise<any>}
 */
export async function apiRequest(endpoint, { auth = true, ...options } = {}) {
  // auth: false → public endpoint (catalog): do not send the token, so an expired
  // token can never break browsing. Content-Type only when there is a body (no CORS preflight for GET).
  const token = auth ? getToken() : null;

  const headers = {
    ...(options.body ? { 'Content-Type': 'application/json' } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  // Parse response body (may be empty for 204)
  let data = {};
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    try {
      data = await response.json();
    } catch {
      data = {};
    }
  }

  if (!response.ok) {
    // Central session-lost handling (401 + TOKEN_EXPIRED / INVALID_TOKEN).  Skipped for:
    //  - /auth/login, /auth/register: a 401 there is a normal form error
    //  - GET /auth/me: the startup session check — AuthProvider handles it itself, no redirect
    // PATCH /auth/me (profile edit) is NOT skipped: an expired token there must lead to /login.
    // Note: a wrong current password is 400 INVALID_CURRENT_PASSWORD, so it never reaches this branch.
    const method = (options.method || 'GET').toUpperCase();
    const isFormEndpoint = endpoint === '/auth/login' || endpoint === '/auth/register';
    const isSessionCheck = endpoint === '/auth/me' && method === 'GET';
    if (
      response.status === 401 &&
      (data.code === 'TOKEN_EXPIRED' || data.code === 'INVALID_TOKEN') &&
      !isFormEndpoint &&
      !isSessionCheck
    ) {
      removeToken();
      // Do NOT hard-redirect (window.location.href = '/login') — it reloads the page and loses
      // state.from, so useAddToCart can never return the user to the product they were viewing.
      // Instead, throw so the calling hook can navigate('/login', { state: { from } }) itself.
      throw new ApiError(401, { code: 'TOKEN_EXPIRED' });
    }

    throw new ApiError(response.status, data);
  }

  return data;
}
