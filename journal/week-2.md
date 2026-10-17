# Journal — Week 2 (DRAFT)

- **Period:** 12.10.2026 – ..
- **Project:** Cyber Shop (React front end)
- **Total time spent:** _fill in_

> Draft: the facts below come from the code (checked on 17.10.2026: `npm run build` passes — 244 modules, JS ≈ 567 kB, CSS ≈ 60 kB; `npm run lint` reports 2 errors). The time, "What I learned" and the self-assessment are for you to write in your own words.

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
| Documentation | Done | README (features, routes, structure, status, troubleshooting), ARCHITECTURE.md (full annotated folder tree, new sections 12 Addresses and 13 Checkout and orders, routing, state keys, session lifecycle, API reference, limitations), ADR 0002 (note), ADR 0005, docs index. |

## 3. Problems and how I solved them

> Rows marked **(risk)** are problems that the code was written to prevent (taken from the comments in the code), not necessarily bugs that you hit. Delete the ones that are not true for you.

| Problem | Cause | Solution |
| --- | --- | --- |
| `Failed to load resource: 401` for `/auth/me` appeared in the console, twice | The access token lives 30 minutes; after a longer break the stored token is dead, and `AuthProvider` still asked the server about it. In dev, React StrictMode runs the effect twice | The `exp` claim of the JWT is read locally (`isTokenExpired`) and an expired token is dropped without a request; one shared in-flight request (`checkSession`) instead of two |
| (risk) F5 on the code screen could lose the order | The `orderId` was only in memory | The order id is in the URL (`/checkout/confirm/:orderId`) and the page reads `GET /orders/:id` itself (ADR 0005) |
| (risk) After paying, the checkout frame sent the user to `/cart` | The frame's guard redirects an empty cart, and after paying the cart *is* empty | `ConfirmPage` is a route outside `CheckoutLayout` |
| (risk) A second click on "Pay" could create a second order | The button is disabled only after React re-renders | An `inFlight` ref blocks a second submit in the same tick, then the button stays disabled while the request runs |
| (risk) The address list showed the wrong default after a change | One change touches several addresses (the old default loses the flag, deleting the default promotes another) | After every address mutation the whole list is reloaded from the server instead of patched by hand |
| (risk) The new order was missing from `/orders` right after paying | The history was served from the 1-minute cache | `useConfirmOrder` invalidates `['orders', 'list']` and writes the order into `['orders', 'detail', id]` |
| (risk) The next person of the same browser could see the previous user's addresses and orders | Only the cart cache was removed on logout | `PRIVATE_QUERY_KEYS` lists all four private cache entries and login / logout wipe them |
| A temporary server error could sign the user out | Any error of the start-up check removed the token | The token is removed only on `401`; a network error or `5xx` (the free server waking up) keeps it |

## 4. What I learned

- _write in your own words_

## 5. Decisions made this week

- [ADR 0005 — checkout state in the URL](../docs/adr/0005-checkout-state-in-url.md): `orderId` and the chosen address in the URL, the card only in the form.
- Note added to [ADR 0002 — token storage](../docs/adr/0002-token-storage.md): an expired token is detected locally.

## 6. Questions for the lecturer / things I did not understand

- _write in your own words_

## 7. Plan for next week

- [ ] Fix the 2 `npm run lint` errors (`react-hooks/refs` in `PaymentStep.jsx` and `ConfirmPage.jsx`, caused by the `inFlight` ref read inside `onSubmit`); the build passes, so this is lint only
- [ ] Tests for the pure functions (`lib/catalog.js`, `cartRules.js`, `profileForm.js`, `isTokenExpired`, and the new `card.js`, `addressForm.js`, `checkoutErrors.js`)
- [ ] Route-level code splitting (`React.lazy`); the single JS chunk is now ≈ 567 kB (≈ 171 kB gzip)
- [ ] Header search outside the catalog should keep the current category
- [ ] Tidy-up: move `getGenericMessage` out of `features/checkout` (addresses and checkout import each other), export `useAuth` from the auth barrel, remove the commented-out lines
- [ ] Wishlist page

## 8. Self-assessment

- _write in your own words_
