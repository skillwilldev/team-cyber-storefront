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
 * See ADR 0007 for the full decision record.
 */

import { useCallback, useMemo, useState } from 'react';
import ka from '../../locales/ka.json';
import en from '../../locales/en.json';
import { DEFAULT_LANG, LANGUAGES, LANG_KEY, applyLang, getInitialLang } from './config';
import { I18nContext } from './I18nContext';

const MESSAGES = { ka, en };

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
      const messages = MESSAGES[lang] ?? MESSAGES[DEFAULT_LANG];
      const parts = key.split('.');
      let value = messages;
      for (const p of parts) {
        if (value == null || typeof value !== 'object') { value = undefined; break; }
        value = value[p];
      }
      if (typeof value !== 'string') {
        // fallback: try the other language
        let fb = MESSAGES[lang === 'ka' ? 'en' : 'ka'];
        for (const p of parts) {
          if (fb == null || typeof fb !== 'object') { fb = undefined; break; }
          fb = fb[p];
        }
        if (typeof fb === 'string') value = fb;
        else return key; // key itself as last resort
      }
      if (params) {
        return value.replace(/\{\{(\w+)\}\}/g, (_, k) => (params[k] !== undefined ? String(params[k]) : `{{${k}}}`));
      }
      return value;
    },
    [lang],
  );

  const value = useMemo(() => ({ lang, setLang, t }), [lang, setLang, t]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}
