import { apiRequest } from '@shared/api/apiClient';

/**
 * Cart requests. The cart lives on the SERVER and is bound to the user, so every call needs the token
 * (apiRequest sends it by default). Every endpoint answers with the WHOLE updated cart:
 *   { items: [{ id, productId, qty, lineTotal, product }], totalQty, subtotal, currency }
 *
 * Two different ids — the most common mistake:
 *   productId  = product.id   → only for POST /cart/items
 *   id         = items[].id   → the cart LINE, for PATCH / DELETE /cart/items/:id
 */

/** GET /cart */
export const fetchCart = ({ signal } = {}) => apiRequest('/cart', { signal });

/** POST /cart/items → 201 (new line) / 200 (line existed, qty was added) */
export const addCartItem = ({ productId, qty = 1 }) =>
  apiRequest('/cart/items', { method: 'POST', body: JSON.stringify({ productId, qty }) });

/** PATCH /cart/items/:id → sets the EXACT quantity (1–99). 0 is not allowed — use removeCartItem. */
export const updateCartItem = ({ id, qty }) =>
  apiRequest(`/cart/items/${encodeURIComponent(id)}`, { method: 'PATCH', body: JSON.stringify({ qty }) });

/** DELETE /cart/items/:id */
export const removeCartItem = ({ id }) =>
  apiRequest(`/cart/items/${encodeURIComponent(id)}`, { method: 'DELETE' });
