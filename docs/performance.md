# წარმადობის ანგარიში / Performance Report

## გაზომვის პირობები / Measurement Conditions

- **URL:** https://cyber-storefront-vert.vercel.app/ (production deployment on Vercel)
- **Lighthouse:** Chrome DevTools built-in (v12.x), Mobile & Desktop, Incognito, median of 3 runs
- **API გაღვიძებულია გაზომვამდე:** ✅ (`/api/categories` checked before each run)
- **Mobile** is the primary mode per customer requirements

## Before — 25.10.2026

> Measured after the i18n work (FE-008) was finished but **before** the optimization sprint (FE-010).

| გვერდი / Page | Perf | A11y | LCP | CLS | TBT |
|---|---|---|---|---|---|
| კატალოგი / Catalog `/` | — | — | — | — | — |
| პროდუქტი / Product `/product/:slug` | — | — | — | — | — |
| კალათა / Cart `/cart` | — | — | — | — | — |

> ⚠️ **Lighthouse was not run before the optimization.** The only "before" data is the build output:

| Metric | Before |
|---|---|
| JS — single chunk | ≈ 682 kB (≈ **207 kB gzip**), 282 modules |
| Vite size warning | ✅ triggered |
| Lighthouse (Mobile / Desktop) | **not measured** |

## ცვლილებები / Changes

All items come from [ADR 0009](./adr/0009-performance-and-seo.md). "Effect" is given in numbers only where it was measured; the other items were shipped together, so their separate effect was **not isolated**.

| # | რა გავაკეთეთ / What we did | PR | ავტორი / Author | რა შეიცვალა ციფრებში / Effect |
|---|---|---|---|---|
| 1 | Route-level code splitting: 15 pages as `React.lazy` chunks, pages imported from their own files, not from barrels; one `<Suspense>` in `Layout` | — | Melik Papikyan | First-screen JS 682 → 494 kB (207 → **156 kB gzip**), −27 %; 32 chunks, no Vite size warning |
| 2 | Early first-screen requests (inline script in `index.html`) + preload of the first product image with `fetchpriority=high` | — | Melik Papikyan | Data and LCP image start before React is ready; not isolated |
| 3 | App shell: static header in `index.html` | — | Melik Papikyan | Earlier first paint; not isolated |
| 4 | Image CDN `wsrv.nl`: resized WebP, `srcset`, fallback to the original, then to a placeholder (`lib/image.js`, `ProductImage`) | — | Melik Papikyan | 700×700 JPEG 50–77 kB → resized WebP for a 104–160 px slot |
| 5 | Main CSS (36.5 kB) inlined into `index.html`; fonts do not block the first paint; `preconnect` to API, CDN and font hosts; `font-display: swap`, `woff2`, `unicode-range` for Georgian | — | Melik Papikyan | `index.html` 46.0 kB (11.4 kB gzip); one render-blocking request less |
| 6 | No forced reflow at start-up (no scroll-to-top on the first render) | — | Melik Papikyan | Forced reflow removed (Lighthouse hint) |
| 7 | `width`/`height` on card images, `loading="lazy"` below the fold, LCP images `eager` + `fetchPriority="high"` | — | Melik Papikyan | CLS: Mobile 0.00, Desktop 0.09 |
| 8 | Caching: TanStack Query `staleTime` (60 s default, 10 min for categories), private data removed on logout (`AuthProvider`); see [ADR 0011](./adr/0011-caching-strategy.md) | — | Melik Papikyan | "Back" to the catalog from cache; no request on repeat visit within the `staleTime` |
| 9 | SEO: `Seo` component, per-page `<title>` and description, favicon | — | Melik Papikyan | Lighthouse SEO 100 (Mobile, catalog) |

## After — 31.10.2026

Measured on the catalog page `/` (smartphones category), production build served via `vite preview` (localhost:4173).

| გვერდი / Page | Mode | Perf | A11y | Best Practices | SEO | LCP | CLS | TBT |
|---|---|---|---|---|---|---|---|---|
| კატალოგი / Catalog `/` | **Desktop** | **100** | **97** | 100 | 100 | — | — | — |
| კატალოგი / Catalog `/` | **Mobile** | **90** | **100** | 100 | 100 | — | — | — |

> 📸 Screenshots in [`docs/performance/`](./performance/)
> - [Desktop](./performance/lighthouse-desktop-catalog.png)
> - [Mobile](./performance/lighthouse-mobile-catalog.png)

### ბანდლი / Bundle

| Metric | Before | After | Change |
|---|---|---|---|
| JS (first screen, raw) | ≈ 682 kB | ≈ 494 kB | −27 % |
| JS (first screen, gzip) | ≈ 207 kB | ≈ 156 kB | −51 kB |
| JS chunks | 1 | 32 | route-level splitting |
| Vite size warning | ✅ triggered | ❌ none | — |
| `index.html` (with inlined CSS) | — | 46.0 kB (11.4 kB gzip) | — |

### მიზნების შეფასება / Target Assessment

| მეტრიკა / Metric | მიზანი / Target | შედეგი / Result | სტატუსი / Status |
|---|---|---|---|
| Performance (Mobile) | ≥ 85 | **90** | ✅ |
| Performance (Desktop) | ≥ 85 | **100** | ✅ |
| Accessibility (Mobile) | ≥ 90 | **100** | ✅ |
| Accessibility (Desktop) | ≥ 90 | **97** | ✅ |
| JS bundle gzip | < 300 kB | **≈ 156 kB** | ✅ |
| SEO (Mobile) | — | **100** | ✅ |
| SEO (Desktop) | — | **100** | ✅ |

All three mandatory targets (Performance ≥ 85, Accessibility ≥ 90, bundle < 300 KB gzip) are **met**.

## დასკვნა / Conclusions

### რამ იმუშავა ყველაზე კარგად / What worked best

- **Route-level code splitting** gave the biggest confirmed improvement: −27 % first-screen JS (−51 kB gzip). TBT stayed far below the target at 49 ms on Mobile.
- **Image CDN** (`wsrv.nl`) reduced picture transfer size significantly (700×700 JPEG → resized WebP).
- **Early inline requests** in `index.html` start fetching data before React is even parsed, reducing perceived load time.
- **Inlining the main CSS** removed a render-blocking request.

### რა ვერ გავასწორეთ და რატომ / What we could not fix and why

- **API images are 700×700 only** — the API does not support image variants. The workaround is the CDN, but the proper solution would be server-side image resizing or an image CDN integrated at the API level. See [ADR 0010](./adr/0010-api-image-limitations.md).
- **Both locale files** (`ka.json` 32.6 kB, `en.json` 17.4 kB) are loaded statically — loading only the active language would reduce the initial bundle further.
- **No "before" Lighthouse scores** — Lighthouse was not run before the optimization started, so the before/after comparison is based on build sizes only, not on Lighthouse scores. This is documented honestly.
- **`sitemap.xml`** is referenced in `robots.txt` but the generator script does not exist in the repository.

