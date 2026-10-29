import './ProductCardSkeleton.css';

/**
 * Card-shaped placeholder shown while the products are loading.
 *
 * It re-uses the classes of the real <ProductCard> (paddings, rows, breakpoints) and only fills the rows with grey blocks,
 * so at every screen width the skeleton is exactly as high as the real card. When the data arrives nothing below moves
 * (before this the skeleton was ~65 px lower per row than the card → the footer jumped, CLS 0.12).
 * Keep the row structure in sync with ProductCard.jsx.
 */
export default function ProductCardSkeleton() {
  return (
    <div className="product-card product-card-skeleton" aria-hidden="true">
      <div className="product-card__link">
        <div className="product-card__img">
          <span className="skeleton product-card-skeleton__pic" />
        </div>
        <p className="product-card__brand">
          <span className="skeleton product-card-skeleton__bar product-card-skeleton__bar--brand">&nbsp;</span>
        </p>
        <h2 className="product-card__title">
          <span className="skeleton product-card-skeleton__bar product-card-skeleton__bar--title">&nbsp;</span>
        </h2>
      </div>

      <p className="product-card__rating product-card__rating--desktop">
        <span className="skeleton product-card-skeleton__stars" />
      </p>
      <p className="product-card__rating product-card__rating--mobile">
        <span className="skeleton product-card-skeleton__badge" />
      </p>

      <p className="product-card__price">
        <span className="skeleton product-card-skeleton__bar product-card-skeleton__bar--price">&nbsp;</span>
        <s className="product-card__old">&nbsp;</s>
      </p>
      <span className="skeleton product-card__btn" />
    </div>
  );
}
