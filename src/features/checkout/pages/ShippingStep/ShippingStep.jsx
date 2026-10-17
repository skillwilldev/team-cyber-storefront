import { useId, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import ActionButton from '@/components/ActionButton/ActionButton';
import QueryError from '@/components/QueryError/QueryError';
import { formatPrice } from '@/lib/format';
import { useCheckout } from '../../hooks/useCheckout';
import { useSelectedAddress } from '../../hooks/useSelectedAddress';
import {
  REGULAR_SHIPMENT_DAYS,
  amountToFreeShipping,
  formatShipmentDate,
  formatShippingFee,  
} from '../../lib/checkoutFormat';
import { checkoutPath } from '../../lib/checkoutRoutes';
import './ShippingStep.css';

/**
 * Step 2 — Shipment Method.
 *
 * The API has ONE delivery option: the fee is decided by the server (free from `freeShippingFrom`, otherwise a fixed
 * fee) and POST /orders has no "method" field. So "Regular shipment" is the only real choice; the two other rows of the
 * mockup (express, scheduled) are drawn greyed out, exactly as in the design, and cannot be selected.
 */
export default function ShippingStep() {
  const name = useId();
  const { data: checkout } = useCheckout();
  const { address, isPending, isError, error, refetch } = useSelectedAddress();
  // a lazy initial value: the date is fixed once per visit and the render stays pure
  const [today] = useState(() => new Date());

  if (isPending) return <span className="skeleton" style={{ height: 240, marginTop: 64 }} aria-busy="true" />;
  if (isError) return <QueryError message={error.message} onRetry={() => refetch()} />;
  // no (valid) address in the URL — e.g. someone opened /checkout/shipping directly → step 1
  if (!address) return <Navigate to="/checkout/address" replace />;

  const { shippingFee, currency, subtotal, freeShippingFrom } = checkout;
  const missing = amountToFreeShipping({ subtotal, freeShippingFrom, shippingFee });
  const arrival = new Date(today);
  arrival.setDate(arrival.getDate() + REGULAR_SHIPMENT_DAYS);

  return (
    <section className="checkout-step" aria-labelledby="step-shipping-title">
      <h1 id="step-shipping-title" className="checkout-step__title">
        Shipment Method
      </h1>

      <ul className="shipping-options" role="radiogroup" aria-labelledby="step-shipping-title">
        <li className="shipping-option shipping-option--active">
          <label>
            <input type="radio" name={name} checked readOnly />
            <strong>{formatShippingFee(shippingFee, currency)}</strong>
            <span className="shipping-option__text">Regular shipment</span>
            <time className="shipping-option__date" dateTime={arrival.toISOString().slice(0, 10)}>
              {formatShipmentDate(arrival)}
            </time>
          </label>
        </li>
        <li className="shipping-option shipping-option--disabled">
          <label>
            <input type="radio" name={name} disabled />
            <strong>Express</strong>
            <span className="shipping-option__text">Get your delivery as soon as possible</span>
            <span className="shipping-option__date">Not available yet</span>
          </label>
        </li>
        <li className="shipping-option shipping-option--disabled">
          <label>
            <input type="radio" name={name} disabled />
            <strong>Schedule</strong>
            <span className="shipping-option__text">Pick a date when you want to get your delivery</span>
            <span className="shipping-option__date">Not available yet</span>
          </label>
        </li>
      </ul>

      <p className="checkout-step__hint">
        Delivering to {address.address}, {address.city}.{' '}
        <Link to={checkoutPath('address', address.id)}>Change address</Link>
        {missing > 0 && <> Add {formatPrice(missing, currency)} more and the delivery is free.</>}
      </p>

      <div className="checkout-actions">
        <ActionButton to={checkoutPath('address', address.id)} variant="outline">
          Back
        </ActionButton>
        <ActionButton to={checkoutPath('payment', address.id)}>Next</ActionButton>
      </div>
    </section>
  );
}
