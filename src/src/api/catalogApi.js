import { apiRequest } from '@shared/api/apiClient';

/**
 * Plain request functions — they know nothing about React or TanStack Query.
 * Catalog is public (`auth: false`). `signal` lets TanStack Query cancel outdated requests.
 */
const get = (path, signal) => apiRequest(path, { auth: false, signal });

/** GET /categories → { items: [...] } */
export const fetchCategories = ({ signal } = {}) => get('/categories', signal);

/** GET /categories/{slug} → category + `filters` array (brand, price, attributes...) */
export const fetchCategory = (slug, { signal } = {}) => get(`/categories/${encodeURIComponent(slug)}`, signal);

/** GET /products?category=&brand=&minPrice=&sort=&page=&limit=&q=... → { items, total, page, limit, totalPages, sort } */
export function fetchProducts(query, { signal } = {}) {
  const sp = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') sp.set(key, String(value));
  });

  return get(`/products?${sp.toString()}`, signal);
}

/** GET /products/{slug} → full product + `related` (8 similar) */
export const fetchProduct = (slug, { signal } = {}) => get(`/products/${encodeURIComponent(slug)}`, signal);
