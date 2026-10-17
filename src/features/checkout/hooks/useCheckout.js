import { useQuery } from '@tanstack/react-query';
import { checkoutQuery } from '@api/checkoutQueries';
import { useAuth } from '@features/auth/hooks/useAuth';

/**
 * GET /checkout — the cart with totals (subtotal, shippingFee, total) from the server.
 * Read by the layout (guard) and by every step: one request, the same numbers everywhere.
 * `options` e.g. { refetchOnMount: 'always' }.
 */
export function useCheckout(options) {
  const { isAuthenticated } = useAuth();

  return useQuery({ ...checkoutQuery(), enabled: isAuthenticated, ...options });
}
