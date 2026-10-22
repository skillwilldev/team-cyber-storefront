import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { AuthProvider } from '@features/auth';
import { ShopProvider } from '@features/shop';
import { queryClient } from '@api/queryClient';
import { ToastProvider } from '@shared/ui';
import '@/lib/i18n'; // initialises i18next (react-i18next picks it up through initReactI18next)
import { initTheme } from '@/lib/theme';
import App from './App';
import './styles/global.css';

initTheme();

/**
 * Provider order:
 *   QueryClientProvider — server state (catalog): cache, loading/error states, refetching
 *   i18next             — no provider: `import '@/lib/i18n'` initialises it once, useTranslation() from react-i18next reads it (FE-008): ka/en, saved in localStorage
 *   ToastProvider       — short messages ("Added to cart")
 *   AuthProvider        — client state: who is signed in (token + user)
 *   ShopProvider        — client state: wishlist of the signed-in user (needs AuthProvider)
 *   The CART is server state: it lives in the TanStack Query cache under ['cart'] (see src/api/cartQueries.js)
 *   BrowserRouter       — routing; the catalog state itself lives in the URL
 * ReactQueryDevtools (the flower button, bottom-right) exists only in `npm run dev`: shows the cache live.
 */
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <AuthProvider>
          <ShopProvider>
            <BrowserRouter>
              <App />
            </BrowserRouter>
          </ShopProvider>
        </AuthProvider>
      </ToastProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  </StrictMode>,
);
