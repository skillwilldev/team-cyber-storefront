# Journal — Week 1

- **Period:** 05.10.2026 – 11.10.2026
- **Project:** Cyber Shop (React front end)
- **Total time spent:** about 25 hours

## 1. Goals for the week

- Build the main shopping flow of the store on top of the ready-made REST API: catalog, product page, accounts and the server cart.
- Keep the code structured (feature folders, one place for API requests, pure helper functions) and document the important decisions as ADRs.
- Tickets on the list: FE-001 to FE-005; FE-006 (checkout) was planned for later.

## 2. What I did

| Ticket | Topic | Status | Notes |
| --- | --- | --- | --- |
| FE-001 | Registration and login (forms, validation, token) | Done | React Hook Form + Zod; server errors are mapped to the right fields (e.g. `EMAIL_TAKEN` under the e-mail input). Three-step password reset is included. |
| FE-002 | Session handling: token storage, central handling of an expired token, protected routes | Done | One `apiRequest()` function for all calls; `ProtectedRoute` returns the user to the page they came from. See [ADR 0002](../docs/adr/0002-token-storage.md) |
| FE-003 | Catalog: filters, sorting, search, pagination, product page | Done | Filters are built from the API response; the whole catalog state lives in the URL. |
| FE-004 | Profile page: editing data and password | Done | Only changed fields are sent in `PATCH /auth/me`. See [ADR 0004](../docs/adr/0004-profile-current-password.md) |
| FE-005 | Server cart and quantity stepper | Done | One cache entry `['cart']` feeds the header badge and the cart page. See [ADR 0003](../docs/adr/0003-cart-quantity-stepper.md) |
| FE-006 | Checkout | Not started (placeholder page) | The route `/checkout` is already protected; the page itself comes next. |

Also done: README, ARCHITECTURE.md, the docs index and four ADRs.

## 3. Problems and how I solved them

| Problem | Cause | Solution |
| --- | --- | --- |
| Three quick clicks on "+" changed the quantity only once | `PATCH` sets an absolute quantity, so each click sent the same number | The line is locked while its request is in flight; the number on screen is always the server's answer (ADR 0003) |
| An expired token could break even the public catalog | The token was sent with every request | Catalog requests are sent without the token (`auth: false`); an expired session is handled in one place in `apiClient` |
| A signed-in user saw a flash of the login page after a refresh | The token was still being checked | `isLoading` state in `AuthProvider`; `ProtectedRoute` shows a spinner until the check ends |
| The next person using the same browser could see the previous user's cart | The cart was kept in the query cache | The `['cart']` cache entry is removed on login and logout |
| Wrong current password logged the user out of the profile page | A wrong password and an expired session looked alike | The server answers `400 INVALID_CURRENT_PASSWORD` (not 401); the error is shown under the field and the user stays on the page |
| The price slider sent a request for every pixel | Each change updated the URL immediately | The slider keeps a local draft and applies it after 400 ms of inactivity |
| First load was very slow | The API is on free hosting and "sleeps" | `LoadingHint` explains after a few seconds that the server is waking up |

## 4. What I learned

- How a query key works in TanStack Query: changing any value in the key gives a new request or an instant cache hit.
- Why catalog filters are better kept in the URL: shareable links, a working Back button and state that survives a refresh.
- How to map server error codes (`code`, `status`) to form fields instead of reading the message text.
- Why server data, "who is signed in" and URL state should be kept in different places.
- How to separate plain request functions from React hooks and put pure logic into `lib/` so it is easy to test.
- How to write an ADR: context, decision, alternatives and consequences.

## 5. Decisions made this week

- [ADR 0001 — front-end stack](../docs/adr/0001-frontend-stack.md)
- [ADR 0002 — token storage](../docs/adr/0002-token-storage.md)
- [ADR 0003 — cart quantity stepper](../docs/adr/0003-cart-quantity-stepper.md)
- [ADR 0004 — current password in the profile form](../docs/adr/0004-profile-current-password.md)

## 6. Questions for the lecturer / things I did not understand

- Is keeping the access token in `localStorage` acceptable for this project, or should we plan a move to an httpOnly cookie (this needs back-end support and CSRF protection)?
- The API has no wishlist and no reviews endpoints. Should the wishlist stay local (`localStorage`) until they appear?
- What should the checkout page contain (FE-006) when there is no order endpoint yet?

## 7. Plan for next week

- [ ] Checkout (FE-006)
- [ ] Fix the header search so it keeps the current category when used outside the catalog
- [ ] Add tests for the pure functions (`lib/catalog.js`, `cartRules.js`, `profileForm.js`)
- [ ] Reduce the bundle size with route-level code splitting (`React.lazy`)
- [ ] Wishlist page

## 8. Self-assessment

- What went well: the data flow is clear and consistent (one cache for server data, URL for catalog state); the cart behaves correctly even with fast clicks and slow responses; the build and the linter pass without errors.
- What was difficult: handling every kind of server error in the right place, and keeping the cart quantity correct when requests are slow.
- What I would do differently: write the ADRs and the journal while working instead of at the end, and add tests from the beginning.
