/**
 * The API returns Georgian filter labels ("ბრენდი"), the UI is English.
 * Known keys get an English title, unknown keys (other categories) fall back to the API label.
 */
const FILTER_TITLES = {
  brand: 'Brand',
  price: 'Price',
  storage: 'Built-in memory',
  ram: 'RAM',
  color: 'Color',
  os: 'Operating system',
  type: 'Type',
  material: 'Material',
  size: 'Size',
  gender: 'Gender',
  season: 'Season',
  availability: 'Availability',
};

export const getFilterTitle = (group) => FILTER_TITLES[group.key] ?? group.label ?? group.key;

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
