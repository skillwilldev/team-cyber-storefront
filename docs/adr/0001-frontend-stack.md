# ADR 0001: Front-end stack

- **Status:** Accepted
- **Date:** 2026-10-11
- **Ticket:** — (project foundation)

## Context

The project is a single-page online electronics store that talks to a ready-made REST API. The application needs:

- a catalog whose state (filters, sort, page, search) can be shared as a link;
- server data with caching, loading and error states;
- several forms with validation (register, login, password reset, profile);
- a cart that must stay consistent between the header badge and the cart page;
- protected pages and an authenticated session.

The API is hosted on a free plan, so the first request after a pause can take up to a minute. The UI therefore has to handle slow and failed requests gracefully.

## Decision

| Concern | Choice |
| --- | --- |
| UI library | **React 19** (function components and hooks) |
| Build tool | **Vite 8** |
| Optimisation | **React Compiler** (automatic memoisation) |
| Routing | **React Router 7** (declarative `<Routes>`, one layout route) |
| Server state | **TanStack Query 5** (one shared `QueryClient`) |
| Forms | **React Hook Form 7** |
| Validation | **Zod 3** with `@hookform/resolvers` |
| Client state | React Context only for *who is signed in* (`AuthContext`), the wishlist (`ShopContext`) and toasts |
| Catalog state | **The URL query string** (`useSearchParams`) |
| Styling | Plain CSS file per component, BEM-style class names, CSS variables for design tokens |
| Language | JavaScript (ES modules, JSX) |

State is split by origin, so every kind of state has one home:

| State | Home |
| --- | --- |
| Data owned by the server (catalog, cart) | TanStack Query cache |
| Who is signed in | `AuthContext` |
| Filters, sort, page, search | URL |
| Purely visual state | local `useState` |

## Alternatives considered

- **Redux / Zustand for server data.** Would require hand-written loading flags, error flags, caching, deduplication and cancellation. TanStack Query provides all of this and removes most of that code.
- **Catalog filters in `useState` or Context.** Filters would be lost on refresh and could not be shared as a link; the Back button would not work. Keeping them in the URL gives all three for free, and the URL object doubles as the cache key.
- **Controlled forms with manual validation.** More re-renders and more repetitive code. React Hook Form uses uncontrolled inputs; Zod keeps all validation rules in one file (`src/shared/lib/validators.js`).
- **A CSS framework or CSS-in-JS.** The design is custom and the amount of CSS is moderate; per-component plain CSS has no extra dependency and no runtime cost.
- **Create React App / Webpack.** Slower development server and builds than Vite, and CRA is no longer maintained.
- **TypeScript.** Would add type safety, but the project is a course project whose focus is React and data flow; JSDoc comments and Zod schemas cover the most important contracts.

## Consequences

**Positive**

- Very little manual state code; loading, error and empty states are rendered from query status.
- Shareable and refresh-proof catalog URLs; no "filter state" bugs.
- No manual `useMemo` / `useCallback` in most places thanks to the React Compiler.
- Clear layering: pure functions in `lib/`, plain request functions separated from React hooks (`xxxApi.js` / `xxxQueries.js`).

**Negative / to remember**

- The team must understand the TanStack Query vocabulary (query keys, `staleTime`, `placeholderData`, mutation scope).
- Query keys must be built from **all** inputs of a request; a missing value in the key means wrong cache hits.
- Without TypeScript, wrong prop names or response shapes are found at run time, not at build time.
- The production build is a single JS chunk of about 511 kB (about 156 kB gzip); route-level code splitting with `React.lazy` is a possible improvement.
