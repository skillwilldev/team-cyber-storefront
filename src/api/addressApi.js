import { apiRequest } from '@shared/api/apiClient';

/**
 * Delivery addresses. Every call needs the token (apiRequest sends it by default).
 *   Address = { id, label | null, fullName, phone, city, address, isDefault, createdAt }
 * The default address is always first in the list. Maximum 10 addresses per user.
 */

/** GET /addresses → { items: Address[] } */
export const fetchAddresses = ({ signal } = {}) => apiRequest('/addresses', { signal });

/** POST /addresses → 201 { address }. The first address becomes the default automatically. */
export const createAddress = (body) => apiRequest('/addresses', { method: 'POST', body: JSON.stringify(body) });

/** PATCH /addresses/:id → { address }. Send ONLY the changed fields. `label: ''` clears the label. */
export const updateAddress = ({ id, ...patch }) =>
  apiRequest(`/addresses/${encodeURIComponent(id)}`, { method: 'PATCH', body: JSON.stringify(patch) });

/** DELETE /addresses/:id → 204 (if it was the default, the oldest remaining address becomes the default) */
export const deleteAddress = ({ id }) => apiRequest(`/addresses/${encodeURIComponent(id)}`, { method: 'DELETE' });
