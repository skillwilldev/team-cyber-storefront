/**
 * Checkout URLs. The checkout state that must survive F5 lives in the URL (see ADR 0005):
 *   ?address=<id>   the delivery address picked on step 1 (the id only — never the card)
 *   :orderId        the pending order on the code screen
 */
export const CHECKOUT_STEPS = [
  { key: 'address', label: 'Address' },
  { key: 'shipping', label: 'Shipping' },
  { key: 'payment', label: 'Payment' },
];

/** /checkout/shipping?address=abc */
export const checkoutPath = (step, addressId) =>
  `/checkout/${step}${addressId ? `?address=${encodeURIComponent(addressId)}` : ''}`;

/** /checkout/confirm/ORDER?address=abc — `address` is kept only so that "Back" returns to the payment step with it */
export const confirmPath = (orderId, addressId) =>
  `/checkout/confirm/${encodeURIComponent(orderId)}${addressId ? `?address=${encodeURIComponent(addressId)}` : ''}`;

export const orderPath = (orderId) => `/orders/${encodeURIComponent(orderId)}`;
