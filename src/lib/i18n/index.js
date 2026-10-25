import './i18n'; // side effect: initialises i18next, so any importer of this barrel gets a ready instance
export { default as i18n } from './i18n';
export { LANG_KEY, DEFAULT_LANG, LANGUAGES, getInitialLang } from './config';
export { formatPriceI18n, formatDateI18n, formatRatingI18n, getCategoryName, getFilterOptionLabel } from './format';
