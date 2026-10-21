import { formatPriceI18n } from '@/lib/i18n';

/**
 * shippingFee 0 → "Free" / "უფასო", 5 → "₾5"
 * Accepts `lang` for i18n-aware formatting.
 */
export const formatShippingFee = (fee, currency, lang) =>
  Number(fee) === 0
    ? (lang === 'ka' ? 'უფასო' : 'Free')
    : formatPriceI18n(fee, currency, lang);

/** How many days a regular shipment takes (display only — the API does not promise a date). */
export const REGULAR_SHIPMENT_DAYS = 5;

/** Date → locale-aware date string */
export function formatShipmentDate(date, lang = 'ka') {
  const locale = lang === 'ka' ? 'ka-GE' : 'en-GB';
  const dayAndMonth = date.toLocaleDateString(locale, { day: 'numeric', month: 'short' });
  return `${dayAndMonth}, ${date.getFullYear()}`;
}

/** ISO string → locale-aware date-time */
export function formatDateTime(iso, lang = 'ka') {
  if (!iso) return '';
  const locale = lang === 'ka' ? 'ka-GE' : 'en-GB';
  return new Date(iso).toLocaleString(locale, { dateStyle: 'medium', timeStyle: 'short' });
}

/** The server ids are long (cuid) — the customer sees the last 8 characters: "№ K9X2A7QD" */
export const shortOrderNumber = (id) => String(id).slice(-8).toUpperCase();

/** What is still missing for free delivery, or 0. (Only a difference of two server numbers — no price maths.) */
export function amountToFreeShipping({ subtotal, freeShippingFrom, shippingFee }) {
  if (!(Number(shippingFee) > 0) || !(Number(freeShippingFrom) > 0)) return 0;
  return Math.max(0, Math.round((freeShippingFrom - subtotal) * 100) / 100);
}
