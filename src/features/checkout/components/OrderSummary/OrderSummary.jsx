import { useTranslation, formatPriceI18n } from '@/lib/i18n';
import { amountToFreeShipping, formatShippingFee } from '../../lib/checkoutFormat';
import './OrderSummary.css';

/**
 * "Summary" card of step 3: products, address, shipment method and totals.
 * Every number is the server's (`GET /checkout`) — nothing is calculated in the browser.
 * (The mockup also shows "Estimated tax"; the API has no tax, so the card shows only what the API really charges.)
 */
export default function OrderSummary({ checkout, address }) {
  const { t, lang } = useTranslation();
  const { items, subtotal, shippingFee, total, currency, freeShippingFrom } = checkout;
  const missing = amountToFreeShipping({ subtotal, freeShippingFrom, shippingFee });

  return (
    <aside className="order-summary" aria-labelledby="order-summary-title">
      <h2 id="order-summary-title" className="order-summary__title">
        {t('cartSummary.title')}
      </h2>

      <ul className="order-summary__items">
        {items.map((item) => (
          <li key={item.id} className="order-summary__item">
            <img src={item.product.image} alt="" width="40" height="40" loading="lazy" />
            <span className="order-summary__name">
              {item.product.title}
              {item.qty > 1 && <span className="order-summary__qty"> × {item.qty}</span>}
            </span>
            <b className="order-summary__price">{formatPriceI18n(item.lineTotal, currency, lang)}</b>
          </li>
        ))}
      </ul>

      <dl className="order-summary__info">
        <div>
          <dt>{t('userMenu.address')}</dt>
          <dd>
            {address.address}, {address.city}
          </dd>
        </div>
        <div>
          <dt>{lang === 'ka' ? 'მიწოდების მეთოდი' : 'Shipment method'}</dt>
          <dd>{formatShippingFee(shippingFee, currency, lang)}</dd>
        </div>
      </dl>

      <dl className="order-summary__totals">
        <div className="order-summary__row order-summary__row--strong">
          <dt>{t('cartSummary.subtotal')}</dt>
          <dd>{formatPriceI18n(subtotal, currency, lang)}</dd>
        </div>
        <div className="order-summary__row">
          <dt>{lang === 'ka' ? 'მიწოდება' : 'Shipping & Handling'}</dt>
          <dd>{formatShippingFee(shippingFee, currency, lang)}</dd>
        </div>
        <div className="order-summary__row order-summary__row--strong order-summary__row--total">
          <dt>{lang === 'ka' ? 'სულ' : 'Total'}</dt>
          <dd>{formatPriceI18n(total, currency, lang)}</dd>
        </div>
      </dl>

      {missing > 0 && (
        <p className="order-summary__hint">
          {lang === 'ka'
            ? `დაამატეთ კიდევ ${formatPriceI18n(missing, currency, lang)} და მიწოდება უფასოა.`
            : `Add ${formatPriceI18n(missing, currency, lang)} more and the delivery is free.`}
        </p>
      )}
    </aside>
  );
}
