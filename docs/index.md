# Documentation index

This folder contains the written documentation of the Cyber Shop front end.

## Where to start

| Document | What it answers |
| --- | --- |
| [`../README.md`](../README.md) | How to install, run, build and deploy the project |
| [`../ARCHITECTURE.md`](../ARCHITECTURE.md) | How the code is organised: folders, data flow, modules, API reference |
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

### ADR template

Copy this when a new decision has to be recorded (next number: `0005`):

```md
# ADR 000X: Short title of the decision

- **Status:** Proposed | Accepted | Superseded by ADR 000Y
- **Date:** YYYY-MM-DD
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

## Where the ADRs are referenced in the code

| Code | ADR |
| --- | --- |
| `src/features/cart/components/CartLine/CartLine.jsx` | [0003](./adr/0003-cart-quantity-stepper.md) |
| `src/features/cart/components/QuantityStepper/QuantityStepper.jsx` | [0003](./adr/0003-cart-quantity-stepper.md) |
| `src/shared/api/apiClient.js`, `src/features/auth/context/AuthProvider.jsx` | [0002](./adr/0002-token-storage.md) |
| `src/features/auth/pages/AccountPage/AccountPage.jsx` | [0004](./adr/0004-profile-current-password.md) |
