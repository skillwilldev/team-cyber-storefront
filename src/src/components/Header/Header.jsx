import { useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@features/auth/hooks/useAuth';
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

/** Search box. Rendered with key={q from URL}, so the text follows the URL (logo click, "Reset filters"...). */
function HeaderSearch({ initialQuery }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState(initialQuery);

  const onSearch = (e) => {
    e.preventDefault();
    const q = query.trim();
    const sp = new URLSearchParams();
    const category = searchParams.get('category');
    if (category) sp.set('category', category); // search inside the current category
    if (q) sp.set('q', q);
    const search = sp.toString();
    navigate({ pathname: '/', search: search ? `?${search}` : '' });
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
        onChange={(e) => setQuery(e.target.value)}
      />
    </form>
  );
}

export default function Header() {
  const { pathname } = useLocation();
  const [searchParams] = useSearchParams();
  const { isAuthenticated, logout } = useAuth();
  const { wishlistCount, cartCount } = useShop();
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
            <HeaderSearch key={urlQuery} initialQuery={urlQuery} />
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
            <button
              type="button"
              aria-label={wishlistCount > 0 ? `Wishlist (${wishlistCount})` : 'Wishlist'}
            >
              <HeartIcon size={32} />
              {wishlistCount > 0 && <span className="header__badge">{wishlistCount}</span>}
            </button>
            <button type="button" aria-label={cartCount > 0 ? `Cart (${cartCount})` : 'Cart'}>
              <CartIcon size={32} />
              {cartCount > 0 && <span className="header__badge">{cartCount}</span>}
            </button>
            {isAuthenticated ? (
              <UserMenu />
            ) : (
              <Link to={profileTo} className="header__profile" aria-label={profileLabel} title={profileLabel}>
                <UserIcon size={32} />
              </Link>
            )}
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
              <li className={pathname.startsWith(profileTo) ? 'active' : undefined}>
                <Link to={profileTo} onClick={closeMenu}>
                  {isAuthenticated ? 'Account' : 'Sign in'}
                </Link>
              </li>
              {isAuthenticated && (
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
