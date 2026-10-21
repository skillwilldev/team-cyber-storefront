# Documentation index

This folder contains the written documentation of the Cyber Shop front end.

## Where to start

| Document | What it answers |
| --- | --- |
| [`../README.md`](../README.md) | How to install, run, build and deploy the project |
| [`../ARCHITECTURE.md`](../ARCHITECTURE.md) | How the code is organised: folders (full annotated tree), data flow, modules (auth, cart, addresses, checkout), API reference, known limitations |
| [`adr/`](./adr) | **Why** the important technical decisions were made |
| [`../journal/`](../journal) | Weekly development journal |

## Architecture Decision Records (ADR)

An ADR is a short document about **one** decision: the situation, what was chosen, what else was considered and what the consequences are. They are numbered and are never deleted; if a decision changes, a new ADR is added and the old one is marked as superseded.

| # | Title | Ticket | Status |
| --- | --- | --- | --- |
| [0001](./adr/0001-frontend-stack.md) | Front-end stack: React 19, Vite, TanStack Query, React Hook Form + Zod | — | Accepted |
| [0002](./adr/0002-token-storage.md) | Where to store the access token: `localStorage` vs httpOnly cookie | FE-002 | Accepted |
| [0003](./adr/0003-cart-quantity-stepper.md) | Cart quantity stepper: how to handle fast clicks | FE-005 | Accepted |
| [0004](./adr/0004-profile-current-password.md) | Profile page: current password in the form, not in a modal | FE-004 | Accepted |
| [0005](./adr/0005-checkout-state-in-url.md) | Checkout state: `orderId` and chosen address in the URL, card only in the form | FE-006 | Accepted |
| [0006](./adr/0006-color-theme.md) | Color theme: light / dark / system, FOUC prevention with inline script, `data-theme` on `<html>` | FE-009 | Accepted (updated) |
| [0007](./adr/0007-i18n-strategy.md) | Internationalization: Georgian + English, JSON + React Context, `Intl` for prices | FE-008 | Accepted |

### ADR template

Copy this when a new decision has to be recorded (next number: `0008`):

```md
# ADR 000X: Short title of the decision

- **Status:** Proposed | Accepted | Superseded by ADR 000Y
- **Date:** 2026-10-11
- **Ticket:** FE-00X

## Context
What is the situation? What problem has to be solved? Which constraints exist?

## Decision
What was chosen? One clear statement.

## Alternatives considered
Each option with a short reason why it was not chosen.

## Consequences
What gets better, what gets worse, what must be remembered later.
```

## Journal

- [Week 1](../journal/week-1.md)
- [Week 2](../journal/week-2.md)
- [Week 3](../journal/week-3.md) (i18n, 3-state theme, bug fixes from lecturer feedback)

## Related code

Where each decision is implemented. Only the cart files reference ADR 0003 directly in their comments; the other rows show which code implements the decision.

| Code | ADR |
| --- | --- |
| `src/features/cart/components/CartLine/CartLine.jsx` | [0003](./adr/0003-cart-quantity-stepper.md) |
| `src/features/cart/components/QuantityStepper/QuantityStepper.jsx` | [0003](./adr/0003-cart-quantity-stepper.md) |
| `src/shared/api/apiClient.js`, `src/features/auth/context/AuthProvider.jsx` | [0002](./adr/0002-token-storage.md) |
| `src/features/auth/pages/AccountPage/AccountPage.jsx` | [0004](./adr/0004-profile-current-password.md) |
| `src/features/checkout/pages/PaymentStep/PaymentStep.jsx`, `src/features/checkout/pages/ConfirmPage/ConfirmPage.jsx`, `src/features/checkout/lib/checkoutRoutes.js`, `src/features/checkout/hooks/useSelectedAddress.js` | [0005](./adr/0005-checkout-state-in-url.md) |
| `src/lib/theme.js`, `src/hooks/useTheme.js`, `src/components/ThemeToggle/`, `src/styles/theme.css`, `index.html` (inline script) | [0006](./adr/0006-color-theme.md) |
| `src/lib/i18n.jsx`, `src/locales/`, `src/components/LanguageSwitcher/`, `src/lib/filterLabels.js` | [0007](./adr/0007-i18n-strategy.md) |
