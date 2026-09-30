const CURRENCY_SYMBOLS = { GEL: '₾', USD: '$', EUR: '€' };

/** 1510, 'GEL' → "₾1,510" */
export function formatPrice(value, currency = 'GEL') {
  const symbol = CURRENCY_SYMBOLS[currency] ?? `${currency} `;

  return `${symbol}${Number(value).toLocaleString('en-US')}`;
}

/** 12 → "1 year", 24 → "2 years", 6 → "6 months" */
export function formatWarranty(months) {
  if (!months) return '—';
  if (months % 12 === 0) {
    const years = months / 12;
    return `${years} year${years > 1 ? 's' : ''}`;
  }

  return `${months} months`;
}
