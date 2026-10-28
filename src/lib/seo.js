/**
 * SEO helpers (no React).
 *
 * VITE_SITE_URL — public address of the deployed site, e.g. https://cyber-shop.netlify.app (no trailing slash).
 * It is needed for absolute URLs in <link rel="canonical">, Open Graph and structured data.
 * When it is not set, the address the page is opened from (window.location.origin) is used instead.
 */
export const SITE_NAME = 'Cyber';
export const SITE_URL = (import.meta.env.VITE_SITE_URL || '').trim().replace(/\/+$/, '');

/** '/product/iphone-15' → 'https://shop.example/product/iphone-15' (an already absolute URL is returned as is) */
export function absoluteUrl(pathOrUrl = '/') {
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  const origin = SITE_URL || window.location.origin;

  return `${origin}${pathOrUrl.startsWith('/') ? '' : '/'}${pathOrUrl}`;
}

/** Cut a long text to a snippet for <meta name="description"> (~155 characters, on a word boundary). */
export function toSnippet(text, max = 155) {
  const clean = String(text ?? '').replace(/\s+/g, ' ').trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max - 1);
  const lastSpace = cut.lastIndexOf(' ');

  return `${(lastSpace > 80 ? cut.slice(0, lastSpace) : cut).replace(/[\s,.;:—-]+$/, '')}…`;
}
