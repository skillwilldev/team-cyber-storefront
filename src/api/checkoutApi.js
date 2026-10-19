import { apiRequest } from '@shared/api/apiClient';

/**
 * Checkout and orders (the payment is simulated — no money moves, see the FE-006 task).
 * Payment is two steps: POST /orders (shipping + card → code "by e-mail"), then POST /orders/:id/confirm { code }.
 */

/**
 * GET /checkout → { items, totalQty, subtotal, shippingFee, total, currency, freeShippingFrom, shipping, addresses }
 * An empty cart comes back as items: [].
 */
export const fetchCheckout = ({ signal } = {}) => apiRequest('/checkout', { signal });

/**
 * POST /orders → 201 { orderId, status: 'pending_payment', total, currency, message, expiresInMinutes, devCode? }
 * body: { shipping: { fullName, phone, city, address }, card: { number, holder, expiry: 'MM/YY', cvc } }
 * The product list is NOT sent: the order is created from the server cart.
 */
export const createOrder = ({ shipping, card }) =>
  apiRequest('/orders', { method: 'POST', body: JSON.stringify({ shipping, card }) });

/** POST /orders/:id/confirm { code } → 200 { order } — the order becomes `paid`, the server clears the cart */
export const confirmOrder = ({ id, code }) =>
  apiRequest(`/orders/${encodeURIComponent(id)}/confirm`, { method: 'POST', body: JSON.stringify({ code }) });

/** POST /orders/:id/resend-code → { message, expiresInMinutes, devCode? }. Once per 30 s (429 RESEND_TOO_SOON). */
export const resendOrderCode = ({ id }) =>
  apiRequest(`/orders/${encodeURIComponent(id)}/resend-code`, { method: 'POST' });

/** GET /orders → { items: Order[] } — my orders, the newest first */
export const fetchOrders = ({ signal } = {}) => apiRequest('/orders', { signal });

/** GET /orders/:id → { order } (only your own orders — somebody else's id is 404) */
export const fetchOrder = ({ id, signal }) => apiRequest(`/orders/${encodeURIComponent(id)}`, { signal });
