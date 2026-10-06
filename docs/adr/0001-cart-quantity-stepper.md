# ADR 0001 — Cart quantity stepper: what happens on rapid clicks

- Status: accepted
- Task: FE-005 (cart)

## Problem

`PATCH /cart/items/:id { qty }` sets an **absolute** quantity. A user can click `+` three times quickly.
If each click computes `qty + 1` from the number currently on screen, three requests with the **same** value are sent
(`2 → 3, 3, 3`). If the requests are parallel, their responses can also arrive in a different order, so a stale answer
may be the last one written and the screen shows `2` instead of `4`.

## Options

| | A. Lock the stepper while the request is in flight | B. Debounce (300 ms) |
|---|---|---|
| Idea | `+` / `−` / trash are disabled until the server answers | the number changes locally at once, the LAST value is sent after 300 ms of silence |
| Correctness | the number on screen is always the server's answer; no shared "draft" state | needs a local draft, a timer, and a way to serialize a new send while the old one is still running |
| Failure handling | nothing to roll back — the screen was never ahead of the server | must roll the draft back on 409 / 404 / network error |
| UX | one click ≈ one round trip (the API is on free hosting: can be slow) | feels instant |
| Code | ~0 extra lines | draft state + timer + cleanup on unmount / logout |

## Decision

**A — lock the line while its request is running**, plus a safety net for the whole cart:

1. `CartLine` disables the stepper and the trash button while `update.isPending || remove.isPending`
   (each line owns its own mutation objects). A second click on the same line is therefore impossible until the
   response is applied, and every `qty ± 1` is always computed from the **server's** number.
2. All cart mutations share one `scope: { id: 'cart' }` (`src/api/cartQueries.js`). TanStack Query runs mutations of the
   same scope **one after another**, so requests from different lines / from "Add to cart" buttons are applied in the
   order they were made — a stale response can't overwrite a newer one.
3. `onMutate` cancels a running `GET /cart`, so an older cart snapshot can't overwrite the mutation's answer.
4. Every mutation response (the whole cart) is written into `['cart']` — header badge and cart page cannot disagree.

## Why not B

It is nicer to use, but it adds a second source of truth (draft vs. server) exactly in the place where the task warns
about wrong numbers. For a cart that must always show the correct total, "simple and reliable" wins; the lock is
visible (dimmed line) so the user understands that the click is being processed.

## Consequences

- Fast clicking applies one change per round trip instead of many — this is intentional.
- Optimistic update (bonus) is not implemented. If it is added later it must roll back to the previous cart on error
  and keep the lock/scope above.
