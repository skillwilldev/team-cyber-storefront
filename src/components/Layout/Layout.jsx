import { Suspense, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Footer from '../Footer/Footer';
import Header from '../Header/Header';
import { IconLoader } from '@shared/ui';

export default function Layout() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <>
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
