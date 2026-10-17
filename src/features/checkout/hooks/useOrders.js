import { useQuery } from '@tanstack/react-query';
import { ordersQuery } from '@api/checkoutQueries';
import { useAuth } from '@features/auth/hooks/useAuth';

/** GET /orders → { items: Order[] } — the order history. Guests have none: the request is not sent. */
export function useOrders(options) {
  const { isAuthenticated } = useAuth();

  return useQuery({ ...ordersQuery(), enabled: isAuthenticated, ...options });
}
