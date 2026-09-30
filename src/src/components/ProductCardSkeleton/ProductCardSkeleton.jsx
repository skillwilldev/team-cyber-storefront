import './ProductCardSkeleton.css';

/** Card-shaped placeholder shown while the products are loading. */
export default function ProductCardSkeleton() {
  return (
    <div className="product-card-skeleton" aria-hidden="true">
      <span className="skeleton product-card-skeleton__img" />
      <span className="skeleton product-card-skeleton__line" />
      <span className="skeleton product-card-skeleton__line product-card-skeleton__line--short" />
      <span className="skeleton product-card-skeleton__price" />
      <span className="skeleton product-card-skeleton__btn" />
    </div>
  );
}
