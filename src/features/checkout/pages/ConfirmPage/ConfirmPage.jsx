import { useEffect, useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, Navigate, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useConfirmOrder, useResendOrderCode } from '@api/checkoutQueries';
import ActionButton from '@/components/ActionButton/ActionButton';
import LoadingHint from '@/components/LoadingHint/LoadingHint';
import QueryError from '@/components/QueryError/QueryError';
import { useTranslation, formatPriceI18n } from '@/lib/i18n';
import { verifyCodeSchema } from '@shared/lib/validators';
import { Alert, FormField, Input, useToast } from '@shared/ui';
import { useAuth } from '@features/auth/hooks/useAuth';
import { useOrder } from '../../hooks/useOrder';
import { getGenericMessage, getStockProblems } from '../../lib/checkoutErrors';
import { checkoutPath, orderPath } from '../../lib/checkoutRoutes';
import '@/styles/cyber-form.css';
import './ConfirmPage.css';

const RESEND_SECONDS = 30;
const CODE_MINUTES = 10;

export default function ConfirmPage() {
  'use no memo';
  const { orderId } = useParams();
  const [searchParams] = useSearchParams();
  const addressId = searchParams.get('address');
  const navigate = useNavigate();
  const toast = useToast();
  const { user } = useAuth();
  const { t, lang } = useTranslation();
  const orderQuery = useOrder(orderId);
  const confirm = useConfirmOrder();
  const resend = useResendOrderCode();
  
  const [secondsLeft, setSecondsLeft] = useState(RESEND_SECONDS);
  const [isBlocked, setIsBlocked] = useState(false);
  const [banner, setBanner] = useState('');
  const [stockProblems, setStockProblems] = useState(null);

  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(verifyCodeSchema),
    defaultValues: { code: '' },
    mode: 'onSubmit',
    reValidateMode: 'onChange',
  });

  // the resend timer: one tick per second until it reaches 0
  useEffect(() => {
    if (secondsLeft <= 0) return undefined;
    const timer = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [secondsLeft]);

  const onSubmit = useCallback(async ({ code }) => {
    if (!orderQuery.data?.order) return;
    const currentOrder = orderQuery.data.order;

    setBanner('');
    setStockProblems(null);

    try {
      const { order: paid } = await confirm.mutateAsync({ id: currentOrder.id, code });
      toast.success(t('checkout.paymentSuccessful'));
      navigate(orderPath(paid.id), { replace: true });
    } catch (err) {
      if (err.code === 'INVALID_PAYMENT_CODE') {
        setError('code', { type: 'server', message: t('checkout.codeIncorrect') }, { shouldFocus: true });
      } else if (err.code === 'TOO_MANY_ATTEMPTS') {
        setIsBlocked(true);
        setBanner(t('checkout.tooManyWrongAttempts'));
      } else if (err.code === 'ORDER_ALREADY_PAID') {
        navigate(orderPath(currentOrder.id), { replace: true });
      } else if (err.code === 'INSUFFICIENT_STOCK') {
        setStockProblems(getStockProblems(err));
      } else if (err.code === 'ORDER_NOT_FOUND') {
        orderQuery.refetch();
      } else if (err.code === 'VALIDATION_ERROR' && err.errors?.code) {
        setError('code', { type: 'server', message: err.errors.code }, { shouldFocus: true });
      } else if (err.code !== 'TOKEN_EXPIRED') {
        setBanner(getGenericMessage(err));
      }
    }
  }, [confirm, orderQuery, navigate, setError, toast, t]);

  const handleResend = useCallback(async () => {
    if (!orderQuery.data?.order) return;
    const currentOrder = orderQuery.data.order;

    try {
      await resend.mutateAsync({ id: currentOrder.id });
      setSecondsLeft(RESEND_SECONDS);
      setIsBlocked(false);
      setBanner('');
      setStockProblems(null);
      reset({ code: '' });
      toast.success(t('checkout.newCodeSent'));
    } catch (err) {
      if (err.code === 'RESEND_TOO_SOON') {
        const wait = Math.ceil(Number(err.data?.retryAfterSeconds));
        setSecondsLeft(Number.isFinite(wait) && wait > 0 ? wait : RESEND_SECONDS);
      } else if (err.code === 'ORDER_ALREADY_PAID') {
        navigate(orderPath(currentOrder.id), { replace: true });
      } else if (err.code !== 'TOKEN_EXPIRED') {
        toast.error(getGenericMessage(err));
      }
    }
  }, [resend, orderQuery, navigate, reset, toast, t]);

  if (orderQuery.isPending) {
    return (
      <div className="container confirm" aria-busy="true">
        <LoadingHint />
        <span className="skeleton" style={{ height: 360, maxWidth: 520, margin: '0 auto' }} aria-hidden="true" />
      </div>
    );
  }
  if (orderQuery.isError) {
    if (orderQuery.error.code === 'ORDER_NOT_FOUND' || orderQuery.error.status === 404) {
      return (
        <div className="container confirm">
          <div className="confirm__card confirm__card--center">
            <h1 className="confirm__title">{t('checkout.orderNotFound')}</h1>
            <p className="confirm__lead">{t('checkout.orderNotFoundText')}</p>
            <ActionButton to="/cart">{t('checkout.backToCart')}</ActionButton>
          </div>
        </div>
      );
    }
    return <QueryError message={orderQuery.error.message} onRetry={() => orderQuery.refetch()} />;
  }

  const { order } = orderQuery.data;
  // already paid (e.g. in another tab) → nothing to confirm
  if (order.status === 'paid') return <Navigate to={orderPath(order.id)} replace />;

  const backTo = addressId ? checkoutPath('payment', addressId) : '/checkout/address';
  const canResend = secondsLeft <= 0 && !resend.isPending;

  const codeField = register('code');

  return (
    <>
      <title>{t('checkout.confirmPaymentTitle')}</title>
      <div className="container confirm">
        <div className="confirm__card">
          <h1 className="confirm__title">{t('checkout.confirmTitle')}</h1>
          <p className="confirm__lead">
            {t('checkout.codeSent')}{user?.email ? <> {t('checkout.codeSentTo')} <b>{user.email}</b></> : ''}. {t('checkout.codeValid', { minutes: CODE_MINUTES })}
          </p>
          <p className="confirm__total">
            {t('checkout.toPay')} <b>{formatPriceI18n(order.total, order.currency, lang)}</b>
          </p>

          {banner && <Alert type="error" message={banner} />}
          {stockProblems && (
            <Alert
              type="error"
              message={
                <>
                  {t('checkout.stockBought')}
                  {stockProblems.length > 0 && (
                    <ul className="confirm__stock">
                      {stockProblems.map((item) => (
                        <li key={item.key}>
                          {item.title}
                          {item.available !== null && ` — ${t('checkout.onlyNLeft', { count: item.available })}`}
                        </li>
                      ))}
                    </ul>
                  )}{' '}
                  <Link className="confirm__link" to="/cart">
                    {t('checkout.goToCart')}
                  </Link>
                </>
              }
            />
          )}

          <form className="cyber-form confirm__form" onSubmit={handleSubmit(onSubmit)} noValidate>
            <FormField label={t('checkout.confirmCode')} error={errors.code?.message} htmlFor="payment-code" required>
              <Input
                id="payment-code"
                inputMode="numeric"
                autoComplete="one-time-code"
                placeholder={t('checkout.sixDigitCode')}
                maxLength={6}
                disabled={isBlocked}
                error={errors.code?.message}
                {...codeField}
                onChange={(e) => {
                  e.target.value = e.target.value.replace(/\D/g, '').slice(0, 6);
                  codeField.onChange(e);
                }}
              />
            </FormField>

            <p className="confirm__resend">
              {t('checkout.didNotGetCode')}{' '}
              <button type="button" className="confirm__link" onClick={handleResend} disabled={!canResend}>
                {secondsLeft > 0 ? t('checkout.resendIn', { seconds: String(secondsLeft).padStart(2, '0') }) : t('checkout.resendCode')}
              </button>
            </p>

            <div className="confirm__actions">
              <ActionButton to={backTo} variant="outline" disabled={isSubmitting}>
                {t('common.back')}
              </ActionButton>
              <ActionButton type="submit" isLoading={isSubmitting} disabled={isBlocked}>
                {t('checkout.confirmPayment')}
              </ActionButton>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}