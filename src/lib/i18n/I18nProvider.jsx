/**
 * Internationalization (i18n) — Georgian (default) + English.
 *
 * Architecture (src/lib/i18n/):
 *   config.js          languages, default language, localStorage key, Intl locales
 *   I18nContext.js     the React context
 *   I18nProvider.jsx   THIS FILE — the only one that exports a component (Fast Refresh rule)
 *   useTranslation.js  the hook: const { t, lang, setLang } = useTranslation()
 *   format.js          price / date / category / filter-label helpers
 *   index.js           re-exports everything, so `import … from '@/lib/i18n'` keeps working
 *
 *   - Two JSON files: locales/ka.json, locales/en.json (same keys).
 *   - Language stored in localStorage ('lang'), survives page refresh.
 *   - <html lang> is updated on every change.
 *   - No external libraries: Context + JSON is enough for 2 languages.
 *
 * Interpolation:
 *   t('cart.cartCount', { count: 5 })  →  "Cart (5)"
 *   The pattern is {{key}} in the JSON value.
 *
 * Plurals:
 *   When `count` is a number, t() first looks for `<key>_<category>` (Intl.PluralRules: one, other…),
 *   then `<key>_other`, then `<key>`.  t('orders.items', { count: 1 }) → orders.items_one
 *
 * See ADR 0007 for the full decision record.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import ka from '../../locales/ka.json';
import en from '../../locales/en.json';
import { DEFAULT_LANG, INTL_LOCALES, LANGUAGES, LANG_KEY, applyLang, getInitialLang } from './config';
import { I18nContext } from './I18nContext';

const MESSAGES = { ka, en };

const pluralRules = {};

/** 'one' | 'other' | … for this language (Intl.PluralRules, no library). */
function pluralCategory(lang, count) {
  const locale = INTL_LOCALES[lang] ?? INTL_LOCALES[DEFAULT_LANG];
  pluralRules[locale] ??= new Intl.PluralRules(locale);
  return pluralRules[locale].select(count);
}

/** 'cart.title' → messages.cart.title (a string) or undefined. */
function lookup(messages, key) {
  let value = messages;
  for (const part of key.split('.')) {
    if (value == null || typeof value !== 'object') return undefined;
    value = value[part];
  }
  return typeof value === 'string' ? value : undefined;
}

/** Plural-aware lookup in ONE language. */
function resolveKey(lang, key, params) {
  const messages = MESSAGES[lang];
  if (typeof params?.count === 'number') {
    const plural = lookup(messages, `${key}_${pluralCategory(lang, params.count)}`) ?? lookup(messages, `${key}_other`);
    if (plural !== undefined) return plural;
  }
  return lookup(messages, key);
}

export function I18nProvider({ children }) {
  const [lang, setLangState] = useState(getInitialLang);

  const setLang = useCallback((next) => {
    if (!LANGUAGES.includes(next)) return;
    setLangState(next);
    applyLang(next);
    try {
      localStorage.setItem(LANG_KEY, next);
    } catch {
      /* storage blocked */
    }
  }, []);

  /**
   * t('cart.addToCart')             → "კალათაში დამატება"
   * t('cart.cartCount', { count: 5 }) → "კალათა (5)"
   */
  const t = useCallback(
    (key, params) => {
      const current = MESSAGES[lang] ? lang : DEFAULT_LANG;
      const other = current === 'ka' ? 'en' : 'ka';
      // the other language is the fallback; the key itself is the last resort
      const value = resolveKey(current, key, params) ?? resolveKey(other, key, params);
      if (value === undefined) return key;
      if (!params) return value;
      return value.replace(/\{\{(\w+)\}\}/g, (_, k) => (params[k] !== undefined ? String(params[k]) : `{{${k}}}`));
    },
    [lang],
  );

  // <meta name="description"> follows the language too (the <title> is just the brand name)
  useEffect(() => {
    document.querySelector('meta[name="description"]')?.setAttribute('content', t('meta.description'));
  }, [t]);

  const value = useMemo(() => ({ lang, setLang, t }), [lang, setLang, t]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}
