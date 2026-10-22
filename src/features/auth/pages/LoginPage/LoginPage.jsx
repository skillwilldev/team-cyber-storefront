import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { loginSchema } from '@shared/lib/validators';
import { apiRequest } from '@shared/api/apiClient';
import { useAuth } from '@features/auth/hooks/useAuth';
import { useTranslation } from '@/lib/i18n';
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
  const { t } = useTranslation();
  const [bannerError, setBannerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Where to redirect after login (saved by ProtectedRoute)
  // pathname + search + hash: a guest who came from /?category=laptops&page=2 returns to the same filtered page
  const fromLocation = location.state?.from;
  const from = fromLocation
    ? `${fromLocation.pathname}${fromLocation.search ?? ''}${fromLocation.hash ?? ''}`
    : '/';

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
      navigate(from, { replace: true });
    } catch (err) {
      if (err.code === 'INVALID_CREDENTIALS' || err.status === 401) {
        setBannerError(t('auth.incorrectCredentials'));
      } else if (err.code === 'VALIDATION_ERROR' && err.errors) {
        // Map server validation errors to fields
        Object.entries(err.errors).forEach(([field, message]) => {
          setError(field, { message });
        });
      } else {
        setBannerError(err.message || t('common.somethingWentWrong'));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-page__header">
        <h1 className="auth-page__title">{t('auth.signInTitle')}</h1>
        <p className="auth-page__subtitle">{t('auth.signInSubtitle')}</p>
      </div>

      {bannerError && <Alert type="error" message={bannerError} />}

      <form onSubmit={handleSubmit(onSubmit)} className="auth-page__form" noValidate>
        <FormField label={t('auth.email')} error={errors.email?.message} htmlFor="login-email" required>
          <Input
            id="login-email"
            type="email"
            placeholder={t('auth.emailPlaceholder')}
            error={errors.email?.message}
            disabled={isSubmitting}
            icon={IconMail}
            {...register('email')}
          />
        </FormField>

        <FormField label={t('auth.password')} error={errors.password?.message} htmlFor="login-password" required>
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
            {t('auth.forgotPasswordLink')}
          </Link>
        </div>

        <Button type="submit" isLoading={isSubmitting}>
          {t('auth.login')}
        </Button>
      </form>

      <p className="auth-page__footer">
        {t('auth.noAccount')}{' '}
        <Link to="/register" state={location.state} className="auth-page__link">
          {t('auth.createAccount')}
        </Link>
      </p>
    </div>
  );
}
