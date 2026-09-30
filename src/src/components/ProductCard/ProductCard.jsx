import { Link } from 'react-router-dom';
import { useShop } from '@features/shop';
import { formatPrice } from '../../lib/format';
import { HeartIcon } from '../icons/icons';
import ProductImage from '../ProductImage/ProductImage';
import Stars from '../Stars/Stars';
import './ProductCard.css';

export default function ProductCard({ product }) {
  const { isInWishlist, toggleWishlist } = useShop();
  const { id, slug, title, brand, image, price, oldPrice, discountPercent, currency, rating, reviewsCount, inStock } =
    product;

  const liked = isInWishlist(id);

  return (
    <article className="product-card">
      {discountPercent > 0 && <span className="product-card__badge">-{discountPercent}%</span>}
      <button
        type="button"
        className="product-card__like"
        aria-label={liked ? 'Remove from wishlist' : 'Add to wishlist'}
        aria-pressed={liked}
        onClick={() => toggleWishlist(id)}
      >
        <HeartIcon size={24} />
      </button>

      <Link to={`/product/${slug}`} className="product-card__link">
        <div className="product-card__img">
          <ProductImage src={image} alt={title} width={160} height={160} loading="lazy" />
        </div>
        {brand && <p className="product-card__brand">{brand}</p>}
        <h3 className="product-card__title">{title}</h3>
      </Link>

      <p className="product-card__rating">
        <Stars value={rating ?? 0} size={14} />
        <span>
          {Number(rating ?? 0).toFixed(1)} ({reviewsCount ?? 0})
        </span>
      </p>

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
