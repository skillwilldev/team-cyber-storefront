import { useId, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCreateAddress, useUpdateAddress } from '@api/addressQueries';
import ActionButton from '@/components/ActionButton/ActionButton';
import { addressSchema } from '@shared/lib/validators';
import { Alert, FormField, Input, useToast } from '@shared/ui';
import { useAuth } from '@features/auth/hooks/useAuth';
import { getGenericMessage } from '@features/checkout/lib/checkoutErrors';
import { useTranslation } from 'react-i18next';
import {
  MAX_ADDRESSES,
  applyServerErrors,
  buildCreateBody,
  buildPatch,
  hasChanges,
  toFormValues,
} from '../../lib/addressForm';
import '@/styles/cyber-form.css';
import './AddressForm.css';

/**
 * Add / edit one delivery address.
 *
 *   <AddressForm isFirst onSaved={(address) => …} />                 → POST /addresses
 *   <AddressForm address={a} onSaved={…} onCancel={…} />             → PATCH /addresses/:id (only changed fields)
 *
 * Server errors: 422 → under the field, 409 ADDRESS_LIMIT_REACHED → banner, 404 ADDRESS_NOT_FOUND → the address was
 * removed elsewhere (the list reloads itself). The first address is always the default one — no checkbox for it,
 * and the default address cannot be un-defaulted (the server answers 422) — so there is no checkbox there either.
 */
export default function AddressForm({ address, isFirst = false, onSaved, onCancel }) {
  'use no memo';
  const uid = useId();
  const { user } = useAuth();
  const toast = useToast();
  const { t } = useTranslation();
  const create = useCreateAddress();
  const update = useUpdateAddress();
  const [banner, setBanner] = useState('');
  const isEdit = Boolean(address);
  const showDefaultCheckbox = !isFirst && !address?.isDefault;

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, dirtyFields, isSubmitting },
  } = useForm({
    resolver: zodResolver(addressSchema),
    defaultValues: toFormValues(address, { user, isFirst }),
    mode: 'onSubmit',
    reValidateMode: 'onChange',
  });

  const onSubmit = async (values) => {
    setBanner('');

    try {
      let saved;
      if (isEdit) {
        const patch = buildPatch({ dirtyFields, values, initial: address });
        if (!patch) {
          onCancel?.();
          return;
        }
        saved = (await update.mutateAsync({ id: address.id, ...patch })).address;
      } else {
        saved = (await create.mutateAsync(buildCreateBody(values))).address;
      }
      toast.success(isEdit ? t('addresses.updated') : t('addresses.added'));
      onSaved?.(saved);
    } catch (err) {
      if (err.code === 'VALIDATION_ERROR' && err.errors) {
        const orphans = applyServerErrors(err.errors, setError);
        if (orphans.length) setBanner(orphans.join(' '));
      } else if (err.code === 'ADDRESS_LIMIT_REACHED') {
        setBanner(t('addresses.limitError', { max: MAX_ADDRESSES }));
      } else if (err.code === 'ADDRESS_NOT_FOUND') {
        toast.error(t('addresses.notFound'));
        onCancel?.();
      } else if (err.code !== 'TOKEN_EXPIRED') {
        setBanner(getGenericMessage(err, t));
      }
    }
  };

  const id = (name) => `${uid}-${name}`;

  return (
    <form className="cyber-form address-form" onSubmit={handleSubmit(onSubmit)} noValidate>
      {banner && <Alert type="error" message={banner} />}

      <div className="address-form__grid">
        <FormField label={t('addresses.fullName')} error={errors.fullName?.message} htmlFor={id('fullName')} required>
          <Input
            id={id('fullName')}
            autoComplete="name"
            placeholder={t('addresses.phFullName')}
            error={errors.fullName?.message}
            {...register('fullName')}
          />
        </FormField>

        <FormField label={t('addresses.phone')} error={errors.phone?.message} htmlFor={id('phone')} required>
          <Input
            id={id('phone')}
            type="tel"
            autoComplete="tel"
            placeholder={t('addresses.phPhone')}
            error={errors.phone?.message}
            {...register('phone')}
          />
        </FormField>

        <FormField label={t('addresses.city')} error={errors.city?.message} htmlFor={id('city')} required>
          <Input
            id={id('city')}
            autoComplete="address-level2"
            placeholder={t('addresses.phCity')}
            error={errors.city?.message}
            {...register('city')}
          />
        </FormField>

        <FormField label={t('addresses.address')} error={errors.address?.message} htmlFor={id('address')} required>
          <Input
            id={id('address')}
            autoComplete="street-address"
            placeholder={t('addresses.phAddress')}
            error={errors.address?.message}
            {...register('address')}
          />
        </FormField>

        <FormField label={t('addresses.labelOptional')} error={errors.label?.message} htmlFor={id('label')}>
          <Input
            id={id('label')}
            autoComplete="off"
            placeholder={t('addresses.phLabel')}
            maxLength={30}
            error={errors.label?.message}
            {...register('label')}
          />
        </FormField>

        {showDefaultCheckbox && (
          <label className="cyber-check address-form__default">
            <input type="checkbox" {...register('isDefault')} />
            {t('addresses.useAsDefault')}
          </label>
        )}
      </div>

      <div className="address-form__actions">
        <ActionButton type="submit" isLoading={isSubmitting} disabled={isEdit && !hasChanges(dirtyFields)}>
          {isEdit ? t('addresses.saveChanges') : t('addresses.saveAddress')}
        </ActionButton>
        {onCancel && (
          <ActionButton variant="outline" onClick={onCancel} disabled={isSubmitting}>
            {t('common.cancel')}
          </ActionButton>
        )}
      </div>
    </form>
  );
}
