import { formatPrice } from '@/lib/format';

/** shippingFee 0 → "Free", 5 → "₾5" */
export const formatShippingFee = (fee, currency) => (Number(fee) === 0 ? 'Free' : formatPrice(fee, currency));

/** How many days a regular shipment takes (display only — the API does not promise a date). */
export const REGULAR_SHIPMENT_DAYS = 5;

/** Date → "18 Oct, 2026" (the format of the Shipment Method mockup) */
export function formatShipmentDate(date) {
  const dayAndMonth = date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  return `${dayAndMonth}, ${date.getFullYear()}`;
}

/** ISO string → "13 Oct 2026, 18:42" */
export function formatDateTime(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' });
}

/** The server ids are long (cuid) — the customer sees the last 8 characters: "№ K9X2A7QD" */
export const shortOrderNumber = (id) => String(id).slice(-8).toUpperCase();

/** What is still missing for free delivery, or 0. (Only a difference of two server numbers — no price maths.) */
export function amountToFreeShipping({ subtotal, freeShippingFrom, shippingFee }) {
  if (!(Number(shippingFee) > 0) || !(Number(freeShippingFrom) > 0)) return 0;
  return Math.max(0, Math.round((freeShippingFrom - subtotal) * 100) / 100);
}
