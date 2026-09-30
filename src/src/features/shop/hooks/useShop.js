import { useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@features/auth/hooks/useAuth';
import { ShopContext } from '../context/ShopContext';

/**
 * Cart + wishlist for components. Must be used inside <BrowserRouter>.
 * Guests can't add anything: the action sends them to /login and brings them back afterwards.
 */
export function useShop() {
  const shop = useContext(ShopContext);
  if (!shop) {
    throw new Error('useShop must be used within a ShopProvider');
  }
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const goToLogin = () => navigate('/login', { state: { from: location } });

  return {
    ...shop,
    toggleWishlist: (productId) => (isAuthenticated ? shop.toggleWishlist(productId) : goToLogin()),
    addToCart: (productId) => (isAuthenticated ? shop.addToCart(productId) : goToLogin()),
  };
}
