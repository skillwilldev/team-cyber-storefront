import { Link } from 'react-router-dom';
import ActionButton from '@/components/ActionButton/ActionButton';
import LoadingHint from '@/components/LoadingHint/LoadingHint';
import QueryError from '@/components/QueryError/QueryError';
import { formatPrice } from '@/lib/format';
import { useOrders } from '../../hooks/useOrders';
import { formatDateTime, shortOrderNumber } from '../../lib/checkoutFormat';
import { orderPath } from '../../lib/checkoutRoutes';
import './OrdersPage.css';

const STATUS_LABELS = {
  paid: 'Paid',
  pending_payment: 'Awaiting payment',
};

const MAX_THUMBS = 4;

/**
 * /orders (protected) — "Orders" in the profile menu: everything the user has bought, the newest first.
 * Data: GET /orders. A row opens the full order (/orders/:id, GET /orders/:id).
 */
export default function OrdersPage() {
  const { data, isPending, isError, error, refetch } = useOrders();

  let content;

  if (isPending) {
    content = (
      <div aria-busy="true">
        <LoadingHint />
        <div aria-hidden="true" className="orders-page__list">
          <span className="skeleton" style={{ height: 120 }} />
          <span className="skeleton" style={{ height: 120 }} />
          <span className="skeleton" style={{ height: 120 }} />
        </div>
      </div>
    );
  } else if (isError) {
    content = <QueryError message={error.message} onRetry={() => refetch()} />;
  } else if (data.items.length === 0) {
    content = (
      <div className="orders-page__empty">
        <p>You have no orders yet.</p>
        <ActionButton to="/">Go shopping</ActionButton>
      </div>
    );
  } else {
    content = (
      <ul className="orders-page__list" aria-label="My orders">
        {data.items.map((order) => {
          const totalQty = order.items.reduce((sum, item) => sum + item.qty, 0);
          const hiddenCount = order.items.length - MAX_THUMBS;

          return (
            <li key={order.id}>
              <Link to={orderPath(order.id)} className="order-row">
                <div className="order-row__head">
                  <div>
                    <b className="order-row__number">Order № {shortOrderNumber(order.id)}</b>
                    <span className="order-row__date">{formatDateTime(order.createdAt)}</span>
                  </div>
                  <span className={`order-row__status order-row__status--${order.status}`}>
                    {STATUS_LABELS[order.status] ?? order.status}
                  </span>
                </div>

                <div className="order-row__body">
                  <div className="order-row__thumbs">
                    {order.items.slice(0, MAX_THUMBS).map((item) => (
                      <img
                        key={`${item.productId ?? item.slug}-${item.title}`}
                        src={item.image}
                        alt={item.title}
                        title={item.title}
                        width="56"
                        height="56"
                        loading="lazy"
                      />
                    ))}
                    {hiddenCount > 0 && <span className="order-row__more">+{hiddenCount}</span>}
                  </div>
                  <div className="order-row__sum">
                    <span>
                      {totalQty} {totalQty === 1 ? 'item' : 'items'}
                    </span>
                    <b>{formatPrice(order.total, order.currency)}</b>
                  </div>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    );
  }

  return (
    <>
      <title>My orders — Cyber</title>
      <div className="container orders-page">
        <h1 className="orders-page__title">My orders</h1>
        {content}
      </div>
    </>
  );
}
