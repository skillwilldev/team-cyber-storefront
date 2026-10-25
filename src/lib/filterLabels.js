/**
 * The API returns Georgian filter labels ("ბრენდი"), the UI needs i18n.
 * Known keys get a translated title via `t('filter.<key>')`; unknown keys fall back to the API label.
 * All titles live in locales/*.json (no text in code).
 */
export const getFilterTitle = (group, t) => {
  const translated = t(`filter.${group.key}`);
  // t() returns the key itself when there is no translation → use the API label
  return translated !== `filter.${group.key}` ? translated : (group.label ?? group.key);
};

// Swatch colors for the "color" filter type; unknown values get a neutral grey (the label is always shown too).
const COLOR_HEX = {
  natural: '#d8c3a5',
  white: '#f5f5f5',
  black: '#111111',
  grey: '#9a9a9a',
  gray: '#9a9a9a',
  silver: '#d4d4d8',
  gold: '#e6b422',
  brown: '#7b4b2a',
  blue: '#2f6fdb',
  green: '#3f9b5f',
  red: '#d94141',
  pink: '#f4a6c0',
  purple: '#7b2fbe',
  yellow: '#f2d13c',
  orange: '#f28c28',
  beige: '#e6d8bf',
};

export const getColorHex = (value) => COLOR_HEX[String(value).toLowerCase()] ?? '#cfcfcf';
