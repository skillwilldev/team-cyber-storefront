# საბოლოო ანგარიში / Final Report

## 1. პროექტის მიმოხილვა / Project Overview

**Cyber Shop** — ელექტრონიკის ონლაინ მაღაზიის ფრონტენდი, აშენებული React 19, React Router 7, TanStack Query 5, React Hook Form + Zod და Vite 8-ზე. პროექტი შეიქმნა 4 კვირის განმავლობაში (05.10.2026 – 31.10.2026) და ფარავს ონლაინ მაღაზიის სრულ ციკლს.

**Cyber Shop** is a full-featured e-commerce front end built with React 19, React Router 7, TanStack Query 5, React Hook Form + Zod, and Vite 8. Developed over 4 weeks (05.10.2026 – 31.10.2026), it covers the complete online store flow.

### Deployment

- **URL:** https://cyber-storefront-vert.vercel.app/
- **API:** https://shop-api-kbe6.onrender.com/api
- **Repository:** GitHub (team-cyber-storefront)

---

## 2. გუნდი / Team

| წევრი / Member | როლი / Role |
|---|---|
| მელიკ პაპიკიანი / Melik Papikyan | Full-stack front-end developer (sole contributor) |

---

## 3. ტექნოლოგიური სტეკი / Tech Stack

| სფერო / Area | ტექნოლოგია / Technology | რატომ / Why |
|---|---|---|
| UI | React 19 | ფუნქციური კომპონენტები და ჰუკები; დიდი ეკოსისტემა |
| Build | Vite 8 | სწრაფი dev სერვერი და build; CRA აღარ მხარდაჭერილია |
| Optimization | React Compiler | ავტომატური მემოიზაცია |
| Routing | React Router 7 | Layout routes, protected routes, URL-based state |
| Server State | TanStack Query 5 | Cache, deduplication, abort, loading/error states |
| Forms | React Hook Form 7 + Zod 3 | Uncontrolled fields (fewer re-renders) + schema validation |
| Styles | Plain CSS + CSS Variables | Custom design; zero runtime cost |
| i18n | i18next + react-i18next | Georgian + English, JSON dictionaries, `Intl` formatting |

See [ADR 0001](./adr/0001-frontend-stack.md) for the full rationale.

---

## 4. რეალიზებული ფუნქციონალი / Implemented Features

| ფუნქცია / Feature | სტატუსი / Status |
|---|---|
| კატალოგი ფილტრებით, სორტირებით, ძებნით, პაგინაციით | ✅ |
| პროდუქტის გვერდი (გალერეა, სპეციფიკაციები, rating) | ✅ |
| რეგისტრაცია / ავტორიზაცია / პაროლის აღდგენა | ✅ |
| პროფილის რედაქტირება | ✅ |
| სერვერული კალათა (quantity stepper, stock check) | ✅ |
| მისამართები (CRUD, default) | ✅ |
| 3-საფეხურიანი Checkout + კოდით დადასტურება | ✅ |
| შეკვეთების ისტორია | ✅ |
| ქართული / ინგლისური ენა (FE-008) | ✅ |
| თემა: light / dark / system, FOUC prevention (FE-009) | ✅ |
| Code splitting, early requests, image CDN, SEO (FE-010) | ✅ |

---

## 5. არქიტექტურა / Architecture

The project follows a **feature-based folder structure**:

```
src/
├─ features/         Feature modules (auth, cart, addresses, checkout, shop)
│  └─ <feature>/
│     ├─ components/  Feature-specific components
│     ├─ hooks/       Feature-specific hooks
│     ├─ pages/       Feature pages
│     └─ lib/         Pure helpers
├─ pages/            Shared pages (Catalog, Product, Filters, Stub)
├─ components/       Shared components (Header, Footer, Layout, Seo, ProductCard…)
├─ shared/           API client, validators, UI kit
├─ api/              Query client, query keys, request functions and hooks
├─ lib/              Pure helpers (catalog, image, seo, i18n, theme)
├─ locales/          Translation JSON files (ka.json, en.json)
├─ hooks/            Shared hooks
└─ styles/           CSS variables, theme tokens, fonts, reset
```

### State Management

| State | Location |
|---|---|
| Server data (catalog, cart, addresses, orders) | TanStack Query cache |
| Auth (current user) | AuthContext + localStorage token |
| Catalog filters, sort, page, search | URL query string |
| Checkout progress | URL parameters |
| Card payment data | Form only (never stored) |
| Theme preference | `data-theme` on `<html>` + localStorage |
| Language | i18next + localStorage + `<html lang>` |

Full architecture details: [ARCHITECTURE.md](../ARCHITECTURE.md)

---

## 6. ოპტიმიზაცია (FE-010) / Optimization

### 6.1 მიზნები და შედეგები / Targets and Results

| მეტრიკა / Metric | მიზანი / Target | შედეგი / Result | სტატუსი / Status |
|---|---|---|---|
| Lighthouse **Performance** (Mobile) | ≥ 85 | **90** | ✅ |
| Lighthouse **Performance** (Desktop) | ≥ 85 | **100** | ✅ |
| Lighthouse **Accessibility** (Mobile) | ≥ 90 | **100** | ✅ |
| Lighthouse **Accessibility** (Desktop) | ≥ 90 | **97** | ✅ |
| JS ბანდლი (gzip) | < 300 KB | **≈ 156 KB** | ✅ |
| Lighthouse **SEO** (Mobile) | — | **100** | ✅ |
| Lighthouse **SEO** (Desktop) | — | **100** | ✅ |
| Lighthouse **Best Practices** | — | **100** | ✅ |

**ყველა სავალდებულო მიზანი მიღწეულია / All mandatory targets are met.**

### 6.2 ბანდლის ოპტიმიზაცია / Bundle Optimization

| Metric | Before (25.10) | After (31.10) | ცვლილება / Change |
|---|---|---|---|
| JS (first screen, raw) | ≈ 682 kB | ≈ 494 kB | **−27 %** |
| JS (first screen, gzip) | ≈ 207 kB | ≈ 156 kB | **−51 kB** |
| JS chunks | 1 | 32 | Route-level splitting |
| Modules | 282 | 274 | — |
| Vite size warning | ✅ triggered | ❌ none | ✅ |

### 6.3 რა გავაკეთეთ / What We Did

| # | ოპტიმიზაცია / Optimization | ეფექტი / Effect |
|---|---|---|
| 1 | **Route-level code splitting** — 15 pages as `React.lazy` chunks | −27 % first-screen JS |
| 2 | **Early first-screen requests** — inline script in `index.html` fetches data before React is ready | Data arrives sooner |
| 3 | **App shell** — static header in `index.html` | Instant first paint |
| 4 | **Image CDN** (`wsrv.nl`) — resized WebP with `srcset` and fallback | Smaller images on cards |
| 5 | **Main CSS inlined** into `index.html` | One less render-blocking request |
| 6 | **Font optimization** — `woff2`, `font-display: swap`, `preload`, `unicode-range` | No FOIT |
| 7 | **Image attributes** — `width`/`height`, `loading="lazy"` below fold, LCP images `eager` | CLS 0.00 (Mobile) |
| 8 | **Caching strategy** — TanStack Query `staleTime`, private data cleared on logout | Instant "back" navigation |
| 9 | **SEO** — per-page `<title>`, description, canonical, Open Graph, schema.org | SEO 100 |

### 6.4 Lighthouse Screenshots

📸 Evidence in [`docs/performance/`](./performance/):

- [Desktop — catalog (Perf 100, A11y 97, BP 100, SEO 100)](./performance/lighthouse-desktop-catalog.png)
- [Mobile — catalog (Perf 90, A11y 100, BP 100, SEO 100)](./performance/lighthouse-mobile-catalog.png)

### 6.5 ხელმისაწვდომობა / Accessibility

| Area | Implementation |
|---|---|
| Semantic HTML | `<header>`, `<main>`, `<nav>`, `<footer>`, `<section>`, landmarks |
| ARIA | `aria-label` on icon buttons (🛒 ❤️ 🔍 ✕), `aria-pressed` on language toggle, `role="group"` |
| Images | `alt` on all `<img>`, `alt=""` on decorative images |
| Forms | All inputs have associated labels |
| `<html lang>` | Set to `ka` or `en` based on selected language |
| Heading hierarchy | One `<h1>` per page, correct nesting |
| Keyboard navigation | All interactive elements focusable, visible focus styles |
| Color contrast | WCAG AA (≥ 4.5:1) for main text in both themes |
| `prefers-reduced-motion` | Animations respect the OS setting |

### 6.6 ADRs for Optimization

- [ADR 0010 — API image limitations](./adr/0010-api-image-limitations.md): the API serves images at a single 700×700 size; the front end uses `wsrv.nl` as a CDN with `srcset`
- [ADR 0011 — Caching strategy](./adr/0011-caching-strategy.md): what is cached, for how long, and when it is cleared

---

## 7. სამუშაო პროცესი / Work Process

### 7.1 Sprint Timeline

| Sprint | Period | Focus |
|---|---|---|
| Week 1 (05.10–11.10) | ≈ 25h | Project setup, catalog, product page, auth, cart (FE-001 – FE-005) |
| Week 2 (12.10–18.10) | ≈ 30h | Checkout, addresses, orders (FE-006 – FE-007) |
| Week 3 (19.10–28.10) | ≈ 20h | i18n (FE-008), theme (FE-009), performance & SEO |
| Week 4 (29.10–31.10) | ≈ 10h | Optimization measurements, documentation, presentation (FE-010) |
| **Total** | **≈ 85h** | |

### 7.2 Documentation

| Document | Description |
|---|---|
| [README.md](../README.md) | Install, run, build, deploy, features, troubleshooting |
| [ARCHITECTURE.md](../ARCHITECTURE.md) | Full architecture: folder tree, data flow, API reference, 25 sections |
| [docs/performance.md](./performance.md) | Performance report with before/after measurements |
| [docs/adr/](./adr/) | 11 Architecture Decision Records (0001–0011) |
| [journal/](../journal/) | 4 weekly development journals |

---

## 8. გამოწვევები და გადაწყვეტები / Challenges and Solutions

| გამოწვევა / Challenge | გადაწყვეტა / Solution |
|---|---|
| API cold starts (~50s on first request) | "Server waking up" UX message; early inline requests |
| Single-language API (Georgian only) | Front-end translation of UI + category names + filter labels; spec values stay Georgian (ADR 0008) |
| API images at 700×700 only | Third-party image CDN with `srcset` + fallback (ADR 0010) |
| No "before" Lighthouse scores | Documented honestly; used build sizes for before/after comparison |
| FOUC on theme change | Inline `<script>` in `<head>` applies theme before first paint (ADR 0006) |
| Single JS bundle > 680 kB | Route-level code splitting → 32 chunks, −27% first-screen JS |

---

## 9. შეზღუდვები / Known Limitations

- **No automated tests** (0 test files)
- **No `sitemap.xml`** — `robots.txt` references it but the generator script doesn't exist
- **Wishlist page** is a placeholder (data stored locally; no API support)
- **SEO tags are JavaScript-only** — crawlers without JS see only the defaults from `index.html`
- **Both locale files** are loaded statically (loading only the active language would reduce the bundle)
- **1 lint error** in `src/main.jsx` — does not affect the build

---

## 10. პროექტი ციფრებში / Project in Numbers

| Metric | Value |
|---|---|
| Development time | ≈ 85 hours over 4 weeks |
| Files in `src/` | 176 (115 JS/JSX, 58 CSS, 2 JSON, 1 font) |
| Lines of code | 7,831 JS/JSX + 5,283 CSS + 902 JSON = **14,016** |
| Pages | 17 page components, 21 routes (15 lazy) |
| Components | 21 shop + 7 UI-kit = **28** |
| Feature modules | 5 (auth, cart, addresses, checkout, shop) |
| API paths used | 21 |
| Translation keys | 393 per language |
| Dependencies | 10 runtime + 12 development |
| ADRs | 11 |
| Journal files | 4 |
| Production build | 274 modules, 32 JS chunks |
| First-screen JS (gzip) | **≈ 156 kB** (target < 300 kB ✅) |
| Lighthouse Performance (Mobile) | **90** (target ≥ 85 ✅) |
| Lighthouse Accessibility (Mobile) | **100** (target ≥ 90 ✅) |
| Lighthouse SEO | **100** |

---

## 11. დასკვნა / Conclusion

Cyber Shop პროექტი წარმატებით აშენდა 4 კვირის განმავლობაში, ყველა სავალდებულო მოთხოვნა შესრულებულია:

- ✅ Performance ≥ 85 (Mobile: 90, Desktop: 100)
- ✅ Accessibility ≥ 90 (Mobile: 100, Desktop: 97)
- ✅ JS bundle < 300 KB gzip (≈ 156 KB)
- ✅ Full documentation with ADRs, journals, and performance report
- ✅ Production deployment on Vercel

The Cyber Shop project was successfully built over 4 weeks. All mandatory performance targets are met, the documentation is comprehensive (README, ARCHITECTURE.md, 11 ADRs, 4 journal files, performance report), and the application is deployed to production.

