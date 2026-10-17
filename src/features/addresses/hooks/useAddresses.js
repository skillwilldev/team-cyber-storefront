import { useQuery } from '@tanstack/react-query';
import { addressesQuery } from '@api/addressQueries';
import { useAuth } from '@features/auth/hooks/useAuth';

/**
 * THE source of truth for the saved addresses: the ['addresses'] entry of the TanStack Query cache.
 * The Address page and checkout step 1 read it through this hook — one request, one list.
 * Guests have no addresses: the request is not even sent. `data.items` — the default address is always first.
 */
export function useAddresses(options) {
  const { isAuthenticated } = useAuth();

  return useQuery({ ...addressesQuery(), enabled: isAuthenticated, ...options });
}
