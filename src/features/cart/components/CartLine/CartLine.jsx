import { Link } from 'react-router-dom';
import { useRemoveCartItem, useUpdateCartItem } from '@api/cartQueries';
import ProductImage from '@/components/ProductImage/ProductImage';
import { TrashIcon } from '@/components/icons/icons';
import { formatPrice } from '@/lib/format';
import { getCartErrorMessage } from '../../lib/cartErrors';
import { getMaxQty, getStockIssue } from '../../lib/cartRules';
import QuantityStepper from '../QuantityStepper/QuantityStepper';
import './CartLine.css';

/**
 * One cart line. Prices (`lineTotal`) come from the server — nothing is calculated here.
 *
 * Quick clicks: PATCH sets an ABSOLUTE quantity, so three fast "+" computed from the same old number
 * would send the same value three times. That is why the stepper and the trash button are locked
 * while this line's request is in flight (ADR 0003); the number on screen is always the server's answer.
 */
export default function CartLine({ item }) {
  const { id, qty, lineTotal, product } = item;
  const update = useUpdateCartItem();
  const remove = useRemoveCartItem();

  const isBusy = update.isPending || remove.isPending;
  const stockIssue = getStockIssue(item);
  const requestError = update.isError ? update.error : remove.isError ? remove.error : null;
  const href = `/product/${product.slug}`;

  const changeQty = (next) => {
    remove.reset();
    update.mutate({ id, qty: next });
  };

  const removeItem = () => {
    update.reset();
    remove.mutate({ id });
  };

  return (
    <li className={`cart-line${stockIssue ? ' cart-line--issue' : ''}`} aria-busy={isBusy}>
      <Link to={href} className="cart-line__img" tabIndex={-1} aria-hidden="true">
        <ProductImage src={product.image} alt="" width={96} height={96} loading="lazy" />
      </Link>

      <div className="cart-line__info">
        {product.brand && <p className="cart-line__brand">{product.brand}</p>}
        <h2 className="cart-line__title">
          <Link to={href}>{product.title}</Link>
        </h2>
        <p className="cart-line__unit">
          {formatPrice(product.price, product.currency)}
          {product.oldPrice ? <s>{formatPrice(product.oldPrice, product.currency)}</s> : null}
        </p>
      </div>

      <div className="cart-line__qty">
        <QuantityStepper
          qty={qty}
          max={getMaxQty(product)}
          disabled={isBusy}
          label={product.title}
          onChange={changeQty}
        />
      </div>

      <p className="cart-line__total">{formatPrice(lineTotal, product.currency)}</p>

      <button
        type="button"
        className="cart-line__remove"
        aria-label={`Remove ${product.title} from cart`}
        disabled={isBusy}
        onClick={removeItem}
      >
        <TrashIcon size={22} />
      </button>

      {stockIssue && <p className="cart-line__warn">{stockIssue}</p>}
      {requestError && (
        <p className="cart-line__error" role="alert">
          {getCartErrorMessage(requestError)}
        </p>
      )}
    </li>
  );
}
