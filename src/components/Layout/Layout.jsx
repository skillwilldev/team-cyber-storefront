import { Suspense, useEffect, useRef } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Footer from '../Footer/Footer';
import Header from '../Header/Header';
import Seo from '../Seo/Seo';
import { IconLoader } from '@shared/ui';

// private / technical screens: no value for a search engine (also closed in public/robots.txt)
const NOINDEX_PREFIXES = ['/login', '/register', '/forgot-password', '/account', '/cart', '/addresses', '/checkout', '/orders', '/wishlist', '/filters'];

export default function Layout() {
  const { pathname } = useLocation();
  const noindex = NOINDEX_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
  // Scroll to the top when the user goes to another page. NOT on the first render: the page is already at the top,
  // and scrollTo() makes the browser recalculate the layout at once ("Forced reflow" in Lighthouse) during startup.
  const lastPathname = useRef(pathname);
  useEffect(() => {
    if (lastPathname.current === pathname) return;
    lastPathname.current = pathname;
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <>
      {noindex && <Seo noindex />}
      <Header />
      <main style={{ flexGrow: 1 }}>
        {/* lazy pages: the header and footer stay on screen while a page chunk is loading */}
        <Suspense
          fallback={
            <div role="status" aria-live="polite" style={{ display: 'grid', placeItems: 'center', minHeight: '40vh' }}>
              <IconLoader size={32} />
            </div>
          }
        >
          <Outlet />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
