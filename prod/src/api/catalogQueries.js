import { keepPreviousData, queryOptions, useQuery } from '@tanstack/react-query';
import { fetchCategories, fetchCategory, fetchProduct, fetchProducts } from './catalogApi';
import { queryKeys } from './queryKeys';

/**
 * Query options = key + fetch function (+ settings) in ONE place.
 * They can be reused by hooks (useQuery), by prefetching (queryClient.prefetchQuery)
 * and by cache reads (queryClient.getQueryData) without repeating the key.
 */
export const categoriesQuery = () =>
  queryOptions({
    queryKey: queryKeys.categories.all,
    queryFn: ({ signal }) => fetchCategories({ signal }),
    staleTime: 10 * 60 * 1000, // categories almost never change
  });

export const categoryQuery = (slug) =>
  queryOptions({
    queryKey: queryKeys.categories.detail(slug),
    queryFn: ({ signal }) => fetchCategory(slug, { signal }),
    enabled: Boolean(slug),
    staleTime: 10 * 60 * 1000, // filter definitions almost never change
  });

export const productsQuery = (query) =>
  queryOptions({
    queryKey: queryKeys.products.list(query),
    queryFn: ({ signal }) => fetchProducts(query, { signal }),
  });

export const productQuery = (slug) =>
  queryOptions({
    queryKey: queryKeys.products.detail(slug),
    queryFn: ({ signal }) => fetchProduct(slug, { signal }),
    enabled: Boolean(slug),
  });

export const useCategories = () => useQuery(categoriesQuery());

export const useCategory = (slug) => useQuery(categoryQuery(slug));

/**
 * placeholderData: keepPreviousData — while the next page / new filters are loading,
 * the previous result stays on screen (`isPlaceholderData === true`) instead of flashing a spinner.
 */
export const useProducts = (query) => useQuery({ ...productsQuery(query), placeholderData: keepPreviousData });

export const useProduct = (slug) => useQuery(productQuery(slug));
