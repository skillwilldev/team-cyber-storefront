import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@features/auth/hooks/useAuth';
import { useCart } from '@features/cart/hooks/useCart';
import { useShop } from '@features/shop';
import { BurgerIcon, CartIcon, HeartIcon, SearchIcon, UserIcon } from '../icons/icons';
import Logo from '../Logo/Logo';
import UserMenu from '../UserMenu/UserMenu';
import './Header.css';

const NAV = [
  { label: 'Home', to: '/' },
  { label: 'About', to: '/about' },
  { label: 'Contact Us', to: '/contact' },
  { label: 'Blog', to: '/blog' },
];

const SEARCH_DELAY = 400;

function HeaderSearch({ urlQuery }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
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
    <form className="header__search" role="search" onSubmit={onSearch}>
      <label htmlFor="search">
        <SearchIcon size={24} />
        <span className="sr-only">Search</span>
      </label>
      <input
        type="text"
        id="search"
        placeholder="Search"
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
  // the badge is the server's `totalQty` from the shared ['cart'] cache (0 for guests / while loading)
  const { data: cart } = useCart();
  const cartCount = cart?.totalQty ?? 0;
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const urlQuery = searchParams.get('q') ?? '';
  const closeMenu = () => setMenuOpen(false);

  const handleLogout = async () => {
    closeMenu();
    await logout();
    navigate('/', { replace: true });
  };

  const isActive = (to) =>
    to === '/' ? !NAV.slice(1).some((item) => pathname.startsWith(item.to)) : pathname.startsWith(to);

  const profileTo = isAuthenticated ? '/account' : '/login';
  const profileLabel = 'Sign in';

  return (
    <header className="header">
      <div className="container">
        <div className="header__inner">
          <div className="header__left">
            <Link to="/" className="logo" aria-label="Cyber — home">
              <Logo />
            </Link>
            <HeaderSearch urlQuery={urlQuery} />
          </div>
          <div className="header__nav">
            <nav aria-label="Main">
              <ul>
                {NAV.map((item) => (
                  <li key={item.to} className={isActive(item.to) ? 'active' : undefined}>
                    <Link to={item.to}>{item.label}</Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
          <div className="header__btns">
            <Link
              to="/wishlist"
              className="header__cart"
              aria-label={wishlistCount > 0 ? `Wishlist (${wishlistCount})` : 'Wishlist'}
            >
              <HeartIcon size={32} />
              {wishlistCount > 0 && <span className="header__badge">{wishlistCount}</span>}
            </Link>
            <Link to="/cart" className="header__cart" aria-label={cartCount > 0 ? `Cart (${cartCount})` : 'Cart'}>
              <CartIcon size={32} />
              {cartCount > 0 && <span className="header__badge">{cartCount}</span>}
            </Link>

            <div className="header__profile-slot">
              {isLoading ? (
                <span className="loader" role="status">Loading</span>
              ) : isAuthenticated ? (
                <UserMenu />
              ) : (
                <Link to={profileTo} className="header__profile" aria-label={profileLabel} title={profileLabel}>
                  <UserIcon size={32} />
                </Link>
              )}
            </div>
          </div>
          <button
            type="button"
            className="header__burger"
            aria-label="Menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
          >
            <BurgerIcon size={32} />
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav className="header__menu" aria-label="Mobile">
          <div className="container">
            <ul>
              {NAV.map((item) => (
                <li key={item.to} className={isActive(item.to) ? 'active' : undefined}>
                  <Link to={item.to} onClick={closeMenu}>
                    {item.label}
                  </Link>
                </li>
              ))}
              <li className={pathname.startsWith('/cart') ? 'active' : undefined}>
                <Link to="/cart" onClick={closeMenu}>
                  {cartCount > 0 ? `Cart (${cartCount})` : 'Cart'}
                </Link>
              </li>
              <li
                className={!isLoading && pathname.startsWith(profileTo) ? 'active' : undefined}
                style={isLoading ? { visibility: 'hidden' } : undefined}
                aria-hidden={isLoading || undefined}
              >
                <Link to={profileTo} onClick={closeMenu} tabIndex={isLoading ? -1 : undefined}>
                  {isAuthenticated ? 'Account' : 'Sign in'}
                </Link>
              </li>
              {!isLoading && isAuthenticated && (
                <li>
                  <button type="button" onClick={handleLogout}>
                    Logout
                  </button>
                </li>
              )}
            </ul>
          </div>
        </nav>
      )}
    </header>
  );
}