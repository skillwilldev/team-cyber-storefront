import { useSyncExternalStore } from 'react';
import { getTheme, setTheme, subscribe, toggleTheme } from '@/lib/theme';

/** Current color theme ('light' | 'dark') + setters. Stays in sync with localStorage and other tabs. */
export function useTheme() {
  const theme = useSyncExternalStore(subscribe, getTheme, () => 'light');
  return { theme, isDark: theme === 'dark', setTheme, toggleTheme };
}
