import { queryOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import { createAddress, deleteAddress, fetchAddresses, updateAddress } from './addressApi';
import { queryKeys } from './queryKeys';

/** GET /addresses. `enabled` (signed in?) is added by useAddresses(), because it depends on the auth state. */
export const addressesQuery = () =>
  queryOptions({
    queryKey: queryKeys.addresses.all,
    queryFn: ({ signal }) => fetchAddresses({ signal }),
  });

/**
 * Base of every address mutation.
 *
 * Changing the default address changes OTHER addresses too (the old default loses the flag, the order of the list
 * changes), and deleting the default promotes another one. So after ANY change we reload the whole list from the
 * server instead of patching the cache by hand — the server is the single source of truth.
 * scope: same id → mutations run one by one, in the order they were made.
 */
function useAddressMutation(name, mutationFn) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: [...queryKeys.addresses.all, name],
    scope: { id: 'addresses' },
    mutationFn,
    onSettled: () => queryClient.invalidateQueries({ queryKey: queryKeys.addresses.all }),
  });
}

/** mutateAsync(body) → { address } */
export const useCreateAddress = () => useAddressMutation('create', createAddress);

/** mutateAsync({ id, ...changedFields }) → { address } */
export const useUpdateAddress = () => useAddressMutation('update', updateAddress);

/** mutateAsync({ id }) */
export const useDeleteAddress = () => useAddressMutation('delete', deleteAddress);
