/**
 * Product pictures: smaller files for the browser.
 *
 * The API serves every picture in its original size (700×700, 50–77 KB), while a card shows it at
 * 104–160 px. On Slow 4G that is the main reason for a slow LCP and for the Lighthouse audits
 * "Properly size images", "Serve images in next-gen formats" and "Efficiently encode images".
 *
 * The fix without touching the API: the picture is requested through a free image CDN that resizes it and
 * converts it to WebP (wsrv.nl, built on Cloudflare; the result is cached on its edge servers).
 *
 *   VITE_IMAGE_PROXY=https://wsrv.nl   (default)  → https://wsrv.nl/?url=<original>&w=320&output=webp&q=75
 *   VITE_IMAGE_PROXY=                  (empty)    → the original URL is used as is (no CDN)
 *
 * If the CDN is unreachable, <ProductImage> automatically falls back to the original URL.
 */
const RAW = import.meta.env.VITE_IMAGE_PROXY;
const PROXY = (RAW === undefined ? 'https://wsrv.nl' : RAW).trim().replace(/\/+$/, '');
const QUALITY = 75;

/** Can this picture go through the CDN? (only public absolute http(s) URLs can) */
export function canOptimize(src) {
  if (!PROXY || typeof src !== 'string' || !/^https?:\/\//i.test(src)) return false;
  try {
    const { hostname } = new URL(src);

    return hostname !== 'localhost' && hostname !== '127.0.0.1' && !hostname.endsWith('.local');
  } catch {
    return false;
  }
}

/** One resized WebP version of the picture. `we` = never enlarge a small original. */
export function optimizedUrl(src, width) {
  return `${PROXY}/?url=${encodeURIComponent(src)}&w=${width}&output=webp&q=${QUALITY}&we`;
}

/**
 * { src, srcSet } for an <img>. `widths` are pixel widths of the versions to offer, e.g. [160, 320, 480];
 * the browser picks one by the `sizes` attribute and the screen density. Returns null when the picture can't go through the CDN.
 */
export function buildImageProps(src, widths) {
  if (!widths?.length || !canOptimize(src)) return null;
  const sorted = [...widths].sort((a, b) => a - b);

  return {
    src: optimizedUrl(src, sorted[Math.min(1, sorted.length - 1)]), // fallback for browsers without srcset support
    srcSet: sorted.map((w) => `${optimizedUrl(src, w)} ${w}w`).join(', '),
  };
}
