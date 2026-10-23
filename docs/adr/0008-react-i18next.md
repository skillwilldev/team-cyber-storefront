# ADR 0008: i18n — react-i18next instead of the home-made React Context

- **Status:** Accepted (supersedes the React-integration part of [ADR 0007](./0007-i18n-strategy.md); everything else in ADR 0007 still applies)
- **Date:** 2026-10-23
- **Ticket:** FE-008 (bonus)

## Context

[ADR 0007](./0007-i18n-strategy.md) chose a small home-made solution: two JSON files, an `I18nProvider` (React Context) and our own `useTranslation()` hook, and it explicitly rejected `react-i18next` as too heavy for two languages.

Since then the dictionaries grew to **391 keys per language** in about 28 sections (cart, auth, checkout, orders, addresses, validation, accessibility texts, …), and the UI now needs the things a library already provides: plurals (`1 year` / `2 years`, `1 item` / `5 items`), `{{param}}` interpolation and a tested way to react to a language change. The task description itself names `react-i18next` as the standard choice, and says a home-made solution is fine only if the decision is justified.

Facts that did not change:

- The API is **single-language**: it sends `name` (Georgian) and `nameEn` for categories, and filter options with a Georgian `label` and an English `value` slug (`oak`, `sofa`), but product `specs`, descriptions and the filter group labels are Georgian only.
- The choice must survive a refresh, `<html lang>` must follow the language, and the page must not reload on change.

## Decision

| Concern | Choice |
| --- | --- |
| Library | `i18next` 26 + `react-i18next` 17, one namespace (`translation`). |
| Set-up | `src/lib/i18n/i18n.js` calls `i18n.use(initReactI18next).init(...)`; `main.jsx` imports it once (`import '@/lib/i18n'`). There is **no provider** in the tree. Components call `useTranslation()` from `react-i18next` and get `{ t, i18n }`; `i18n.language` is the current language. |
| Dictionaries | Unchanged: `src/locales/ka.json` and `src/locales/en.json`, bundled statically (`useSuspense: false`, nothing to wait for). Keys are meaning-based and nested (`cart.empty`, `orders.status.paid`), the **same 391 keys in both files** (checked on 23.10.2026). No text is left in the components. |
| Interpolation and plurals | The i18next defaults: `{{name}}` and `key_one` / `key_other`. The JSON files did not have to change when the library was introduced. Georgian does not distinguish the two forms in these strings, so both Georgian keys have the same text. |
| Fallback | `ka → en`, `en → ka`, default `ka`. A missing key renders as the key itself, so it is visible in review. `nsSeparator` is turned off because keys contain dots, not colons. |
| Persistence | `localStorage`, key `lang` (`ka` / `en`), default `ka`. The language is written when it is **changed** (`languageChanged` event), so a first-time visitor is not pinned to the default. |
| `<html lang>` | Set from `lib/i18n/config.js` (`applyLang`) at start-up and on every change; also the `<meta name="description">` follows the language. The inline script in `index.html` sets `<html lang>` from `localStorage.lang` before React starts. |
| Where the language is kept | **`localStorage`, not the URL.** A URL prefix (`/en/catalog`) is more correct for sharing and SEO, but it touches every link and route; for this project (no SEO need, bonus task) the simpler variant was chosen. |
| Formatting | Never by hand: `formatPriceI18n`, `formatDateI18n`, `formatRatingI18n` in `src/lib/i18n/format.js` wrap `Intl` with `ka-GE` / `en-US`. The checkout date helpers use the same locale map. |
| Switch | `LanguageSwitcher` in the header and in the mobile menu: a `role="group"` of two buttons with `aria-pressed`, no page reload. |

### What is translated and what is not

| What | Source | Result |
| --- | --- | --- |
| Buttons, menus, form labels, validation and error messages, `aria-label`s | our code | fully translated (`t()`) |
| Category name | API `name` + `nameEn` | `nameEn` in English, `name` in Georgian |
| Filter group title ("Material") | API `label`, Georgian only | translated on the front end through `filter.<key>`; an unknown group falls back to the API label |
| Filter option ("Oak") | API `label` (Georgian) + `value` (English slug) | Georgian: `label`; English: `value` with a capital first letter; brand names unchanged |
| Product title | API, already English | not translated |
| Spec **names** | API, Georgian keys | translated through a static map (`SPEC_I18N_KEYS` → `specs.*`); an unknown name is shown as it comes |
| Spec **values**, descriptions | API, Georgian | **not translated**: there is no English version to show |

## Alternatives considered

| Option | Why it was not chosen |
| --- | --- |
| **Keep the home-made Context** (ADR 0007) | It worked for two languages, but plurals, interpolation and update handling would have to be written and tested by hand, and the library is the standard answer to exactly this. |
| **URL-based language** (`/en/...`) | Better for shareable links and SEO, but every link and redirect must carry the language. Not needed here; can be added later on top of i18next. |
| **Lazy-loaded dictionaries / several namespaces** | Two small JSON files are cheaper to bundle than to load on demand. |
| **Machine-translate spec values on the front end** | Inaccurate and inconsistent with the API data. |

## Consequences

**Positive**

- Standard API (`t`, `useTranslation`, `i18n.changeLanguage`), plurals and interpolation for free, the same JSON files as before.
- Changing the language re-renders only the components that use the hook; no reload.
- Prices, dates and ratings follow the language through `Intl`.

**Negative / trade-offs**

- Two new dependencies (`i18next`, `react-i18next`); the single JS chunk is bigger (see [ARCHITECTURE.md → Performance notes](../../ARCHITECTURE.md#20-performance-notes)). Both dictionaries are loaded together.
- **The API is single-language, so the translation is partial.** The UI is fully translated, server data only in part, and spec values stay in Georgian in both languages. The right fix is on the API side: accept an `Accept-Language` header and return localized `name`, `description` and `specs`. Until then the limit is recorded here.
- The language is not in the URL: a shared link does not carry it.
- The inline script in `index.html` and `lib/i18n/config.js` both know the `lang` key; keep them in sync.
- Adding a third language needs a JSON file, an entry in `LANGUAGES`, `INTL_LOCALES` and the switcher's `LABELS`.
- Text length: English is usually shorter, Georgian sometimes longer, so buttons and the menu have to be checked in both languages at 360 px.

## Where this is implemented

- `src/lib/i18n/config.js`, `i18n.js`, `format.js`, `index.js` — settings, i18next set-up, formatters.
- `src/locales/ka.json`, `src/locales/en.json` — all UI strings.
- `src/components/LanguageSwitcher/` and `src/components/Header/Header.jsx` — the switch and its place.
- `src/lib/filterLabels.js`, `src/lib/specs.js` — filter titles and spec names.
- `index.html` — inline script (`<html lang>` before the first paint).
- `src/main.jsx` — `import '@/lib/i18n'`.
