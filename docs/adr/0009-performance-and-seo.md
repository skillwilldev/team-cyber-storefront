# ADR 0009: Performance and SEO — code splitting, early requests, image CDN, `Seo` component

- **Status:** Accepted
- **Date:** 2026-10-28
- **Ticket:** —

## Context

After the i18n work the whole application was **one JavaScript chunk of ≈ 682 kB (≈ 207 kB gzip, 282 modules)** and Vite warned about it. The free-hosted API can also be slow to answer, the product pictures are served in their original size (700 × 700, 50–77 kB) while a card shows them at 104–160 px, and the app is a single-page application: every URL returns the same `index.html`, so every page had the same title, description and link preview.

Two goals followed:

1. a fast first screen on a slow phone (the catalog is the first screen);
2. pages that search engines can index correctly and that messengers can preview.

Constraints: the front end only (the API and the host cannot be changed), no server-side rendering, no new framework.

## Decision

**Performance**

1. **Route-level code splitting.** Only `Layout` and `CatalogPage` are in the main bundle; the other 15 pages are `React.lazy` chunks imported from their own files (not from the feature barrels, which would pull them back). One `<Suspense>` inside `Layout` around `<Outlet />` keeps the header and the footer on screen while a chunk loads.
2. **Early first-screen requests.** An inline script in `index.html` starts `GET /categories/smartphones` and the first page of products as soon as the HTML is parsed, only for `/` without a query string. `apiRequest()` takes the answers from `window.__earlyRequests` (each answer is used once; a failed request is simply repeated by the app). The picture of the first product (the probable LCP element) is preloaded with `fetchpriority=high`.
3. **App shell.** A static header with the logo is part of `index.html`; React replaces it when it starts.
4. **Image CDN.** Product pictures are requested through `wsrv.nl` (resized, WebP, quality 75) with a `srcset` built in `lib/image.js`. `ProductImage` falls back to the original URL and then to a placeholder. `VITE_IMAGE_PROXY` changes the CDN or switches it off.
5. **Main CSS inlined** into `index.html` by a small Vite plugin (not for a stylesheet larger than 80 kB); fonts load without blocking the first paint; `preconnect` to the API, the CDN and the font hosts; long-lived caching of hashed files in `public/_headers`.
6. The scroll-to-top in `Layout` and `CatalogPage` is skipped on the first render (no forced reflow at start-up).

**SEO**

7. **Static defaults in `index.html`** (title, description, Open Graph, Twitter, JSON-LD `Organization` + `WebSite`), filled with the real address by the build (`VITE_SITE_URL`, placeholder `__SITE_URL__`).
8. **`<Seo />` component** for per-page tags. It **changes the tags that already exist** in `index.html` and restores them when the page is left, instead of rendering new `<meta>` elements.
9. **Indexing rules.** A plain category page (no search, default sort, no filters) is indexed and is its own canonical. Search results, filtered and re-sorted lists get `noindex` and a canonical that points to the category. Private screens and placeholder / 404 pages get `noindex` and are closed in `public/robots.txt`. Page numbers are real links.
10. **Product page:** unique title and description, canonical address, `og:image`, schema.org `Product` (price, availability, rating) and `BreadcrumbList`.

## Alternatives considered

| Option | Why it was not chosen |
| --- | --- |
| Render `<meta>` elements in every page (React 19 moves them to `<head>`) | `index.html` already has default `<meta>` tags, so the page would end up with **duplicates**; updating the existing tags and restoring them on leave is safe |
| Serve the original pictures | 700 × 700 files for a 104–160 px slot is the main reason for a slow LCP; the API cannot be changed, so a CDN in front is the only front-end fix |
| Pre-rendering or server-side rendering | Would solve the "crawler without JavaScript" problem, but needs a different build and host; out of scope for a front-end-only project (recorded as a limitation) |
| Keep one bundle and only raise Vite's warning limit | Hides the problem; the first screen would still download every page |

## Consequences

**Positive**

- First-screen JavaScript on 28.10.2026: **≈ 494 kB (≈ 156 kB gzip)** instead of ≈ 682 kB (≈ 207 kB gzip): about 27 % less. The build has 274 modules, 32 JS chunks and no size warning; `index.html` is 46.0 kB (11.4 kB gzip) with the main CSS inside.
- The catalog request and the first picture start before React is ready; the header is painted at once.
- Filtered, sorted and searched lists no longer compete with the category page in a search index; shared product links get their own title, description and picture.

**Negative / to remember**

- The per-page tags are written by JavaScript. A crawler that does not run JavaScript, and the preview of a messenger, see only the Georgian defaults of `index.html`. Pre-rendering is the real fix.
- The widths in the inline script of `index.html` must be kept in sync with `lib/image.js` and `ProductCard` (a comment in both places says so).
- The image CDN is a third party; the fallback to the original URL covers a failure, but not slowness.
- `public/robots.txt` mentions a sitemap generator (`scripts/generate-sitemap.mjs`) that is **not** in the repository, so `sitemap.xml` does not exist yet.
- `VITE_SITE_URL` must be set to the real address on the host (the local `.env` has `http://localhost:4173`).
- Lighthouse scores were not measured; the numbers above are build sizes, not scores.
