/** i18n settings and the pure helpers around them (no React). */

export const LANG_KEY = 'lang';
export const DEFAULT_LANG = 'ka';
export const LANGUAGES = ['ka', 'en'];

/**
 * BCP-47 locale tag for Intl formatters.
 * Georgian prices: 1 234,56 ₾   English prices: ₾1,234.56
 */
export const INTL_LOCALES = { ka: 'ka-GE', en: 'en-US' };

/** Read the saved language or fall back to default. */
function readStoredLang() {
  try {
    const value = localStorage.getItem(LANG_KEY);
    return LANGUAGES.includes(value) ? value : null;
  } catch {
    return null;
  }
}

/** Get the initial language (before React renders). */
export function getInitialLang() {
  return readStoredLang() ?? DEFAULT_LANG;
}

/** Set <html lang> (and [dir] if a RTL language is ever added). */
export function applyLang(lang) {
  document.documentElement.lang = lang;
}
