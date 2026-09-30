import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { loginSchema } from '@shared/lib/validators';
import { apiRequest } from '@shared/api/apiClient';
import { useAuth } from '@features/auth/hooks/useAuth';
import { Button, Input, PasswordInput, FormField, Alert, IconMail } from '@shared/ui';
import './LoginPage.css';

/**
 * Login Page — FE-001 + FE-002
 *
 * Fields: Email + Password (masked, show/hide toggle)
 * Validation: email required + valid format; password required only (no strength rules)
 * On submit: POST /auth/login → save token → redirect to where user came from
 * Error: 401 INVALID_CREDENTIALS → banner "Incorrect email or password"
 */
export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [bannerError, setBannerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Where to redirect after login (saved by ProtectedRoute)
  const from = location.state?.from?.pathname || '/';

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    mode: 'onSubmit',
    reValidateMode: 'onChange',
  });

  const onSubmit = async (values) => {
    setBannerError('');
    setIsSubmitting(true);

    try {
      const data = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: values.email,
          password: values.password,
        }),
      });

      login(data.accessToken, data.user);
      console.log('Login successful:', data.user);
      // console.log('accessToken: ', data.accessToken);
      navigate(from, { replace: true });
    } catch (err) {
      if (err.code === 'INVALID_CREDENTIALS' || err.status === 401) {
        setBannerError('Incorrect email or password');
      } else if (err.code === 'VALIDATION_ERROR' && err.errors) {
        // Map server validation errors to fields
        Object.entries(err.errors).forEach(([field, message]) => {
          setError(field, { message });
        });
      } else {
        setBannerError(err.message || 'Something went wrong. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-page__header">
        <h1 className="auth-page__title">Sign in to your account</h1>
        <p className="auth-page__subtitle">Enter your credentials to continue</p>
      </div>

      {bannerError && <Alert type="error" message={bannerError} />}

      <form onSubmit={handleSubmit(onSubmit)} className="auth-page__form" noValidate>
        <FormField label="Email" error={errors.email?.message} htmlFor="login-email" required>
          <Input
            id="login-email"
            type="email"
            placeholder="you@example.com"
            error={errors.email?.message}
            disabled={isSubmitting}
            icon={IconMail}
            {...register('email')}
          />
        </FormField>

        <FormField label="Password" error={errors.password?.message} htmlFor="login-password" required>
          <PasswordInput
            id="login-password"
            placeholder="••••••••"
            error={errors.password?.message}
            disabled={isSubmitting}
            {...register('password')}
          />
        </FormField>

        <div className="auth-page__actions-row">
          <Link to="/forgot-password" className="auth-page__link">
            Forgot password?
          </Link>
        </div>

        <Button type="submit" isLoading={isSubmitting}>
          Sign In
        </Button>
      </form>

      <p className="auth-page__footer">
        Don't have an account?{' '}
        <Link to="/register" className="auth-page__link">
          Create an account
        </Link>
      </p>
    </div>
  );
}
