import { DEFAULT_LANG, INTL_LOCALES } from './config';

// ─── Locale-aware formatters ────────────────────────────────────────────────

const priceFormatters = {};

/**
 * Format a price according to the current language.
 *   formatPriceI18n(1510, 'GEL', 'ka') → "1 510,00 ₾"  or  "₾1,510.00"
 * Uses Intl.NumberFormat (browser-native, no library needed).
 */
export function formatPriceI18n(value, currency = 'GEL', lang = DEFAULT_LANG) {
  const locale = INTL_LOCALES[lang] ?? INTL_LOCALES[DEFAULT_LANG];
  // whole prices stay clean (₾1,510); fractions keep two digits (₾1,510.50)
  const digits = Number.isInteger(Number(value)) ? 0 : 2;
  const key = `${locale}-${currency}-${digits}`;
  if (!priceFormatters[key]) {
    const currencyCode = currency === 'GEL' ? 'GEL' : currency;
    try {
      priceFormatters[key] = new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: currencyCode,
        currencyDisplay: 'narrowSymbol', // en-US would print "GEL 1,510" otherwise; we want "₾1,510"
        minimumFractionDigits: digits,
        maximumFractionDigits: digits,
      });
    } catch {
      // fallback
      priceFormatters[key] = { format: (v) => `₾${Number(v).toLocaleString(locale)}` };
    }
  }
  return priceFormatters[key].format(Number(value));
}

/**
 * Format a date according to the current language.
 */
export function formatDateI18n(dateStr, lang = DEFAULT_LANG) {
  const locale = INTL_LOCALES[lang] ?? INTL_LOCALES[DEFAULT_LANG];
  try {
    return new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(dateStr));
  } catch {
    return dateStr;
  }
}

/**
 * Get the category name in the current language.
 * The API gives `name` (Georgian) and `nameEn` (English).
 */
export function getCategoryName(category, lang = DEFAULT_LANG) {
  if (!category) return '';
  if (lang === 'en') return category.nameEn || category.name || '';
  return category.name || '';
}

/**
 * Get the filter option label in the current language.
 * The API filter options have `label` (Georgian) and `value` (English slug).
 * For English, we use the `value` as it is already in English.
 * Brand names stay as-is in both languages.
 */
export function getFilterOptionLabel(option, filterKey, lang = DEFAULT_LANG) {
  if (!option) return '';
  // Brand names are the same in both languages
  if (filterKey === 'brand') return option.label || option.value || '';
  if (lang === 'en') {
    // value is English: capitalize first letter for display
    const v = option.value || '';
    return v.charAt(0).toUpperCase() + v.slice(1);
  }
  return option.label || option.value || '';
}

const ratingFormatters = {};

/**
 * Rating with one decimal, locale-aware: 4.5 → "4.5" (en) / "4,5" (ka).
 */
export function formatRatingI18n(value, lang = DEFAULT_LANG) {
  const locale = INTL_LOCALES[lang] ?? INTL_LOCALES[DEFAULT_LANG];
  ratingFormatters[locale] ??= new Intl.NumberFormat(locale, { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  return ratingFormatters[locale].format(Number(value ?? 0));
}
