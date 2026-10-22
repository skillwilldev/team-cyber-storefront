/**
 * Color theme: 'light' | 'dark' | 'system'.
 *
 * Three states (FE-009):
 *   - light:  always light
 *   - dark:   always dark
 *   - system: follows prefers-color-scheme live
 *
 * Source of truth is the `data-theme` attribute on <html> (the CSS reads it, see styles/theme.css).
 * The PREFERENCE is saved in localStorage under THEME_KEY ('light' | 'dark' | 'system').
 * The RESOLVED theme on <html> is always 'light' or 'dark'.
 *
 * initTheme() is called by the inline script in index.html (FOUC prevention)
 * AND in main.jsx (to set up listeners). After that this module handles
 * toggle, save, sync between tabs and exposes a store for React.
 */

export const THEME_KEY = 'theme';

const LIGHT = 'light';
const DARK = 'dark';
const SYSTEM = 'system';
const PREFERENCES = [LIGHT, DARK, SYSTEM];
const META_COLOR = { [LIGHT]: '#ffffff', [DARK]: '#111114' };

const listeners = new Set();

function readStored() {
  try {
    const value = window.localStorage.getItem(THEME_KEY);
    return PREFERENCES.includes(value) ? value : null;
  } catch {
    return null;
  }
}

function getSystemTheme() {
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? DARK : LIGHT;
}

/** Resolve the preference to an actual theme ('light' or 'dark'). */
function resolve(preference) {
  if (preference === DARK) return DARK;
  if (preference === LIGHT) return LIGHT;
  return getSystemTheme(); // 'system' or null
}

function apply(theme) {
  const root = document.documentElement;
  root.dataset.theme = theme;
  root.style.colorScheme = theme;
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', META_COLOR[theme]);
}

function notify() {
  listeners.forEach((listener) => listener());
}

function sync() {
  const preference = readStored() ?? SYSTEM;
  apply(resolve(preference));
  notify();
}

/** Applies the saved theme (or the OS one). Called by the inline script and main.jsx. */
export function initTheme() {
  const preference = readStored() ?? SYSTEM;
  apply(resolve(preference));
}

/** Returns the resolved theme ('light' | 'dark') — what is currently shown. */
export function getTheme() {
  return document.documentElement.dataset.theme === DARK ? DARK : LIGHT;
}

/** Returns the stored preference ('light' | 'dark' | 'system'). */
export function getPreference() {
  return readStored() ?? SYSTEM;
}

/** Applies and saves a preference. */
export function setTheme(preference) {
  const next = PREFERENCES.includes(preference) ? preference : SYSTEM;
  try {
    window.localStorage.setItem(THEME_KEY, next);
  } catch {
    /* not saved, still applied for this session */
  }
  apply(resolve(next));
  notify();
}

/** Cycles through light → dark → system. */
export function toggleTheme() {
  const current = getPreference();
  const order = [LIGHT, DARK, SYSTEM];
  const idx = order.indexOf(current);
  setTheme(order[(idx + 1) % order.length]);
}

// the other tab changed the theme / the OS theme changed (matters when preference is 'system')
const onStorage = (e) => {
  if (e.key === null || e.key === THEME_KEY) sync();
};
const onSystemChange = () => {
  // re-apply if the preference is 'system' (or unset)
  const pref = readStored() ?? SYSTEM;
  if (pref === SYSTEM) sync();
};

/** subscribe for useSyncExternalStore */
export function subscribe(listener) {
  listeners.add(listener);
  if (listeners.size === 1) {
    window.addEventListener('storage', onStorage);
    window.matchMedia?.('(prefers-color-scheme: dark)').addEventListener('change', onSystemChange);
  }
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) {
      window.removeEventListener('storage', onStorage);
      window.matchMedia?.('(prefers-color-scheme: dark)').removeEventListener('change', onSystemChange);
    }
  };
}
