/**
 * Color theme: 'light' | 'dark'.
 *
 * Source of truth is the `data-theme` attribute on <html> (the CSS reads it, see styles/theme.css).
 * The choice is saved in localStorage under THEME_KEY; until the user picks something,
 * the OS preference (prefers-color-scheme) is used and follows the system changes.
 *
 * initTheme() is called once in main.jsx before React renders; after that this module handles
 * toggle, save, sync between tabs and exposes a store for React.
 */

export const THEME_KEY = 'theme';

const LIGHT = 'light';
const DARK = 'dark';
const META_COLOR = { [LIGHT]: '#ffffff', [DARK]: '#111114' };

const listeners = new Set();

function readStored() {
  try {
    const value = window.localStorage.getItem(THEME_KEY);
    return value === DARK || value === LIGHT ? value : null;
  } catch {
    // storage blocked (private mode, disabled cookies) — just live without saving
    return null;
  }
}

function getSystemTheme() {
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? DARK : LIGHT;
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
  apply(readStored() ?? getSystemTheme());
  notify();
}

/** Applies the saved theme (or the OS one). Call once at startup, before the first render. */
export function initTheme() {
  apply(readStored() ?? getSystemTheme());
}

export function getTheme() {
  return document.documentElement.dataset.theme === DARK ? DARK : LIGHT;
}

/** Applies and saves the theme. A short class turns on smooth color transitions for this one switch only. */
export function setTheme(theme) {
  const next = theme === DARK ? DARK : LIGHT;
  try {
    window.localStorage.setItem(THEME_KEY, next);
  } catch {
    /* not saved, still applied for this session */
  }
  const root = document.documentElement;
  root.classList.add('theme-switching');
  apply(next);
  notify();
  window.setTimeout(() => root.classList.remove('theme-switching'), 300);
}

export function toggleTheme() {
  setTheme(getTheme() === DARK ? LIGHT : DARK);
}

// the other tab changed the theme / the OS theme changed (matters only while nothing is saved)
const onStorage = (e) => {
  if (e.key === null || e.key === THEME_KEY) sync();
};
const onSystemChange = () => {
  if (readStored() === null) sync();
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
