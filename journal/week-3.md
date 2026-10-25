# Journal — Week 3

- **Period:** 19.10.2026 – 25.10.2026
- **Project:** Cyber Shop (React front end)
- **Total time spent:** about 20 hours

## 1. Goals for the week

- FE-008: Add Georgian + English language support (i18n) to the entire UI.
- FE-009: Upgrade the dark theme from 2 states (light/dark) to 3 states (light/dark/system) and eliminate the FOUC (flash of wrong color on reload).
- Fix bugs found during the lecturer's review of FE-004 – FE-007.

## 2. What I did

| Topic | Status | Notes |
| --- | --- | --- |
| i18n: Georgian + English (FE-008) | Done | Two JSON files (`locales/ka.json`, `locales/en.json`), now 391 keys each with identical key sets. First built with an own `I18nProvider` (React Context), later moved to **`react-i18next`** (`src/lib/i18n/`, `useTranslation()` returns `{ t, i18n }`, no provider; plurals `_one` / `_other` and `{{param}}` interpolation). Every component's hardcoded text replaced with `t()` calls. Prices, dates and ratings formatted via `Intl` (locale-aware). See [ADR 0007](../docs/adr/0007-i18n-strategy.md) and [ADR 0008](../docs/adr/0008-react-i18next.md). |
| i18n: language switcher | Done | `LanguageSwitcher` component (KA / ENG segmented pill, `role="group"`, `aria-pressed`) in the header (desktop and mobile). The choice is saved in `localStorage` (`lang`) and `<html lang>` is updated; the page does not reload. |
| i18n: API data | Done | Category names use `nameEn` (English) or `name` (Georgian) depending on the language (`getCategoryName`). Filter titles use `t('filter.<key>')` via updated `getFilterTitle`. Spec **names** are translated through `SPEC_I18N_KEYS`; spec **values** stay in Georgian (API limitation, documented in ADR 0007 and ADR 0008). |
| i18n: inline script | Done | The `<script>` in `index.html` reads `localStorage.lang` and sets `<html lang>` before React mounts. |
| Theme: 3 states (FE-009) | Done | `theme.js` now stores `'light' \| 'dark' \| 'system'` in localStorage. `getPreference()` returns the stored choice, `getTheme()` the resolved one. When `system`, `matchMedia('prefers-color-scheme: dark')` is listened to live. |
| Theme: FOUC prevention (FE-009) | Done | Inline `<script>` in `index.html` `<head>` reads `localStorage.theme`, resolves it (including `system` → `matchMedia`), and sets `data-theme`, `color-scheme`, and `<meta name="theme-color">` before the first paint. |
| Theme: toggle (FE-009) | Done | `ThemeToggle` first had three buttons (☀️ 🌙 💻); it is now **one button** that cycles light → dark → system (three stacked icons, the `aria-label` names the next mode; in the mobile menu it is a row with the name of the current mode). All three states are reachable. |
| Theme: tokens instead of overrides (FE-009) | Done | Components now use theme tokens (`--t-*`, `--c-*`, `--color-*`); `theme.css` holds the light and dark values of the same tokens plus a short dark-only list. About 20 hard-coded colors remain in 6 stylesheets on purpose (footer, payment card, star / heart, thumbnail tile). Contrast of the main text / background pairs was calculated for both themes (see section 4). |
| Bug fix: `inFlight` ref in PaymentStep | Done | The `useRef(false)` guard and the `if (inFlight.current) return` check were commented out — restored and added a `finally` block to reset the ref. |
| Bug fix: TOKEN_EXPIRED hard redirect | Done | `apiClient.js` no longer does `window.location.href = '/login'` on TOKEN_EXPIRED. Instead it throws an `ApiError`, and the calling hooks (like `useAddToCart`) navigate with `state.from` preserved, so the user returns to the product page after re-login. |
| Updated ADR 0006 | Done | Documented the 3-state theme, FOUC prevention inline script, the exception to ADR 0002, the cycling button and the token approach. |
| ADR 0008 (react-i18next) | Done | Records the move from the own Context to `react-i18next`, what is and is not translated, language kept in `localStorage` (not in the URL), and that the proper fix is an `Accept-Language` header on the API. |
| Lint and build check | Done | `npm run lint` is clean (0 errors; the two `react-hooks/refs` errors from week 2 are gone) and `npm run build` passes (282 modules, JS ≈ 682 kB / ≈ 207 kB gzip). |
| Documentation | Done | ADR 0007 (i18n strategy) and ADR 0008 (react-i18next), updated ADR 0006, updated `README.md`, `ARCHITECTURE.md` and `docs/index.md`, filled in `journal/week-2.md` (was a draft), created `journal/week-3.md`. |

## 3. Problems and how I solved them

| Problem | Cause | Solution |
| --- | --- | --- |
| Prices showed wrong separators in Georgian mode | `formatPrice` used a simple template literal, not locale-aware formatting | Replaced with `formatPriceI18n()` wrapping `Intl.NumberFormat` with `ka-GE` / `en-US` locales |
| Sort option labels didn't update when switching language | `SORT_OPTIONS` was a static array with English labels defined at module level | Moved to `SORT_KEYS` (just the value strings) and labels are now fetched via `t('sort.<key>')` at render time |
| Filter titles stayed in English when switching to Georgian | `getFilterTitle()` only read from a static English map | Updated to accept `t` function: `getFilterTitle(group, t)` tries `t('filter.<key>')` first |
| The FOUC script set the wrong theme for `system` preference | The original inline script only checked for `'dark'` / `'light'` in localStorage | Added `matchMedia` check in the inline script for when the stored preference is `'system'` (or absent) |
| `inFlight` ref was not reset after an error in PaymentStep | The commented-out code had no `finally` block | Added `finally { inFlight.current = false; }` so the guard resets even if the request fails |
| After TOKEN_EXPIRED, user was not returned to the product page | `apiClient.js` did `window.location.href = '/login'` which reloads the page and loses React Router state | Changed to `throw ApiError` so hooks navigate with `state: { from }` preserved |

## 4. What I learned

- How an i18n system works from the inside: a first version with React Context + JSON + `Intl` showed what is needed (keys, interpolation, plurals, language change), and moving to `react-i18next` kept the same JSON files while the library took over the mechanics.
- Why `Intl.NumberFormat` is better than custom price formatting: it handles locale-specific separators, currency symbols, and symbol placement automatically.
- How an inline script in `<head>` prevents FOUC by applying the theme before the browser paints. The script must be synchronous and tiny.
- Why `window.location.href` redirects are problematic in a SPA: they reload the entire app and lose all in-memory state including React Router's `location.state`.
- How `useSyncExternalStore` allows reading both the resolved theme and the stored preference from the same external store.
- How to check dark-theme contrast with numbers instead of by eye: the WCAG ratio of the main text / background token pairs is ≥ 4.5:1 in dark mode; in light mode the rating badge text (`--t-rating-text` on `--t-rating-bg`) is only about 1.9:1 and is still to be fixed.

## 5. Decisions made this week

- [ADR 0007 — i18n strategy](../docs/adr/0007-i18n-strategy.md): Georgian + English, JSON + React Context, `Intl` for prices, specs stay in Georgian.
- [ADR 0006 — color theme (updated)](../docs/adr/0006-color-theme.md): 3 states (light / dark / system), FOUC prevention with inline script.

## 6. Questions for the lecturer / things I did not understand

- Product specs come from the API in Georgian only. Should we add a static English mapping for spec *values* (not just labels), or is it acceptable to show Georgian values in both languages?
- ~~The `format.js` file still has the old `formatPrice` and `formatWarranty` functions.~~ Resolved: `lib/format.js` is gone; formatting lives in `lib/i18n/format.js`, and the warranty text is a local helper in `ProductPage.jsx`.
- The API has no `Accept-Language` support. Is it enough that ADR 0008 records this as the proper fix, or should the front end do more (for example a static English map for the most common spec values)?

## 7. Plan for next week

- [ ] Tests for the pure functions (`lib/catalog.js`, `cartRules.js`, `profileForm.js`, `isTokenExpired`, `card.js`, `addressForm.js`, `checkoutErrors.js`, `i18n` formatters)
- [ ] Route-level code splitting (`React.lazy`); the single JS chunk is now larger with i18n
- [x] Remove unused `formatPrice` / `formatWarranty` from `lib/format.js` (done)
- [x] Replace the hard-coded `#000` / `#fff` in component CSS with tokens (done, about 20 intentional ones remain)
- [ ] Take the PR screenshots for FE-008 (both languages) and FE-009 (both themes, 3 pages) and check 360 / 768 / 1440 px
- [ ] Wishlist page

## 8. Self-assessment

- What went well: the i18n system works cleanly — switching language updates the entire UI instantly, prices are correctly formatted per locale, and no text is left hardcoded. The FOUC fix with the inline script is effective and small. The bug fixes from the lecturer's feedback were straightforward once the root cause was clear.
- What was difficult: finding every hardcoded string in 30+ components and making sure the translation keys are organized logically. Also making sure the inline script in `index.html` stays in sync with `theme.js` (they both resolve the same logic).
- What I would do differently: start with i18n from the beginning of the project. Retrofitting translations to an existing codebase is much more work than building with them from day one.
