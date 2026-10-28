import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useCategory, useProduct } from '@api/catalogQueries';
import { useAddToCart } from '@features/cart/hooks/useAddToCart';
import { useShop } from '@features/shop';
import { useTranslation } from 'react-i18next';
import { formatPriceI18n, formatRatingI18n, getCategoryName } from '../../lib/i18n';
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
import Seo from '../../components/Seo/Seo';
import Stars from '../../components/Stars/Stars';
import { getColorHex } from '../../lib/filterLabels';
import { absoluteUrl, toSnippet } from '../../lib/seo';
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

function formatWarrantyI18n(months, t) {
  if (!months) return t('warranty.none');
  if (months % 12 === 0) {
    return t('warranty.year', { count: months / 12 }); // i18next picks year_one / year_other
  }
  return t('warranty.months', { count: months });
}

function ProductView({ product }) {
  const { data: category } = useCategory(product.category?.slug);
  const { isInWishlist, toggleWishlist } = useShop();
  const { addToCart, isAdding } = useAddToCart();
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const [photoIndex, setPhotoIndex] = useState(0);
  const [showMoreSpecs, setShowMoreSpecs] = useState(false);

  const { title, brand, price, oldPrice, discountPercent, currency, rating, reviewsCount, inStock, stock } = product;
  const gallery = product.images?.length ? product.images : product.image ? [product.image] : [];
  const photo = gallery[photoIndex] ?? null;
  const color = product.attributes?.color;
  const colorName = product.specs?.['ფერი'] ?? color;
  const storage = product.attributes?.storage;
  const quick = getQuickSpecs(product.specs);
  const groups = buildSpecGroups(product.specs, t);
  const related = product.related ?? [];

  const categorySlug = product.category?.slug ?? 'smartphones';
  const categoryLabel = getCategoryName(category ?? product.category, lang) || 'Category';

  // SEO: unique description, canonical address and schema.org structured data (rich snippet: price, availability, rating)
  const productPath = `/product/${product.slug}`;
  const productUrl = absoluteUrl(productPath);
  const description = toSnippet(
    product.description || t('seo.productDescription', { title, price: formatPriceI18n(price, currency, lang) }),
  );
  const images = gallery.map((src) => absoluteUrl(src));
  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: title,
      ...(images.length > 0 && { image: images }),
      ...(product.description && { description: toSnippet(product.description, 500) }),
      ...(brand && { brand: { '@type': 'Brand', name: brand } }),
      sku: String(product.id),
      ...(reviewsCount > 0 && rating > 0 && {
        aggregateRating: { '@type': 'AggregateRating', ratingValue: Number(rating), reviewCount: Number(reviewsCount) },
      }),
      offers: {
        '@type': 'Offer',
        url: productUrl,
        priceCurrency: currency || 'GEL',
        price: Number(price),
        itemCondition: 'https://schema.org/NewCondition',
        availability: inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { name: t('common.home'), url: absoluteUrl('/') },
        { name: categoryLabel, url: absoluteUrl(`/?category=${categorySlug}`) },
        { name: title, url: productUrl },
      ].map((item, i) => ({ '@type': 'ListItem', position: i + 1, name: item.name, item: item.url })),
    },
  ];

  return (
    <>
      <title>{`${title} — Cyber`}</title>
      <Seo
        description={description}
        ogTitle={title}
        canonical={productPath}
        image={images[0]}
        type="product"
        jsonLd={jsonLd}
      />
      <div className="container">
        <Breadcrumbs
          items={[
            { label: t('common.home'), to: '/' },
            { label: t('common.catalog'), to: '/' },
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
                      aria-label={t('product.photo', { n: i + 1 })}
                      aria-current={i === photoIndex}
                      onClick={() => setPhotoIndex(i)}
                    >
                      <ProductImage src={src} alt="" widths={[80, 160, 240]} sizes="80px" width={80} height={100} loading="lazy" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <div className="product__photo">
              <ProductImage
                src={photo}
                alt={title}
                widths={[320, 480, 640, 700]}
                sizes="(max-width: 1023px) 320px, 514px"
                loading="eager"
                fetchPriority="high"
                decoding="async"
              />
            </div>
          </div>

          <div className="product__info">
            <h1>{title}</h1>

            <p className="product__price">
              <b>{formatPriceI18n(price, currency, lang)}</b>
              {oldPrice && <s>{formatPriceI18n(oldPrice, currency, lang)}</s>}
              {discountPercent > 0 && <span className="product__badge">-{discountPercent}%</span>}
            </p>

            {color && (
              <div className="product__colors">
                <span id="colors-label">{t('product.color')}</span>
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
                        <span>{getSpecLabel(key, t)}</span>
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
                {isInWishlist(product.id) ? t('product.removeFromWishlist') : t('product.addToWishlist')}
              </button>
              <button
                type="button"
                className="btn btn--dark"
                disabled={!inStock || isAdding}
                onClick={() => addToCart(product)}
              >
                {!inStock ? t('cart.outOfStock') : isAdding ? t('cart.adding') : t('cart.addToCart')}
              </button>
            </div>

            <ul className="product__perks">
              <li>
                <span>
                  <TruckIcon size={24} />
                </span>
                <div>
                  <small>{t('product.freeDelivery')}</small>
                  <b>{t('product.deliveryTime')}</b>
                </div>
              </li>
              <li>
                <span>
                  <StoreIcon size={24} />
                </span>
                <div>
                  <small>{inStock ? t('product.inStock') : t('product.outOfStock')}</small>
                  <b>{inStock ? `${stock} ${t('common.pcs')}` : '—'}</b>
                </div>
              </li>
              <li>
                <span>
                  <ShieldCheckIcon size={24} />
                </span>
                <div>
                  <small>{t('product.guaranteed')}</small>
                  <b>{formatWarrantyI18n(product.warrantyMonths, t)}</b>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </section>

      <section className="details-band">
        <div className="container">
          <div className="details">
            <h2>{t('product.details')}</h2>
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
                {showMoreSpecs ? t('common.viewLess') : t('common.viewMore')}
                <ChevronIcon direction={showMoreSpecs ? 'up' : 'down'} size={16} />
              </button>
            )}
          </div>
        </div>
      </section>

      {/* The API has only the rating and the number of reviews (no reviews endpoint yet),
          so only the real numbers are shown — no demo reviews. */}
      <section className="reviews">
        <div className="container">
          <h2>{t('product.reviews')}</h2>

          <div className="reviews__summary">
            <div className="reviews__score">
              <b>{formatRatingI18n(rating, lang)}</b>
              <span>{t('product.ofReviews', { count: reviewsCount })}</span>
              <Stars value={rating} />
            </div>
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section className="related">
          <div className="container">
            <h2>{t('product.relatedProducts')}</h2>
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
  const { t } = useTranslation();
  const { data: product, isPending, isError, error, refetch } = useProduct(slug);

  if (isPending) return <ProductSkeleton />;
  if (isError) {
    if (error.status === 404) return <StubPage title={t('product.productNotFound')} text={t('product.productNotFoundText')} />;

    return <QueryError message={error.message} onRetry={() => refetch()} />;
  }

  // key → a different product starts with fresh local state (selected photo, opened blocks)
  return <ProductView key={product.id} product={product} />;
}
