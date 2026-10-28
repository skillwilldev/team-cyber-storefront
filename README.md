# Cyber Shop

A responsive online electronics store front end built with **React 19**, **React Router 7**, **TanStack Query 5**, **React Hook Form + Zod** and **Vite 8** (with the React Compiler).

It talks to a ready-made REST API and covers the full shopping flow: a data-driven catalog with filters, sorting, search and pagination; product pages; registration, login and password reset; a profile editor; a **server-side shopping cart**; **delivery addresses**; a **3-step checkout** with a simulated card payment and an e-mail code; and the **orders history**. The whole interface is available in **Georgian and English** and in a **light, dark or system** color theme. The first screen is tuned for a slow phone (route-level code splitting, early first-screen requests, resized WebP pictures) and the public pages are prepared for search engines and link previews (canonical addresses, Open Graph, schema.org data).

> 📐 Want to understand how everything fits together? Read **[ARCHITECTURE.md](./ARCHITECTURE.md)** — folder structure, data flow, module and function reference, API reference and design decisions.

---

## Table of contents

- [Features](#features)
- [Tech stack](#tech-stack)
- [Getting started](#getting-started)
- [Scripts](#scripts)
- [Environment variables](#environment-variables)
- [Routes](#routes)
- [Project structure](#project-structure)
- [How it works (short version)](#how-it-works-short-version)
- [Performance and SEO](#performance-and-seo)
- [Catalog URL format](#catalog-url-format)
- [Working with the API](#working-with-the-api)
- [Deployment](#deployment)
- [Documentation](#documentation)
- [Project status](#project-status)
- [Project in numbers](#project-in-numbers)
- [Troubleshooting](#troubleshooting)
- [Contributing and code style](#contributing-and-code-style)
- [License](#license)

---

## Features

**Catalog**
- Category-based product listing (default category: `smartphones`; any category slug from the API works)
- **Data-driven filters** — the filter panel is built from the API response (checkbox, radio, colour and price-range filters), so new categories need no front-end changes
- Price range slider with numeric inputs and debounced requests
- Seven sort modes (rating, price ↑/↓, newest, oldest, popular, name A–Z)
- Header search with debounce
- Pagination (8 items per page on mobile, 9 on desktop); the page numbers are real links, so search engines can follow them
- Whole catalog state lives **in the URL** — shareable links, working Back button, state survives refresh
- Separate mobile filters screen with an "Apply" button

**Product page**
- Image gallery, price with discount badge, quick specs with icons, grouped specification tables with "View More"
- Rating and review count, related products
- Add to cart and add to wishlist

**Accounts**
- Register, sign in, sign out
- Three-step password reset (email → 6-digit code → new password)
- Profile editor that sends **only changed fields**
- Protected routes with automatic return to the page you came from after signing in
- Centralised handling of expired sessions; an already expired token is detected locally (no failing `GET /auth/me` on start-up)

**Addresses**
- Up to 10 saved delivery addresses per user: add, edit, delete, choose the default one
- The same address manager is used on the `/addresses` page and on checkout step 1

**Checkout and orders**
- Three steps: address → shipment method → card payment, then a 6-digit confirmation code and an order page
- The chosen address and the pending order live **in the URL**, so F5 and the Back button keep the screen; the card exists **only in the payment form** and is emptied right after the order is created
- Card form with live formatting, Luhn check, expiry check and a card preview with the brand logo
- Protection against double payment, a resend-code timer, clear messages for a declined card, a missing address or a product that ran out of stock
- Orders history (`/orders`) and a "Thank you!" order page that works after a refresh
- The payment is **simulated** by the learning API: no money moves

**Cart**
- Server-side cart bound to the user
- Quantity stepper (1–99, limited by stock), remove, totals calculated by the server
- Header badge always in sync with the cart page (one shared cache entry)
- Stock-problem detection that blocks checkout until fixed

**Appearance and language**
- Light / dark / **system** theme: one button at the right end of the header (and in the mobile menu) cycles the three modes; the choice is saved in `localStorage`, `system` follows the OS setting live, and the choice is shared between tabs
- No flash of the wrong theme on reload: a tiny inline script in `index.html` applies the theme before the first paint (ADR 0006)
- Georgian (default) and English: a KA / ENG switch in the header; the language changes without a page reload, is saved in `localStorage` and sets `<html lang>`
- Prices, dates and ratings are formatted with `Intl` for the current language (for example `1510 ₾` and `1234,56 ₾` in Georgian, `₾1,510` and `₾1,234.56` in English — the exact separators are decided by the browser's `Intl`)
- The API is single-language, so category names (`nameEn`) and filter labels are translated, while product specs values stay as the API sends them (ADR 0008)

**Performance and SEO**
- Route-level code splitting: 15 pages are loaded on first visit, the header and footer stay on screen while a page loads
- The first catalog requests start from an inline script in `index.html` while the bundle is still loading; a static header (app shell) is painted at once
- Product pictures are requested resized and as WebP through a free image CDN, with an automatic fallback to the original picture
- One `<h1>` per page, a unique title and description, canonical addresses, `noindex` for private screens and for filtered / sorted / searched lists, Open Graph and Twitter tags, schema.org `Product` and `BreadcrumbList` data on the product page, `robots.txt`
- Details: [Performance and SEO](#performance-and-seo) and [ADR 0009](./docs/adr/0009-performance-and-seo.md)

**Quality**
- Loading skeletons, error states with "Try again", empty states
- Friendly hint when the free-hosted API is waking up
- Accessible markup (landmarks, labels, ARIA live regions, focus styles, reduced-motion support)

---

## Tech stack

| Area | Technology |
| --- | --- |
| UI | React 19 |
| Routing | React Router 7 |
| Server state | TanStack Query 5 (+ Devtools in development) |
| Forms | React Hook Form 7, `@hookform/resolvers` (profile, addresses, card, codes) |
| Validation | Zod 3 |
| Build tool | Vite 8 |
| Optimisation | React Compiler (`babel-plugin-react-compiler`) |
| Linting | ESLint 10 (flat config), `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh` |
| Styling | Plain CSS files per component (BEM-style class names); light / dark / system theme through the `data-theme` attribute and CSS variables (tokens) |
| i18n | `i18next` + `react-i18next` (Georgian / English, two JSON dictionaries), `Intl` for numbers, prices and dates |
| SEO | `Seo` component (`<head>` tags per page), `lib/seo.js`, static tags in `index.html`, `public/robots.txt` |
| Images | Image CDN `wsrv.nl` (resize + WebP) through `lib/image.js`; can be switched off |
| Fonts | Inter (Google Fonts, loaded without blocking the first paint) + ADG2, a local Georgian font (`src/assets/fonts/ADG2.woff2`) |

---

## Getting started

### Requirements

- **Node.js** — a current LTS version (Vite 8 requires a modern Node release)
- **npm** (comes with Node)

### Install and run

```bash
# 1. install dependencies
npm install

# 2. start the dev server
npm run dev
```

The app opens at **http://localhost:5173**. In development a small "flower" button appears in the bottom-right corner — that is the **TanStack Query Devtools**. Open it to watch query keys, `fresh` / `stale` states and cache hits live while you click around.

### Production build

```bash
npm run build      # outputs to dist/
npm run preview    # serves dist/ locally to check the production build
```

---

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the Vite dev server with hot reload |
| `npm run build` | Create an optimised production build in `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | Run ESLint on the whole project |

---

## Environment variables

Create a `.env` file in the project root (a template is provided in `.env.example`):

```env
VITE_API_URL=https://shop-api-kbe6.onrender.com/api
VITE_SITE_URL=https://your-site.example
VITE_IMAGE_PROXY=https://wsrv.nl
```

| Variable | Default | Description |
| --- | --- | --- |
| `VITE_API_URL` | `https://shop-api-kbe6.onrender.com/api` | Base URL of the REST API |
| `VITE_SITE_URL` | empty | Public address of the deployed site, no trailing slash. Used for canonical addresses, Open Graph and structured data. Empty: canonical addresses use the address the page is opened from and the Open Graph lines are removed from the built `index.html`. Set the real address on the host before publishing |
| `VITE_IMAGE_PROXY` | `https://wsrv.nl` | Image CDN that resizes pictures and converts them to WebP. Leave the line out to use the default; set it empty (`VITE_IMAGE_PROXY=`) to use the original pictures |

The API URL is built in as a fallback, so the project also works **without** a `.env` file. Variables must start with `VITE_` to be visible in the browser code. `.env` is listed in `.gitignore`; do not commit real secrets there.

---

## Routes

| Path | Page | Access |
| --- | --- | --- |
| `/` | Catalog (filters sidebar, sort, pagination, search) | public |
| `/filters` | Mobile filters screen (redirects to `/` on desktop) | public |
| `/product/:slug` | Product page | public |
| `/login` | Sign in | public |
| `/register` | Create account | public |
| `/forgot-password` | Password reset (3 steps) | public |
| `/account` | Profile editor | 🔒 requires sign-in |
| `/cart` | Shopping cart | 🔒 requires sign-in |
| `/addresses` | My delivery addresses (add / edit / delete / default) — "Address" in the profile menu | 🔒 requires sign-in |
| `/checkout` | Redirects to `/checkout/address` | 🔒 requires sign-in |
| `/checkout/address` | Step 1 — choose or add a delivery address | 🔒 requires sign-in |
| `/checkout/shipping` | Step 2 — shipment method (`?address=<id>`) | 🔒 requires sign-in |
| `/checkout/payment` | Step 3 — summary + card (`?address=<id>`) | 🔒 requires sign-in |
| `/checkout/confirm/:orderId` | 6-digit payment code | 🔒 requires sign-in |
| `/orders` | My orders — the history of everything bought, newest first ("Orders" in the profile menu) | 🔒 requires sign-in |
| `/orders/:id` | Order confirmation / order details ("Thank you!") | 🔒 requires sign-in |
| `/wishlist`, `/about`, `/contact`, `/blog` | Placeholder pages | public |
| any other path | "Page not found" | public |

Visiting a protected page as a guest redirects to `/login`; after signing in you are sent back to where you were going.

---

## Project structure

```
src/
├─ main.jsx          entry point, provider stack
├─ App.jsx           route table (15 pages are lazy chunks)
├─ assets/fonts/     ADG2.woff2 — local Georgian font
├─ api/              server-state layer: queryClient, queryKeys, catalog / cart / address / checkout requests and hooks
├─ shared/           apiClient (token, errors), Zod validators, UI kit (Button, Input, Alert, Toast…)
├─ features/
│  ├─ auth/          sign in / register / reset password / account, ProtectedRoute, AuthContext
│  ├─ cart/          cart hooks, CartPage, CartLine, CartSummary, QuantityStepper, cart rules
│  ├─ addresses/     AddressManager, AddressCard, AddressForm, AddressesPage, address form helpers
│  ├─ checkout/      CheckoutLayout, Address / Shipping / Payment steps, ConfirmPage, OrderPage, OrdersPage, card helpers
│  └─ shop/          wishlist (localStorage)
├─ pages/            CatalogPage, FiltersPage, ProductPage, StubPage
├─ components/       Header, Footer, Layout, Seo, ProductCard, ProductImage, FilterPanel, PriceRange, Pagination, ThemeToggle, LanguageSwitcher, …
├─ lib/              pure helpers: URL ⇄ API mapping, specs, filter labels, `seo.js`, `image.js` (image CDN); `i18n/` (i18next setup, `Intl` formatters); `theme.js` (color-theme store)
├─ locales/          ka.json, en.json — all UI texts (same keys in both files)
├─ hooks/            useCatalogParams, useMediaQuery, useTheme
└─ styles/           CSS variables, fonts.css, reset, global styles, cyber-form.css (checkout / address inputs), theme.css (light and dark theme tokens)

public/              favicon, og-image.png (link preview), robots.txt, _headers (HTTP caching), _redirects (SPA fallback)
```

Conventions: every component or page has **its own folder with its own CSS file**; feature folders expose a public API through an `index.js` barrel; path aliases `@`, `@api`, `@shared`, `@features` point to `src/`, `src/api/`, `src/shared/` and `src/features/`; every private cache key (cart, addresses, checkout, orders) is registered in `PRIVATE_QUERY_KEYS` and wiped on login / logout.

➡️ Full annotated tree and per-file descriptions: **[ARCHITECTURE.md → Folder structure](./ARCHITECTURE.md#3-folder-structure)**.

---

## How it works (short version)

State is split by where it comes from, so each kind has exactly one home:

| State | Lives in |
| --- | --- |
| Catalog, cart, addresses, checkout and orders data from the server | **TanStack Query cache** |
| "Who is signed in" | **`AuthContext`** (token in `localStorage`) |
| Catalog filters, sort, page, search | **The URL** |
| Checkout progress (chosen address, pending order) | **The URL** (`?address=<id>`, `/checkout/confirm/:orderId`) |
| Card number, holder, expiry, CVC | **Only the payment form** (never stored) |
| Wishlist | `ShopContext` + `localStorage` (the API has no wishlist yet) |
| Color theme (light / dark / system) | **`data-theme` on `<html>`** + `localStorage` (key `theme`) |
| Language (ka / en) | **i18next** (`useTranslation()`) + `localStorage` (key `lang`) + `<html lang>` |

### Reading the code in a good order

1. `main.jsx` — the provider stack; `QueryClientProvider` gives the app one shared cache. `import '@/lib/i18n'` initialises i18next, and `initTheme()` applies the saved color theme before the first render.
2. `api/queryClient.js` — cache defaults (`staleTime`, `retry`; no retries on 4xx).
3. `api/catalogApi.js` — plain request functions that know nothing about React.
4. `api/queryKeys.js` + `api/catalogQueries.js` — a **query key** is the address of data in the cache. Change any value in the key and you get a new request or an instant cache hit.
5. `pages/CatalogPage` — `useProducts(...)` returns `{ data, isPending, isError, error, refetch, isPlaceholderData }`; the page just renders those states. `keepPreviousData` keeps the old page (dimmed) on screen while the next one loads.
6. `lib/catalog.js` and `hooks/useCatalogParams.js` — how the URL becomes an API query.
7. `features/cart` — how one cache entry `['cart']` powers the header badge and the cart page.
8. `features/addresses` and `features/checkout` — the same pattern with several cache entries, and how the URL keeps the checkout step (ADR 0005).
9. Open the devtools and click around to see all of this live.

### The cart in two sentences

Every cart request returns the **whole cart**, which is written straight into the `['cart']` cache entry — so the header badge and the cart page always show the same numbers without extra requests. Cart mutations run one at a time and the quantity stepper is locked while a request is in flight, so quick clicks can never produce a wrong quantity.

---

## Performance and SEO

**What makes the first screen fast** (details and the build measurements: [ARCHITECTURE.md → Performance and SEO notes](./ARCHITECTURE.md#20-performance-and-seo-notes))

| Technique | Effect |
| --- | --- |
| Route-level code splitting (`React.lazy`, 15 pages) | Only `Layout` and the catalog are in the main bundle; first-screen JavaScript is ≈ 494 kB (≈ 156 kB gzip) instead of the former single chunk of ≈ 682 kB (≈ 207 kB gzip) |
| Early requests in `index.html` | The categories and the first page of products are requested while the bundle is still downloading; the first product picture is preloaded with a high priority |
| App shell | A static header is painted before the JavaScript is ready |
| Image CDN (`wsrv.nl`) | A 700 × 700 picture of 50–77 kB becomes a 160–480 px WebP; automatic fallback to the original |
| Main CSS inlined into `index.html` | One render-blocking request less |
| `public/_headers` | Hashed files cached for a year, `index.html` always re-checked |

**What makes the pages visible to search engines and link previews**

- Static defaults in `index.html` (title, description, Open Graph, Twitter, schema.org `Organization` + `WebSite`) and per-page tags written by the `Seo` component.
- A plain category page is indexed and is its own canonical; search results, filtered and re-sorted lists point to the category and are `noindex`. Private screens (`/cart`, `/checkout`, `/account`, `/addresses`, `/orders`, `/login`, `/register`, `/forgot-password`) are `noindex` and closed in `robots.txt`.
- The product page has a unique title and description, the canonical address, `og:image` and schema.org `Product` (price, availability, rating) and `BreadcrumbList`.
- Limits: the tags are written by JavaScript (a crawler without JavaScript sees the Georgian defaults of `index.html`); there is no `sitemap.xml` yet; Lighthouse scores were not measured, so none are quoted. See [ARCHITECTURE.md → Known limitations](./ARCHITECTURE.md#24-known-limitations-and-technical-debt).

---

## Catalog URL format

Catalog state is stored in the query string in the same format the API uses:

```
/?category=smartphones&brand=Apple,Samsung&storage=256gb&minPrice=500&maxPrice=3000&inStock=true&sort=price-asc&page=2&q=pro
```

| Parameter | Meaning | Default (omitted from URL) |
| --- | --- | --- |
| `category` | Category slug, e.g. `smartphones`, `laptops` | `smartphones` |
| `brand`, `storage`, `color`, … | Attribute filters; several values are comma-separated | — |
| `minPrice`, `maxPrice` | Price bounds | full range |
| `inStock=true`, `onSale=true` | Availability flags | off |
| `sort` | `rating-desc`, `price-asc`, `price-desc`, `newest`, `oldest`, `popular`, `title-asc` | `rating-desc` |
| `page` | Page number | `1` |
| `q` | Search text | empty |

Try it: `/?category=laptops`, or any category slug returned by `GET /categories`.

---

## Working with the API

- All requests go through **one function**, `apiRequest()` in `src/shared/api/apiClient.js`. It attaches the Bearer token, parses JSON, throws a typed `ApiError` (`status`, `code`, `errors`, `data`) and handles expired sessions centrally (`401` + `TOKEN_EXPIRED` / `INVALID_TOKEN` → token removed, redirect to `/login`).
- **Public catalog requests are sent without the token** (`auth: false`), so an expired token can never break browsing.
- The code makes decisions from `error.code`, **never from `error.message`**.
- **Cold starts:** the API runs on free hosting. The first request after a pause can take up to a minute; the UI shows an explanatory message after a few seconds.

Endpoints used: `/categories`, `/categories/{slug}`, `/products`, `/products/{slug}`, `/auth/register`, `/auth/login`, `/auth/logout`, `/auth/me` (GET, PATCH), `/auth/forgot-password`, `/auth/verify-reset-code`, `/auth/reset-password`, `/cart`, `/cart/items`, `/cart/items/:id`, `/addresses`, `/addresses/:id`, `/checkout`, `/orders`, `/orders/:id/confirm`, `/orders/:id/resend-code`, `/orders/:id`. A full table is in **[ARCHITECTURE.md → API reference](./ARCHITECTURE.md#21-api-reference-as-used-by-the-front-end)**.

---

## Deployment

The app is a single-page application, so the host must **rewrite every path to `index.html`**; otherwise opening or refreshing `/cart` or `/product/some-slug` returns a 404.

| Host | What to do |
| --- | --- |
| Netlify-style hosts | Nothing — `public/_redirects` (`/*  /index.html  200`) is included |
| Render (static site) | Add a rewrite rule: `/*` → `/index.html` |
| Firebase Hosting | `"rewrites": [{ "source": "**", "destination": "/index.html" }]` |

Build command: `npm run build` · Publish directory: `dist` · Set `VITE_API_URL` in the host's environment settings if you use a different API, and **set `VITE_SITE_URL` to the real public address of the site** (without it the canonical and Open Graph addresses are not correct). `public/_headers` (caching and security headers) works on Netlify and Cloudflare Pages; other hosts ignore it.

---

## Documentation

| Document | Contents |
| --- | --- |
| [`ARCHITECTURE.md`](./ARCHITECTURE.md) | Folder structure, data flow, module and API reference |
| [`docs/index.md`](./docs/index.md) | Index of the documentation |
| [`docs/adr/`](./docs/adr) | Architecture decision records: [0001 stack](./docs/adr/0001-frontend-stack.md), [0002 token storage](./docs/adr/0002-token-storage.md), [0003 cart quantity stepper](./docs/adr/0003-cart-quantity-stepper.md), [0004 profile current password](./docs/adr/0004-profile-current-password.md), [0005 checkout state in the URL](./docs/adr/0005-checkout-state-in-url.md), [0006 color theme](./docs/adr/0006-color-theme.md), [0007 i18n strategy](./docs/adr/0007-i18n-strategy.md), [0008 react-i18next](./docs/adr/0008-react-i18next.md), [0009 performance and SEO](./docs/adr/0009-performance-and-seo.md) |
| [`journal/`](./journal) | Weekly development journal: [week 1](./journal/week-1.md), [week 2](./journal/week-2.md), [week 3](./journal/week-3.md) |

---

## Project status

| Area | Status |
| --- | --- |
| Catalog, filters, sort, search, pagination | ✅ done |
| Product page | ✅ done |
| Register / login / logout / password reset | ✅ done |
| Profile editor | ✅ done |
| Server cart | ✅ done |
| Addresses (several, default, edit) | ✅ done |
| Checkout (3 steps, code, order page) | ✅ done (FE-006); the payment is simulated by the API |
| Orders history (`/orders`) | ✅ done |
| Color theme: light / dark / system, no flash on reload (FE-009, bonus) | ✅ done |
| Georgian + English interface (FE-008, bonus) | ✅ done; the API is single-language, so spec values stay in Georgian (ADR 0008) |
| Wishlist page | 🚧 placeholder (data is stored locally; no page and no API yet) |
| Code splitting | ✅ done: 32 JS chunks, first screen ≈ 494 kB (≈ 156 kB gzip); no Vite size warning |
| Performance: early requests, app shell, image CDN, inlined CSS, caching headers | ✅ done (ADR 0009); Lighthouse scores not measured |
| SEO: titles, descriptions, canonical, `noindex`, Open Graph, JSON-LD, `robots.txt` | ✅ done (ADR 0009) |
| `sitemap.xml` | 🚧 not generated: `robots.txt` mentions `scripts/generate-sitemap.mjs`, but the script does not exist |
| About / Contact / Blog | 🚧 placeholders |
| Product reviews | 🚧 only rating and count (no API endpoint yet) |
| Automated tests | ❌ not yet (0 test files) |
| `npm run lint` | ⚠️ 1 error, 0 warnings (checked on 28.10.2026): `react-refresh/only-export-components` in `src/main.jsx:17` (the lazy Devtools constant); the build is not affected |

A detailed list of limitations and improvement ideas is in **[ARCHITECTURE.md → Known limitations](./ARCHITECTURE.md#24-known-limitations-and-technical-debt)**.

---

## Project in numbers

Measured on 28.10.2026 from the files of the repository and from `npm run lint` and `npm run build` (the project was developed over three weeks, 05.10 – 28.10.2026, about 75 hours according to the journal).

| Metric | Value |
| --- | --- |
| Files in `src/` | 176 (115 JS / JSX, 58 CSS, 2 JSON, 1 font) |
| Lines of code | 7,831 JS / JSX + 5,283 CSS + 902 JSON = 14,016 |
| Pages | 17 page components, 21 route entries (15 of them lazy) |
| Components | 21 shop components + 7 UI-kit components |
| Feature modules | 5 (`auth`, `cart`, `addresses`, `checkout`, `shop`) |
| API paths used | 21 |
| Translation keys | 393 per language (Georgian, English) |
| Dependencies | 10 runtime + 12 development |
| ADRs / journal files | 9 / 3 |
| Production build | 274 modules, 32 JS chunks, ≈ 8.7 s |
| First-screen JavaScript | ≈ 494 kB (≈ 156 kB gzip); all chunks together ≈ 704 kB |
| Lint | 1 error, 0 warnings |
| Automated tests | 0 |

---

## Troubleshooting

| Problem | Likely cause / fix |
| --- | --- |
| The first page load is very slow or shows "The server is waking up" | The free-hosted API was asleep. Wait up to a minute; the next requests are fast. |
| Refreshing `/cart` or `/product/...` gives 404 in production | The host does not rewrite paths to `index.html` — see [Deployment](#deployment). |
| You are sent to `/login` unexpectedly | Your session expired (`TOKEN_EXPIRED`). Sign in again; you will return to the previous page. |
| "Network error. Check your connection…" when adding to cart | The request failed before reaching the server (offline, CORS or the API is down). |
| Products have no pictures | The API image is `null` or failed to load; a placeholder is shown automatically and a real URL will appear without code changes. |
| Changes to `.env` are ignored | Restart `npm run dev` — Vite reads environment variables at startup. |
| Cart or wishlist looks empty after signing in as another user | By design: the cart is bound to the user, and the wishlist is stored per user id. |
| Where do I get the 6-digit payment code? | The learning API returns it as `devCode` in the response of `POST /orders` — open DevTools → Network and type it by hand (the app deliberately does not fill it in). |
| `/checkout/shipping` or `/checkout/payment` sends me back to the address step | The address id is kept in the URL (`?address=<id>`). Without it (or with a deleted address) the step returns to step 1. |
| `/checkout` sends me to the cart | The cart is empty — there is nothing to buy. |
| The theme or the language resets after a refresh | The choices are saved in `localStorage` (keys `theme`, `lang`); if the browser blocks storage (some private modes) they last only for the session. The page should not flash white in dark mode: the inline script in `index.html` applies the theme before the first paint (ADR 0006). |
| Pictures are loaded from `wsrv.nl` and I want the original ones | The product pictures go through an image CDN for speed. Set `VITE_IMAGE_PROXY=` (empty) in `.env` and restart `npm run dev` to use the original pictures. If the CDN is blocked, the app falls back to the original picture by itself. |
| Link previews (Open Graph) show no picture or a wrong address | `VITE_SITE_URL` is empty or points to localhost. Set the real public address (no trailing slash) in the host's environment and rebuild. |
| Part of a product page is Georgian in English mode | The API has one language: spec values, descriptions and brand names come as they are. Spec names, category names and filters are translated (ADR 0008). |

---

## Contributing and code style

- Run `npm run lint` before committing; the project uses ESLint's flat config with React Hooks rules; at the last check (28.10.2026) it reported one known error in `src/main.jsx` (see [Project status](#project-status)) — do not add new ones.
- **No text in the code:** every visible string (labels, errors, `aria-label`, `alt`, `title`) comes from `src/locales/*.json` through `t('section.key')`; add the key to **both** `ka.json` and `en.json`. Format prices and dates only with the helpers from `src/lib/i18n`.
- **No hard-coded colors** for things that change with the theme: use the tokens (`var(--c-*)`, `var(--color-*)`, `var(--t-*)`) and check the page in both themes.
- Keep **one component per folder** with its own `.css` file and BEM-style class names.
- Put pure logic (no React) into `src/lib/` or a feature's `lib/` folder so it stays easy to test.
- Keep request functions separate from hooks (`xxxApi.js` vs `xxxQueries.js`) and add new cache keys to `src/api/queryKeys.js`.
- Decide on errors by `code` / `status`, not by message text.
- New pages: add them to `App.jsx` with `React.lazy` (import from the page file, not from a feature barrel) and, if the page is private or only a duplicate, render `<Seo noindex />` and add the path to `public/robots.txt`.
- Product pictures: use `<ProductImage widths=… sizes=… />` so they go through the image CDN.
- Do not commit secrets; `.env` is git-ignored.

See **[ARCHITECTURE.md → How to extend the project](./ARCHITECTURE.md#23-how-to-extend-the-project)** for step-by-step recipes (new page, new API-backed list, new checkout step, form with server errors, new filter type).

---

## License

Released under the MIT License — see the [LICENSE](./LICENSE) file.
