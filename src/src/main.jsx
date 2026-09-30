import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { AuthProvider } from '@features/auth';
import { queryClient } from '@api/queryClient';
import App from './App';
import './styles/global.css';

/**
 * Provider order:
 *   QueryClientProvider — server state (catalog): cache, loading/error states, refetching
 *   AuthProvider        — client state: who is signed in (token + user)
 *   BrowserRouter       — routing; the catalog state itself lives in the URL
 * ReactQueryDevtools (the flower button, bottom-right) exists only in `npm run dev`: shows the cache live.
 */
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </AuthProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  </StrictMode>,
);
