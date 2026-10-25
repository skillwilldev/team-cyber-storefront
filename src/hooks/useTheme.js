import { useSyncExternalStore } from 'react';
import { getTheme, getPreference, setTheme, toggleTheme, subscribe } from '@/lib/theme';

/**
 * Current color theme + preference + setters.
 *   theme:      'light' | 'dark'   — the resolved (visible) theme
 *   preference: 'light' | 'dark' | 'system' — the stored choice
 * Stays in sync with localStorage and other tabs.
 */
export function useTheme() {
  const theme = useSyncExternalStore(subscribe, getTheme, () => 'light');
  const preference = useSyncExternalStore(subscribe, getPreference, () => 'system');
  return { theme, preference, isDark: theme === 'dark', setTheme, toggleTheme };
}
