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
import { useTranslation } from '@/lib/i18n';
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
  const { t } = useTranslation();
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
        <h1 className="auth-page__title">{t('auth.resetTitle')}</h1>
        <p className="auth-page__subtitle">
          {step === 1 && t('auth.resetStep1')}
          {step === 2 && t('auth.resetStep2')}
          {step === 3 && !isComplete && t('auth.resetStep3')}
          {isComplete && t('auth.resetComplete')}
        </p>
        {!isComplete && (
          <div className="auth-page__step-info" style={{ marginTop: '8px' }}>
            {t('auth.stepOf', { step })}
          </div>
        )}
      </div>

      {bannerError && <Alert type="error" message={bannerError} />}
      {bannerSuccess && <Alert type="success" message={bannerSuccess} />}

      {devCode && step === 2 && (
        <div className="auth-page__dev-banner">
          <IconTerminal size={16} />
          <span>
            <strong>{t('auth.devModeCode')}</strong> <code>{devCode}</code>
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
          {t('auth.backToSignIn')}
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
  const { t } = useTranslation();
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

      setBannerSuccess(t('auth.emailSent'));
      setStep(2);
    } catch (err) {
      if (err.code === 'VALIDATION_ERROR' && err.errors) {
        setBannerError(Object.values(err.errors).join('. '));
      } else {
        setBannerError(err.message || t('auth.requestFailed'));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="auth-page__form" noValidate>
      <FormField label={t('auth.email')} error={errors.email?.message} htmlFor="fp-email" required>
        <Input
          id="fp-email"
          type="email"
          placeholder={t('auth.emailPlaceholder')}
          error={errors.email?.message}
          disabled={isSubmitting}
          icon={IconMail}
          {...register('email')}
        />
      </FormField>
      <Button type="submit" isLoading={isSubmitting}>
        {t('auth.sendResetCode')}
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
  const { t } = useTranslation();
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
        setError('code', { message: t('auth.codeInvalidExpired') });
      } else if (err.code === 'TOO_MANY_ATTEMPTS' || err.status === 429) {
        setBannerError(t('auth.tooManyAttempts'));
        // Optionally go back to step 1
        setTimeout(() => setStep(1), 3000);
      } else {
        setBannerError(err.message || t('auth.verificationFailed'));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="auth-page__form" noValidate>
      <FormField label={t('auth.verificationCode')} error={errors.code?.message} htmlFor="fp-code" required>
        <Input
          id="fp-code"
          placeholder={t('auth.enterCode')}
          error={errors.code?.message}
          disabled={isSubmitting}
          icon={IconKeyRound}
          {...register('code')}
        />
      </FormField>
      <Button type="submit" isLoading={isSubmitting}>
        {t('auth.verifyCode')}
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
  const { t } = useTranslation();
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
        setBannerError(t('auth.resetTokenUsed'));
      } else {
        setBannerError(err.message || t('auth.resetFailed'));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="auth-page__form" noValidate>
      <FormField label={t('auth.newPassword')} error={errors.password?.message} htmlFor="fp-new-password" required>
        <PasswordInput
          id="fp-new-password"
          placeholder={t('auth.minChars')}
          error={errors.password?.message}
          disabled={isSubmitting}
          {...register('password')}
        />
      </FormField>
      <Button type="submit" isLoading={isSubmitting}>
        {t('auth.updatePassword')}
      </Button>
    </form>
  );
}

// ---- Success view after password reset ----
function SuccessView() {
  const { t } = useTranslation();
  return (
    <div className="auth-page__success">
      <div className="auth-page__success-icon">
        <IconCheckCircle size={32} />
      </div>
      <p>{t('auth.resetSuccess')}</p>
    </div>
  );
}
