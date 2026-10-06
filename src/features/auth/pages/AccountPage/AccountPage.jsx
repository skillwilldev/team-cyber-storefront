import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { apiRequest } from '@shared/api/apiClient';
import { profileSchema } from '@shared/lib/validators';
import { useAuth } from '@features/auth/hooks/useAuth';
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
 * Account page — FE-004: edit name, email, phone, city, address and password.
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
  const { user, setUser, logout } = useAuth();
  const navigate = useNavigate();
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
      setBanner({ type: 'error', message: 'There is nothing to change.' });
      return;
    }

    try {
      const data = await apiRequest('/auth/me', { method: 'PATCH', body: JSON.stringify(body) });

      setUser(data.user); // one source of truth → Header, UserMenu, checkout prefill all see it
      reset(toFormValues(data.user)); // new defaults: form is clean again, password fields are emptied
      setBanner({ type: 'success', message: 'Changes saved.' });
    } catch (err) {
      if (err.code === 'INVALID_CURRENT_PASSWORD') {
        // 400, not 401 — the session is fine, so the user stays on the page
        setError('currentPassword', { type: 'server', message: 'Password is incorrect' }, { shouldFocus: true });
      } else if (err.code === 'EMAIL_TAKEN' || err.status === 409) {
        setError('email', { type: 'server', message: 'This email is already registered' }, { shouldFocus: true });
      } else if (err.code === 'VALIDATION_ERROR' && err.errors) {
        const orphans = applyServerErrors(err.errors, setError);
        if (orphans.length) setBanner({ type: 'error', message: 'There is nothing to change.' });
      } else if (err.code !== 'TOKEN_EXPIRED') {
        setBanner({ type: 'error', message: err.message || 'Could not save changes. Please try again.' });
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
          <h1 className="account__title">My profile</h1>
          <p className="account__subtitle">Update your details. Enter your current password to confirm any change.</p>
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
            <h2 id="acc-personal" className="account__section-title">Personal details</h2>

            <FormField label="Full name" error={errors.name?.message} htmlFor="acc-name" required>
              <Input
                id="acc-name"
                autoComplete="name"
                error={errors.name?.message}
                icon={IconUser}
                {...register('name')}
              />
            </FormField>

            <FormField label="Email" error={errors.email?.message} htmlFor="acc-email" required>
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

          <section className="account__section" aria-labelledby="acc-delivery">
            <h2 id="acc-delivery" className="account__section-title">Delivery address</h2>
            <p className="account__hint">The saved address is filled in automatically when you place an order.</p>

            <FormField label="Phone" error={errors.phone?.message} htmlFor="acc-phone">
              <Input
                id="acc-phone"
                type="tel"
                autoComplete="tel"
                placeholder="+995 555 12 34 56"
                error={errors.phone?.message}
                {...register('phone')}
              />
            </FormField>

            <div className="account__row">
              <FormField label="City" error={errors.city?.message} htmlFor="acc-city">
                <Input
                  id="acc-city"
                  autoComplete="address-level2"
                  placeholder="Tbilisi"
                  error={errors.city?.message}
                  {...register('city')}
                />
              </FormField>

              <FormField label="Address" error={errors.address?.message} htmlFor="acc-address">
                <Input
                  id="acc-address"
                  autoComplete="street-address"
                  placeholder="Rustaveli Ave 12, apt 5"
                  error={errors.address?.message}
                  {...register('address')}
                />
              </FormField>
            </div>
          </section>

          <section className="account__section" aria-labelledby="acc-security">
            <h2 id="acc-security" className="account__section-title">Security</h2>
            <p className="account__hint">Leave the new password empty if you do not want to change it.</p>

            <div className="account__row">
              <FormField label="New password" error={errors.newPassword?.message} htmlFor="acc-new-password">
                <PasswordInput
                  id="acc-new-password"
                  autoComplete="new-password"
                  placeholder="Min 8 characters"
                  error={errors.newPassword?.message}
                  {...register('newPassword')}
                />
              </FormField>

              <FormField
                label="Repeat new password"
                error={errors.confirmNewPassword?.message}
                htmlFor="acc-confirm-password"
              >
                <PasswordInput
                  id="acc-confirm-password"
                  autoComplete="new-password"
                  placeholder="Repeat new password"
                  error={errors.confirmNewPassword?.message}
                  {...register('confirmNewPassword')}
                />
              </FormField>
            </div>

            <FormField
              label="Current password"
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
              Save changes
            </Button>
            <Button variant="secondary" type="button" onClick={handleLogout} disabled={isSubmitting}>
              <IconLogOut size={16} />
              Sign out
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
