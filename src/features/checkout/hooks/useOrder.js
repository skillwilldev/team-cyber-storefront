import { useQuery } from '@tanstack/react-query';
import { orderQuery } from '@api/checkoutQueries';
import { useAuth } from '@features/auth/hooks/useAuth';

/** GET /orders/:id → { order }. Works after F5: the data comes from the server, not from the previous page. */
export function useOrder(id, options) {
  const { isAuthenticated } = useAuth();

  return useQuery({ ...orderQuery(id), enabled: isAuthenticated && Boolean(id), ...options });
}
