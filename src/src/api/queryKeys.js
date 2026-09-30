/**
 * Query keys = the "address" of data in the cache.
 * Same key → same cache entry. Key contains every value the request depends on,
 * so when a filter/page/sort changes the key changes and TanStack Query fetches (or reuses) the right data.
 */
export const queryKeys = {
  categories: {
    all: ['categories'],
    detail: (slug) => ['categories', slug],
  },
  products: {
    list: (query) => ['products', 'list', query],
    detail: (slug) => ['products', 'detail', slug],
  },
};
