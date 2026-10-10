# Cyber Shop

A responsive online electronics store front end built with **React 19**, **React Router 7**, **TanStack Query 5**, **React Hook Form + Zod** and **Vite 8** (with the React Compiler).

It talks to a ready-made REST API and covers the full browsing and account flow: a data-driven catalog with filters, sorting, search and pagination; product pages; registration, login and password reset; a profile editor; and a **server-side shopping cart**.

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
- [Catalog URL format](#catalog-url-format)
- [Working with the API](#working-with-the-api)
- [Deployment](#deployment)
- [Documentation](#documentation)
- [Project status](#project-status)
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
- Pagination (8 items per page on mobile, 9 on desktop)
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
- Centralised handling of expired sessions

**Cart**
- Server-side cart bound to the user
- Quantity stepper (1–99, limited by stock), remove, totals calculated by the server
- Header badge always in sync with the cart page (one shared cache entry)
- Stock-problem detection that blocks checkout until fixed

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
| Forms | React Hook Form 7, `@hookform/resolvers` |
| Validation | Zod 3 |
| Build tool | Vite 8 |
| Optimisation | React Compiler (`babel-plugin-react-compiler`) |
| Linting | ESLint 10 (flat config), `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh` |
| Styling | Plain CSS files per component (BEM-style class names) |
| Font | Inter (Google Fonts) |

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
```

| Variable | Default | Description |
| --- | --- | --- |
| `VITE_API_URL` | `https://shop-api-kbe6.onrender.com/api` | Base URL of the REST API |

The same URL is built in as a fallback, so the project also works **without** a `.env` file. Variables must start with `VITE_` to be visible in the browser code. `.env` is listed in `.gitignore`; do not commit real secrets there.

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
| `/checkout` | Checkout (placeholder) | 🔒 requires sign-in |
| `/wishlist`, `/about`, `/contact`, `/blog` | Placeholder pages | public |
| any other path | "Page not found" | public |

Visiting a protected page as a guest redirects to `/login`; after signing in you are sent back to where you were going.

---

## Project structure

```
src/
├─ main.jsx          entry point, provider stack
├─ App.jsx           route table
├─ api/              server-state layer: queryClient, queryKeys, catalog + cart requests and hooks
├─ shared/           apiClient (token, errors), Zod validators, UI kit (Button, Input, Alert, Toast…)
├─ features/
│  ├─ auth/          sign in / register / reset password / account, ProtectedRoute, AuthContext
│  ├─ cart/          cart hooks, CartPage, CartLine, CartSummary, QuantityStepper, cart rules
│  └─ shop/          wishlist (localStorage)
├─ pages/            CatalogPage, FiltersPage, ProductPage, StubPage
├─ components/       Header, Footer, Layout, ProductCard, FilterPanel, PriceRange, Pagination, …
├─ lib/              pure helpers: URL ⇄ API mapping, price formatting, specs, filter labels
├─ hooks/            useCatalogParams, useMediaQuery
└─ styles/           CSS variables, reset, global styles
```

Conventions: every component or page has **its own folder with its own CSS file**; feature folders expose a public API through an `index.js` barrel; path aliases `@`, `@api`, `@shared`, `@features` point to `src/`, `src/api/`, `src/shared/` and `src/features/`.

➡️ Full annotated tree and per-file descriptions: **[ARCHITECTURE.md → Folder structure](./ARCHITECTURE.md#3-folder-structure)**.

---

## How it works (short version)

State is split by where it comes from, so each kind has exactly one home:

| State | Lives in |
| --- | --- |
| Catalog and cart data from the server | **TanStack Query cache** |
| "Who is signed in" | **`AuthContext`** (token in `localStorage`) |
| Catalog filters, sort, page, search | **The URL** |
| Wishlist | `ShopContext` + `localStorage` (the API has no wishlist yet) |

### Reading the code in a good order

1. `main.jsx` — the provider stack; `QueryClientProvider` gives the app one shared cache.
2. `api/queryClient.js` — cache defaults (`staleTime`, `retry`; no retries on 4xx).
3. `api/catalogApi.js` — plain request functions that know nothing about React.
4. `api/queryKeys.js` + `api/catalogQueries.js` — a **query key** is the address of data in the cache. Change any value in the key and you get a new request or an instant cache hit.
5. `pages/CatalogPage` — `useProducts(...)` returns `{ data, isPending, isError, error, refetch, isPlaceholderData }`; the page just renders those states. `keepPreviousData` keeps the old page (dimmed) on screen while the next one loads.
6. `lib/catalog.js` and `hooks/useCatalogParams.js` — how the URL becomes an API query.
7. `features/cart` — how one cache entry `['cart']` powers the header badge and the cart page.
8. Open the devtools and click around to see all of this live.

### The cart in two sentences

Every cart request returns the **whole cart**, which is written straight into the `['cart']` cache entry — so the header badge and the cart page always show the same numbers without extra requests. Cart mutations run one at a time and the quantity stepper is locked while a request is in flight, so quick clicks can never produce a wrong quantity.

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

Endpoints used: `/categories`, `/categories/{slug}`, `/products`, `/products/{slug}`, `/auth/register`, `/auth/login`, `/auth/logout`, `/auth/me` (GET, PATCH), `/auth/forgot-password`, `/auth/verify-reset-code`, `/auth/reset-password`, `/cart`, `/cart/items`, `/cart/items/:id`. A full table is in **[ARCHITECTURE.md → API reference](./ARCHITECTURE.md#19-api-reference-as-used-by-the-front-end)**.

---

## Deployment

The app is a single-page application, so the host must **rewrite every path to `index.html`**; otherwise opening or refreshing `/cart` or `/product/some-slug` returns a 404.

| Host | What to do |
| --- | --- |
| Netlify-style hosts | Nothing — `public/_redirects` (`/*  /index.html  200`) is included |
| Render (static site) | Add a rewrite rule: `/*` → `/index.html` |
| Firebase Hosting | `"rewrites": [{ "source": "**", "destination": "/index.html" }]` |

Build command: `npm run build` · Publish directory: `dist` · Set `VITE_API_URL` in the host's environment settings if you use a different API.

---

## Documentation

| Document | Contents |
| --- | --- |
| [`ARCHITECTURE.md`](./ARCHITECTURE.md) | Folder structure, data flow, module and API reference |
| [`docs/index.md`](./docs/index.md) | Index of the documentation |
| [`docs/adr/`](./docs/adr) | Architecture decision records: [0001 stack](./docs/adr/0001-frontend-stack.md), [0002 token storage](./docs/adr/0002-token-storage.md), [0003 cart quantity stepper](./docs/adr/0003-cart-quantity-stepper.md), [0004 profile current password](./docs/adr/0004-profile-current-password.md) |
| [`journal/week-1.md`](./journal/week-1.md) | Weekly development journal |

---

## Project status

| Area | Status |
| --- | --- |
| Catalog, filters, sort, search, pagination | ✅ done |
| Product page | ✅ done |
| Register / login / logout / password reset | ✅ done |
| Profile editor | ✅ done |
| Server cart | ✅ done |
| Checkout | 🚧 placeholder (task FE-006) |
| Wishlist page | 🚧 placeholder (data is stored locally; no page and no API yet) |
| About / Contact / Blog | 🚧 placeholders |
| Product reviews | 🚧 only rating and count (no API endpoint yet) |
| Automated tests | ❌ not yet |

A detailed list of limitations and improvement ideas is in **[ARCHITECTURE.md → Known limitations](./ARCHITECTURE.md#22-known-limitations-and-technical-debt)**.

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

---

## Contributing and code style

- Run `npm run lint` before committing; the project uses ESLint's flat config with React Hooks rules.
- Keep **one component per folder** with its own `.css` file and BEM-style class names.
- Put pure logic (no React) into `src/lib/` or a feature's `lib/` folder so it stays easy to test.
- Keep request functions separate from hooks (`xxxApi.js` vs `xxxQueries.js`) and add new cache keys to `src/api/queryKeys.js`.
- Decide on errors by `code` / `status`, not by message text.
- Do not commit secrets; `.env` is git-ignored.

See **[ARCHITECTURE.md → How to extend the project](./ARCHITECTURE.md#21-how-to-extend-the-project)** for step-by-step recipes (new page, new API-backed list, checkout, new filter type).

---

## License

Released under the MIT License — see the [LICENSE](./LICENSE) file.
