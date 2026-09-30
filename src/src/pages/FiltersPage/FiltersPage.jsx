import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useCategory } from '@api/catalogQueries';
import FilterPanel from '../../components/FilterPanel/FilterPanel';
import { ChevronIcon } from '../../components/icons/icons';
import QueryError from '../../components/QueryError/QueryError';
import { useCatalogParams } from '../../hooks/useCatalogParams';
import { MOBILE_QUERY, useMediaQuery } from '../../hooks/useMediaQuery';
import { AVAILABILITY_GROUP, emptyFilters, toSearchParams } from '../../lib/catalog';
import './FiltersPage.css';

/** Mobile filters screen: the changes are applied only after pressing "Apply". */

export default function FiltersPage() {
  const { params } = useCatalogParams();
  const { search } = useLocation();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(MOBILE_QUERY);
  const categoryQ = useCategory(params.category);
  const [draft, setDraft] = useState(params.filters);
  // there is no separate filters screen on desktop, the sidebar is used instead
  if (!isMobile) return <Navigate to={{ pathname: '/', search }} replace />;

  const groups = categoryQ.data ? [...categoryQ.data.filters, AVAILABILITY_GROUP] : [];
  const apply = () => {
    const s = toSearchParams({ ...params, filters: draft, page: 1 }).toString();
    navigate({ pathname: '/', search: s ? `?${s}` : '' });
  };

  return (
    <div className="container filters-page">
      <div className="filters-page__top">
        <Link to={{ pathname: '/', search }} aria-label="Back to catalog" className="filters-page__back">
          <ChevronIcon direction="left" size={28} />
        </Link>
        <h1>Filters</h1>
        <button type="button" className="filters-page__reset" onClick={() => setDraft(emptyFilters())}>
          Clear all
        </button>
      </div>

      {categoryQ.isPending && (
        <div className="filters-page__skeleton" aria-hidden="true">
          {[0, 1, 2, 3].map((i) => (
            <span key={i} className="skeleton" />
          ))}
        </div>
      )}
      {categoryQ.isError && <QueryError message={categoryQ.error.message} onRetry={() => categoryQ.refetch()} />}
      {categoryQ.data && (
        <FilterPanel
          groups={groups}
          value={draft}
          onChange={setDraft}
          defaultOpen={['price', 'brand', 'storage']}
          withPrice
          scrollable
          priceDelay={0}
        />
      )}

      <button type="button" className="filters-page__apply" onClick={apply} disabled={!categoryQ.data}>
        Apply
      </button>
    </div>
  );
}
