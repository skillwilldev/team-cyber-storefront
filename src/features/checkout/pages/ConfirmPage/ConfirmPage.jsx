import { useEffect, useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, Navigate, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useConfirmOrder, useResendOrderCode } from '@api/checkoutQueries';
import ActionButton from '@/components/ActionButton/ActionButton';
import LoadingHint from '@/components/LoadingHint/LoadingHint';
import QueryError from '@/components/QueryError/QueryError';
import { formatPrice } from '@/lib/format';
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
      toast.success('Payment successful');
      navigate(orderPath(paid.id), { replace: true });
    } catch (err) {
      if (err.code === 'INVALID_PAYMENT_CODE') {
        setError('code', { type: 'server', message: 'The code is incorrect or has expired' }, { shouldFocus: true });
      } else if (err.code === 'TOO_MANY_ATTEMPTS') {
        setIsBlocked(true);
        setBanner('Too many wrong attempts. Request a new code to continue.');
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
  }, [confirm, orderQuery, navigate, setError, toast]);

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
      toast.success('A new code has been sent');
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
  }, [resend, orderQuery, navigate, reset, toast]);

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
            <h1 className="confirm__title">Order not found</h1>
            <p className="confirm__lead">This order does not exist or belongs to another account.</p>
            <ActionButton to="/cart">Back to cart</ActionButton>
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
      <title>Confirm payment — Cyber</title>
      <div className="container confirm">
        <div className="confirm__card">
          <h1 className="confirm__title">Confirm your payment</h1>
          <p className="confirm__lead">
            We have sent a 6-digit code{user?.email ? <> to <b>{user.email}</b></> : ''}. It is valid for {CODE_MINUTES}{' '}
            minutes.
          </p>
          <p className="confirm__total">
            To pay: <b>{formatPrice(order.total, order.currency)}</b>
          </p>

          {banner && <Alert type="error" message={banner} />}
          {stockProblems && (
            <Alert
              type="error"
              message={
                <>
                  The last items were bought by someone else, nothing was charged.
                  {stockProblems.length > 0 && (
                    <ul className="confirm__stock">
                      {stockProblems.map((item) => (
                        <li key={item.key}>
                          {item.title}
                          {item.available !== null && ` — only ${item.available} left`}
                        </li>
                      ))}
                    </ul>
                  )}{' '}
                  <Link className="confirm__link" to="/cart">
                    Go to the cart
                  </Link>
                </>
              }
            />
          )}

          <form className="cyber-form confirm__form" onSubmit={handleSubmit(onSubmit)} noValidate>
            <FormField label="Confirmation code" error={errors.code?.message} htmlFor="payment-code" required>
              <Input
                id="payment-code"
                inputMode="numeric"
                autoComplete="one-time-code"
                placeholder="6-digit code"
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
              Did not get the code?{' '}
              <button type="button" className="confirm__link" onClick={handleResend} disabled={!canResend}>
                {secondsLeft > 0 ? `Resend in 0:${String(secondsLeft).padStart(2, '0')}` : 'Resend code'}
              </button>
            </p>

            <div className="confirm__actions">
              <ActionButton to={backTo} variant="outline" disabled={isSubmitting}>
                Back
              </ActionButton>
              <ActionButton type="submit" isLoading={isSubmitting} disabled={isBlocked}>
                Confirm payment
              </ActionButton>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}