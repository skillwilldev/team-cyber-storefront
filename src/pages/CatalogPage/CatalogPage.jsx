import { useEffect } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { useCategory, useProducts } from '@api/catalogQueries';
import { useTranslation } from 'react-i18next';
import { getCategoryName } from '../../lib/i18n';
import Breadcrumbs from '../../components/Breadcrumbs/Breadcrumbs';
import FilterPanel from '../../components/FilterPanel/FilterPanel';
import { SlidersIcon } from '../../components/icons/icons';
import LoadingHint from '../../components/LoadingHint/LoadingHint';
import Pagination from '../../components/Pagination/Pagination';
import ProductCard from '../../components/ProductCard/ProductCard';
import ProductCardSkeleton from '../../components/ProductCardSkeleton/ProductCardSkeleton';
import QueryError from '../../components/QueryError/QueryError';
import SortSelect from '../../components/SortSelect/SortSelect';
import { useCatalogParams } from '../../hooks/useCatalogParams';
import { MOBILE_QUERY, useMediaQuery } from '../../hooks/useMediaQuery';
import {
  AVAILABILITY_GROUP,
  DEFAULT_SORT,
  countActiveFilters,
  emptyFilters,
  toApiQuery,
  toSearchParams,
} from '../../lib/catalog';
import StubPage from '../StubPage/StubPage';
import './CatalogPage.css';

/**
 * Two independent TanStack queries:
 *   useCategory(slug)   → GET /categories/{slug}  → filter definitions (cached for 10 min)
 *   useProducts(query)  → GET /products?...       → the page of products (key = the whole query)
 * The query is built from the URL, so changing a filter / sort / page = changing the key = new request (or cache hit).
 */
export default function CatalogPage() {
  const { params, setFilters, setSort, setPage } = useCatalogParams();
  const { search } = useLocation();
  const isMobile = useMediaQuery(MOBILE_QUERY);
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const limit = isMobile ? 8 : 9;

  const categoryQ = useCategory(params.category);
  const productsQ = useProducts(toApiQuery(params, { limit }));
  const { data, isPending, isError, error, refetch, isPlaceholderData } = productsQ;

  const page = params.page;
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [page]);

  if (categoryQ.error?.status === 404) {
    return <StubPage title={t('catalog.categoryNotFound')} text={t('catalog.categoryNotFoundText')} />;
  }

  // page number from the URL is beyond the last page → go to the last one
  if (data && !isPlaceholderData && data.items.length === 0 && data.total > 0 && page > data.totalPages) {
    const lastPage = toSearchParams({ ...params, page: data.totalPages }).toString();

    return <Navigate to={{ pathname: '/', search: lastPage ? `?${lastPage}` : '' }} replace />;
  }

  const groups = categoryQ.data ? [...categoryQ.data.filters, AVAILABILITY_GROUP] : [];
  const categoryName = getCategoryName(categoryQ.data, lang) || params.category;
  const crumbs = [{ label: t('common.home'), to: '/' }, { label: t('common.catalog'), to: '/' }, { label: categoryName }];
  const items = data?.items ?? [];
  const totalPages = data?.totalPages ?? 1;
  const activeFilters = countActiveFilters(params.filters);

  const linkTo = (next) => {
    const s = toSearchParams({ ...params, ...next }).toString();

    return { pathname: '/', search: s ? `?${s}` : '' };
  };
  const resetTo = linkTo({ q: '', sort: DEFAULT_SORT, page: 1, filters: emptyFilters() });

  return (
    <div className="container">
      <title>{`${categoryName} — Cyber`}</title>
      <Breadcrumbs items={crumbs} />

      <div className="catalog">
        <aside className="catalog__filters only-desktop" aria-label={t('catalog.filters')}>
          {categoryQ.isPending && (
            <div className="catalog__filters-skeleton" aria-hidden="true">
              {[0, 1, 2, 3].map((i) => (
                <span key={i} className="skeleton" />
              ))}
            </div>
          )}
          {categoryQ.isError && <p className="catalog__filters-error">{t('catalog.couldNotLoadFilters')}</p>}
          {categoryQ.data && (
            <FilterPanel
              groups={groups}
              value={params.filters}
              onChange={setFilters}
              defaultOpen={['price', 'brand']}
              withPrice
            />
          )}
        </aside>

        <section className="catalog__main">
          {params.q && (
            <p className="catalog__query">
              {t('catalog.resultsFor', { query: params.q })} <Link to={linkTo({ q: '', page: 1 })}>{t('common.clear')}</Link>
            </p>
          )}
          <div className="catalog__bar">
            <p className="catalog__count">
              <span className="only-desktop">{t('catalog.selectedProducts')}</span>
              <span className="only-mobile">{t('catalog.productsResult')}</span> <b>{data ? data.total : '…'}</b>
            </p>
            <Link to={{ pathname: '/filters', search }} className="catalog__filters-btn only-mobile">
              {activeFilters > 0 ? t('catalog.filtersCount', { count: activeFilters }) : t('catalog.filters')}
              <SlidersIcon size={24} />
            </Link>
            <SortSelect value={params.sort} onChange={setSort} />
          </div>

          {isPending && (
            <>
              <LoadingHint />
              <ul className="catalog__grid" aria-busy="true">
                {Array.from({ length: limit }, (_, i) => (
                  <li key={i}>
                    <ProductCardSkeleton />
                  </li>
                ))}
              </ul>
            </>
          )}

          {isError && <QueryError message={error.message} onRetry={() => refetch()} />}

          {data && items.length > 0 && (
            <ul className={`catalog__grid${isPlaceholderData ? ' catalog__grid--stale' : ''}`}>
              {items.map((product) => (
                <li key={product.id}>
                  <ProductCard product={product} />
                </li>
              ))}
            </ul>
          )}

          {data && items.length === 0 && (
            <div className="catalog__empty">
              <p>{t('catalog.noProducts')}</p>
              <Link to={resetTo}>{t('catalog.resetFilters')}</Link>
            </div>
          )}

          {data && items.length > 0 && (
            <p className="catalog__range">
              {t('catalog.showing', {
                from: (data.page - 1) * data.limit + 1,
                to: (data.page - 1) * data.limit + items.length,
                total: data.total,
              })}
            </p>
          )}
          <Pagination page={Math.min(page, totalPages)} total={totalPages} onChange={setPage} />
        </section>
      </div>
    </div>
  );
}
