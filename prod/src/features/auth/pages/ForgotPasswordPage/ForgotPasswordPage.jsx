import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';
import {
  forgotPasswordSchema,
  verifyCodeSchema,
  resetPasswordSchema,
} from '@shared/lib/validators';
import { apiRequest } from '@shared/api/apiClient';
import {
  Button,
  Input,
  PasswordInput,
  FormField,
  Alert,
  IconMail,
  IconKeyRound,
  IconArrowLeft,
  IconCheckCircle,
  IconTerminal,
} from '@shared/ui';
import '../LoginPage/LoginPage.css';
import './ForgotPasswordPage.css';

/**
 * Forgot Password Page — 3-step flow on a single URL
 *
 * Step 1: Email → POST /auth/forgot-password → always 200 (never reveal if email exists)
 * Step 2: 6-digit code → POST /auth/verify-reset-code → get resetToken (stored in component state, NOT localStorage)
 * Step 3: New password → POST /auth/reset-password → success message → redirect to /login
 */
export default function ForgotPasswordPage() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [devCode, setDevCode] = useState('');
  const [bannerError, setBannerError] = useState('');
  const [bannerSuccess, setBannerSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  return (
    <div className="auth-page">
      <div className="auth-page__header">
        <h1 className="auth-page__title">Reset your password</h1>
        <p className="auth-page__subtitle">
          {step === 1 && 'Enter your email to receive a reset code'}
          {step === 2 && 'Enter the 6-digit verification code'}
          {step === 3 && !isComplete && 'Create a new secure password'}
          {isComplete && 'Your password has been updated'}
        </p>
        {!isComplete && (
          <div className="auth-page__step-info" style={{ marginTop: '8px' }}>
            Step {step} of 3
          </div>
        )}
      </div>

      {bannerError && <Alert type="error" message={bannerError} />}
      {bannerSuccess && <Alert type="success" message={bannerSuccess} />}

      {devCode && step === 2 && (
        <div className="auth-page__dev-banner">
          <IconTerminal size={16} />
          <span>
            <strong>Dev Mode:</strong> Your code is <code>{devCode}</code>
          </span>
        </div>
      )}

      {isComplete ? (
        <SuccessView />
      ) : (
        <>
          {step === 1 && (
            <Step1Email
              isSubmitting={isSubmitting}
              setIsSubmitting={setIsSubmitting}
              setBannerError={setBannerError}
              setBannerSuccess={setBannerSuccess}
              setEmail={setEmail}
              setDevCode={setDevCode}
              setStep={setStep}
            />
          )}
          {step === 2 && (
            <Step2Code
              email={email}
              isSubmitting={isSubmitting}
              setIsSubmitting={setIsSubmitting}
              setBannerError={setBannerError}
              setBannerSuccess={setBannerSuccess}
              setResetToken={setResetToken}
              setStep={setStep}
            />
          )}
          {step === 3 && (
            <Step3NewPassword
              resetToken={resetToken}
              isSubmitting={isSubmitting}
              setIsSubmitting={setIsSubmitting}
              setBannerError={setBannerError}
              setIsComplete={setIsComplete}
            />
          )}
        </>
      )}

      <div className="auth-page__divider">
        <Link to="/login" className="auth-page__back-link">
          <IconArrowLeft size={16} />
          Back to sign in
        </Link>
      </div>
    </div>
  );
}

// ---- Step 1: Email ----
function Step1Email({
  isSubmitting,
  setIsSubmitting,
  setBannerError,
  setBannerSuccess,
  setEmail,
  setDevCode,
  setStep,
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(forgotPasswordSchema),
    mode: 'onSubmit',
    reValidateMode: 'onChange',
  });

  const onSubmit = async (values) => {
    setBannerError('');
    setBannerSuccess('');
    setIsSubmitting(true);

    try {
      const data = await apiRequest('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email: values.email }),
      });

      setEmail(values.email);

      // Dev mode: API returns devCode for testing
      if (data.devCode) {
        setDevCode(data.devCode);
      }

      setBannerSuccess('If an account exists for this email, we\'ve sent a reset link.');
      setStep(2);
    } catch (err) {
      if (err.code === 'VALIDATION_ERROR' && err.errors) {
        setBannerError(Object.values(err.errors).join('. '));
      } else {
        setBannerError(err.message || 'Request failed. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="auth-page__form" noValidate>
      <FormField label="Email" error={errors.email?.message} htmlFor="fp-email" required>
        <Input
          id="fp-email"
          type="email"
          placeholder="you@example.com"
          error={errors.email?.message}
          disabled={isSubmitting}
          icon={IconMail}
          {...register('email')}
        />
      </FormField>
      <Button type="submit" isLoading={isSubmitting}>
        Send Reset Code
      </Button>
    </form>
  );
}

// ---- Step 2: Verification Code ----
function Step2Code({
  email,
  isSubmitting,
  setIsSubmitting,
  setBannerError,
  setBannerSuccess,
  setResetToken,
  setStep,
}) {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(verifyCodeSchema),
    mode: 'onSubmit',
    reValidateMode: 'onChange',
  });

  const onSubmit = async (values) => {
    setBannerError('');
    setBannerSuccess('');
    setIsSubmitting(true);

    try {
      const data = await apiRequest('/auth/verify-reset-code', {
        method: 'POST',
        body: JSON.stringify({ email, code: values.code }),
      });

      // Store resetToken in component state only — NOT localStorage
      setResetToken(data.resetToken);
      setStep(3);
    } catch (err) {
      if (err.code === 'INVALID_RESET_CODE' || err.status === 400) {
        setError('code', { message: 'Code is invalid or expired' });
      } else if (err.code === 'TOO_MANY_ATTEMPTS' || err.status === 429) {
        setBannerError('Too many attempts. Please request a new code.');
        // Optionally go back to step 1
        setTimeout(() => setStep(1), 3000);
      } else {
        setBannerError(err.message || 'Verification failed. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="auth-page__form" noValidate>
      <FormField label="Verification Code" error={errors.code?.message} htmlFor="fp-code" required>
        <Input
          id="fp-code"
          placeholder="Enter 6-digit code"
          error={errors.code?.message}
          disabled={isSubmitting}
          icon={IconKeyRound}
          {...register('code')}
        />
      </FormField>
      <Button type="submit" isLoading={isSubmitting}>
        Verify Code
      </Button>
    </form>
  );
}

// ---- Step 3: New Password ----
function Step3NewPassword({
  resetToken,
  isSubmitting,
  setIsSubmitting,
  setBannerError,
  setIsComplete,
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(resetPasswordSchema),
    mode: 'onSubmit',
    reValidateMode: 'onChange',
  });

  const onSubmit = async (values) => {
    setBannerError('');
    setIsSubmitting(true);

    try {
      await apiRequest('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({
          resetToken,
          password: values.password,
        }),
      });

      setIsComplete(true);
    } catch (err) {
      if (err.code === 'RESET_TOKEN_USED') {
        setBannerError('This reset link has already been used. Please request a new one.');
      } else {
        setBannerError(err.message || 'Password reset failed. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="auth-page__form" noValidate>
      <FormField label="New Password" error={errors.password?.message} htmlFor="fp-new-password" required>
        <PasswordInput
          id="fp-new-password"
          placeholder="Min 8 characters"
          error={errors.password?.message}
          disabled={isSubmitting}
          {...register('password')}
        />
      </FormField>
      <Button type="submit" isLoading={isSubmitting}>
        Update Password
      </Button>
    </form>
  );
}

// ---- Success view after password reset ----
function SuccessView() {
  return (
    <div className="auth-page__success">
      <div className="auth-page__success-icon">
        <IconCheckCircle size={32} />
      </div>
      <p>Your password has been successfully updated. You can now sign in with your new password.</p>
    </div>
  );
}
