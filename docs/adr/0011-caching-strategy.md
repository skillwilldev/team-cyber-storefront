# ADR 0011: Caching Strategy — What Is Cached, for How Long, and When It Is Cleared

- **Status:** Accepted
- **Date:** 2026-10-31
- **Ticket:** FE-010

## Context

The application uses **TanStack Query 5** as its server-state cache. Without an explicit caching strategy:

- The same API call can fire twice (e.g. `StrictMode` double mount in development, or navigating back to a page).
- Navigating "back" to the catalog re-fetches the product list every time, making the app feel slow.
- After logout, the next user's session could see the previous user's cart, addresses, or orders in the cache — a **security issue**.
- Categories and filter options almost never change, but they are fetched fresh on every page load.

## Decision

### Cache durations

| Data | `staleTime` | `gcTime` | Rationale |
|---|---|---|---|
| **Categories, filter options** | **10 minutes** | 15 minutes | Rarely change; safe to reuse for a long browsing session |
| **Product list (catalog)** | **60 seconds** | 5 minutes | Changes occasionally (new products, price updates); 60 s avoids flashing on "back" navigation |
| **Single product** | **60 seconds** | 5 minutes | Same as the list |
| **Cart** | **0** (always stale) | 5 minutes | Must be fresh — the user expects to see exactly what they just added/removed |
| **Addresses** | **60 seconds** | 5 minutes | Changes are user-initiated; stale data for a minute is acceptable |
| **Orders** | **60 seconds** | 5 minutes | Historical data; rarely changes after creation |
| **User profile (`/auth/me`)** | **60 seconds** | 5 minutes | Changes only when the user edits the profile |

### Cache invalidation

| Event | Action |
|---|---|
| **Add / remove / change cart item** | `invalidateQueries(['cart'])` — forces a fresh fetch |
| **Create / edit / delete address** | `invalidateQueries(['addresses'])` |
| **Place an order** | `invalidateQueries(['cart'])` + `invalidateQueries(['orders'])` |
| **Edit profile** | `invalidateQueries(['auth', 'me'])` |

### Cache clearing on logout / login

All private query keys are registered in `PRIVATE_QUERY_KEYS` (in `src/api/queryKeys.js`). On **logout**, `AuthProvider` calls `queryClient.removeQueries()` for each private key, ensuring:

- The next user **never** sees the previous user's cart, addresses, orders, or profile.
- Public data (categories, products) stays in the cache — it is not user-specific.

On **login**, the same clearing happens before the new user's data is fetched, preventing stale data from a previous session.

### Retry policy

- **4xx errors** (client errors): **no retry** — repeating a bad request is pointless.
- **5xx errors** and network errors: **3 retries** with exponential backoff — the free-hosted API can have cold starts.
- The `retry` function in `queryClient.js` checks `error.status` to decide.

## Alternatives considered

| Option | Why it was not chosen |
|---|---|
| No `staleTime` (default: 0) | Every navigation triggers a new request, even "back" — poor UX |
| Very long `staleTime` (hours) | Product availability and prices can change; too long risks showing outdated data |
| localStorage / sessionStorage cache | TanStack Query already provides in-memory caching with deduplication, refetch-on-focus, and garbage collection; adding localStorage would double the complexity |
| Service Worker caching | Significant complexity for a 5-week project; the benefit over TanStack Query's in-memory cache is marginal for this data |

## Consequences

**Positive**

- "Back" button to the catalog is **instant** (served from cache within 60 s).
- Categories are fetched once per 10 minutes, not on every navigation.
- Cart, addresses, and orders are invalidated immediately after mutations — the user sees the fresh state.
- Logging out clears all private data — no data leaks between users.
- Public catalog data is never cleared on logout — the next user sees the catalog immediately.

**Negative / to remember**

- The 60 s `staleTime` for products means a price change on the server takes up to 60 s to appear. This is acceptable for a storefront but would need adjusting for an auction or flash-sale system.
- `staleTime: 0` for the cart means it is re-fetched on every focus — slightly more API calls, but correctness is more important.
- The cache is in-memory only (no persistence). A page reload starts with an empty cache. This is intentional: the free API's cold-start latency makes persistence counterproductive (the data would often be stale anyway).

## Where implemented

- `src/api/queryClient.js` — default `staleTime`, `gcTime`, `retry`
- `src/api/queryKeys.js` — `PRIVATE_QUERY_KEYS`
- `src/api/catalogQueries.js` — per-query `staleTime` overrides
- `src/features/auth/context/AuthProvider.jsx` — `removeQueries()` on login/logout
- `src/features/cart/hooks/` — `invalidateQueries(['cart'])` after mutations
- `src/features/addresses/hooks/` — `invalidateQueries(['addresses'])` after mutations

