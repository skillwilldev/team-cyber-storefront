# ADR 0003: Cart quantity stepper — how to handle fast clicks

- **Status:** Accepted
- **Date:** 2026-10-11
- **Ticket:** FE-005

## Context

The cart lives on the server. Each line has a quantity stepper `− [qty] +`. Changing the quantity is done with

```
PATCH /cart/items/:id   { qty }
```

and the important detail is that **`PATCH` sets an absolute quantity, not a delta.**

That creates a race. Suppose the line shows `qty = 2` and the user clicks "+" three times quickly:

- if each click computes `qty + 1` from the same number on screen (`2`), the browser sends `qty: 3` three times;
- the user expected `5`, the server ends at `3`;
- if requests are sent in parallel they can also be answered out of order, so an older response may overwrite a newer one on screen.

Additional facts:

- Every cart endpoint returns the **whole updated cart** (items, `totalQty`, `subtotal`, `lineTotal`).
- The API can be slow (free hosting; a cold start can take up to a minute).
- The quantity must stay within `1…99` and not above the stock.
- The header badge and the cart page must show the same numbers at all times.

## Decision

**While a line's request is in flight, the line is locked, and what is displayed is always the server's answer.**

Concretely:

1. **Lock the line.** In `CartLine`, `isBusy = update.isPending || remove.isPending`. The stepper (`disabled={isBusy}`) and the trash button are disabled until the request finishes. The next click is computed from the server's confirmed `qty`, so a duplicate value can never be sent.
2. **Never calculate money in the browser.** `lineTotal`, `subtotal` and `totalQty` are shown exactly as the server returned them.
3. **Write the response straight into the cache.** All cart mutations go through one helper (`useCartMutation`) whose `onSuccess` calls `queryClient.setQueryData(['cart'], cart)`. The header badge and the cart page read the same entry, so they cannot disagree and no extra `GET /cart` is needed.
4. **Serialise cart mutations.** The mutations use `scope: { id: 'cart' }`, so mutations with the same scope run one after another in creation order. This protects the *other* kinds of races (for example, a click on line A and a click on line B at almost the same time).
5. **Cancel outdated reads.** `onMutate` calls `cancelQueries(['cart'])`, so a `GET /cart` that is still in flight can never overwrite newer data.
6. **Self-heal on conflicts.** If a mutation fails with `404` or `409`, the local picture is outdated, so the cart is invalidated and reloaded.
7. **Bounds are enforced in the UI too.** "−" is disabled at `1` (use the trash button to remove; `0` is not a valid quantity); "+" is disabled at `min(stock, 99)` (`getMaxQty`). If stock dropped below the quantity, the line shows a warning (`getStockIssue`) and checkout is blocked until it is fixed.
8. **Errors appear next to the cause.** A failed update shows the message under that cart line (`getCartErrorMessage` maps error *codes* to texts), not as a global error.

## Alternatives considered

| Option | Why it was not chosen |
| --- | --- |
| **Optimistic update** (change the number instantly, fix it if the request fails) | Feels faster, but needs rollback logic and still has the "absolute value" race on rapid clicks. With a slow free-tier server the number could jump back and forth, and the totals would temporarily be wrong. Correctness was preferred over perceived speed. |
| **Debounce** (wait 300–500 ms after the last click, then send one request with the final number) | Solves the three-clicks problem, but the number on screen is not confirmed by the server for a while, the lock-free UI can still reorder responses, and it adds timers and edge cases (unmount, quantity change on another tab). |
| **Send deltas** (`+1`, `-1`) | The API does not support it; `PATCH` takes an absolute quantity. |
| **Serialise only (queue), do not lock the UI** | Queued requests would still be computed from a stale on-screen number. Needs a local "pending quantity" state that mirrors the server — more complexity and a second source of truth. |
| **Compute totals on the client** | Risk of rounding differences and a mismatch with the server's real price at checkout. |

## Consequences

**Positive**

- The quantity shown is always what the server confirmed; there is no wrong or "jumping" number.
- No client-side money maths, so no rounding or price mismatches.
- One cache entry (`['cart']`) keeps the header badge and the cart page in sync.
- The behaviour is simple to reason about and to explain: *one request per line at a time*.

**Negative / trade-offs**

- With a slow network the stepper is briefly disabled after each click; the interaction feels less instant than an optimistic UI. The line has `aria-busy` so assistive technology knows it is updating.
- Changing the quantity of several *different* lines at the same time is allowed, but their requests run one after another (mutation scope), so the last one can take longer.
- Product pages and cards still add items with `POST /cart/items`, which uses `productId`. Updating and removing use the **cart line id** (`items[].id`). Mixing the two ids is the most common mistake in this module.

## Where this is implemented

- `src/features/cart/components/CartLine/CartLine.jsx` — locks the line while a request is pending.
- `src/features/cart/components/QuantityStepper/QuantityStepper.jsx` — `disabled` prop and bounds.
- `src/api/cartQueries.js` — `useCartMutation` (scope, `cancelQueries`, `setQueryData`, self-heal).
- `src/features/cart/lib/cartRules.js` — `MIN_QTY`, `MAX_QTY`, `getMaxQty`, `getStockIssue`.
- `src/features/cart/lib/cartErrors.js` — `getCartErrorMessage`.
