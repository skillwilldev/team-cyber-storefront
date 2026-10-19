import { queryOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import { confirmOrder, createOrder, fetchCheckout, fetchOrder, fetchOrders, resendOrderCode } from './checkoutApi';
import { queryKeys } from './queryKeys';

/** GET /checkout. `enabled` is added by useCheckout() (signed in?). */
export const checkoutQuery = () =>
  queryOptions({
    queryKey: queryKeys.checkout.all,
    queryFn: ({ signal }) => fetchCheckout({ signal }),
  });

/** GET /orders — the order history of the signed-in user */
export const ordersQuery = () =>
  queryOptions({
    queryKey: queryKeys.orders.list,
    queryFn: ({ signal }) => fetchOrders({ signal }),
  });

/** GET /orders/:id */
export const orderQuery = (id) =>
  queryOptions({
    queryKey: queryKeys.orders.detail(id),
    queryFn: ({ signal }) => fetchOrder({ id, signal }),
  });

/** mutateAsync({ shipping, card }) → { orderId, ... }. A declined card is an ApiError (402), not a success. */
export const useCreateOrder = () => useMutation({ mutationKey: ['orders', 'create'], mutationFn: createOrder });

/**
 * mutateAsync({ id, code }) → { order }.
 * On success the server has charged (simulated) and cleared the cart — the browser must forget its copy too:
 * the header badge reads ['cart'], so it is set to an empty cart right away; the checkout copy is dropped.
 */
export function useConfirmOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['orders', 'confirm'],
    mutationFn: confirmOrder,
    onSuccess: ({ order }) => {
      queryClient.setQueryData(queryKeys.cart.all, {
        items: [],
        totalQty: 0,
        subtotal: 0,
        currency: order.currency,
      });
      queryClient.removeQueries({ queryKey: queryKeys.checkout.all });
      queryClient.setQueryData(queryKeys.orders.detail(order.id), { order });
      // a new paid order appeared: the history must be re-read, not shown from the 1-minute cache
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.list });
    },
  });
}

/** mutateAsync({ id }) */
export const useResendOrderCode = () => useMutation({ mutationKey: ['orders', 'resend'], mutationFn: resendOrderCode });
