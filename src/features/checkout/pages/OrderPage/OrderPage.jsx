import { Link, useParams } from 'react-router-dom';
import ActionButton from '@/components/ActionButton/ActionButton';
import { CheckCircleIcon } from '@/components/icons/checkoutIcons';
import LoadingHint from '@/components/LoadingHint/LoadingHint';
import QueryError from '@/components/QueryError/QueryError';
import { useTranslation } from 'react-i18next';
import { formatPriceI18n } from '@/lib/i18n';
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
  const { t, i18n } = useTranslation();
  const lang = i18n.language;

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
          <h1 className="order-page__title">{t('checkout.orderNotFound')}</h1>
          <p className="order-page__lead">{t('checkout.orderNotFoundText')}</p>
          <ActionButton to="/">{t('common.backToCatalog')}</ActionButton>
        </div>
      );
    }
    return <QueryError message={error.message} onRetry={() => refetch()} />;
  }

  const { order } = data;
  const isPaid = order.status === 'paid';

  return (
    <>
      <title>{isPaid ? t('orders.titlePaid') : t('orders.order')} — Cyber</title>
      <div className="container order-page">
        <header className="order-page__header">
          {isPaid && <CheckCircleIcon size={48} className="order-page__check" />}
          <div>
            <h1 className="order-page__title">
              {isPaid ? t('orders.thanks') : t('orders.notPaidYet')}
            </h1>
            <p className="order-page__lead">
              {t('orders.order')} № <b>{shortOrderNumber(order.id)}</b>
              {isPaid && order.paidAt && <> · {t('orders.paid')} {formatDateTime(order.paidAt, lang)}</>}
            </p>
          </div>
        </header>

        {!isPaid && (
          <div className="order-page__notice">
            <Alert type="warning" message={t('orders.paymentNotCompleted')} />
            <ActionButton to={confirmPath(order.id)}>
              {t('orders.enterCode')}
            </ActionButton>
          </div>
        )}

        <div className="order-page__layout">
          <ul className="order-page__items" aria-label={t('orders.productsInOrder')}>
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
                    {formatPriceI18n(item.price, order.currency, lang)} × {item.qty}
                  </span>
                </div>
                <b className="order-item__total">{formatPriceI18n(item.lineTotal, order.currency, lang)}</b>
              </li>
            ))}
          </ul>

          <aside className="order-page__aside">
            <dl className="order-page__totals">
              <div>
                <dt>{t('cartSummary.subtotal')}</dt>
                <dd>{formatPriceI18n(order.subtotal, order.currency, lang)}</dd>
              </div>
              <div>
                <dt>{t('checkout.shipping')}</dt>
                <dd>{formatShippingFee(order.shippingFee, order.currency, lang, t)}</dd>
              </div>
              <div className="order-page__total">
                <dt>{t('checkout.total')}</dt>
                <dd>{formatPriceI18n(order.total, order.currency, lang)}</dd>
              </div>
            </dl>

            <dl className="order-page__details">
              <div>
                <dt>{t('orders.deliveryAddress')}</dt>
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
                  <dt>{t('checkout.payment')}</dt>
                  <dd>
                    <span className="order-page__brand">{order.payment.brand}</span> •••• {order.payment.last4}
                  </dd>
                </div>
              )}
              <div>
                <dt>{t('orders.orderDate')}</dt>
                <dd>{formatDateTime(order.createdAt, lang)}</dd>
              </div>
            </dl>
          </aside>
        </div>

        <div className="order-page__actions">
          <ActionButton to="/">{t('orders.continueShopping')}</ActionButton>
        </div>
      </div>
    </>
  );
}
