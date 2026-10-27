import { lazy } from 'react';
import { Navigate, Outlet, Route, Routes } from 'react-router-dom';
import AuthLayout from '@features/auth/components/AuthLayout/AuthLayout';
import ProtectedRoute from '@features/auth/components/ProtectedRoute/ProtectedRoute';
import Layout from './components/Layout/Layout';
import CatalogPage from './pages/CatalogPage/CatalogPage';
import StubPage from './pages/StubPage/StubPage';
import { useTranslation } from 'react-i18next';

/**
 * Route-level code splitting: only the layout and the catalog (the first screen) are in the
 * main bundle. Every other page is downloaded on first visit (<Suspense> is in <Layout />).
 * Pages are imported from their own files, not from the feature barrels (index.js), because a
 * barrel re-exports every page and would pull them all back into the main bundle.
 */
const FiltersPage = lazy(() => import('./pages/FiltersPage/FiltersPage'));
const ProductPage = lazy(() => import('./pages/ProductPage/ProductPage'));
const LoginPage = lazy(() => import('@features/auth/pages/LoginPage/LoginPage'));
const RegisterPage = lazy(() => import('@features/auth/pages/RegisterPage/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('@features/auth/pages/ForgotPasswordPage/ForgotPasswordPage'));
const AccountPage = lazy(() => import('@features/auth/pages/AccountPage/AccountPage'));
const CartPage = lazy(() => import('@features/cart/pages/CartPage/CartPage'));
const AddressesPage = lazy(() => import('@features/addresses/pages/AddressesPage'));
const CheckoutLayout = lazy(() => import('@features/checkout/pages/CheckoutLayout/CheckoutLayout'));
const AddressStep = lazy(() => import('@features/checkout/pages/AddressStep/AddressStep'));
const ShippingStep = lazy(() => import('@features/checkout/pages/ShippingStep/ShippingStep'));
const PaymentStep = lazy(() => import('@features/checkout/pages/PaymentStep/PaymentStep'));
const ConfirmPage = lazy(() => import('@features/checkout/pages/ConfirmPage/ConfirmPage'));
const OrderPage = lazy(() => import('@features/checkout/pages/OrderPage/OrderPage'));
const OrdersPage = lazy(() => import('@features/checkout/pages/OrdersPage/OrdersPage'));

/** Wrapper: reads i18n keys and passes translated text to StubPage. */
function TranslatedStub({ titleKey, textKey }) {
  const { t } = useTranslation();
  return <StubPage title={t(titleKey)} text={textKey ? t(textKey) : undefined} />;
}

/**
 * Routes
 *   /                  catalog (category, filters, sort, page, search live in the query string)
 *   /filters           mobile filters screen
 *   /product/:slug     product page
 *   /login /register /forgot-password   public auth screens
 *   /account           protected profile editor (FE-004) — redirects to /login without a valid token
 *   /cart              protected server cart (FE-005)
 *   /addresses         protected: my delivery addresses — add / edit / delete / default (FE-006, "Address" in the profile menu)
 *   /checkout          protected, → /checkout/address
 *   /checkout/address  step 1: choose (or add) a delivery address; a new user MUST add one to continue
 *   /checkout/shipping step 2: shipment method        (?address=<id> — the choice of step 1 lives in the URL)
 *   /checkout/payment  step 3: summary + card         → POST /orders
 *   /checkout/confirm/:orderId   the 6-digit code     → POST /orders/:id/confirm (orderId is in the URL: F5 keeps it)
 *   /orders            protected: my orders (history) — "Orders" in the profile menu, data from GET /orders
 *   /orders/:id        protected order confirmation page ("Thank you!"), data from GET /orders/:id
 *   /wishlist          placeholder (the API has no wishlist endpoints yet)
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
          path="addresses"
          element={
            <ProtectedRoute>
              <AddressesPage />
            </ProtectedRoute>
          }
        />

        {/* checkout: header and footer come from <Layout />, only the content of the step changes */}
        <Route
          path="checkout"
          element={
            <ProtectedRoute>
              <Outlet />
            </ProtectedRoute>
          }
        >
          <Route element={<CheckoutLayout />}>
            <Route index element={<Navigate to="address" replace />} />
            <Route path="address" element={<AddressStep />} />
            <Route path="shipping" element={<ShippingStep />} />
            <Route path="payment" element={<PaymentStep />} />
          </Route>
          {/* outside the layout: its guard sends an empty cart to /cart, and after paying the cart IS empty */}
          <Route path="confirm/:orderId" element={<ConfirmPage />} />
        </Route>

        <Route
          path="orders"
          element={
            <ProtectedRoute>
              <OrdersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="orders/:id"
          element={
            <ProtectedRoute>
              <OrderPage />
            </ProtectedRoute>
          }
        />

        <Route path="about" element={<TranslatedStub titleKey="stub.about" />} />
        <Route path="contact" element={<TranslatedStub titleKey="stub.contact" />} />
        <Route path="blog" element={<TranslatedStub titleKey="stub.blog" />} />
        <Route path="wishlist" element={<TranslatedStub titleKey="stub.wishlist" textKey="stub.wishlistText" />} />
        <Route
          path="*"
          element={<TranslatedStub titleKey="stub.notFound" textKey="stub.notFoundText" />}
        />
      </Route>
    </Routes>
  );
}
