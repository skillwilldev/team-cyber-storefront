/**
 * i18next setup (ADR 0007, updated: react-i18next instead of the home-made Context).
 *
 *   import '@/lib/i18n'                          once, in main.jsx (this file runs as a side effect)
 *   import { useTranslation } from 'react-i18next'   in components → const { t, i18n } = useTranslation()
 *   i18n.language                                'ka' | 'en'
 *   i18n.changeLanguage('en')                    switches the language, re-renders every component that uses the hook
 *
 * - Two JSON files (locales/ka.json, locales/en.json), same keys, one namespace (`translation`).
 * - Interpolation `{{name}}` and plurals `key_one` / `key_other` are the i18next defaults,
 *   so the JSON files did not change at all.
 * - The other language is the fallback; a missing key renders as the key itself.
 * - The language is saved in localStorage ('lang') only when it is CHANGED
 *   (a first-time visitor is not pinned to the default). index.html reads the same key before React starts.
 */
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import ka from '../../locales/ka.json';
import en from '../../locales/en.json';
import { DEFAULT_LANG, LANGUAGES, LANG_KEY, applyLang, getInitialLang } from './config';

/** <html lang> and <meta name="description"> follow the language (the <title> is just the brand name). */
function syncDocument(lang) {
  applyLang(lang);
  document.querySelector('meta[name="description"]')?.setAttribute('content', i18n.t('meta.description'));
}

i18n.use(initReactI18next).init({
  resources: { ka: { translation: ka }, en: { translation: en } },
  lng: getInitialLang(),
  supportedLngs: LANGUAGES,
  fallbackLng: { ka: ['en'], en: ['ka'], default: [DEFAULT_LANG] },
  nsSeparator: false, // keys are 'cart.title'; a ':' must never be read as a namespace
  interpolation: { escapeValue: false }, // React already escapes
  react: { useSuspense: false }, // resources are bundled, nothing to wait for
});

syncDocument(i18n.language);

i18n.on('languageChanged', (lang) => {
  try {
    localStorage.setItem(LANG_KEY, lang);
  } catch {
    /* storage blocked */
  }
  syncDocument(lang);
});

export default i18n;
