import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@features/auth/hooks/useAuth';
import './UserMenu.css';

/** Avatar circle with the first letter of the name (like Gmail) + dropdown with Logout. */
export default function UserMenu() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  const label = user?.name || user?.email || 'User';
  const letter = (Array.from(label.trim())[0] ?? '?').toUpperCase();

  // close on click outside / Escape
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e) => {
      if (!rootRef.current?.contains(e.target)) setOpen(false);
    };
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  const handleLogout = async () => {
    setOpen(false);
    await logout();
    navigate('/', { replace: true });
  };

  return (
    <div className="user-menu" ref={rootRef}>
      <button
        type="button"
        className="user-menu__avatar"
        aria-label={`Account menu (${label})`}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        {letter}
      </button>

      {open && (
        <div className="user-menu__dropdown" role="menu">
          <div className="user-menu__user">
            <b>{user?.name || 'User'}</b>
            {user?.email && <span>{user.email}</span>}
          </div>
          <Link to="/account" role="menuitem" className="user-menu__item" onClick={() => setOpen(false)}>
            Account
          </Link>
          <button type="button" role="menuitem" className="user-menu__item" onClick={handleLogout}>
            Logout
          </button>
        </div>
      )}
    </div>
  );
}
