import { Link, useParams } from 'react-router-dom';
import ActionButton from '@/components/ActionButton/ActionButton';
import { CheckCircleIcon } from '@/components/icons/checkoutIcons';
import LoadingHint from '@/components/LoadingHint/LoadingHint';
import QueryError from '@/components/QueryError/QueryError';
import { formatPrice } from '@/lib/format';
import { Alert } from '@shared/ui';
import { useOrder } from '../../hooks/useOrder';
import { formatDateTime, formatShippingFee, shortOrderNumber } from '../../lib/checkoutFormat';
import { confirmPath } from '../../lib/checkoutRoutes';
import './OrderPage.css';

/**
 * /orders/:id (protected) — the order confirmation page: "Thank you! Order № … is paid".
 * Works after F5: the data is read from the server (GET /orders/:id), not passed from the previous page.
 * An order that is not paid yet (pending_payment) offers to go back and enter the code.
 * A foreign or unknown id is 404 ORDER_NOT_FOUND → "Order not found".
 */
export default function OrderPage() {
  const { id } = useParams();
  const { data, isPending, isError, error, refetch } = useOrder(id);

  if (isPending) {
    return (
      <div className="container order-page" aria-busy="true">
        <LoadingHint />
        <div aria-hidden="true" className="order-page__skeleton">
          <span className="skeleton" style={{ height: 48, maxWidth: 420 }} />
          <span className="skeleton" style={{ height: 280 }} />
        </div>
      </div>
    );
  }
  if (isError) {
    if (error.code === 'ORDER_NOT_FOUND' || error.status === 404) {
      return (
        <div className="container order-page order-page--center">
          <h1 className="order-page__title">Order not found</h1>
          <p className="order-page__lead">This order does not exist or belongs to another account.</p>
          <ActionButton to="/">Back to catalog</ActionButton>
        </div>
      );
    }
    return <QueryError message={error.message} onRetry={() => refetch()} />;
  }

  const { order } = data;
  const isPaid = order.status === 'paid';

  return (
    <>
      <title>{isPaid ? 'Order paid' : 'Order'} — Cyber</title>
      <div className="container order-page">
        <header className="order-page__header">
          {isPaid && <CheckCircleIcon size={48} className="order-page__check" />}
          <div>
            <h1 className="order-page__title">{isPaid ? 'Thank you! Your order is paid' : 'Your order is not paid yet'}</h1>
            <p className="order-page__lead">
              Order № <b>{shortOrderNumber(order.id)}</b>
              {isPaid && order.paidAt && <> · paid {formatDateTime(order.paidAt)}</>}
            </p>
          </div>
        </header>

        {!isPaid && (
          <div className="order-page__notice">
            <Alert type="warning" message="The payment is not completed. Enter the code from the e-mail to pay for this order." />
            <ActionButton to={confirmPath(order.id)}>Enter the payment code</ActionButton>
          </div>
        )}

        <div className="order-page__layout">
          <ul className="order-page__items" aria-label="Products in the order">
            {order.items.map((item) => (
              <li key={`${item.productId ?? item.slug}-${item.title}`} className="order-item">
                <img src={item.image} alt="" width="72" height="72" loading="lazy" />
                <div className="order-item__info">
                  {item.productId ? (
                    <Link to={`/product/${item.slug}`} className="order-item__title">
                      {item.title}
                    </Link>
                  ) : (
                    <span className="order-item__title">{item.title}</span>
                  )}
                  <span className="order-item__meta">
                    {formatPrice(item.price, order.currency)} × {item.qty}
                  </span>
                </div>
                <b className="order-item__total">{formatPrice(item.lineTotal, order.currency)}</b>
              </li>
            ))}
          </ul>

          <aside className="order-page__aside">
            <dl className="order-page__totals">
              <div>
                <dt>Subtotal</dt>
                <dd>{formatPrice(order.subtotal, order.currency)}</dd>
              </div>
              <div>
                <dt>Shipping</dt>
                <dd>{formatShippingFee(order.shippingFee, order.currency)}</dd>
              </div>
              <div className="order-page__total">
                <dt>Total</dt>
                <dd>{formatPrice(order.total, order.currency)}</dd>
              </div>
            </dl>

            <dl className="order-page__details">
              <div>
                <dt>Delivery address</dt>
                <dd>
                  {order.shipping.fullName}
                  <br />
                  {order.shipping.address}, {order.shipping.city}
                  <br />
                  {order.shipping.phone}
                </dd>
              </div>
              {order.payment && (
                <div>
                  <dt>Payment</dt>
                  <dd>
                    <span className="order-page__brand">{order.payment.brand}</span> •••• {order.payment.last4}
                  </dd>
                </div>
              )}
              <div>
                <dt>Order date</dt>
                <dd>{formatDateTime(order.createdAt)}</dd>
              </div>
            </dl>
          </aside>
        </div>

        <div className="order-page__actions">
          <ActionButton to="/">Continue shopping</ActionButton>
        </div>
      </div>
    </>
  );
}
