import { useRef, useState, useCallback } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useCreateOrder } from '@api/checkoutQueries';
import ActionButton from '@/components/ActionButton/ActionButton';
import QueryError from '@/components/QueryError/QueryError';
import { Alert, FormField, Input } from '@shared/ui';
import { useTranslation } from 'react-i18next';
import CardPreview from '../../components/CardPreview/CardPreview';
import OrderSummary from '../../components/OrderSummary/OrderSummary';
import { useCheckout } from '../../hooks/useCheckout';
import { useSelectedAddress } from '../../hooks/useSelectedAddress';
import { cardSchema, formatCardNumber, formatExpiry } from '../../lib/card';
import { getGenericMessage, getStockProblems, splitOrderErrors } from '../../lib/checkoutErrors';
import { checkoutPath, confirmPath } from '../../lib/checkoutRoutes';
import '@/styles/cyber-form.css';
import './PaymentStep.css';

const EMPTY_CARD = { number: '', holder: '', expiry: '', cvc: '' };

/**
 * Step 3 — Payment (card).
 *
 *   Pay → POST /orders { shipping, card }
 *     201                 → /checkout/confirm/:orderId  (the 6-digit code "by e-mail")
 *     422 card.*          → under the matching card field (errors["card.number"] → "number")
 *     422 shipping.*      → banner: the address is invalid → edit it on step 1 (the card data stays typed)
 *     402 CARD_DECLINED   → banner in the card section; the address is NOT lost
 *     409 CART_EMPTY      → /cart
 *     409 INSUFFICIENT_STOCK → list of products + link to the cart
 *
 * ⛔ Card data: only in this form's state. Never in storage / URL / store / console. The fields are emptied right
 * after the order is created, and the card number is never logged (see ADR 0005).
 * ⛔ Double pay: `inFlight` blocks a second submit in the same tick (before React disables the button), then the
 * button is disabled while the request runs.
 */
export default function PaymentStep() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const { data: checkout } = useCheckout();
  const { address, isPending, isError, error, refetch } = useSelectedAddress();
  const createOrder = useCreateOrder();
  const inFlight = useRef(false);
  const [cardBanner, setCardBanner] = useState('');
  const [banner, setBanner] = useState('');
  const [addressProblems, setAddressProblems] = useState([]);
  const [stockProblems, setStockProblems] = useState(null);

  const {
    register,
    handleSubmit,
    setError,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(cardSchema),
    defaultValues: EMPTY_CARD,
    mode: 'onSubmit',
    reValidateMode: 'onChange',
  });

  const number = useWatch({ control, name: 'number' });
  const holder = useWatch({ control, name: 'holder' });

  const clearMessages = () => {
    setCardBanner('');
    setBanner('');
    setAddressProblems([]);
    setStockProblems(null);
  };


  const onSubmit = useCallback(async (values) => {
    if (inFlight.current) return;
    inFlight.current = true;
    clearMessages();

    try {
      const result = await createOrder.mutateAsync({
        // the form is filled from the saved address; the id of the address is NOT sent — only a copy of its data
        shipping: {
          fullName: address.fullName,
          phone: address.phone,
          city: address.city,
          address: address.address,
        },
        card: { number: values.number, holder: values.holder.trim(), expiry: values.expiry, cvc: values.cvc },
      });
      // the order exists: empty the card fields BEFORE leaving, so nothing of the card survives in memory
      reset(EMPTY_CARD);
      navigate(confirmPath(result.orderId, address.id));
    } catch (err) {
      if (err.code === 'CARD_DECLINED') {
        setCardBanner(t('checkout.cardDeclined'));
      } else if (err.code === 'VALIDATION_ERROR' && err.errors) {
        const { fields, shipping, other } = splitOrderErrors(err.errors);
        let first = true;
        for (const [field, message] of Object.entries(fields)) {
          setError(field, { type: 'server', message }, { shouldFocus: first });
          first = false;
        }
        if (shipping.length) setAddressProblems(shipping);
        if (other.length) setBanner(other.join(' '));
      } else if (err.code === 'CART_EMPTY') {
        navigate('/cart', { replace: true });
      } else if (err.code === 'INSUFFICIENT_STOCK') {
        setStockProblems(getStockProblems(err, t));
      } else if (err.code === 'UNAUTHORIZED') {
        navigate('/login', { state: { from: location } });
      } else if (err.code !== 'TOKEN_EXPIRED') {
        setBanner(getGenericMessage(err, t));
      }
    } finally {
      inFlight.current = false;
    }
  }, [createOrder, address, navigate, reset, location, setError, t]);

  if (isPending) return <span className="skeleton" style={{ height: 480, marginTop: 64 }} aria-busy="true" />;
  if (isError) return <QueryError message={error.message} onRetry={() => refetch()} />;
  if (!address) return <Navigate to="/checkout/address" replace />;






  // the visible formatting (4-4-4-4, MM/YY) happens before React Hook Form reads the value
  const numberField = register('number');
  const expiryField = register('expiry');
  const cvcField = register('cvc');

  return (
    <div className="checkout-payment">
      <OrderSummary checkout={checkout} address={address} />

      <section className="payment" aria-labelledby="payment-title">
        <h1 id="payment-title" className="checkout-step__title">
          {t('checkout.payment')}
        </h1>

        <div className="payment__tabs" role="tablist" aria-label={t('checkout.payment')}>
          <button type="button" role="tab" aria-selected="true" className="payment__tab payment__tab--active">
            {t('checkout.creditCard')}
          </button>
          <button type="button" role="tab" aria-selected="false" className="payment__tab" disabled title={t('checkout.notAvailable')}>
            {t('checkout.paypal')}
          </button>
          <button type="button" role="tab" aria-selected="false" className="payment__tab" disabled title={t('checkout.notAvailable')}>
            {t('checkout.paypalCredit')}
          </button>
        </div>

        <form className="cyber-form payment__form" onSubmit={(event) => handleSubmit(onSubmit)(event)} noValidate>
          {cardBanner && <Alert type="error" message={cardBanner} />}
          {banner && <Alert type="error" message={banner} />}
          {addressProblems.length > 0 && (
            <Alert
              type="error"
              message={
                <>
                  {t('checkout.addressInvalid')} {addressProblems.join(' ')}{' '}
                  <Link className="payment__link" to={checkoutPath('address', address.id)}>
                    {t('checkout.editAddress')}
                  </Link>
                </>
              }
            />
          )}
          {stockProblems && (
            <Alert
              type="error"
              message={
                <>
                  {t('checkout.stockProblem')}
                  {stockProblems.length > 0 && (
                    <ul className="payment__stock">
                      {stockProblems.map((item) => (
                        <li key={item.key}>
                          {item.title}
                          {item.available !== null && ` — ${t('checkout.onlyNLeft', { count: item.available })}`}
                        </li>
                      ))}
                    </ul>
                  )}{' '}
                  <Link className="payment__link" to="/cart">
                    {t('checkout.goToCart')}
                  </Link>
                </>
              }
            />
          )}

          <CardPreview number={number} holder={holder} />

          <FormField label={t('checkout.cardholderName')} error={errors.holder?.message} htmlFor="card-holder">
            <Input
              id="card-holder"
              autoComplete="cc-name"
              placeholder={t('checkout.cardholderName')}
              error={errors.holder?.message}
              {...register('holder')}
            />
          </FormField>

          <FormField label={t('checkout.cardNumber')} error={errors.number?.message} htmlFor="card-number">
            <Input
              id="card-number"
              inputMode="numeric"
              autoComplete="cc-number"
              placeholder={t('checkout.cardNumber')}
              error={errors.number?.message}
              {...numberField}
              onChange={(e) => {
                e.target.value = formatCardNumber(e.target.value);
                numberField.onChange(e);
              }}
            />
          </FormField>

          <div className="payment__row">
            <FormField label={t('checkout.expDate')} error={errors.expiry?.message} htmlFor="card-expiry">
              <Input
                id="card-expiry"
                inputMode="numeric"
                autoComplete="cc-exp"
                placeholder={t('checkout.expPlaceholder')}
                maxLength={5}
                error={errors.expiry?.message}
                {...expiryField}
                onChange={(e) => {
                  const deleting = String(e.nativeEvent.inputType ?? '').startsWith('delete');
                  e.target.value = formatExpiry(e.target.value, { deleting });
                  expiryField.onChange(e);
                }}
              />
            </FormField>

            <FormField label={t('checkout.cvv')} error={errors.cvc?.message} htmlFor="card-cvc">
              <Input
                id="card-cvc"
                type="password"
                inputMode="numeric"
                autoComplete="cc-csc"
                placeholder={t('checkout.cvv')}
                maxLength={4}
                error={errors.cvc?.message}
                {...cvcField}
                onChange={(e) => {
                  e.target.value = e.target.value.replace(/\D/g, '').slice(0, 4);
                  cvcField.onChange(e);
                }}
              />
            </FormField>
          </div>

          <div className="payment__actions">
            <ActionButton to={checkoutPath('shipping', address.id)} variant="outline" disabled={isSubmitting}>
              {t('common.back')}
            </ActionButton>
            <ActionButton type="submit" isLoading={isSubmitting}>
              {t('checkout.pay')}
            </ActionButton>
          </div>
        </form>
      </section>
    </div>
  );
}
