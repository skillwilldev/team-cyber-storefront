/**
 * Barrel export for cart feature (server cart: TanStack Query ['cart']).
 * The request layer lives in src/api/cartApi.js + cartQueries.js.
 */
export { default as CartPage } from './pages/CartPage/CartPage';
export { useCart } from './hooks/useCart';
export { useAddToCart } from './hooks/useAddToCart';
