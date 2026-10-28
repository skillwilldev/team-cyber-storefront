# Journal — Week 2

- **Period:** 12.10.2026 – 18.10.2026
- **Project:** Cyber Shop (React front end)
- **Total time spent:** about 30 hours

## 1. Goals for the week

- Finish the shopping flow: delivery addresses, a 3-step checkout with a card payment and an e-mail code (FE-006), and the orders the user has already bought.
- Keep the checkout state safe: the chosen address and the pending order must survive F5, and the card must never be stored.
- Remove the `401` error that sometimes appears in the console at start-up.

## 2. What I did

| Topic | Status | Notes |
| --- | --- | --- |
| Delivery addresses `/addresses` (FE-006) | Done | Up to 10 addresses per user: add, edit (only changed fields are sent), delete with confirmation, choose the default. One `AddressManager` component is used on the page and on checkout step 1. After every change the whole list is reloaded from the server. |
| Checkout, steps 1–3 (FE-006) | Done | `CheckoutLayout` (stepper + `GET /checkout`, an empty cart goes back to `/cart`), `AddressStep`, `ShippingStep` (the API has one delivery option, so Express and Schedule are shown disabled) and `PaymentStep` (card form with Zod, live card preview, Luhn and expiry checks) → `POST /orders`. |
| Payment code and order page (FE-006) | Done | `ConfirmPage` (6-digit code, 30 s resend timer, error mapping by `code`) → `POST /orders/:id/confirm` → `OrderPage` "Thank you!" (`GET /orders/:id`, works after F5). |
| Checkout state in the URL, [ADR 0005](../docs/adr/0005-checkout-state-in-url.md) | Done | `?address=<id>` and `/checkout/confirm/:orderId`; the card lives only in the payment form and is emptied right after the order is created. |
| Private cache wiped on login / logout | Done | `PRIVATE_QUERY_KEYS` (cart, addresses, checkout, orders) in `api/queryKeys.js`. |
| Shared pieces | Done | `ActionButton` (Back / Next / Pay), `cyber-form.css`, `checkoutIcons.jsx`, `addressSchema` in `validators.js`. |
| Orders history page `/orders` | Done | Uses the existing endpoint `GET /orders`. A row shows the order number, date, status, up to 4 product thumbnails, item count and total; a click opens `/orders/:id`. Loading skeleton, error with "Try again" and an empty state are included. |
| "Orders" item in the profile menu | Done | Added to the avatar dropdown and to the mobile menu. |
| Fresh history after paying | Done | After `POST /orders/:id/confirm` the `['orders', 'list']` cache entry is invalidated, so the new order is visible at once. |
| Start-up `401` on `GET /auth/me` | Done | See the table below. |
| Dark theme | Done | A light / dark switch in the right part of the header (and in the mobile menu). The choice is saved in `localStorage` (`theme`), follows the OS setting until the user chooses and is shared between tabs. The dark palette is one file, `styles/theme.css`; component styles were not changed. See [ADR 0006](../docs/adr/0006-color-theme.md). |
| Documentation | Done | README (features, routes, structure, status, troubleshooting), ARCHITECTURE.md (full annotated folder tree, new sections 12 Addresses and 13 Checkout and orders, routing, state keys, session lifecycle, API reference, limitations), ADR 0002 (note), ADR 0005, docs index. |

## 3. Problems and how I solved them

| Problem | Cause | Solution |
| --- | --- | --- |
| `Failed to load resource: 401` for `/auth/me` appeared in the console, twice | The access token lives 30 minutes; after a longer break the stored token is dead, and `AuthProvider` still asked the server about it. In dev, React StrictMode runs the effect twice | The `exp` claim of the JWT is read locally (`isTokenExpired`) and an expired token is dropped without a request; one shared in-flight request (`checkSession`) instead of two |
| F5 on the code screen could lose the order | The `orderId` was only in memory | The order id is in the URL (`/checkout/confirm/:orderId`) and the page reads `GET /orders/:id` itself (ADR 0005) |
| After paying, the checkout frame sent the user to `/cart` | The frame's guard redirects an empty cart, and after paying the cart *is* empty | `ConfirmPage` is a route outside `CheckoutLayout` |
| A second click on "Pay" could create a second order | The button is disabled only after React re-renders | An `inFlight` ref blocks a second submit in the same tick, then the button stays disabled while the request runs |
| The address list showed the wrong default after a change | One change touches several addresses (the old default loses the flag, deleting the default promotes another) | After every address mutation the whole list is reloaded from the server instead of patched by hand |
| The new order was missing from `/orders` right after paying | The history was served from the 1-minute cache | `useConfirmOrder` invalidates `['orders', 'list']` and writes the order into `['orders', 'detail', id]` |
| The next person of the same browser could see the previous user's addresses and orders | Only the cart cache was removed on logout | `PRIVATE_QUERY_KEYS` lists all four private cache entries and login / logout wipe them |
| A temporary server error could sign the user out | Any error of the start-up check removed the token | The token is removed only on `401`; a network error or `5xx` (the free server waking up) keeps it |
| A short white flash on reload in dark mode | The theme is applied by `initTheme()` in `main.jsx`, after the page starts loading | Accepted as a trade-off in this week's version. Fixed in week 3 with an inline script (FE-009) |

## 4. What I learned

- How to build a multi-step checkout where each step has its own route and state is passed through URL params.
- Why the card number must never leave the form state: no localStorage, no URL, no store, no console logging.
- How to use `useRef` for an in-flight guard that works synchronously (before React has time to re-render and disable the button).
- How TanStack Query's `invalidateQueries` and `setQueryData` work together to keep the cache consistent after mutations.
- How to structure ADRs so each decision has clear context, alternatives, and consequences.
- Why `data-theme` on `<html>` is better than a class for theme switching (one attribute, easy to set from JS, readable in CSS).

## 5. Decisions made this week

- [ADR 0005 — checkout state in the URL](../docs/adr/0005-checkout-state-in-url.md): `orderId` and the chosen address in the URL, the card only in the form.
- [ADR 0006 — color theme](../docs/adr/0006-color-theme.md): `data-theme` on `<html>`, the choice in `localStorage`, dark colors in one `theme.css`.
- Note added to [ADR 0002 — token storage](../docs/adr/0002-token-storage.md): an expired token is detected locally.

## 6. Questions for the lecturer / things I did not understand

- Is the white flash on dark-mode reload a problem we should fix with an inline script, or is the trade-off acceptable? (Answered in FE-009: must be fixed.)
- Should the theme toggle have a "system" option, or is light/dark enough? (Answered in FE-009: three states required.)

## 7. Plan for next week

- [x] FE-008: Internationalization (Georgian + English) — done in week 3
- [x] FE-009: Upgrade theme to 3 states (light / dark / system) and fix FOUC — done in week 3
- [x] Fix the `inFlight` ref in PaymentStep (was commented out) — done in week 3
- [x] Fix `apiClient.js` TOKEN_EXPIRED redirect (loses `state.from`) — done in week 3
- [ ] Tests for the pure functions — not done: 0 test files on 28.10.2026
- [x] Route-level code splitting (`React.lazy`) — done in the last days of the project ([ADR 0009](../docs/adr/0009-performance-and-seo.md))

## 8. Self-assessment

- What went well: the checkout flow is complete and robust — the card is never stored, the order survives F5, the cache stays consistent, and the theme works across tabs. The documentation (ADRs, README, ARCHITECTURE) is up to date.
- What was difficult: handling every edge case in the payment flow (stock changes, card declined, address validation, double click) and making sure the theme covers every component.
- What I would do differently: write the inFlight guard first and test it before building the rest of the payment form. Start the journal entries during the week instead of at the end.
