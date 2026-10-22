import { Navigate, Outlet, useLocation } from 'react-router-dom';
import LoadingHint from '@/components/LoadingHint/LoadingHint';
import QueryError from '@/components/QueryError/QueryError';
import { useTranslation } from 'react-i18next';
import CheckoutStepper from '../../components/CheckoutStepper/CheckoutStepper';
import { useCheckout } from '../../hooks/useCheckout';
import { CHECKOUT_STEPS } from '../../lib/checkoutRoutes';
import './CheckoutPages.css';

/**
 * Frame of the 3 checkout steps (/checkout/address, /shipping, /payment).
 * The header and the footer come from the app Layout and never change — only the content of the step does.
 *
 *   GET /checkout    cart + totals. An empty cart (items: []) has nothing to buy → back to /cart.
 *   The route itself sits inside <ProtectedRoute> → a guest goes to /login and, after signing in, returns here.
 *
 * `refetchOnMount: 'always'` — entering checkout always asks the server again (stock and prices may have changed),
 * while the cached copy is shown immediately.
 */
export default function CheckoutLayout() {
  const { pathname } = useLocation();
  const { t } = useTranslation();
  const { data: checkout, isPending, isError, error, refetch } = useCheckout({ refetchOnMount: 'always' });
  const current = CHECKOUT_STEPS.find((step) => pathname.endsWith(`/${step.key}`))?.key ?? 'address';

  if (isPending) {
    return (
      <div className="container checkout" aria-busy="true">
        <LoadingHint />
        <div aria-hidden="true" className="checkout__skeleton">
          <span className="skeleton" style={{ height: 40 }} />
          <span className="skeleton" style={{ height: 320 }} />
        </div>
      </div>
    );
  }
  if (isError) return <QueryError message={error.message} onRetry={() => refetch()} />;
  if (checkout.items.length === 0) return <Navigate to="/cart" replace />;

  return (
    <>
      <title>{t('checkout.pageTitle')} — Cyber</title>
      <div className="container checkout">
        <CheckoutStepper current={current} />
        <Outlet />
      </div>
    </>
  );
}
