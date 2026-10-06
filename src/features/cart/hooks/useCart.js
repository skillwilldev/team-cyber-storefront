import { useQuery } from '@tanstack/react-query';
import { cartQuery } from '@api/cartQueries';
import { useAuth } from '@features/auth/hooks/useAuth';

/**
 * THE source of truth for the cart: the ['cart'] entry of the TanStack Query cache.
 * Header badge, cart page and checkout all read it through this hook — one request, one number.
 * Guests have no cart: the request is not even sent. `options` e.g. { refetchOnMount: 'always' }.
 */
export function useCart(options) {
  const { isAuthenticated } = useAuth();

  return useQuery({ ...cartQuery(), enabled: isAuthenticated, ...options });
}
