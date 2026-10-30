# ADR 0010: API Image Limitations — Product Pictures at a Single Size

- **Status:** Accepted
- **Date:** 2026-10-31
- **Ticket:** FE-010

## Context

The REST API (`https://shop-api-kbe6.onrender.com/api`) returns product images at a **single resolution**: 700 × 700 px JPEG, typically 50–77 kB per image. There is no query parameter to request a different size (e.g. `?w=300`), no `srcset`-compatible set of variants, and no built-in image CDN.

A product card in the catalog displays images at 104–160 px (depending on screen width). This means **each card downloads 4–7× more data than needed**, which directly hurts LCP on mobile connections.

The front end cannot change the API.

## Decision

Use a **third-party image CDN** ([wsrv.nl](https://wsrv.nl)) as a proxy to resize and convert product images on the fly:

1. `src/lib/image.js` builds a `srcset` with widths 160, 240, 320, 480 px for cards and 320–700 px for the product page gallery.
2. `src/components/ProductImage/ProductImage.jsx` renders `<img srcset="..." sizes="...">` pointing to `wsrv.nl` URLs with `output=webp&q=75` parameters.
3. If the CDN fails, the component falls back to the **original API URL**. If that also fails, a placeholder SVG is shown.
4. The CDN can be switched off entirely by setting `VITE_IMAGE_PROXY=` (empty) in `.env`.

## Alternatives considered

| Option | Why it was not chosen |
|---|---|
| Use the original 700×700 images everywhere | Wastes bandwidth on every card (4–7× oversized); directly hurts LCP |
| Resize images at build time | Product images are dynamic (come from the API), not static assets; cannot be processed at build time |
| Ask the API team to add image variants | Out of scope — the API is a learning resource and cannot be modified |
| Self-hosted image proxy (e.g. `sharp` on a server) | Requires server infrastructure; the project is front-end only |

## Consequences

**Positive**

- Product cards receive images at the correct size (160–480 px WebP instead of 700 px JPEG), dramatically reducing transfer size per card.
- `srcset` + `sizes` let the browser pick the best variant for the screen.
- The fallback chain (CDN → original → placeholder) means the feature is resilient to CDN downtime.

**Negative / to remember**

- `wsrv.nl` is a free third-party service with no SLA. If it becomes slow or unreachable, images fall back to the full-size originals (the layout does not break).
- The widths in `lib/image.js` must stay in sync with the inline script in `index.html` and the `ProductCard` component — comments in all three files note this.
- The **correct solution** would be for the API to support image variants (e.g. `/products/:slug/image?w=300`) or to integrate an image CDN server-side (e.g. Cloudinary, imgix, or a self-hosted solution). This should be requested when the API allows modifications.

## Where implemented

- `src/lib/image.js` — `buildSrcSet()`, `buildSrc()`
- `src/components/ProductImage/ProductImage.jsx` — `<img>` with `srcset`, `sizes`, and fallback `onError`
- `index.html` — early LCP preload with `imagesrcset` matching the CDN widths
- `.env.example` — `VITE_IMAGE_PROXY`

