# Journal — Week 3

- **Period:** 19.10.2026 – 28.10.2026 (the last three days were used for performance, SEO and the final documentation)
- **Project:** Cyber Shop (React front end)
- **Total time spent:** about 20 hours

## 1. Goals for the week

- FE-008: Add Georgian + English language support (i18n) to the entire UI.
- FE-009: Upgrade the dark theme from 2 states (light/dark) to 3 states (light/dark/system) and eliminate the FOUC (flash of wrong color on reload).
- Fix bugs found during the lecturer's review of FE-004 – FE-007.
- Make the first screen fast on a slow phone (the single JS chunk had grown to ≈ 682 kB) and prepare the public pages for search engines and link previews.
- Bring README, ARCHITECTURE.md, `docs/` and the journal in line with the final code, with numbers measured on the real build.

## 2. What I did

| Topic | Status | Notes |
| --- | --- | --- |
| i18n: Georgian + English (FE-008) | Done | Two JSON files (`locales/ka.json`, `locales/en.json`), 391 keys each with identical key sets when this row was written (393 keys each on 28.10.2026, still identical). First built with an own `I18nProvider` (React Context), later moved to **`react-i18next`** (`src/lib/i18n/`, `useTranslation()` returns `{ t, i18n }`, no provider; plurals `_one` / `_other` and `{{param}}` interpolation). Every component's hardcoded text replaced with `t()` calls. Prices, dates and ratings formatted via `Intl` (locale-aware). See [ADR 0007](../docs/adr/0007-i18n-strategy.md) and [ADR 0008](../docs/adr/0008-react-i18next.md). |
| i18n: language switcher | Done | `LanguageSwitcher` component (KA / ENG segmented pill, `role="group"`, `aria-pressed`) in the header (desktop and mobile). The choice is saved in `localStorage` (`lang`) and `<html lang>` is updated; the page does not reload. |
| i18n: API data | Done | Category names use `nameEn` (English) or `name` (Georgian) depending on the language (`getCategoryName`). Filter titles use `t('filter.<key>')` via updated `getFilterTitle`. Spec **names** are translated through `SPEC_I18N_KEYS`; spec **values** stay in Georgian (API limitation, documented in ADR 0007 and ADR 0008). |
| i18n: inline script | Done | The `<script>` in `index.html` reads `localStorage.lang` and sets `<html lang>` before React mounts. |
| Theme: 3 states (FE-009) | Done | `theme.js` now stores `'light' \| 'dark' \| 'system'` in localStorage. `getPreference()` returns the stored choice, `getTheme()` the resolved one. When `system`, `matchMedia('prefers-color-scheme: dark')` is listened to live. |
| Theme: FOUC prevention (FE-009) | Done | Inline `<script>` in `index.html` `<head>` reads `localStorage.theme`, resolves it (including `system` → `matchMedia`), and sets `data-theme`, `color-scheme`, and `<meta name="theme-color">` before the first paint. |
| Theme: toggle (FE-009) | Done | `ThemeToggle` first had three buttons (☀️ 🌙 💻); it is now **one button** that cycles light → dark → system (three stacked icons, the `aria-label` names the next mode; in the mobile menu it is a row with the name of the current mode). All three states are reachable. |
| Theme: tokens instead of overrides (FE-009) | Done | Components now use theme tokens (`--t-*`, `--c-*`, `--color-*`); `theme.css` holds the light and dark values of the same tokens plus a short dark-only list. About 20 hard-coded colors remain in 6 stylesheets on purpose (footer, payment card, star / heart, thumbnail tile). Contrast of the main text / background pairs was calculated for both themes (see section 4). |
| Bug fix: `inFlight` ref in PaymentStep | Done | The `useRef(false)` guard and the `if (inFlight.current) return` check were commented out — restored and added a `finally` block to reset the ref. |
| Bug fix: TOKEN_EXPIRED hard redirect | Done | `apiClient.js` no longer does `window.location.href = '/login'` on TOKEN_EXPIRED. Instead it throws an `ApiError`, and the calling hooks (like `useAddToCart`) navigate with `state.from` preserved, so the user returns to the product page after re-login. |
| Updated ADR 0006 | Done | Documented the 3-state theme, FOUC prevention inline script, the exception to ADR 0002, the cycling button and the token approach. |
| ADR 0008 (react-i18next) | Done | Records the move from the own Context to `react-i18next`, what is and is not translated, language kept in `localStorage` (not in the URL), and that the proper fix is an `Accept-Language` header on the API. |
| Lint and build check (23–25.10) | Done | `npm run lint` was clean (0 errors; the two `react-hooks/refs` errors from week 2 were gone) and `npm run build` passed (282 modules, one JS chunk ≈ 682 kB / ≈ 207 kB gzip). This is the state **before** the performance work; the final measurement is in the row *Final check on 28.10.2026*. |
| Performance: route-level code splitting | Done | 15 pages are `React.lazy` chunks; only `Layout` and `CatalogPage` are in the main bundle. One `<Suspense>` inside `Layout` keeps the header and footer on screen. Pages are imported from their own files, not from the feature barrels. See [ADR 0009](../docs/adr/0009-performance-and-seo.md). |
| Performance: early requests and app shell | Done | An inline script in `index.html` starts `GET /categories/smartphones` and the first page of products before the bundle is ready; `apiRequest()` takes the answers from `window.__earlyRequests` (each is used once). The first product picture is preloaded with a high priority; a static header is painted at once. |
| Performance: product pictures | Done | `lib/image.js` + `ProductImage`: resized WebP versions through the image CDN `wsrv.nl` (`srcset` 160–480 px for cards, 320–700 px for the product photo), automatic fallback to the original and then to a placeholder; `VITE_IMAGE_PROXY` switches it off. |
| Performance: CSS, fonts, caching | Done | The main CSS (36.5 kB) is inlined into `index.html` by a Vite plugin; Inter loads without blocking; `preconnect` to the API, the CDN and the font hosts; `public/_headers` with long caching of hashed files; no forced reflow at start-up (no scroll on the first render). |
| SEO: `Seo` component and indexing rules | Done | `components/Seo` and `lib/seo.js`: description, canonical, `noindex`, Open Graph, Twitter and JSON-LD per page. A plain category page is indexed; search, filtered and re-sorted lists are `noindex` with a canonical to the category; private screens and placeholder pages are `noindex`. Pagination numbers are real links. |
| SEO: product page, `robots.txt`, preview picture | Done | Unique title and description, `og:image`, schema.org `Product` (price, availability, rating) and `BreadcrumbList`; `public/robots.txt`; `public/og-image.png` (1200 × 630); `VITE_SITE_URL` fills the absolute addresses at build time. |
| Final check on 28.10.2026 | Done | `npm run build`: **274 modules, 32 JS chunks, ≈ 8.7 s, no size warning**; first-screen JavaScript ≈ **494 kB (≈ 156 kB gzip)** instead of ≈ 682 kB (≈ 207 kB gzip), about 27 % less; all chunks together ≈ 704 kB; `index.html` 46.0 kB (11.4 kB gzip). `npm run lint`: **1 error, 0 warnings** (`react-refresh/only-export-components` in `src/main.jsx:17`, not fixed yet). Dictionaries: 393 keys in `ka.json` and in `en.json`, identical. Lighthouse was not run. |
| Documentation | Done | ADR 0007 (i18n strategy), ADR 0008 (react-i18next) and ADR 0009 (performance and SEO), updated ADR 0006, `README.md` (new sections *Performance and SEO* and *Project in numbers*), `ARCHITECTURE.md` (new section 20 *Performance and SEO notes*, new numbers, corrected limitations), `docs/index.md`, filled in `journal/week-2.md` (was a draft), created `journal/week-3.md`; plan checkboxes in weeks 1 and 2 brought up to date. |

## 3. Problems and how I solved them

| Problem | Cause | Solution |
| --- | --- | --- |
| Prices showed wrong separators in Georgian mode | `formatPrice` used a simple template literal, not locale-aware formatting | Replaced with `formatPriceI18n()` wrapping `Intl.NumberFormat` with `ka-GE` / `en-US` locales |
| Sort option labels didn't update when switching language | `SORT_OPTIONS` was a static array with English labels defined at module level | Moved to `SORT_KEYS` (just the value strings) and labels are now fetched via `t('sort.<key>')` at render time |
| Filter titles stayed in English when switching to Georgian | `getFilterTitle()` only read from a static English map | Updated to accept `t` function: `getFilterTitle(group, t)` tries `t('filter.<key>')` first |
| The FOUC script set the wrong theme for `system` preference | The original inline script only checked for `'dark'` / `'light'` in localStorage | Added `matchMedia` check in the inline script for when the stored preference is `'system'` (or absent) |
| `inFlight` ref was not reset after an error in PaymentStep | The commented-out code had no `finally` block | Added `finally { inFlight.current = false; }` so the guard resets even if the request fails |
| After TOKEN_EXPIRED, user was not returned to the product page | `apiClient.js` did `window.location.href = '/login'` which reloads the page and loses React Router state | Changed to `throw ApiError` so hooks navigate with `state: { from }` preserved |
| Slow largest paint on a phone and the Lighthouse hints "Properly size images" / "Serve images in next-gen formats" | The API serves every picture at 700 × 700 (50–77 kB) while a card shows it at 104–160 px | Resized WebP versions through the image CDN with a `srcset`; fixed `width` / `height` on cards; the first two pictures have a high fetch priority |
| The first catalog data arrived late | The requests started only after the JavaScript bundle was downloaded and parsed | The same requests are started from an inline script in `index.html`; `apiRequest()` reuses the answers once |
| A lazy page was pulled back into the main bundle | A feature barrel (`index.js`) re-exports every page of the feature | `App.jsx` imports each lazy page from its own file |
| Duplicate `<meta>` tags | Rendering `<meta>` in a page adds a second tag next to the default of `index.html` | `Seo` updates the existing tags and restores the defaults when the page is left |
| The same products under many addresses (search, filters, sorting) | Every combination of query parameters is a separate URL with almost the same content | Only a plain category page is indexed; the others get `noindex` and a canonical to the category; the duplicates are also closed in `robots.txt` |
| "Forced reflow" at start-up | `scrollTo()` was called on the first render | The scroll runs only when the path (or the page number) really changes |
| `npm run lint` reports an error in `src/main.jsx` | The lazy `ReactQueryDevtools` constant (development only) is declared in the entry file, and `react-refresh/only-export-components` does not accept it | **Not fixed.** It does not affect the build; moving the constant to its own file would remove it |
| `robots.txt` promises a sitemap that does not exist | The comment mentions `scripts/generate-sitemap.mjs`, but the script and the `package.json` hook are not in the repository | **Not fixed.** `sitemap.xml` is listed as a limitation in ARCHITECTURE.md |

## 4. What I learned

- How an i18n system works from the inside: a first version with React Context + JSON + `Intl` showed what is needed (keys, interpolation, plurals, language change), and moving to `react-i18next` kept the same JSON files while the library took over the mechanics.
- Why `Intl.NumberFormat` is better than custom price formatting: it handles locale-specific separators, currency symbols, and symbol placement automatically.
- How an inline script in `<head>` prevents FOUC by applying the theme before the browser paints. The script must be synchronous and tiny.
- Why `window.location.href` redirects are problematic in a SPA: they reload the entire app and lose all in-memory state including React Router's `location.state`.
- How `useSyncExternalStore` allows reading both the resolved theme and the stored preference from the same external store.
- How to check dark-theme contrast with numbers instead of by eye: the WCAG ratio of the main text / background token pairs is ≥ 4.5:1 in dark mode; in light mode the rating badge text (`--t-rating-text` on `--t-rating-bg`) is only about 1.9:1 and is still to be fixed.
- How route-level code splitting works with `React.lazy` and `<Suspense>`, and why a barrel file can silently defeat it.
- How to measure instead of guess: the build report shows the first-screen JavaScript (the main chunk plus the chunks `index.html` preloads, ≈ 494 kB) and the total of all chunks (≈ 704 kB); both numbers are needed to describe a split bundle honestly.
- How a single-page app can have per-page SEO: static defaults in `index.html`, per-page tags written by JavaScript, `canonical` + `noindex` for duplicates, absolute addresses for Open Graph, and the limit of the approach (crawlers and messengers that do not run JavaScript see only the defaults).
- Why an image CDN with `srcset` and an automatic fallback is a good front-end answer when the API cannot be changed.

## 5. Decisions made this week

- [ADR 0007 — i18n strategy](../docs/adr/0007-i18n-strategy.md): Georgian + English, JSON files, `Intl` for prices, specs stay in Georgian (the React Context part was replaced by ADR 0008).
- [ADR 0008 — react-i18next](../docs/adr/0008-react-i18next.md): the home-made Context is replaced by `react-i18next`; the same JSON dictionaries, plurals and interpolation from the library.
- [ADR 0006 — color theme (updated)](../docs/adr/0006-color-theme.md): 3 states (light / dark / system), FOUC prevention with inline script.
- [ADR 0009 — performance and SEO](../docs/adr/0009-performance-and-seo.md): route-level code splitting, early first-screen requests, image CDN, the `Seo` component and the canonical / `noindex` rules.

## 6. Questions for the lecturer / things I did not understand

- Product specs come from the API in Georgian only. Should we add a static English mapping for spec *values* (not just labels), or is it acceptable to show Georgian values in both languages?
- ~~The `format.js` file still has the old `formatPrice` and `formatWarranty` functions.~~ Resolved: `lib/format.js` is gone; formatting lives in `lib/i18n/format.js`, and the warranty text is a local helper in `ProductPage.jsx`.
- The API has no `Accept-Language` support. Is it enough that ADR 0008 records this as the proper fix, or should the front end do more (for example a static English map for the most common spec values)?
- The per-page SEO tags are written by JavaScript (a crawler without JavaScript sees only the defaults of `index.html`), and there is no `sitemap.xml`. Is this acceptable for the project, or is pre-rendering / a sitemap expected?

## 7. Plan for next week

- [ ] Tests for the pure functions (`lib/catalog.js`, `cartRules.js`, `profileForm.js`, `isTokenExpired`, `card.js`, `addressForm.js`, `checkoutErrors.js`, `i18n` formatters)
- [x] Route-level code splitting (`React.lazy`); the single JS chunk was larger with i18n — done, see ADR 0009 (first screen ≈ 494 kB instead of ≈ 682 kB)
- [x] Remove unused `formatPrice` / `formatWarranty` from `lib/format.js` (done)
- [x] Replace the hard-coded `#000` / `#fff` in component CSS with tokens (done, about 20 intentional ones remain)
- [ ] Take the PR screenshots for FE-008 (both languages) and FE-009 (both themes, 3 pages) and check 360 / 768 / 1440 px
- [ ] Wishlist page
- [ ] Fix the one lint error in `src/main.jsx` (move the lazy `ReactQueryDevtools` constant to its own file)
- [ ] Generate `sitemap.xml` (or remove the sentence about `scripts/generate-sitemap.mjs` from `public/robots.txt`)
- [ ] Set the real `VITE_SITE_URL` on the host and run Lighthouse on the deployed site (no score is recorded yet)
- [ ] Check the light-theme contrast of the rating badge (≈ 1.9:1 measured in this week)

## 8. Self-assessment

- What went well: the i18n system works cleanly — switching language updates the entire UI instantly, prices are correctly formatted per locale, and no text is left hardcoded. The FOUC fix with the inline script is effective and small. The bug fixes from the lecturer's feedback were straightforward once the root cause was clear.
- What was difficult: finding every hardcoded string in 30+ components and making sure the translation keys are organized logically. Also making sure the inline script in `index.html` stays in sync with `theme.js` (they both resolve the same logic).
- What I would do differently: start with i18n from the beginning of the project. Retrofitting translations to an existing codebase is much more work than building with them from day one.

## 9. Project totals after three weeks (measured on 28.10.2026)

| Metric | Value |
| --- | --- |
| Time spent (the author's figures from the three journal files) | about 75 hours: week 1 ≈ 25, week 2 ≈ 30, week 3 ≈ 20 |
| Tickets | FE-001 – FE-009 (week 1: FE-001 – FE-005, week 2: FE-006 and FE-007, week 3: FE-008 and FE-009, the last two are the bonus tasks), plus the performance and SEO work of week 3 |
| Files in `src/` | 176 (115 JS / JSX, 58 CSS, 2 JSON, 1 font) |
| Lines of code | 7,831 JS / JSX + 5,283 CSS + 902 JSON = 14,016 |
| Pages and routes | 17 page components, 21 route entries (15 lazy) |
| Components | 21 shop components + 7 UI-kit components; 5 feature modules |
| API paths used | 21 |
| Translation keys | 393 per language |
| Dependencies | 10 runtime + 12 development |
| Documentation | README, ARCHITECTURE.md, `docs/index.md`, 9 ADRs, 3 journal files |
| Production build | 274 modules, 32 JS chunks, ≈ 8.7 s; first screen ≈ 494 kB JS (≈ 156 kB gzip) |
| Lint / tests | 1 error, 0 warnings / 0 test files |

Not recorded (no `.git` folder was available for this check): the number of commits, branches and pull requests.
