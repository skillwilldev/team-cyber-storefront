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
  // the cart of the signed-in user: ONE entry, read by the header badge, the cart page and checkout
  cart: {
    all: ['cart'],
  },
  // saved delivery addresses (FE-004 / FE-006): read by the Address page AND by checkout step 1
  addresses: {
    all: ['addresses'],
  },
  // GET /checkout: cart + totals incl. shipping fee (FE-006)
  checkout: {
    all: ['checkout'],
  },
  // orders (FE-006): one entry per order, so the confirmation page survives F5
  orders: {
    all: ['orders'],
    list: ['orders', 'list'],
    detail: (id) => ['orders', 'detail', id],
  },
};

/** Everything that belongs to the signed-in user and must never leak to the next person of this browser. */
export const PRIVATE_QUERY_KEYS = [
  queryKeys.cart.all,
  queryKeys.addresses.all,
  queryKeys.checkout.all,
  queryKeys.orders.all,
];
