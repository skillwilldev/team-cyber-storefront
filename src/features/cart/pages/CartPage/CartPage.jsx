import { Link } from 'react-router-dom';
import LoadingHint from '@/components/LoadingHint/LoadingHint';
import QueryError from '@/components/QueryError/QueryError';
import CartLine from '../../components/CartLine/CartLine';
import CartSummary from '../../components/CartSummary/CartSummary';
import { useCart } from '../../hooks/useCart';
import { getStockIssue } from '../../lib/cartRules';
import './CartPage.css';

function CartSkeleton() {
  return (
    <div className="container cart-page" aria-busy="true">
      <LoadingHint />
      <div aria-hidden="true">
        <span className="skeleton" style={{ height: 40, width: 240 }} />
        <div className="cart-page__layout">
          <div className="cart-page__list">
            <span className="skeleton" style={{ height: 128 }} />
            <span className="skeleton" style={{ height: 128 }} />
          </div>
          <span className="skeleton" style={{ height: 240 }} />
        </div>
      </div>
    </div>
  );
}

function CartEmpty() {
  return (
    <div className="cart-empty">
      <h2>Your cart is empty</h2>
      <p>Add something you like and it will show up here.</p>
      <Link to="/">Back to catalog</Link>
    </div>
  );
}

/**
 * /cart (protected). The cart is read from the shared ['cart'] cache entry — the same one the header badge uses.
 * `refetchOnMount: 'always'`: opening the page always checks the server again (stock may have changed),
 * while the cached cart is shown immediately.
 */
export default function CartPage() {
  const { data: cart, isPending, isError, error, refetch } = useCart({ refetchOnMount: 'always' });

  if (isPending) return <CartSkeleton />;
  if (isError) return <QueryError message={error.message} onRetry={() => refetch()} />;

  const { items, totalQty, subtotal, currency } = cart;
  const hasStockIssues = items.some((item) => getStockIssue(item) !== null);

  return (
    <>
      <title>Cart — Cyber</title>
      <div className="container cart-page">
        <h1 className="cart-page__title">
          Shopping Cart{totalQty > 0 && <span> ({totalQty})</span>}
        </h1>

        {items.length === 0 ? (
          <CartEmpty />
        ) : (
          <div className="cart-page__layout">
            <ul className="cart-page__list">
              {items.map((item) => (
                <CartLine key={item.id} item={item} />
              ))}
            </ul>
            <CartSummary
              totalQty={totalQty}
              subtotal={subtotal}
              currency={currency}
              hasStockIssues={hasStockIssues}
            />
          </div>
        )}
      </div>
    </>
  );
}
