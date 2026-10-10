import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { parseParams, toSearchParams } from '../lib/catalog';

/**
 * Catalog state (category, filters, sort, page, search) lives in the URL — the single source of truth.
 * No useState / context for it: the URL changes → params change → the products query key changes → TanStack Query fetches.
 */
export function useCatalogParams() {
  const [sp, setSp] = useSearchParams();
  const params = useMemo(() => parseParams(sp), [sp]);

  return {
    params,
    setFilters: (filters) => setSp(toSearchParams({ ...params, filters, page: 1 })),
    setSort: (sort) => setSp(toSearchParams({ ...params, sort, page: 1 })),
    setPage: (page) => setSp(toSearchParams({ ...params, page })),
  };
}
