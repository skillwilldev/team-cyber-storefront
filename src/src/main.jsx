import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { AuthProvider } from '@features/auth';
import { ShopProvider } from '@features/shop';
import { queryClient } from '@api/queryClient';
import App from './App';
import './styles/global.css';

/**
 * Provider order:
 *   QueryClientProvider — server state (catalog): cache, loading/error states, refetching
 *   AuthProvider        — client state: who is signed in (token + user)
 *   ShopProvider        — client state: cart + wishlist of the signed-in user (needs AuthProvider)
 *   BrowserRouter       — routing; the catalog state itself lives in the URL
 * ReactQueryDevtools (the flower button, bottom-right) exists only in `npm run dev`: shows the cache live.
 */
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ShopProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </ShopProvider>
      </AuthProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  </StrictMode>,
);
