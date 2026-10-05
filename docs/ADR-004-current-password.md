# ADR-004 — Where to ask for the current password (FE-004)

**Decision:** a regular "Current password" field at the end of the profile form (inside the "Security" section), not a confirmation modal.

**Why**
- Every server error maps to a visible field: `400 INVALID_CURRENT_PASSWORD` appears right under that input, `409` under Email, `422` under its own field. With a modal, errors would be split between two screens and the modal would have to close/reopen to show a field error.
- No focus-trap / Escape / scroll-lock logic to build and maintain; fewer places for accessibility bugs. Keyboard order is simply top → bottom.
- Password managers recognise `autocomplete="current-password"` + `new-password` pairs in one form and behave correctly.
- A single submit path: `handleSubmit` → `PATCH`.

**Trade-off:** the field is always visible, so the form looks a bit longer. A modal would feel "lighter" for a one-field edit like City; we accept the extra height for simpler, more reliable error handling.

**Related decisions**
- Source of truth for the user is `AuthContext`; after a 200 we call `setUser(data.user)`, so Header/UserMenu/checkout update without a refetch. TanStack Query is not used for the user (it is not stored there).
- Only changed fields are sent (`dirtyFields` + comparison with the server user). `currentPassword` alone is not a change → "Save" stays disabled.
- Wrong current password is `400`, so `apiClient` does not log the user out (only `401 TOKEN_EXPIRED / INVALID_TOKEN` does, now also for `PATCH /auth/me`).
