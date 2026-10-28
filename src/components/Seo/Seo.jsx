import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { absoluteUrl } from '../../lib/seo';

/**
 * Per-page SEO tags for a single-page app.
 *
 * <title> is still written with a plain `<title>` element in each page (React 19 moves it to <head>).
 * Everything else — description, canonical, robots, Open Graph, Twitter and JSON-LD — is set here.
 *
 * Why not simply render <meta> elements? index.html already contains default <meta name="description"> and
 * Open Graph tags (they are what crawlers and link previews see before JavaScript runs). Rendering more <meta>
 * elements would DUPLICATE them. So this component updates the existing tags in place and, when the page
 * is left, puts the defaults back.
 *
 * Every prop is optional: only what is passed is changed.
 *   description  text for <meta name="description"> and og:description
 *   canonical    path ('/?category=tablets') or absolute URL → <link rel="canonical"> and og:url
 *   noindex      true → <meta name="robots" content="noindex, follow">
 *   image        absolute URL of a picture for link previews (og:image)
 *   ogTitle      text for og:title / twitter:title (the page <title> without the brand is a good value)
 *   type         og:type ('website' by default, 'product' for a product page)
 *   jsonLd       object or array of objects — structured data (schema.org)
 */

const initialValues = new Map(); // remembers what index.html had, so it can be restored

function metaSelector(attr, key) {
  return `meta[${attr}="${key}"]`;
}

function setMeta(attr, key, content) {
  const selector = metaSelector(attr, key);
  let el = document.head.querySelector(selector);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  if (!initialValues.has(selector)) initialValues.set(selector, el.getAttribute('content'));
  el.setAttribute('content', content);
}

function resetMeta(attr, key) {
  const selector = metaSelector(attr, key);
  const el = document.head.querySelector(selector);
  if (!el) return;
  const initial = initialValues.get(selector);
  if (initial === null || initial === undefined) el.remove(); // the tag did not exist in index.html
  else el.setAttribute('content', initial);
}

export default function Seo({ description, canonical, noindex = false, image, ogTitle, type, jsonLd }) {
  const { t } = useTranslation();
  const jsonLdText = jsonLd ? JSON.stringify(jsonLd) : '';

  useEffect(() => {
    const touched = []; // [attr, key] of every meta changed by this page
    const meta = (attr, key, content) => {
      if (!content) return;
      setMeta(attr, key, content);
      touched.push([attr, key]);
    };

    meta('name', 'description', description);
    meta('property', 'og:description', description);
    meta('name', 'twitter:description', description);
    meta('property', 'og:title', ogTitle);
    meta('name', 'twitter:title', ogTitle);
    meta('property', 'og:type', type);
    meta('property', 'og:image', image);
    meta('name', 'twitter:image', image);
    if (noindex) meta('name', 'robots', 'noindex, follow');

    let link = null;
    if (canonical) {
      const href = absoluteUrl(canonical);
      link = document.createElement('link');
      link.rel = 'canonical';
      link.href = href;
      document.head.appendChild(link);
      meta('property', 'og:url', href);
    }

    let script = null;
    if (jsonLdText) {
      script = document.createElement('script');
      script.type = 'application/ld+json';
      script.textContent = jsonLdText; // textContent: the JSON is never parsed as HTML
      document.head.appendChild(script);
    }

    return () => {
      touched.forEach(([attr, key]) => resetMeta(attr, key));
      // the description follows the language (see lib/i18n/i18n.js), so the default is read at this moment
      const descriptionTag = document.head.querySelector('meta[name="description"]');
      if (descriptionTag) {
        const text = t('meta.description');
        descriptionTag.setAttribute('content', text);
        document.head.querySelector('meta[property="og:description"]')?.setAttribute('content', text);
        document.head.querySelector('meta[name="twitter:description"]')?.setAttribute('content', text);
      }
      link?.remove();
      script?.remove();
    };
  }, [description, canonical, noindex, image, ogTitle, type, jsonLdText, t]);

  return null;
}
