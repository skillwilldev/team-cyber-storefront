import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { formatPriceI18n } from '@/lib/i18n';
import './CartSummary.css';

/** Totals come from the server (`totalQty`, `subtotal`). Checkout is blocked while any line has a stock problem. */
export default function CartSummary({ totalQty, subtotal, currency, hasStockIssues }) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;

  return (
    <aside className="cart-summary" aria-labelledby="cart-summary-title">
      <h2 id="cart-summary-title">{t('cartSummary.title')}</h2>

      <dl>
        <div>
          <dt>{t('cartSummary.items')}</dt>
          <dd>{totalQty}</dd>
        </div>
        <div className="cart-summary__subtotal">
          <dt>{t('cartSummary.subtotal')}</dt>
          <dd aria-live="polite">{formatPriceI18n(subtotal, currency, lang)}</dd>
        </div>
      </dl>

      <p className="cart-summary__note">{t('cartSummary.deliveryNote')}</p>

      {hasStockIssues ? (
        <>
          <p className="cart-summary__warn" id="cart-summary-warn">
            {t('cartSummary.stockWarning')}
          </p>
          <button type="button" className="cart-summary__btn" disabled aria-describedby="cart-summary-warn">
            {t('cartSummary.checkout')}
          </button>
        </>
      ) : (
        <Link to="/checkout" className="cart-summary__btn">
          {t('cartSummary.checkout')}
        </Link>
      )}
    </aside>
  );
}
