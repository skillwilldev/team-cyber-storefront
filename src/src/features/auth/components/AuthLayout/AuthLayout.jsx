import { Outlet } from 'react-router-dom';
import './AuthLayout.css';

/**
 * Centered card for the auth screens (login / register / forgot password / account).
 * Rendered inside the shop Layout, so the Header and Footer stay on the page.
 */
export default function AuthLayout() {
  return (
    <div className="auth-shell">
      <div className="auth-shell__card">
        <Outlet />
      </div>
    </div>
  );
}
