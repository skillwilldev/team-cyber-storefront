import { useCallback, useState } from 'react';
import { useAuth } from '@features/auth/hooks/useAuth';
import { ShopContext } from './ShopContext';

/**
 * Shop Context — cart and wishlist of the signed-in user.
 *
 * The API has no cart/wishlist endpoints yet, so the data lives in localStorage,
 * one record per user id: `shop:<userId>` → { cart: { [productId]: qty }, wishlist: [productId] }.
 * When the user signs out the state is empty; after the next sign-in it is restored.
 * Later this file can be switched to real API calls — components use only the hook (useShop).
 */

const EMPTY = { cart: {}, wishlist: [] };
const storageKey = (userId) => `shop:${userId}`;

function load(userId) {
  if (!userId) return EMPTY;
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey(userId)));
    return {
      cart: saved?.cart && typeof saved.cart === 'object' ? saved.cart : {},
      wishlist: Array.isArray(saved?.wishlist) ? saved.wishlist : [],
    };
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
    commit({ cart: state.cart, wishlist });
  };

  const addToCart = (productId) => {
    if (!userId) return;
    const id = String(productId);
    commit({ cart: { ...state.cart, [id]: (state.cart[id] ?? 0) + 1 }, wishlist: state.wishlist });
  };

  const value = {
    wishlistCount: state.wishlist.length,
    cartCount: Object.values(state.cart).reduce((sum, qty) => sum + qty, 0),
    isInWishlist: (productId) => state.wishlist.includes(String(productId)),
    toggleWishlist,
    addToCart,
  };

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
}
