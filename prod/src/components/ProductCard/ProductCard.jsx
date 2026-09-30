import { useState } from 'react';
import { Link } from 'react-router-dom';
import { formatPrice } from '../../lib/format';
import { HeartIcon } from '../icons/icons';
import ProductImage from '../ProductImage/ProductImage';
import './ProductCard.css';

export default function ProductCard({ product }) {
  const [liked, setLiked] = useState(false);
  const { slug, title, image, price, oldPrice, discountPercent, currency, inStock } = product;

  return (
    <article className="product-card">
      {discountPercent > 0 && <span className="product-card__badge">-{discountPercent}%</span>}
      <button
        type="button"
        className="product-card__like"
        aria-label={liked ? 'Remove from wishlist' : 'Add to wishlist'}
        aria-pressed={liked}
        onClick={() => setLiked((v) => !v)}
      >
        <HeartIcon size={24} />
      </button>

      <Link to={`/product/${slug}`} className="product-card__link">
        <div className="product-card__img">
          <ProductImage src={image} alt="" width={160} height={160} loading="lazy" />
        </div>
        <h3 className="product-card__title">{title}</h3>
      </Link>

      <p className="product-card__price">
        {formatPrice(price, currency)}
        {/* {oldPrice && <s className="product-card__old">{formatPrice(oldPrice, currency)}</s>} */}
        <s className="product-card__old">
          {oldPrice ? formatPrice(oldPrice, currency) : '\u00A0'}
        </s>
      </p>
      <button type="button" className="product-card__btn" disabled={!inStock}>
        {inStock ? 'Buy Now' : 'Out of stock'}
      </button>
    </article>
  );
}
