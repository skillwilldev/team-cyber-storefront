# ADR 0004: Profile page — where to ask for the current password

- **Status:** Accepted
- **Date:** 2026-10-11
- **Ticket:** FE-004

## Context

The profile page lets a signed-in user change their name, e-mail, phone, city, address and password. The API endpoint is

```
PATCH /auth/me   { currentPassword, ...only the changed fields }
```

and it **requires `currentPassword` for every change**. This protects the account if somebody finds an unlocked computer or a stolen session.

The ticket asks us to decide *where* the user types the current password: in the form itself or in a confirmation modal that appears after pressing "Save", and to record why.

Related facts:

- A wrong current password is returned as **`400 INVALID_CURRENT_PASSWORD`** (not 401), because the session itself is still valid. The user must stay on the page.
- `401 TOKEN_EXPIRED` is handled centrally in `apiClient` and redirects to `/login`.
- Other server errors must be mapped to fields: `409 EMAIL_TAKEN` → Email, `422 VALIDATION_ERROR` → each field.
- Only changed fields are sent, so the form must know what really changed.

## Decision

Keep **`currentPassword` as a normal, required field at the bottom of the form**, in the password section, directly above the "Save changes" button. There is no confirmation modal.

Details:

- The field uses `autocomplete="current-password"`, so password managers can fill it.
- **"Save changes" is disabled until a profile field actually changed.** Typing only the current password is not a change (`hasChanges(dirtyFields)`), which prevents empty requests.
- The request body is built by `buildPatch()` from fields that are both *dirty* and *really different* from the server value. Clearing phone, city or address sends an empty string on purpose. If nothing differs, nothing is sent.
- On success the new user object is published with `setUser(data.user)` so the Header and `UserMenu` update instantly, and the form is reset (`reset(...)`) so the password fields are emptied and the form is clean again. The "saved" message disappears as soon as the user edits again.
- `INVALID_CURRENT_PASSWORD` is shown **under the "Current password" field** and the field receives focus (`shouldFocus: true`).
- The same schema (`profileSchema`) validates everything, including the rule that the new password and its confirmation must match. The confirmation field exists only on the front end.

## Alternatives considered

| Option | Why it was not chosen |
| --- | --- |
| **Confirmation modal after "Save"** | Needs a focus trap, `Escape` handling, restoring focus and a second place for errors. Server errors would be split: field errors (e-mail taken, validation) in the form, a password error in the modal, with extra state to keep the form data while the modal is open. More code and more accessibility risk for the same security result, because the server checks the password anyway. |
| **Ask only when changing e-mail or password** | The API requires `currentPassword` for every `PATCH`; the form would have to hide a field the server still needs. |
| **Separate "Security" page for password and e-mail** | Splits one API call across two screens and duplicates the form logic. |
| **Remember the password after the first entry** | Would keep a secret in memory longer than needed; rejected for security reasons. |

## Consequences

**Positive**

- One screen, one submit, one place for all errors; the form logic stays simple.
- Works with password managers and keyboard-only users without extra behaviour.
- The wrong-password case keeps the user on the page and keeps what they typed.
- Easy to test: `buildPatch`, `hasChanges`, `toFormValues` and `applyServerErrors` are pure functions in `features/auth/lib/profileForm.js`.

**Negative / trade-offs**

- Users see a "Current password" field even for a small change such as the city; that is a little more friction than asking only when needed.
- A modal can feel like a clearer "are you sure?" moment than a field in a long form. The label and the page subtitle ("Enter your current password to confirm any change") are used to make the requirement obvious.

## Where this is implemented

- `src/features/auth/pages/AccountPage/AccountPage.jsx` — the form and error mapping.
- `src/features/auth/lib/profileForm.js` — `toFormValues`, `buildPatch`, `hasChanges`, `applyServerErrors`.
- `src/shared/lib/validators.js` — `profileSchema`.
