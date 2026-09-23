/**
 * Centralized API client.
 * All requests go through apiRequest() — token handling, error parsing, TOKEN_EXPIRED redirect.
 *
 * Usage:
 *   import { apiRequest } from '../shared/api/apiClient';
 *   const data = await apiRequest('/auth/login', { method: 'POST', body: JSON.stringify({...}) });
 */

const API_URL = import.meta.env.VITE_API_URL;

/**
 * Custom error class for API errors.
 * Contains: status, code, message, errors (for validation).
 */
export class ApiError extends Error {
  constructor(status, data) {
    super(data.message || 'Request failed');
    this.status = status;
    this.code = data.code || 'UNKNOWN_ERROR';
    this.errors = data.errors || null;
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
 * Central fetch wrapper.
 * - Automatically attaches Bearer token if present
 * - Parses JSON response
 * - Throws ApiError on non-ok responses
 * - Handles TOKEN_EXPIRED centrally (except for auth endpoints)
 *
 * @param {string} endpoint - e.g. '/auth/login'
 * @param {RequestInit} [options={}]
 * @returns {Promise<any>}
 */
export async function apiRequest(endpoint, options = {}) {
  const token = getToken();

  const headers = {
    'Content-Type': 'application/json',
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
    // Central TOKEN_EXPIRED handling — except on auth endpoints where we expect 401
    const authEndpoints = ['/auth/login', '/auth/me', '/auth/register'];
    if (
      response.status === 401 &&
      data.code === 'TOKEN_EXPIRED' &&
      !authEndpoints.includes(endpoint)
    ) {
      removeToken();
      window.location.href = '/login';
      // Throw to stop further execution
      throw new ApiError(401, { message: 'Session expired. Please sign in again.', code: 'TOKEN_EXPIRED' });
    }

    throw new ApiError(response.status, data);
  }

  return data;
}
