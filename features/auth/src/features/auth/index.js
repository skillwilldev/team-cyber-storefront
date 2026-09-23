/**
 * Barrel export for auth feature.
 */
export { AuthProvider, useAuth } from './context/AuthContext';
export { default as ProtectedRoute } from './components/ProtectedRoute';
export { default as LoginPage } from './pages/LoginPage/LoginPage';
export { default as RegisterPage } from './pages/RegisterPage/RegisterPage';
export { default as ForgotPasswordPage } from './pages/ForgotPasswordPage/ForgotPasswordPage';
export { default as HomePage } from './pages/HomePage/HomePage';
