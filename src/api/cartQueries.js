import { queryOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import { addCartItem, fetchCart, removeCartItem, updateCartItem } from './cartApi';
import { queryKeys } from './queryKeys';

/** GET /cart. `enabled` (signed in?) is added by useCart(), because it depends on the auth state. */
export const cartQuery = () =>
  queryOptions({
    queryKey: queryKeys.cart.all,
    queryFn: ({ signal }) => fetchCart({ signal }),
  });

/**
 * Base of every cart mutation.
 *
 * - The server returns the WHOLE cart → we write the response straight into the ['cart'] cache entry.
 *   No extra GET /cart: the header badge, the cart page and checkout all re-render from the same data.
 * - onMutate cancels a GET /cart that may still be in flight, so its older response can't overwrite ours.
 * - scope: same scope id → TanStack Query runs these mutations ONE BY ONE, in the order they were made.
 *   Responses are applied in that order, so a stale answer can never be the last one written.
 * - 404 / 409 mean our picture of the cart (or of the stock) is outdated → reload it from the server.
 *
 * Callbacks passed here run even if the component that started the mutation is already unmounted.
 */
function useCartMutation(name, mutationFn) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: [...queryKeys.cart.all, name],
    scope: { id: 'cart' },
    mutationFn,
    onMutate: () => queryClient.cancelQueries({ queryKey: queryKeys.cart.all }),
    onSuccess: (cart) => queryClient.setQueryData(queryKeys.cart.all, cart),
    onError: (error) => {
      if (error?.status === 404 || error?.status === 409) {
        queryClient.invalidateQueries({ queryKey: queryKeys.cart.all });
      }
    },
  });
}

/** mutate({ productId, qty }) */
export const useAddCartItem = () => useCartMutation('add', addCartItem);

/** mutate({ id, qty }) — id is the cart LINE id (items[].id) */
export const useUpdateCartItem = () => useCartMutation('update', updateCartItem);

/** mutate({ id }) — id is the cart LINE id (items[].id) */
export const useRemoveCartItem = () => useCartMutation('remove', removeCartItem);
