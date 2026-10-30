# Journal — Week 4

- **Period:** 29.10.2026 – 31.10.2026 (optimization sprint FE-010 and final documentation)
- **Project:** Cyber Shop (React front end)
- **Total time spent:** about 10 hours

## 1. Goals for the week

- FE-010: Optimization — performance, accessibility, bundle.
- Run Lighthouse on the production build (Mobile and Desktop), capture screenshots as evidence.
- Create `docs/performance.md` with before/after measurements per the §11 template.
- Write the missing ADRs: API image limitations (ADR 0010) and caching strategy (ADR 0011).
- Create `docs/final-report.md` with performance data in §6.
- Prepare the 10-minute presentation.
- Final documentation review and fill in any gaps.

## 2. What I did

| Topic | Status | Notes |
|---|---|---|
| Lighthouse measurements (Mobile) | Done | Performance 90, Accessibility 100, Best Practices 100, SEO 100 on the catalog page |
| Lighthouse measurements (Desktop) | Done | Performance 100, Accessibility 97, Best Practices 100, SEO 100 on the catalog page |
| Lighthouse screenshots | Done | Saved in `docs/performance/` — desktop and mobile catalog page |
| `docs/performance.md` | Done | Before/after tables, changes log, target assessment, conclusions |
| ADR 0010 — API image limitations | Done | Documents the 700×700 single-size limitation and the `wsrv.nl` CDN workaround |
| ADR 0011 — Caching strategy | Done | Documents staleTime per entity, invalidation rules, cache clearing on logout |
| `docs/final-report.md` | Done | §6 contains the performance optimization data with measurements |
| `journal/week-4.md` | Done | This file |
| Updated `docs/index.md` | Done | Added references to new ADRs (0010, 0011), performance.md, final-report.md, and week-4 journal |
| Presentation preparation | Done | `Cyber_Shop_Presentation.pptx` — 10-minute presentation covering the project |
| Practical project report | Done | Written report document submitted |

## 3. Problems and how I solved them

| Problem | Cause | Solution |
|---|---|---|
| Lighthouse scores were not measured before optimization | The optimization was done together with the feature work in week 3 | Documented the "before" state using build sizes only; noted honestly that no Lighthouse "before" numbers exist |
| Desktop Accessibility is 97, not 100 | Likely contrast issue with the rating badge in light theme (≈ 1.9:1 measured in week 3) | Documented as a known issue; the 97 is above the ≥ 90 target |
| Screenshots show `localhost:4173` not the deployment URL | The Lighthouse run was done on `vite preview` (production build served locally) | This is valid: the build is identical to what Vercel serves, and it avoids network variability from the deployment host |
| The assignment requires "each team member to have at least one optimization PR" | Solo project — all work is by one author | All PRs are documented honestly as being by one author |

## 4. What I learned

- How to properly measure performance: Incognito mode, Mobile emulation, median of 3 runs, production build only.
- The importance of documenting "before" numbers **before** starting optimization — without them, the improvement cannot be proven with scores.
- How to write ADRs for non-functional decisions (caching, image strategy) that are just as important as feature decisions.
- How cache invalidation and clearing on logout work together to prevent data leaks between users.

## 5. Decisions made this week

- [ADR 0010 — API image limitations](../docs/adr/0010-api-image-limitations.md): the API serves images at a single size; the front end uses `wsrv.nl` as a CDN with `srcset`; the proper fix would be server-side variants.
- [ADR 0011 — Caching strategy](../docs/adr/0011-caching-strategy.md): categories cached 10 min, products/addresses/orders 60 s, cart always fresh; private data cleared on logout.

## 6. Questions for the lecturer

- The Lighthouse measurements are taken on `vite preview` (localhost:4173), which serves the exact same production build as Vercel. Is this acceptable, or should we re-run on the Vercel deployment URL?
- Desktop Accessibility is 97 (Mobile is 100). The likely cause is the rating badge contrast in the light theme. Is this acceptable given the ≥ 90 target?

## 7. Plan for next week

- [x] This was the final sprint. No new features are planned (code freeze per FE-010 rules).
- [ ] Fix the one lint error in `src/main.jsx`
- [ ] Fix the rating badge contrast issue (≈ 1.9:1 → ≥ 4.5:1) for full Desktop Accessibility 100
- [ ] Remove the sitemap reference from `robots.txt` or generate `sitemap.xml`

## 8. Self-assessment

- What went well: the documentation is thorough and honest — gaps (no "before" Lighthouse, all work by one author) are stated openly rather than hidden. All three mandatory performance targets are met (Performance ≥ 85, Accessibility ≥ 90, bundle < 300 KB).
- What was difficult: creating comprehensive before/after performance documentation when the "before" Lighthouse measurement was missed.
- What I would do differently: run Lighthouse **before** starting any optimization work, and make one change at a time with a measurement after each.

