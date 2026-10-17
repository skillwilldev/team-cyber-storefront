# ADR 0005: Checkout state — where `orderId`, the chosen address and the card live

- **Status:** Accepted
- **Date:** 2026-10-13
- **Ticket:** FE-006

## Context

Checkout is a chain of screens: **Address → Shipping → Payment → code → order page**. Three pieces of data travel through it:

1. the **chosen delivery address** (step 1 → steps 2, 3);
2. the **`orderId`** of the pending order (payment step → code screen → order page);
3. the **card** (only on the payment step).

Requirements from the task: pressing **F5** on the code screen must not lose the order; the order page must work after F5; the card must **never** be stored outside the form.

## Decision

| Data | Where it lives | Why |
| --- | --- | --- |
| Chosen address | URL: `?address=<id>` (`/checkout/shipping?address=…`). The data itself comes from the `['addresses']` cache. | Survives F5 and "Back"; no storage; an id that was deleted meanwhile is simply not found → the step returns to step 1. |
| `orderId` | URL: `/checkout/confirm/:orderId`. The order itself is read with `GET /orders/:id` (`['orders','detail',id]`). | F5 keeps the screen; an already paid order redirects to `/orders/:id`; a foreign id is a clean "not found". |
| Card | Only the state of the payment form (React Hook Form). Emptied (`reset`) right after `POST /orders` succeeds. | Never in `localStorage`, `sessionStorage`, the URL, a global store, `console.log`. The server keeps only brand + last 4 digits. |
| Devcode | Not used by the UI. | It is a learning-mode field: read it in DevTools → Network and type it by hand. |

The address **id** in the URL is not sensitive; `POST /orders` still receives a full copy of the address (`shipping`), as the API requires.

## Alternatives considered

| Option | Why it was not chosen |
| --- | --- |
| Context / global store for the wizard | Lost on F5 unless duplicated into storage — then the same data lives in two places. |
| `sessionStorage` for the address and `orderId` | Works, but hidden state: links are not shareable, "Back" and tabs can disagree. The URL is simpler and visible. |
| `location.state` (router state) | Survives F5 in some browsers only and is lost when the link is opened again. |
| One long page with 3 sections (the task text recommends 2 steps) | The mockups show 3 separate steps, so 3 routes were built; they share one layout and one `GET /checkout`. |

## Consequences

**Positive**
- F5 on every screen restores the same screen; "Back" works naturally.
- Nothing about the card can leak: it exists only while the form is mounted.

**Negative / trade-offs**
- Opening `/checkout/shipping` or `/payment` without `?address=` redirects to step 1.
- "Back" from the code screen returns to a **new, empty** card form; paying again creates a new order and a new code (the server removes the previous unpaid one) — this is normal.
- Step 2 is informational: the API has one delivery option (fee decided by the server) and no "method" field, so express / scheduled rows are shown disabled.

## Where this is implemented

- `src/features/checkout/lib/checkoutRoutes.js` — all checkout URLs.
- `src/features/checkout/hooks/useSelectedAddress.js` — address from `?address=` + `['addresses']`.
- `src/features/checkout/pages/PaymentStep.jsx` — card form, `reset()` after success, double-click guard.
- `src/features/checkout/pages/ConfirmPage.jsx` — `orderId` from the URL, code, resend timer.
- `src/api/checkoutQueries.js` — `useConfirmOrder` empties the `['cart']` cache after payment.
