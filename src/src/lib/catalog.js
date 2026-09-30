/**
 * Catalog state ⇄ URL ⇄ API query.
 *
 * URL (shareable, "Back" works, refresh keeps everything):
 *   /?category=smartphones&brand=Apple,Samsung&storage=256gb&minPrice=500&maxPrice=3000&inStock=true&sort=price-asc&page=2&q=pro
 * Multiple values of one filter are comma-separated — exactly as the API expects them.
 */

export const DEFAULT_CATEGORY = 'smartphones';
export const DEFAULT_SORT = 'rating-desc';

export const SORT_OPTIONS = [
  { value: 'rating-desc', label: 'By rating' },
  { value: 'price-asc', label: 'Price: low to high' },
  { value: 'price-desc', label: 'Price: high to low' },
  { value: 'newest', label: 'Newest first' },
  { value: 'popular', label: 'Most popular' },
  { value: 'title-asc', label: 'Name: A to Z' },
];

/** Not a category attribute: maps to the API flags `inStock=true` / `onSale=true`. */
export const AVAILABILITY_KEY = 'availability';
export const AVAILABILITY_GROUP = {
  key: AVAILABILITY_KEY,
  label: 'Availability',
  type: 'checkbox',
  options: [
    { value: 'inStock', label: 'In stock' },
    { value: 'onSale', label: 'On sale' },
  ],
};

// URL params that are NOT attribute filters
const RESERVED = ['q', 'sort', 'page', 'category', 'minPrice', 'maxPrice', 'inStock', 'onSale', 'minRating'];
const SAFE_KEY = /^[a-z][\w-]*$/i;

const splitList = (value) => value.split(',').map((v) => v.trim()).filter(Boolean);
const toNumber = (value) => {
  if (value === null || value === '') return null;
  const n = Number(value);

  return Number.isFinite(n) && n >= 0 ? n : null;
};

export const emptyFilters = () => ({ [AVAILABILITY_KEY]: [], minPrice: null, maxPrice: null });

/** URLSearchParams → { q, sort, page, category, filters } */
export function parseParams(sp) {
  const filters = emptyFilters();

  for (const [key, value] of sp.entries()) {
    if (RESERVED.includes(key) || key === AVAILABILITY_KEY || !SAFE_KEY.test(key)) continue;
    filters[key] = [...(Object.hasOwn(filters, key) ? filters[key] : []), ...splitList(value)];
  }
  if (sp.get('inStock') === 'true') filters[AVAILABILITY_KEY].push('inStock');
  if (sp.get('onSale') === 'true') filters[AVAILABILITY_KEY].push('onSale');
  filters.minPrice = toNumber(sp.get('minPrice'));
  filters.maxPrice = toNumber(sp.get('maxPrice'));

  const sort = sp.get('sort');
  const page = parseInt(sp.get('page') ?? '1', 10);

  return {
    q: sp.get('q') ?? '',
    category: sp.get('category') || DEFAULT_CATEGORY,
    sort: SORT_OPTIONS.some((o) => o.value === sort) ? sort : DEFAULT_SORT,
    page: Number.isFinite(page) && page > 0 ? page : 1,
    filters,
  };
}

/** { q, sort, page, category, filters } → URLSearchParams (defaults are omitted to keep the URL short) */
export function toSearchParams({ q, sort, page, category, filters }) {
  const sp = new URLSearchParams();
  if (category && category !== DEFAULT_CATEGORY) sp.set('category', category);
  if (q) sp.set('q', q);
  if (sort !== DEFAULT_SORT) sp.set('sort', sort);
  if (page > 1) sp.set('page', String(page));

  Object.entries(filters).forEach(([key, values]) => {
    if (key === 'minPrice' || key === 'maxPrice' || key === AVAILABILITY_KEY) return;
    if (Array.isArray(values) && values.length > 0) sp.set(key, values.join(','));
  });
  if (filters.minPrice !== null) sp.set('minPrice', String(filters.minPrice));
  if (filters.maxPrice !== null) sp.set('maxPrice', String(filters.maxPrice));
  if (filters[AVAILABILITY_KEY]?.includes('inStock')) sp.set('inStock', 'true');
  if (filters[AVAILABILITY_KEY]?.includes('onSale')) sp.set('onSale', 'true');

  return sp;
}

/** Catalog state → query object for GET /products (this object is also the TanStack Query key). */
export function toApiQuery({ q, sort, page, category, filters }, { limit }) {
  const query = { category, sort, page, limit };
  if (q) query.q = q;

  Object.entries(filters).forEach(([key, values]) => {
    if (key === 'minPrice' || key === 'maxPrice' || key === AVAILABILITY_KEY) return;
    if (Array.isArray(values) && values.length > 0) query[key] = values.join(',');
  });
  if (filters.minPrice !== null) query.minPrice = filters.minPrice;
  if (filters.maxPrice !== null) query.maxPrice = filters.maxPrice;
  if (filters[AVAILABILITY_KEY]?.includes('inStock')) query.inStock = true;
  if (filters[AVAILABILITY_KEY]?.includes('onSale')) query.onSale = true;

  return query;
}

export function countActiveFilters(filters) {
  const lists = Object.entries(filters)
    .filter(([key]) => key !== 'minPrice' && key !== 'maxPrice')
    .reduce((sum, [, values]) => sum + values.length, 0);

  return lists + (filters.minPrice !== null ? 1 : 0) + (filters.maxPrice !== null ? 1 : 0);
}
