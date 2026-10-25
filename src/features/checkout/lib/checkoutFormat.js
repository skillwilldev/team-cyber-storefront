import { formatPriceI18n } from '@/lib/i18n';
import { DEFAULT_LANG, INTL_LOCALES } from '@/lib/i18n/config';

/**
 * shippingFee 0 → t('checkout.free') ("Free" / "უფასო"), 5 → "₾5"
 * `lang` formats the number, `t` gives the word.
 */
export const formatShippingFee = (fee, currency, lang, t) =>
  Number(fee) === 0 ? t('checkout.free') : formatPriceI18n(fee, currency, lang);

/** How many days a regular shipment takes (display only — the API does not promise a date). */
export const REGULAR_SHIPMENT_DAYS = 5;

/** Date → locale-aware date string */
export function formatShipmentDate(date, lang = DEFAULT_LANG) {
  const locale = INTL_LOCALES[lang] ?? INTL_LOCALES[DEFAULT_LANG];
  const dayAndMonth = date.toLocaleDateString(locale, { day: 'numeric', month: 'short' });
  return `${dayAndMonth}, ${date.getFullYear()}`;
}

/** ISO string → locale-aware date-time */
export function formatDateTime(iso, lang = DEFAULT_LANG) {
  if (!iso) return '';
  const locale = INTL_LOCALES[lang] ?? INTL_LOCALES[DEFAULT_LANG];
  return new Date(iso).toLocaleString(locale, { dateStyle: 'medium', timeStyle: 'short' });
}

/** The server ids are long (cuid) — the customer sees the last 8 characters: "№ K9X2A7QD" */
export const shortOrderNumber = (id) => String(id).slice(-8).toUpperCase();

/** What is still missing for free delivery, or 0. (Only a difference of two server numbers — no price maths.) */
export function amountToFreeShipping({ subtotal, freeShippingFrom, shippingFee }) {
  if (!(Number(shippingFee) > 0) || !(Number(freeShippingFrom) > 0)) return 0;
  return Math.max(0, Math.round((freeShippingFrom - subtotal) * 100) / 100);
}
