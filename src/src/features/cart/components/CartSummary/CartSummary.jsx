import { Link } from 'react-router-dom';
import { formatPrice } from '@/lib/format';
import './CartSummary.css';

/** Totals come from the server (`totalQty`, `subtotal`). Checkout is blocked while any line has a stock problem. */
export default function CartSummary({ totalQty, subtotal, currency, hasStockIssues }) {
  return (
    <aside className="cart-summary" aria-labelledby="cart-summary-title">
      <h2 id="cart-summary-title">Order Summary</h2>

      <dl>
        <div>
          <dt>Items</dt>
          <dd>{totalQty}</dd>
        </div>
        <div className="cart-summary__subtotal">
          <dt>Subtotal</dt>
          <dd aria-live="polite">{formatPrice(subtotal, currency)}</dd>
        </div>
      </dl>

      <p className="cart-summary__note">Delivery cost is calculated at checkout.</p>

      {hasStockIssues ? (
        <>
          <p className="cart-summary__warn" id="cart-summary-warn">
            Some items are out of stock or exceed the available quantity. Fix them to continue.
          </p>
          <button type="button" className="cart-summary__btn" disabled aria-describedby="cart-summary-warn">
            Go to Checkout
          </button>
        </>
      ) : (
        <Link to="/checkout" className="cart-summary__btn">
          Go to Checkout
        </Link>
      )}
    </aside>
  );
}
