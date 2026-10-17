import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import ActionButton from '@/components/ActionButton/ActionButton';
import { AddressManager, useAddresses } from '@features/addresses';
import { checkoutPath } from '../../lib/checkoutRoutes';

/**
 * Step 1 — Address.
 * The user picks one of the saved addresses (the default one is preselected), can edit / delete / add addresses
 * right here (the same <AddressManager> as on the Address page). With no address the "add" form is open and
 * "Next" stays disabled: an address is required to go on.
 *
 * Selection = the id of the address, kept in the URL (?address=<id>) when going to the next step.
 * Priority of the preselection: what the user just clicked → ?address= (coming back from step 2/3) → the default address.
 */
export default function AddressStep() {
  const [searchParams] = useSearchParams();
  const { data } = useAddresses();
  const [pickedId, setPickedId] = useState(null);

  const items = data?.items ?? [];
  const exists = (id) => items.some((address) => address.id === id);
  const urlId = searchParams.get('address');
  // the default address is always first in the list
  const selectedId = [pickedId, urlId].find((id) => id && exists(id)) ?? items[0]?.id ?? null;

  return (
    <section className="checkout-step" aria-labelledby="step-address-title">
      <h1 id="step-address-title" className="checkout-step__title">
        Select Address
      </h1>

      <div className="checkout-step__body">
        <AddressManager
          selectable
          selectedId={selectedId}
          onSelect={setPickedId}
          onCreated={(address) => setPickedId(address.id)}
        />
      </div>

      {!selectedId && <p className="checkout-step__hint">Add a delivery address to continue.</p>}

      <div className="checkout-actions">
        <ActionButton to="/cart" variant="outline">
          Back
        </ActionButton>
        <ActionButton to={selectedId ? checkoutPath('shipping', selectedId) : undefined} disabled={!selectedId}>
          Next
        </ActionButton>
      </div>
    </section>
  );
}
