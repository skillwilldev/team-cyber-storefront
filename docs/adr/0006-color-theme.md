# ADR 0006: Color theme — light / dark switch and where the choice is stored

- **Status:** Accepted
- **Date:** 2026-10-17
- **Ticket:** — (UI improvement)

## Context

The header gets a switch for a dark theme. The choice has to survive a page refresh and a new tab, and the dark colors have to cover the whole shop (catalog, cart, checkout, addresses, auth), not only the header.

Facts about the existing code:

- Colors come from two token sets (`vars.css` → `--c-*`, `auth-tokens.css` → `--color-*`), but many component stylesheets also contain hard-coded `#000` / `#fff` (about 110 places in 50+ files).
- There is no server-side rendering, so the theme can only be applied in the browser.
- [ADR 0002](./0002-token-storage.md) states that the only script in `index.html` is the Vite module entry.

## Decision

| Concern | Choice |
| --- | --- |
| Source of truth | The `data-theme="light" \| "dark"` attribute on `<html>`. CSS reads only this attribute. |
| Persistence | `localStorage`, key `theme` (`light` / `dark`). Until the user chooses, the OS preference (`prefers-color-scheme`) is used and followed live. If `localStorage` is blocked, the theme still works for the session. |
| Start-up | `initTheme()` in `lib/theme.js`, called once in `main.jsx` before React renders. |
| React access | A small external store (`lib/theme.js`) read with `useSyncExternalStore` in the `useTheme` hook. No Context provider. |
| Several tabs | The `storage` event re-applies the theme in the other tabs. |
| Dark colors | One new file `styles/theme.css`: it re-defines the shared tokens under `:root[data-theme='dark']` and overrides the hard-coded colors one by one. Component stylesheets are not edited. |
| Switch | `ThemeToggle` (`role="switch"`, keyboard accessible, respects `prefers-reduced-motion`): in the right block of the header on desktop and as a row in the mobile menu. |

## Alternatives considered

| Option | Why it was not chosen |
| --- | --- |
| **Inline script in `index.html`** that sets the theme before the first paint | Removes the short white flash on reload, but puts logic in a second place (HTML and JS must be kept in sync) and breaks the statement of ADR 0002 that `index.html` has only the module entry. The flash was accepted instead. |
| **Context provider** (`ThemeProvider`) | One more provider in `main.jsx` and re-renders of the tree on change, while the attribute on `<html>` has to exist anyway for CSS. |
| **Replace every hard-coded color with a token** in all component CSS | The cleanest long-term result, but a very large diff across 50+ files for a single feature. Kept as a later clean-up. |
| **Only `prefers-color-scheme`** (no switch) | The user cannot choose against the OS setting. |
| **A class on `<html>`** instead of the attribute | Works the same, but the attribute is easier to read and to set from one place without touching other classes. |

## Consequences

**Positive**

- One attribute drives the theme; the choice is saved and shared between tabs.
- No existing component stylesheet was changed; the whole dark palette is in one file.
- The switch and the store are small and have no dependencies.

**Negative / trade-offs**

- On reload in dark mode a very short white flash is possible, because the theme is applied after the JS bundle starts.
- A new component with a hard-coded `#000` / `#fff` will look wrong in dark mode until it gets a rule in `theme.css` (or uses the tokens). New code should use the tokens.
- Product photos are assumed to be shot on a white background, so in dark mode they are shown on a light rounded tile and `mix-blend-mode: multiply` is switched off for the order thumbnails.
- `theme.css` uses CSS nesting; Vite lowers it for older browsers if the build targets require it.

## Where this is implemented

- `src/lib/theme.js` — `initTheme`, `getTheme`, `setTheme`, `toggleTheme`, `subscribe`.
- `src/hooks/useTheme.js` — `useSyncExternalStore` wrapper.
- `src/components/ThemeToggle/` — the switch.
- `src/components/Header/Header.jsx`, `Header.css` — placement (desktop and mobile menu).
- `src/styles/theme.css` — dark tokens and overrides; imported by `src/styles/global.css`.
- `src/main.jsx` — `initTheme()` before the first render.
