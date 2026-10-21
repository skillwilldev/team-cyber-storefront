import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@features/auth/hooks/useAuth';
import { useCart } from '@features/cart/hooks/useCart';
import { useShop } from '@features/shop';
import { useTranslation } from '@/lib/i18n';
import { BagIcon, CloseIcon, HeartIcon, MenuIcon, SearchIcon, UserIcon } from './HeaderIcons';
import LanguageSwitcher from '../LanguageSwitcher/LanguageSwitcher';
import Logo from '../Logo/Logo';
import ThemeToggle from '../ThemeToggle/ThemeToggle';
import UserMenu from '../UserMenu/UserMenu';
import './Header.css';

const SEARCH_DELAY = 400;

function HeaderSearch({ urlQuery, id = 'search', className = '' }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { t } = useTranslation();
  const [query, setQuery] = useState(urlQuery);
  const [syncedUrlQuery, setSyncedUrlQuery] = useState(urlQuery);
  const timer = useRef(null);

  if (syncedUrlQuery !== urlQuery) {
    setSyncedUrlQuery(urlQuery);
    setQuery(urlQuery);
  }

  useEffect(() => () => clearTimeout(timer.current), []);

  const runSearch = (value, { force = false } = {}) => {
    const q = value.trim();
    const sp = new URLSearchParams(window.location.search);
    if (!force && (sp.get('q') ?? '') === q) return;
    if (q) sp.set('q', q);
    else sp.delete('q');
    sp.delete('page');
    const search = sp.toString();
    navigate({ pathname: '/', search: search ? `?${search}` : '' }, { replace: pathname === '/' && !force });
  };

  const onChange = (e) => {
    const { value } = e.target;
    setQuery(value);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => runSearch(value), SEARCH_DELAY);
  };

  const onSearch = (e) => {
    e.preventDefault();
    clearTimeout(timer.current);
    runSearch(query, { force: true });
  };

  return (
    <form className={`header__search ${className}`.trim()} role="search" onSubmit={onSearch}>
      <label htmlFor={id}>
        <SearchIcon />
        <span className="sr-only">{t('common.search')}</span>
      </label>
      <input
        type="text"
        id={id}
        placeholder={t('catalog.searchPlaceholder')}
        value={query}
        onChange={onChange}
      />
    </form>
  );
}

export default function Header() {
  const { pathname } = useLocation();
  const [searchParams] = useSearchParams();
  const { isAuthenticated, logout, isLoading } = useAuth();
  const { wishlistCount } = useShop();
  const { t } = useTranslation();
  // the badge is the server's `totalQty` from the shared ['cart'] cache (0 for guests / while loading)
  const { data: cart } = useCart();
  const cartCount = cart?.totalQty ?? 0;
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const urlQuery = searchParams.get('q') ?? '';
  const closeMenu = () => setMenuOpen(false);

  useEffect(() => {
    if (!menuOpen) return undefined;
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [menuOpen]);

  const NAV = [
    { label: t('nav.home'), to: '/' },
    { label: t('nav.about'), to: '/about' },
    { label: t('nav.contactUs'), to: '/contact' },
    { label: t('nav.blog'), to: '/blog' },
  ];

  const handleLogout = async () => {
    closeMenu();
    await logout();
    navigate('/', { replace: true });
  };

  const isActive = (to) =>
    to === '/' ? !NAV.slice(1).some((item) => pathname.startsWith(item.to)) : pathname.startsWith(to);

  const profileTo = isAuthenticated ? '/account' : '/login';

  const iconLabel = (key, count, fallbackKey) => (count > 0 ? t(key, { count }) : t(fallbackKey));

  return (
    <header className="header">
      <div className="container">
        <div className="header__inner">
          <Link to="/" className="header__logo" aria-label={t('header.home')}>
            <Logo />
          </Link>

          <HeaderSearch urlQuery={urlQuery} className="header__search--desktop" />

          <nav className="header__nav" aria-label={t('header.navMain')}>
            <ul>
              {NAV.map((item) => (
                <li key={item.to}>
                  <Link to={item.to} aria-current={isActive(item.to) ? 'page' : undefined}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="header__btns">
            <Link
              to="/wishlist"
              className="header__icon-btn"
              aria-label={iconLabel('cart.wishlistCount', wishlistCount, 'wishlist.title')}
            >
              <HeartIcon />
              {wishlistCount > 0 && <span className="header__badge">{wishlistCount}</span>}
            </Link>
            <Link
              to="/cart"
              className="header__icon-btn"
              aria-label={iconLabel('cart.cartCount', cartCount, 'cart.cart')}
            >
              <BagIcon />
              {cartCount > 0 && <span className="header__badge">{cartCount}</span>}
            </Link>

            <div className="header__profile-slot">
              {isLoading ? (
                <span className="skeleton header__avatar-skeleton" role="status" aria-label={t('common.loading')} />
              ) : isAuthenticated ? (
                <UserMenu />
              ) : (
                <Link to={profileTo} className="header__icon-btn" aria-label={t('header.signIn')} title={t('header.signIn')}>
                  <UserIcon />
                </Link>
              )}
            </div>

            <span className="header__divider" aria-hidden="true" />

            <LanguageSwitcher />
            <ThemeToggle />
          </div>

          <button
            type="button"
            className="header__burger"
            aria-label={menuOpen ? t('header.close') : t('header.menu')}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            onClick={() => setMenuOpen((v) => !v)}
          >
            {menuOpen ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav className="header__menu" id="mobile-menu" aria-label={t('header.navMobile')}>
          <div className="container">
            <HeaderSearch urlQuery={urlQuery} id="search-mobile" className="header__search--mobile" />

            <ul>
              {NAV.map((item) => (
                <li key={item.to}>
                  <Link to={item.to} onClick={closeMenu} aria-current={isActive(item.to) ? 'page' : undefined}>
                    {item.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link to="/wishlist" onClick={closeMenu} aria-current={pathname.startsWith('/wishlist') ? 'page' : undefined}>
                  {iconLabel('cart.wishlistCount', wishlistCount, 'wishlist.title')}
                </Link>
              </li>
              <li>
                <Link to="/cart" onClick={closeMenu} aria-current={pathname.startsWith('/cart') ? 'page' : undefined}>
                  {iconLabel('cart.cartCount', cartCount, 'cart.cart')}
                </Link>
              </li>
              {!isLoading && (
                <li>
                  <Link
                    to={profileTo}
                    onClick={closeMenu}
                    aria-current={pathname.startsWith(profileTo) ? 'page' : undefined}
                  >
                    {isAuthenticated ? t('userMenu.account') : t('header.signIn')}
                  </Link>
                </li>
              )}
              {!isLoading && isAuthenticated && (
                <>
                  <li>
                    <Link to="/orders" onClick={closeMenu} aria-current={pathname.startsWith('/orders') ? 'page' : undefined}>
                      {t('userMenu.orders')}
                    </Link>
                  </li>
                  <li>
                    <Link to="/addresses" onClick={closeMenu} aria-current={pathname.startsWith('/addresses') ? 'page' : undefined}>
                      {t('userMenu.address')}
                    </Link>
                  </li>
                  <li>
                    <button type="button" onClick={handleLogout}>
                      {t('userMenu.logout')}
                    </button>
                  </li>
                </>
              )}
            </ul>

            <div className="header__menu-tools">
              <ThemeToggle withLabel />
              <LanguageSwitcher />
            </div>
          </div>
        </nav>
      )}
    </header>
  );
}
