import { formatPrice } from '@/lib/format';
import { amountToFreeShipping, formatShippingFee } from '../../lib/checkoutFormat';
import './OrderSummary.css';

/**
 * "Summary" card of step 3: products, address, shipment method and totals.
 * Every number is the server's (`GET /checkout`) — nothing is calculated in the browser.
 * (The mockup also shows "Estimated tax"; the API has no tax, so the card shows only what the API really charges.)
 */
export default function OrderSummary({ checkout, address }) {
  const { items, subtotal, shippingFee, total, currency, freeShippingFrom } = checkout;
  const missing = amountToFreeShipping({ subtotal, freeShippingFrom, shippingFee });

  return (
    <aside className="order-summary" aria-labelledby="order-summary-title">
      <h2 id="order-summary-title" className="order-summary__title">
        Summary
      </h2>

      <ul className="order-summary__items">
        {items.map((item) => (
          <li key={item.id} className="order-summary__item">
            <img src={item.product.image} alt="" width="40" height="40" loading="lazy" />
            <span className="order-summary__name">
              {item.product.title}
              {item.qty > 1 && <span className="order-summary__qty"> × {item.qty}</span>}
            </span>
            <b className="order-summary__price">{formatPrice(item.lineTotal, currency)}</b>
          </li>
        ))}
      </ul>

      <dl className="order-summary__info">
        <div>
          <dt>Address</dt>
          <dd>
            {address.address}, {address.city}
          </dd>
        </div>
        <div>
          <dt>Shipment method</dt>
          <dd>{formatShippingFee(shippingFee, currency)}</dd>
        </div>
      </dl>

      <dl className="order-summary__totals">
        <div className="order-summary__row order-summary__row--strong">
          <dt>Subtotal</dt>
          <dd>{formatPrice(subtotal, currency)}</dd>
        </div>
        <div className="order-summary__row">
          <dt>Shipping &amp; Handling</dt>
          <dd>{formatShippingFee(shippingFee, currency)}</dd>
        </div>
        <div className="order-summary__row order-summary__row--strong order-summary__row--total">
          <dt>Total</dt>
          <dd>{formatPrice(total, currency)}</dd>
        </div>
      </dl>

      {missing > 0 && (
        <p className="order-summary__hint">Add {formatPrice(missing, currency)} more and the delivery is free.</p>
      )}
    </aside>
  );
}
