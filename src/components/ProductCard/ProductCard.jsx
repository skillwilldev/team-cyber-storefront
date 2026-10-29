import { Link } from 'react-router-dom';
import { useAddToCart } from '@features/cart/hooks/useAddToCart';
import { useShop } from '@features/shop';
import { useTranslation } from 'react-i18next';
import { formatPriceI18n, formatRatingI18n } from '../../lib/i18n';
import { HeartIcon } from '../icons/icons';
import ProductImage from '../ProductImage/ProductImage';
import { StarIcon } from '../icons/icons';
import Stars from '../Stars/Stars';
import './ProductCard.css';

// resized WebP versions offered to the browser (the card shows the picture 104 px high on mobile, 160 px on desktop)
const IMAGE_WIDTHS = [160, 240, 320, 480];
const IMAGE_SIZES = '(max-width: 1023px) 104px, 160px';

/**
 * priority — the picture that is probably the LCP element: loaded at once with a high fetch priority.
 * eager    — a card that is visible without scrolling: loaded at once, normal priority.
 * Every other card is lazy (loaded when it is about to appear on screen).
 */
export default function ProductCard({ product, priority = false, eager = false, headingLevel = 3 }) {
  // the title is a heading; its level must follow the heading above the list (h1 → h2 in the catalog, h2 → h3 on the product page)
  const Heading = `h${headingLevel}`;
  const { isInWishlist, toggleWishlist } = useShop();
  const { addToCart, isAdding } = useAddToCart();
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const { id, slug, title, brand, image, price, oldPrice, discountPercent, currency, rating, reviewsCount, inStock } =
    product;

  const liked = isInWishlist(id);

  return (
    <article className="product-card">
      {discountPercent > 0 && <span className="product-card__badge">-{discountPercent}%</span>}
      <button
        type="button"
        className="product-card__like"
        aria-label={liked ? t('wishlist.remove') : t('wishlist.add')}
        aria-pressed={liked}
        onClick={() => toggleWishlist(id)}
      >
        <HeartIcon size={24} />
      </button>

      <Link to={`/product/${slug}`} className="product-card__link">
        <div className="product-card__img">
          <ProductImage
            src={image}
            alt={title}
            widths={IMAGE_WIDTHS}
            sizes={IMAGE_SIZES}
            width={160}
            height={160}
            loading={priority || eager ? 'eager' : 'lazy'}
            fetchPriority={priority ? 'high' : undefined}
            decoding="async"
          />
        </div>
        {brand && <p className="product-card__brand">{brand}</p>}
        <Heading className="product-card__title">{title}</Heading>
      </Link>

      <p className="product-card__rating product-card__rating--desktop">
        <Stars value={rating ?? 0} size={14} />
        <span>
          {formatRatingI18n(rating, lang)} ({reviewsCount ?? 0})
        </span>
      </p>

      <p className="product-card__rating product-card__rating--mobile">
        <span className="product-card__rating-badge">
          <StarIcon size={12} filled={true} />
          <span>{formatRatingI18n(rating, lang)}</span>
        </span>

        <span className="product-card__reviews-count">
          ({reviewsCount ?? 0})
        </span>
      </p>

      <p className="product-card__price">
        {formatPriceI18n(price, currency, lang)}
        <s className="product-card__old">
          {oldPrice ? formatPriceI18n(oldPrice, currency, lang) : '\u00A0'}
        </s>
      </p>
      <button type="button" className="product-card__btn" disabled={!inStock || isAdding} onClick={() => addToCart(product)}>
        {!inStock ? t('cart.outOfStock') : isAdding ? t('cart.adding') : t('cart.addToCart')}
      </button>
    </article>
  );
}
