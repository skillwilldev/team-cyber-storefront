import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useCategory, useProduct } from '@api/catalogQueries';
import { useShop } from '@features/shop';
import Breadcrumbs from '../../components/Breadcrumbs/Breadcrumbs';
import {
  BatteryIcon,
  CameraIcon,
  FrontCameraIcon,
  ChevronIcon,
  CoresIcon,
  CpuIcon,
  InfoIcon,
  PhoneIcon,
  ShieldCheckIcon,
  StoreIcon,
  TruckIcon,
} from '../../components/icons/icons';
import LoadingHint from '../../components/LoadingHint/LoadingHint';
import ProductCard from '../../components/ProductCard/ProductCard';
import ProductImage from '../../components/ProductImage/ProductImage';
import QueryError from '../../components/QueryError/QueryError';
import Stars from '../../components/Stars/Stars';
import { RATING_SUMMARY, REVIEWS } from '../../data/reviews';
import { formatPrice, formatWarranty } from '../../lib/format';
import { getColorHex } from '../../lib/filterLabels';
import { buildSpecGroups, getQuickSpecs, getSpecLabel } from '../../lib/specs';
import StubPage from '../StubPage/StubPage';
import './ProductPage.css';

// icons of the "quick specs" (keys are the API spec names); everything else gets a generic icon
const QUICK_ICONS = {
  'ეკრანი': PhoneIcon,
  'პროცესორი': CpuIcon,
  'ოპერატიული მეხსიერება': CoresIcon,
  'ძირითადი კამერა': CameraIcon,
  'წინა კამერა': FrontCameraIcon,
  'ბატარეა': BatteryIcon,
};

function SpecTable({ group }) {
  return (
    <div className="spec-group">
      <h3>{group.title}</h3>
      <dl>
        {group.rows.map((row) => (
          <div key={row.label} className="spec-group__row">
            <dt>{row.label}</dt>
            <dd>{row.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

function ProductSkeleton() {
  return (
    <div className="container product-skeleton" aria-busy="true">
      <LoadingHint />
      <div className="product-skeleton__grid" aria-hidden="true">
        <span className="skeleton product-skeleton__photo" />
        <div className="product-skeleton__info">
          <span className="skeleton" style={{ height: 48, width: '80%' }} />
          <span className="skeleton" style={{ height: 40, width: '40%' }} />
          <span className="skeleton" style={{ height: 120 }} />
          <span className="skeleton" style={{ height: 56 }} />
        </div>
      </div>
    </div>
  );
}

function ProductView({ product }) {
  const { data: category } = useCategory(product.category?.slug);
  const { isInWishlist, toggleWishlist, addToCart } = useShop();
  const [photoIndex, setPhotoIndex] = useState(0);
  const [showMoreSpecs, setShowMoreSpecs] = useState(false);
  const [showAllReviews, setShowAllReviews] = useState(false);

  const { title, brand, price, oldPrice, discountPercent, currency, rating, reviewsCount, inStock, stock } = product;
  const gallery = product.images?.length ? product.images : product.image ? [product.image] : [];
  const photo = gallery[photoIndex] ?? null;
  const color = product.attributes?.color;
  const colorName = product.specs?.['ფერი'] ?? color;
  const storage = product.attributes?.storage;
  const quick = getQuickSpecs(product.specs);
  const groups = buildSpecGroups(product.specs);
  const related = (product.related ?? []).slice(0, 4);
  const reviews = showAllReviews ? REVIEWS : REVIEWS.slice(0, 2);
  const totalVotes = RATING_SUMMARY.distribution.reduce((sum, d) => sum + d.count, 0);

  const categorySlug = product.category?.slug ?? 'smartphones';
  const categoryLabel = category?.nameEn ?? product.category?.name ?? 'Category';

  return (
    <>
      <title>{`${title} — Cyber`}</title>
      <div className="container">
        <Breadcrumbs
          items={[
            { label: 'Home', to: '/' },
            { label: 'Catalog', to: '/' },
            { label: categoryLabel, to: `/?category=${categorySlug}` },
            { label: brand, to: `/?category=${categorySlug}&brand=${encodeURIComponent(brand)}` },
            { label: title },
          ]}
        />
      </div>

      <section className="product">
        <div className="container product__inner">
          <div className="product__gallery">
            {gallery.length > 1 && (
              <ul className="product__thumbs">
                {gallery.map((src, i) => (
                  <li key={src}>
                    <button
                      type="button"
                      aria-label={`Photo ${i + 1}`}
                      aria-current={i === photoIndex}
                      onClick={() => setPhotoIndex(i)}
                    >
                      <ProductImage src={src} alt="" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <div className="product__photo">
              <ProductImage src={photo} alt={title} />
            </div>
          </div>

          <div className="product__info">
            <h1>{title}</h1>

            <p className="product__price">
              <b>{formatPrice(price, currency)}</b>
              {oldPrice && <s>{formatPrice(oldPrice, currency)}</s>}
              {discountPercent > 0 && <span className="product__badge">-{discountPercent}%</span>}
            </p>

            {color && (
              <div className="product__colors">
                <span id="colors-label">Color :</span>
                <ul role="radiogroup" aria-labelledby="colors-label">
                  <li>
                    <button
                      type="button"
                      role="radio"
                      aria-checked="true"
                      aria-label={colorName}
                      title={colorName}
                      style={{ background: getColorHex(color) }}
                    />
                  </li>
                </ul>
              </div>
            )}

            {storage && (
              <ul className="product__memory">
                <li>
                  <button type="button" aria-pressed="true">
                    {String(storage).toUpperCase()}
                  </button>
                </li>
              </ul>
            )}

            {quick.length > 0 && (
              <ul className="product__quick">
                {quick.map(({ key, value }) => {
                  const Icon = QUICK_ICONS[key] ?? InfoIcon;

                  return (
                    <li key={key}>
                      <Icon size={20} />
                      <div>
                        <span>{getSpecLabel(key)}</span>
                        <b>{value}</b>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}

            <div className="product__actions">
              <button
                type="button"
                className="btn btn--outline"
                aria-pressed={isInWishlist(product.id)}
                onClick={() => toggleWishlist(product.id)}
              >
                {isInWishlist(product.id) ? 'Remove from Wishlist' : 'Add to Wishlist'}
              </button>
              <button
                type="button"
                className="btn btn--dark"
                disabled={!inStock}
                onClick={() => addToCart(product.id)}
              >
                {inStock ? 'Add to Cart' : 'Out of stock'}
              </button>
            </div>

            <ul className="product__perks">
              <li>
                <span>
                  <TruckIcon size={24} />
                </span>
                <div>
                  <small>Free Delivery</small>
                  <b>1-2 day</b>
                </div>
              </li>
              <li>
                <span>
                  <StoreIcon size={24} />
                </span>
                <div>
                  <small>{inStock ? 'In Stock' : 'Out of Stock'}</small>
                  <b>{inStock ? `${stock} pcs` : '—'}</b>
                </div>
              </li>
              <li>
                <span>
                  <ShieldCheckIcon size={24} />
                </span>
                <div>
                  <small>Guaranteed</small>
                  <b>{formatWarranty(product.warrantyMonths)}</b>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </section>

      <section className="details-band">
        <div className="container">
          <div className="details">
            <h2>Details</h2>
            {product.description && <p className="details__text">{product.description}</p>}
            {groups.main.map((g) => (
              <SpecTable key={g.title} group={g} />
            ))}
            {showMoreSpecs && groups.more.map((g) => <SpecTable key={g.title} group={g} />)}
            {groups.more.length > 0 && (
              <button
                type="button"
                className="btn-more"
                aria-expanded={showMoreSpecs}
                onClick={() => setShowMoreSpecs((v) => !v)}
              >
                {showMoreSpecs ? 'View Less' : 'View More'}
                <ChevronIcon direction={showMoreSpecs ? 'up' : 'down'} size={16} />
              </button>
            )}
          </div>
        </div>
      </section>

      {/* The API has the rating and the number of reviews, but no reviews endpoint yet:
          the score comes from the API, the bars and the comments below are demo data (data/reviews.js). */}
      <section className="reviews">
        <div className="container">
          <h2>Reviews</h2>

          <div className="reviews__summary">
            <div className="reviews__score">
              <b>{Number(rating).toFixed(1)}</b>
              <span>of {reviewsCount} reviews</span>
              <Stars value={rating} />
            </div>
            <ul className="reviews__bars">
              {RATING_SUMMARY.distribution.map((d) => (
                <li key={d.label}>
                  <span>{d.label}</span>
                  <div className="reviews__bar">
                    <div style={{ width: `${(d.count / totalVotes) * 100}%` }} />
                  </div>
                  <em>{Math.round((d.count / totalVotes) * reviewsCount)}</em>
                </li>
              ))}
            </ul>
          </div>

          <label className="sr-only" htmlFor="comment">
            Leave comment
          </label>
          <input id="comment" className="reviews__input" type="text" placeholder="Leave Comment" />

          <ul className="reviews__list">
            {reviews.map((r) => (
              <li key={r.id} className="review">
                <div className="review__avatar" aria-hidden="true">
                  {r.name
                    .split(' ')
                    .map((w) => w[0])
                    .join('')}
                </div>
                <div className="review__body">
                  <div className="review__head">
                    <h3>{r.name}</h3>
                    <time>{r.date}</time>
                  </div>
                  <Stars value={r.rating} />
                  <p>{r.text}</p>
                </div>
              </li>
            ))}
          </ul>

          {!showAllReviews && (
            <button type="button" className="btn-more" onClick={() => setShowAllReviews(true)}>
              View More
              <ChevronIcon size={16} />
            </button>
          )}
        </div>
      </section>

      {related.length > 0 && (
        <section className="related">
          <div className="container">
            <h2>Related Products</h2>
            <ul>
              {related.map((p) => (
                <li key={p.id}>
                  <ProductCard product={p} />
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </>
  );
}

export default function ProductPage() {
  const { slug } = useParams();
  const { data: product, isPending, isError, error, refetch } = useProduct(slug);

  if (isPending) return <ProductSkeleton />;
  if (isError) {
    if (error.status === 404) return <StubPage title="Product not found" text="We could not find this product." />;

    return <QueryError message={error.message} onRetry={() => refetch()} />;
  }

  // key → a different product starts with fresh local state (selected photo, opened blocks)
  return <ProductView key={product.id} product={product} />;
}
