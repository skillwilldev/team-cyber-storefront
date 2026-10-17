# Journal — Week 2 (DRAFT)

- **Period:** 12.10.2026 – ..
- **Project:** Cyber Shop (React front end)
- **Total time spent:** _fill in_

> Draft: the facts below come from the code. The time, "What I learned" and the self-assessment are for you to write in your own words.

## 1. Goals for the week

- Finish the shopping flow: show the user the orders they have already bought.
- Remove the `401` error that sometimes appears in the console at start-up.

## 2. What I did

| Topic | Status | Notes |
| --- | --- | --- |
| Orders history page `/orders` | Done | Uses the existing endpoint `GET /orders`. A row shows the order number, date, status, up to 4 product thumbnails, item count and total; a click opens `/orders/:id`. Loading skeleton, error with "Try again" and an empty state are included. |
| "Orders" item in the profile menu | Done | Added to the avatar dropdown and to the mobile menu. |
| Fresh history after paying | Done | After `POST /orders/:id/confirm` the `['orders', 'list']` cache entry is invalidated, so the new order is visible at once. |
| Start-up `401` on `GET /auth/me` | Done | See the table below. |
| Documentation | Done | README (routes, status), ARCHITECTURE.md (routing, session lifecycle, API reference, limitations), ADR 0002 (note), docs index. |

## 3. Problems and how I solved them

| Problem | Cause | Solution |
| --- | --- | --- |
| `Failed to load resource: 401` for `/auth/me` appeared in the console, twice | The access token lives 30 minutes; after a longer break the stored token is dead, and `AuthProvider` still asked the server about it. In dev, React StrictMode runs the effect twice | The `exp` claim of the JWT is read locally (`isTokenExpired`) and an expired token is dropped without a request; one shared in-flight request (`checkSession`) instead of two |
| A temporary server error could sign the user out | Any error of the start-up check removed the token | The token is removed only on `401`; a network error or `5xx` (the free server waking up) keeps it |

## 4. What I learned

- _write in your own words_

## 5. Decisions made this week

- Note added to [ADR 0002 — token storage](../docs/adr/0002-token-storage.md): an expired token is detected locally.

## 6. Questions for the lecturer / things I did not understand

- _write in your own words_

## 7. Plan for next week

- [ ] Tests for the pure functions (`lib/catalog.js`, `cartRules.js`, `profileForm.js`, `isTokenExpired`)
- [ ] Route-level code splitting (`React.lazy`)
- [ ] Wishlist page

## 8. Self-assessment

- _write in your own words_
