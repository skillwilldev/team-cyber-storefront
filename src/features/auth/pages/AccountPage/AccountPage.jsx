import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { apiRequest } from '@shared/api/apiClient';
import { profileSchema } from '@shared/lib/validators';
import { useAuth } from '@features/auth/hooks/useAuth';
import { useTranslation } from 'react-i18next';
import {
  Alert,
  Button,
  FormField,
  IconLogOut,
  IconMail,
  IconUser,
  Input,
  PasswordInput,
} from '@shared/ui';
import { applyServerErrors, buildPatch, hasChanges, toFormValues } from '../../lib/profileForm';
import './AccountPage.css';

/**
 * Account page — FE-004: edit name, email and password.
 * (The delivery addresses are managed on /addresses — FE-006.)
 *
 * Flow:   user (from AuthContext, loaded by GET /auth/me) → form defaults
 *         submit → PATCH /auth/me { currentPassword, ...ONLY changed fields }
 *         200   → setUser(data.user) (Header/UserMenu update instantly) + reset form
 *         400 INVALID_CURRENT_PASSWORD → under "Current password"
 *         409 EMAIL_TAKEN              → under "Email"
 *         422 VALIDATION_ERROR         → each message under its own field (`errors._` → banner)
 *         401                          → central handling in apiClient (FE-002)
 *
 * The page is rendered only inside <ProtectedRoute>, so `user` is never null here.
 */
export default function AccountPage() {
  'use no memo';
  const { user, setUser, logout } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [banner, setBanner] = useState(null); // { type: 'success' | 'error', message }

  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors, dirtyFields, isSubmitting },
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: toFormValues(user),
    mode: 'onSubmit',
    reValidateMode: 'onChange',
  });

  // "Save" is disabled until a profile field changed — typing only the current password is not a change.
  const canSave = hasChanges(dirtyFields);

  const onSubmit = async (values) => {
    setBanner(null);

    const body = buildPatch({ dirtyFields, values, initial: user });
    if (!body) {
      setBanner({ type: 'error', message: t('auth.nothingToChange') });
      return;
    }

    try {
      const data = await apiRequest('/auth/me', { method: 'PATCH', body: JSON.stringify(body) });

      setUser(data.user); // one source of truth → Header and UserMenu see it
      reset(toFormValues(data.user)); // new defaults: form is clean again, password fields are emptied
      setBanner({ type: 'success', message: t('auth.changesSaved') });
    } catch (err) {
      if (err.code === 'INVALID_CURRENT_PASSWORD') {
        // 400, not 401 — the session is fine, so the user stays on the page
        setError('currentPassword', { type: 'server', message: t('auth.passwordIncorrect') }, { shouldFocus: true });
      } else if (err.code === 'EMAIL_TAKEN' || err.status === 409) {
        setError('email', { type: 'server', message: t('auth.emailTaken') }, { shouldFocus: true });
      } else if (err.code === 'VALIDATION_ERROR' && err.errors) {
        const orphans = applyServerErrors(err.errors, setError);
        if (orphans.length) setBanner({ type: 'error', message: t('auth.nothingToChange') });
      } else if (err.code !== 'TOKEN_EXPIRED') {
        setBanner({ type: 'error', message: err.message || t('auth.couldNotSave') });
      }
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="account">
      <div className="account__card">
        <header className="account__header">
          <h1 className="account__title">{t('auth.myProfile')}</h1>
          <p className="account__subtitle">{t('auth.profileSubtitle')}</p>
        </header>

        {banner && <Alert type={banner.type} message={banner.message} />}

        <form
          className="account__form"
          onSubmit={handleSubmit(onSubmit)}
          // the "saved" message goes away as soon as the user starts editing again
          onChange={() => banner?.type === 'success' && setBanner(null)}
          noValidate
        >
          <section className="account__section" aria-labelledby="acc-personal">
            <h2 id="acc-personal" className="account__section-title">{t('auth.personalDetails')}</h2>

            <FormField label={t('auth.fullName')} error={errors.name?.message} htmlFor="acc-name" required>
              <Input
                id="acc-name"
                autoComplete="name"
                error={errors.name?.message}
                icon={IconUser}
                {...register('name')}
              />
            </FormField>

            <FormField label={t('auth.email')} error={errors.email?.message} htmlFor="acc-email" required>
              <Input
                id="acc-email"
                type="email"
                autoComplete="email"
                error={errors.email?.message}
                icon={IconMail}
                {...register('email')}
              />
            </FormField>
          </section>

          <section className="account__section" aria-labelledby="acc-security">
            <h2 id="acc-security" className="account__section-title">{t('auth.security')}</h2>
            <p className="account__hint">{t('auth.passwordHint')}</p>

            <div className="account__row">
              <FormField label={t('auth.newPassword')} error={errors.newPassword?.message} htmlFor="acc-new-password">
                <PasswordInput
                  id="acc-new-password"
                  autoComplete="new-password"
                  placeholder={t('auth.minChars')}
                  error={errors.newPassword?.message}
                  {...register('newPassword')}
                />
              </FormField>

              <FormField
                label={t('auth.repeatNewPassword')}
                error={errors.confirmNewPassword?.message}
                htmlFor="acc-confirm-password"
              >
                <PasswordInput
                  id="acc-confirm-password"
                  autoComplete="new-password"
                  placeholder={t('auth.repeatNewPassword')}
                  error={errors.confirmNewPassword?.message}
                  {...register('confirmNewPassword')}
                />
              </FormField>
            </div>

            <FormField
              label={t('auth.currentPassword')}
              error={errors.currentPassword?.message}
              htmlFor="acc-current-password"
              required
            >
              <PasswordInput
                id="acc-current-password"
                autoComplete="current-password"
                error={errors.currentPassword?.message}
                {...register('currentPassword')}
              />
            </FormField>
          </section>

          <div className="account__actions">
            <Button type="submit" isLoading={isSubmitting} disabled={!canSave}>
              {t('auth.saveChanges')}
            </Button>
            <Button variant="secondary" type="button" onClick={handleLogout} disabled={isSubmitting}>
              <IconLogOut size={16} />
              {t('auth.signOut')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
