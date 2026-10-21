# ADR 0007: Internationalization — Georgian + English, JSON + React Context

- **Status:** Accepted
- **Date:** 2026-10-21
- **Ticket:** FE-008

## Context

The shop needs to support two languages: Georgian (default) and English. Most data comes from the API in Georgian only (`name`, `description`, `specs`), but category objects have a `nameEn` field and filter options have both `label` (Georgian) and `value` (English slug). The UI has about 200 hard-coded English strings spread across 30+ components.

Constraints:

- Only two languages — no need for a full-blown i18n library.
- The choice must survive a page reload (`localStorage`).
- `<html lang>` must update when the language changes (accessibility and SEO).
- Prices and dates must be formatted with the browser's `Intl` API (locale-aware, no custom code).
- Product specs come from the API in Georgian (keys are Georgian words); they cannot be translated because the API has no English version of specs. This is accepted.

## Decision

| Concern | Choice |
| --- | --- |
| Translation files | Two JSON files (`src/locales/ka.json`, `src/locales/en.json`) with identical keys, imported statically by Vite. |
| Translation function | `t('section.key')` with `{{param}}` interpolation (e.g., `t('cart.cartCount', { count: 5 })`). |
| React integration | A React Context (`I18nProvider` in `src/lib/i18n.jsx`) wrapping the app in `main.jsx`. The `useTranslation()` hook returns `{ lang, setLang, t }`. |
| Persistence | `localStorage`, key `lang` (`ka` / `en`). Default is `ka`. |
| `<html lang>` | Updated by `I18nProvider.setLang()` and by the inline script in `index.html`. |
| Price formatting | `formatPriceI18n(value, currency, lang)` — wraps `Intl.NumberFormat` with `ka-GE` or `en-US` locale. |
| Category names | `getCategoryName(category, lang)` reads `name` (Georgian) or `nameEn` (English) from the API response. |
| Filter titles | `getFilterTitle(group, t)` tries `t('filter.<key>')` first, then falls back to the API `label` or the English constant. |
| Product specs | Shown as-is from the API (Georgian). The English labels for "quick specs" on the product page come from `src/lib/specs.js` (`SPEC_LABELS`), which is a static map of Georgian→English. This is a pragmatic choice: the API has no `specsEn` field, and translating spec keys is not the same as translating spec values. See "Consequences" below. |
| Switch component | `LanguageSwitcher` (`role="radiogroup"`, KA / EN buttons) in the header desktop area and mobile menu. |
| Inline script | The `<script>` block in `index.html` reads `localStorage.lang` and sets `<html lang>` before React mounts, preventing a language mismatch during first paint. |

## Alternatives considered

| Option | Why it was not chosen |
| --- | --- |
| **react-i18next / i18next** | A full library with plurals, namespaces, lazy loading, and backend plugins. Powerful but heavy for two languages with ~200 keys. The project already avoids unnecessary dependencies. |
| **Only English UI** | Violates FE-008; the course requires Georgian as the default. |
| **Translate spec values** | The API does not provide English spec values. Machine-translating them would be inaccurate and inconsistent with the API data. |
| **URL-based language (`/en/...`, `/ka/...`)** | Adds complexity (rewriting routes, handling redirects) without benefit for a SPA that does not need SEO for both languages. |

## Consequences

**Positive**

- The language can be changed with one click; the whole UI re-renders in the new language.
- `Intl.NumberFormat` gives correct price formatting for each locale (Georgian lari symbol, separators).
- No new npm dependencies.
- The inline script ensures `<html lang>` is correct before the first paint.

**Negative / trade-offs**

- Product specs (`ეკრანი`, `პროცესორი`, …) remain in Georgian in both languages because the API does not have English versions. Only the quick-spec labels on the product page have a static English mapping (`SPEC_LABELS` in `specs.js`).
- Product titles, descriptions, and brands come from the API and are not translated (the API is single-language).
- Both JSON files are loaded statically (not lazy-loaded), adding ~4 kB to the bundle. Acceptable for two files.
- Adding a third language would require a new JSON file and minor code changes (`LANGUAGES`, `INTL_LOCALES`).

## Where this is implemented

- `src/locales/ka.json`, `src/locales/en.json` — all UI strings.
- `src/lib/i18n.jsx` — `I18nProvider`, `useTranslation`, `formatPriceI18n`, `formatDateI18n`, `getCategoryName`.
- `src/components/LanguageSwitcher/` — the KA/EN toggle.
- `src/components/Header/Header.jsx` — placement of the switcher.
- `src/lib/filterLabels.js` — `getFilterTitle(group, t)`.
- `index.html` — inline `<script>` sets `<html lang>`.
- `src/main.jsx` — `<I18nProvider>` in the provider tree.
