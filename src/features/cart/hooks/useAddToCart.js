import { useNavigate } from 'react-router-dom';
import { useAddCartItem } from '@api/cartQueries';
import { useAuth } from '@features/auth/hooks/useAuth';
import { useToast } from '@shared/ui';
import { getCartErrorMessage } from '../lib/cartErrors';

/**
 * "Add to cart" for a product card / product page.
 *
 *   const { addToCart, isAdding } = useAddToCart();
 *   <button disabled={!product.inStock || isAdding} onClick={() => addToCart(product)}>
 *
 * - guest (or 401 UNAUTHORIZED) → /login, and after signing in the user comes back to THIS product page
 * - success → the badge updates by itself (cache) + toast
 * - 409 / 404 → toast with the reason ("Only 3 in stock", "This product no longer exists")
 * Needs product.id (NOT slug!) and product.slug.
 */
export function useAddToCart() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const add = useAddCartItem();

  const goToLogin = (slug) => navigate('/login', { state: { from: { pathname: `/product/${slug}` } } });

  const addToCart = (product, qty = 1) => {
    if (!isAuthenticated) {
      goToLogin(product.slug);
      return;
    }
    if (add.isPending || product.inStock === false) return;

    add.mutate(
      { productId: product.id, qty },
      {
        onSuccess: () => toast.success('Added to cart'),
        onError: (error) => {
          if (error.status === 401) goToLogin(product.slug);
          else toast.error(getCartErrorMessage(error));
        },
      },
    );
  };

  return { addToCart, isAdding: add.isPending };
}
