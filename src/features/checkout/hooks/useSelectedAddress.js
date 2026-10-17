import { useSearchParams } from 'react-router-dom';
import { useAddresses } from '@features/addresses';

/**
 * The delivery address chosen on step 1: its id lives in the URL (`?address=<id>`), the data comes from ['addresses'].
 * So F5 on step 2 / 3 keeps the choice, and an id that no longer exists (deleted in another tab)
 * simply gives `address: null` → the step sends the user back to step 1.
 */
export function useSelectedAddress() {
  const [searchParams] = useSearchParams();
  const { data, isPending, isError, error, refetch } = useAddresses();
  const id = searchParams.get('address');
  const address = data?.items.find((item) => item.id === id) ?? null;

  return { address, isPending, isError, error, refetch };
}
