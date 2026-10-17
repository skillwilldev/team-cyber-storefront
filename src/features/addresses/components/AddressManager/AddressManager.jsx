import { useId, useState } from 'react';
import { useDeleteAddress, useUpdateAddress } from '@api/addressQueries';
import { PlusIcon } from '@/components/icons/checkoutIcons';
import LoadingHint from '@/components/LoadingHint/LoadingHint';
import QueryError from '@/components/QueryError/QueryError';
import { useToast } from '@shared/ui';
import { getGenericMessage } from '@features/checkout/lib/checkoutErrors';
import { useAddresses } from '../../hooks/useAddresses';
import { MAX_ADDRESSES } from '../../lib/addressForm';
import AddressCard from '../AddressCard/AddressCard';
import AddressForm from '../AddressForm/AddressForm';
import './AddressManager.css';

function AddressesSkeleton() {
  return (
    <div aria-busy="true">
      <LoadingHint />
      <div className="addr-manager__skeleton" aria-hidden="true">
        <span className="skeleton" style={{ height: 128 }} />
        <span className="skeleton" style={{ height: 128 }} />
      </div>
    </div>
  );
}

/**
 * The whole "my addresses" UI: list, add, edit, delete, set as default.
 * Used by the Address page (/addresses) and by checkout step 1 — so the two always behave the same.
 *
 *   <AddressManager />                                           Address page
 *   <AddressManager selectable selectedId={id} onSelect={setId} onCreated={(a) => setId(a.id)} />   checkout step 1
 *
 * With no addresses the "add" form is open and cannot be closed — an address is the only way forward at checkout.
 */
export default function AddressManager({ selectable = false, selectedId = null, onSelect, onCreated }) {
  const radioName = useId();
  const toast = useToast();
  const { data, isPending, isError, error, refetch } = useAddresses({ refetchOnMount: 'always' });
  const remove = useDeleteAddress();
  const update = useUpdateAddress();
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [busyId, setBusyId] = useState(null);

  if (isPending) return <AddressesSkeleton />;
  if (isError) return <QueryError message={error.message} onRetry={() => refetch()} />;

  const addresses = data.items;
  const isEmpty = addresses.length === 0;
  const limitReached = addresses.length >= MAX_ADDRESSES;
  const showCreateForm = creating || isEmpty;

  const closeCreate = () => setCreating(false);

  const handleDelete = async (address) => {
    setBusyId(address.id);
    try {
      await remove.mutateAsync({ id: address.id });
      toast.success('Address deleted');
      setConfirmDeleteId(null);
    } catch (err) {
      // 404: it is already gone (another tab) — the list reloads by itself, nothing else to do
      if (err.code === 'ADDRESS_NOT_FOUND') setConfirmDeleteId(null);
      else if (err.code !== 'TOKEN_EXPIRED') toast.error(getGenericMessage(err));
    } finally {
      setBusyId(null);
    }
  };

  const handleSetDefault = async (address) => {
    setBusyId(address.id);
    try {
      await update.mutateAsync({ id: address.id, isDefault: true });
      toast.success('Default address changed');
    } catch (err) {
      if (err.code !== 'TOKEN_EXPIRED') toast.error(getGenericMessage(err));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="addr-manager">
      {!isEmpty && (
        <ul className="addr-manager__list" aria-label="Delivery addresses">
          {addresses.map((address) => (
            <li key={address.id}>
              {editingId === address.id ? (
                <section className="addr-manager__panel" aria-label="Edit address">
                  <h2 className="addr-manager__panel-title">Edit address</h2>
                  <AddressForm
                    address={address}
                    onSaved={() => setEditingId(null)}
                    onCancel={() => setEditingId(null)}
                  />
                </section>
              ) : (
                <AddressCard
                  address={address}
                  selectable={selectable}
                  selected={selectable && selectedId === address.id}
                  radioName={radioName}
                  onSelect={onSelect}
                  onEdit={(id) => {
                    setConfirmDeleteId(null);
                    setEditingId(id);
                  }}
                  onSetDefault={selectable ? undefined : handleSetDefault}
                  isConfirmingDelete={confirmDeleteId === address.id}
                  onAskDelete={setConfirmDeleteId}
                  onCancelDelete={() => setConfirmDeleteId(null)}
                  onConfirmDelete={() => handleDelete(address)}
                  isBusy={busyId === address.id}
                />
              )}
            </li>
          ))}
        </ul>
      )}

      {showCreateForm ? (
        <section className="addr-manager__panel" aria-label={isEmpty ? 'Add your first address' : 'Add new address'}>
          <h2 className="addr-manager__panel-title">{isEmpty ? 'Add your first address' : 'Add new address'}</h2>
          {isEmpty && (
            <p className="addr-manager__hint">
              {selectable
                ? 'You have no saved addresses yet. Add a delivery address to continue.'
                : 'You have no saved addresses yet. Add one — it will be available when you place an order.'}
            </p>
          )}
          <AddressForm
            isFirst={isEmpty}
            onSaved={(address) => {
              closeCreate();
              onCreated?.(address);
            }}
            onCancel={isEmpty ? undefined : closeCreate}
          />
        </section>
      ) : (
        <div className="addr-manager__add">
          <button type="button" onClick={() => setCreating(true)} disabled={limitReached}>
            <span className="addr-manager__add-icon">
              <PlusIcon size={18} />
            </span>
            Add New Address
          </button>
          {limitReached && <p>You have reached the limit of {MAX_ADDRESSES} addresses. Delete one to add another.</p>}
        </div>
      )}
    </div>
  );
}
