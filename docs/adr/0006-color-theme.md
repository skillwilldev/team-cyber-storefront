# ADR 0006: Color theme — light / dark / system switch, FOUC prevention

- **Status:** Accepted (updated 2026-10-21, supersedes the original 2026-10-17 version)
- **Date:** 2026-10-17 (updated 2026-10-21 for FE-009)
- **Ticket:** FE-009

## Context

The header gets a switch for the color theme. The choice has to survive a page refresh and a new tab, and the colors have to cover the whole shop (catalog, cart, checkout, addresses, auth), not only the header.

FE-009 requires **three states**: light, dark, and **system** (follows the OS preference live). It also requires **no FOUC** (flash of unstyled content / wrong-color flash on reload).

Facts about the existing code:

- Colors come from two token sets (`vars.css` → `--c-*`, `auth-tokens.css` → `--color-*`), but many component stylesheets also contain hard-coded `#000` / `#fff` (about 110 places in 50+ files).
- There is no server-side rendering, so the theme can only be applied in the browser.
- [ADR 0002](./0002-token-storage.md) originally stated that the only script in `index.html` is the Vite module entry. The FOUC prevention script is an accepted exception (see below).

## Decision

| Concern | Choice |
| --- | --- |
| Source of truth | The `data-theme="light" \| "dark"` attribute on `<html>`. CSS reads only this attribute. |
| Three states | The **stored preference** is `light`, `dark`, or `system`. The **resolved theme** on `<html>` is always `light` or `dark`. When `system`, it follows `prefers-color-scheme` live (via `matchMedia` listener). |
| Persistence | `localStorage`, key `theme` (`light` / `dark` / `system`). Until the user chooses, the default is `system` (OS preference). If `localStorage` is blocked, the theme still works for the session. |
| FOUC prevention | An **inline `<script>` in `index.html` `<head>`** reads `localStorage.theme` and applies `data-theme`, `color-scheme`, and `<meta name="theme-color">` **before the first paint**. This is the one exception to ADR 0002's "only the module entry" rule. |
| Start-up | `initTheme()` in `lib/theme.js`, called in `main.jsx`, sets up event listeners for `storage` and `matchMedia` changes. The actual theme is already applied by the inline script. |
| React access | A small external store (`lib/theme.js`) read with `useSyncExternalStore` in the `useTheme` hook. No Context provider. Returns both `theme` (resolved) and `preference` (stored). |
| Several tabs | The `storage` event re-applies the theme in the other tabs. |
| Dark colors | One file `styles/theme.css`: it re-defines the shared tokens under `:root[data-theme='dark']` and overrides the hard-coded colors one by one. Component stylesheets are not edited. |
| Switch | `ThemeToggle` (`role="radiogroup"`, three buttons: ☀️ light, 🌙 dark, 💻 system, keyboard accessible, respects `prefers-reduced-motion`): in the right block of the header on desktop and as a row in the mobile menu. |
| `color-scheme` | Applied as `<html style="color-scheme: light|dark">` by both the inline script and `theme.js`, so native scrollbars and form controls follow the theme. |
| `<meta name="theme-color">` | Updated to `#ffffff` (light) or `#111114` (dark) by both the inline script and `theme.js`. |

## Alternatives considered

| Option | Why it was not chosen |
| --- | --- |
| **Only two states (light / dark)** | FE-009 explicitly requires a "system" mode that follows the OS. |
| **Context provider** (`ThemeProvider`) | One more provider in `main.jsx` and re-renders of the tree on change, while the attribute on `<html>` has to exist anyway for CSS. |
| **Replace every hard-coded color with a token** in all component CSS | The cleanest long-term result, but a very large diff across 50+ files for a single feature. Kept as a later clean-up. |
| **Only `prefers-color-scheme`** (no switch) | The user cannot choose against the OS setting. |
| **No inline script** (accept the flash) | FE-009 says FOUC is unacceptable. The inline script is small (~15 lines) and runs synchronously before paint. |

## Consequences

**Positive**

- One attribute drives the theme; the choice is saved and shared between tabs.
- No existing component stylesheet was changed; the whole dark palette is in one file.
- The switch and the store are small and have no dependencies.
- **No FOUC**: the inline script applies the theme before the first paint.
- The `system` mode follows OS changes in real time.

**Negative / trade-offs**

- A new component with a hard-coded `#000` / `#fff` will look wrong in dark mode until it gets a rule in `theme.css` (or uses the tokens). New code should use the tokens.
- Product photos are assumed to be shot on a white background, so in dark mode they are shown on a light rounded tile and `mix-blend-mode: multiply` is switched off for the order thumbnails.
- `theme.css` uses CSS nesting; Vite lowers it for older browsers if the build targets require it.
- The inline script in `index.html` is an exception to ADR 0002. It is documented and small.

## Where this is implemented

- `index.html` — inline `<script>` for FOUC prevention.
- `src/lib/theme.js` — `initTheme`, `getTheme`, `getPreference`, `setTheme`, `toggleTheme`, `subscribe`.
- `src/hooks/useTheme.js` — `useSyncExternalStore` wrapper (returns `theme` + `preference`).
- `src/components/ThemeToggle/` — the three-button switch.
- `src/components/Header/Header.jsx`, `Header.css` — placement (desktop and mobile menu).
- `src/styles/theme.css` — dark tokens and overrides; imported by `src/styles/global.css`.
- `src/main.jsx` — `initTheme()` before the first render.
