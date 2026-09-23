import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, Link } from 'react-router-dom';
import { registerSchema } from '@shared/lib/validators';
import { apiRequest } from '@shared/api/apiClient';
import { useAuth } from '@features/auth/context/AuthContext';
import { Button, Input, PasswordInput, FormField, Alert, IconMail, IconUser } from '@shared/ui';
import '../LoginPage/LoginPage.css';
import './RegisterPage.css';

/**
 * Register Page — FE-001 + FE-002
 *
 * Fields: Name · Email · Password · Confirm Password
 * Validation: name min 2; email valid; password min 8 + letter + digit; confirm must match
 * On submit: POST /auth/register → save token → redirect to /
 * Errors: 409 EMAIL_TAKEN → field error; 422 VALIDATION_ERROR → map to fields
 */
export default function RegisterPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [bannerError, setBannerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register: registerField,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
    mode: 'onSubmit',
    reValidateMode: 'onChange',
  });

  const onSubmit = async (values) => {
    setBannerError('');
    setIsSubmitting(true);

    try {
      const data = await apiRequest('/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          name: values.name,
          email: values.email,
          password: values.password,
        }),
      });

      login(data.accessToken, data.user);
      console.log('Registration successful:', data.user);
      navigate('/', { replace: true });
    } catch (err) {
      if (err.code === 'EMAIL_TAKEN' || err.status === 409) {
        setError('email', { message: 'This email is already registered' });
      } else if (err.code === 'VALIDATION_ERROR' && err.errors) {
        Object.entries(err.errors).forEach(([field, message]) => {
          setError(field, { message });
        });
      } else {
        setBannerError(err.message || 'Registration failed. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-page__header">
        <h1 className="auth-page__title">Create an account</h1>
        <p className="auth-page__subtitle">Join us to get started</p>
      </div>

      {bannerError && <Alert type="error" message={bannerError} />}

      <form onSubmit={handleSubmit(onSubmit)} className="auth-page__form" noValidate>
        <FormField label="Full Name" error={errors.name?.message} htmlFor="reg-name" required>
          <Input
            id="reg-name"
            placeholder="Your full name"
            error={errors.name?.message}
            disabled={isSubmitting}
            icon={IconUser}
            {...registerField('name')}
          />
        </FormField>

        <FormField label="Email" error={errors.email?.message} htmlFor="reg-email" required>
          <Input
            id="reg-email"
            type="email"
            placeholder="you@example.com"
            error={errors.email?.message}
            disabled={isSubmitting}
            icon={IconMail}
            {...registerField('email')}
          />
        </FormField>

        <FormField label="Password" error={errors.password?.message} htmlFor="reg-password" required>
          <PasswordInput
            id="reg-password"
            placeholder="Min 8 characters"
            error={errors.password?.message}
            disabled={isSubmitting}
            {...registerField('password')}
          />
        </FormField>

        <FormField label="Confirm Password" error={errors.confirmPassword?.message} htmlFor="reg-confirm" required>
          <PasswordInput
            id="reg-confirm"
            placeholder="Repeat your password"
            error={errors.confirmPassword?.message}
            disabled={isSubmitting}
            {...registerField('confirmPassword')}
          />
        </FormField>

        <Button type="submit" isLoading={isSubmitting}>
          Create account
        </Button>
      </form>

      <p className="auth-page__footer">
        Already have an account?{' '}
        <Link to="/login" className="auth-page__link">
          Sign in
        </Link>
      </p>
    </div>
  );
}
