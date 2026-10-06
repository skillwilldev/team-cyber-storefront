import { Route, Routes } from 'react-router-dom';
import {
  AccountPage,
  AuthLayout,
  ForgotPasswordPage,
  LoginPage,
  ProtectedRoute,
  RegisterPage,
} from '@features/auth';
import { CartPage } from '@features/cart';
import Layout from './components/Layout/Layout';
import CatalogPage from './pages/CatalogPage/CatalogPage';
import FiltersPage from './pages/FiltersPage/FiltersPage';
import ProductPage from './pages/ProductPage/ProductPage';
import StubPage from './pages/StubPage/StubPage';

/**
 * Routes
 *   /                  catalog (category, filters, sort, page, search live in the query string)
 *   /filters           mobile filters screen
 *   /product/:slug     product page
 *   /login /register /forgot-password   public auth screens
 *   /account           protected profile editor (FE-004) — redirects to /login without a valid token
 *   /cart              protected server cart (FE-005)
 *   /checkout          protected placeholder until FE-006
 */
export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<CatalogPage />} />
        <Route path="filters" element={<FiltersPage />} />
        <Route path="product/:slug" element={<ProductPage />} />

        <Route element={<AuthLayout />}>
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
          <Route path="forgot-password" element={<ForgotPasswordPage />} />
        </Route>

        {/* wide card for the profile form, so it lives outside the narrow AuthLayout */}
        <Route
          path="account"
          element={
            <ProtectedRoute>
              <AccountPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="cart"
          element={
            <ProtectedRoute>
              <CartPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="checkout"
          element={
            <ProtectedRoute>
              <StubPage title="Checkout" text="Checkout is the next task (FE-006)." />
            </ProtectedRoute>
          }
        />

        <Route path="about" element={<StubPage title="About" />} />
        <Route path="contact" element={<StubPage title="Contact Us" />} />
        <Route path="blog" element={<StubPage title="Blog" />} />
        <Route
          path="*"
          element={<StubPage title="Page not found" text="The page you are looking for does not exist." />}
        />
      </Route>
    </Routes>
  );
}
