import { useNavigate } from 'react-router-dom';
import { useAuth } from '@features/auth/hooks/useAuth';
import { Button, IconShield, IconLogOut } from '@shared/ui';
import './HomePage.css';

/**
 * Minimal Home Page — shows user info after login.
 * Demonstrates that auth flow works end-to-end.
 */
export default function HomePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="home-page">
      <div className="home-page__avatar">
        <IconShield size={32} />
      </div>

      <div>
        <h1 className="home-page__title">Welcome, {user?.name || 'User'}!</h1>
        <p className="home-page__subtitle">You are securely authenticated.</p>
      </div>

      <div className="home-page__info">
        <p><strong>ID:</strong> {user?.id}</p>
        <p><strong>Email:</strong> {user?.email}</p>
        <p><strong>Created:</strong> {user?.createdAt ? new Date(user.createdAt).toLocaleString() : 'N/A'}</p>
      </div>

      <Button variant="secondary" type="button" onClick={handleLogout}>
        <IconLogOut size={16} />
        Sign Out
      </Button>
    </div>
  );
}
