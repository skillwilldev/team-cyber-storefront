import { useCallback, useState } from 'react';
import { useAuth } from '@features/auth/hooks/useAuth';
import { ShopContext } from './ShopContext';

/**
 * Shop Context — the WISHLIST of the signed-in user.
 *
 * The cart is NOT here any more: it lives on the server and is read through TanStack Query
 * (see src/api/cartQueries.js and src/features/cart). The API has no wishlist endpoints yet,
 * so the wishlist stays in localStorage, one record per user id: `shop:<userId>` → { wishlist: [productId] }.
 * When the user signs out the state is empty; after the next sign-in it is restored.
 */

const EMPTY = { wishlist: [] };
const storageKey = (userId) => `shop:${userId}`;

function load(userId) {
  if (!userId) return EMPTY;
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey(userId)));
    return { wishlist: Array.isArray(saved?.wishlist) ? saved.wishlist : [] };
  } catch {
    return EMPTY;
  }
}

function save(userId, data) {
  try {
    localStorage.setItem(storageKey(userId), JSON.stringify(data));
  } catch {
    // storage is full or blocked — the state still works until the page is reloaded
  }
}

export function ShopProvider({ children }) {
  const { user } = useAuth();
  const userId = user?.id ?? null;

  const [state, setState] = useState(() => ({ ownerId: userId, ...load(userId) }));

  // The user changed (sign in / sign out / session restored) → load that user's data
  if (state.ownerId !== userId) {
    setState({ ownerId: userId, ...load(userId) });
  }

  const commit = useCallback(
    (next) => {
      setState({ ownerId: userId, ...next });
      save(userId, next);
    },
    [userId],
  );

  const toggleWishlist = (productId) => {
    if (!userId) return;
    const id = String(productId);
    const wishlist = state.wishlist.includes(id)
      ? state.wishlist.filter((x) => x !== id)
      : [...state.wishlist, id];
    commit({ wishlist });
  };

  const value = {
    wishlistCount: state.wishlist.length,
    isInWishlist: (productId) => state.wishlist.includes(String(productId)),
    toggleWishlist,
  };

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
}
