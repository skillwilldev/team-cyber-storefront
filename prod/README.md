# Cyber shop

React 19.3 · React Router 7 · TanStack Query 5 · React Hook Form + Zod · Vite 8 (React Compiler).

```bash
npm install
npm run dev       # http://localhost:5173  (TanStack devtools = the flower button, bottom-right)
npm run build     # production build → dist/
npm run preview   # serve dist/
```

`.env`: `VITE_API_URL=https://shop-api-kbe6.onrender.com/api` (the same URL is the built-in fallback).
The API is on free hosting — the first request after a pause can take up to a minute (the UI tells the user).

## Routes

| Path | Page |
| --- | --- |
| `/` | Catalog: filters (sidebar), sort, pagination, search |
| `/filters` | Mobile filters screen (on desktop redirects to `/`) |
| `/product/:slug` | Product page |
| `/login` `/register` `/forgot-password` | Auth (public) |
| `/account` | Protected page → redirects to `/login` without a valid token |

Catalog state lives in the URL, in the same format the API uses:
`/?category=smartphones&brand=Apple,Samsung&storage=256gb&minPrice=500&maxPrice=3000&inStock=true&sort=price-asc&page=2&q=pro`
Default category is `smartphones`; any other category slug from `GET /categories` works: `/?category=laptops`.

## Structure (every component/page = its own folder with its own CSS)

```
src/
  api/          queryClient · queryKeys · catalogApi (plain fetch fns) · catalogQueries (useQuery hooks)
  components/   Header Footer Layout FilterPanel Checkbox PriceRange ProductCard ProductImage
                ProductCardSkeleton QueryError LoadingHint Pagination SortSelect Breadcrumbs Stars ...
  pages/        CatalogPage FiltersPage ProductPage StubPage
  features/auth/  context · hooks · pages (Login Register ForgotPassword Account) · AuthLayout · ProtectedRoute
  shared/       api/apiClient (token, ApiError) · lib/validators (zod) · ui (Button Input Alert ...)
  lib/          catalog (URL ⇄ API mapping) · format · specs · filterLabels
  hooks/        useCatalogParams · useMediaQuery
  data/         reviews.js (demo only — the API has no reviews endpoint)
  styles/       vars · reset · global · auth-tokens
```

## How TanStack Query works here (read in this order)

1. `main.jsx` — `QueryClientProvider` gives the whole app one **cache**.
2. `api/queryClient.js` — defaults: `staleTime` (how long data is "fresh"), `retry` (no retries on 4xx).
3. `api/catalogApi.js` — plain functions `fetchProducts(...)`. They know nothing about React.
4. `api/queryKeys.js` + `api/catalogQueries.js` — **query key** = the address of the data in the cache
   (`['products','list',{category,brand,page,...}]`). Change any value in the key → new request, or an instant cache hit.
5. `pages/CatalogPage` — `useProducts(...)` returns `{ data, isPending, isError, error, refetch, isPlaceholderData }`;
   the page just renders these states (skeleton → data / error + retry / empty).
   `placeholderData: keepPreviousData` keeps the old page on screen (dimmed) while the next one loads.
6. `useCategory(slug)` loads the filter definitions; `FilterPanel` renders whatever the API sends
   (`checkbox` / `radio` / `color` / `range`) — nothing is hard-coded, so every category works.
7. **State split:** server data → TanStack Query · "who is signed in" → `AuthContext` · catalog filters/sort/page → the URL.
8. Open the devtools and click around: you can see keys, `fresh`/`stale`, and cache hits when you go back to a page.

## Notes

- Images: if the API image is `null` or fails to load, `ProductImage` shows a placeholder; a working URL appears automatically.
- Public catalog requests are sent with `auth: false` (no token), so an expired token can never break browsing.
- SPA hosting: rewrite all paths to `index.html` (`public/_redirects` is included for Netlify-style hosts;
  Render static site: rewrite `/*` → `/index.html`; Firebase: `"rewrites": [{ "source": "**", "destination": "/index.html" }]`).
