import { CloseIcon, PencilIcon } from '@/components/icons/checkoutIcons';
import './AddressCard.css';

function Details({ address }) {
  return (
    <div className="addr-card__details">
      <div className="addr-card__head">
        <span className="addr-card__name">{address.fullName}</span>
        {address.label && <span className="addr-card__tag">{address.label}</span>}
        {address.isDefault && <span className="addr-card__tag addr-card__tag--light">Default</span>}
      </div>
      <p>
        {address.address}, {address.city}
      </p>
      <p>{address.phone}</p>
    </div>
  );
}

/**
 * One saved address (the card from the "Select Address" mockup).
 *
 *   selectable  → a radio button on the left (checkout step 1); otherwise a plain card (Address page)
 *   Edit (pencil) and Delete (×) are always there; deleting asks for confirmation right inside the card.
 *   onSetDefault → "Set as default" (Address page only)
 */
export default function AddressCard({
  address,
  selectable = false,
  selected = false,
  radioName,
  onSelect,
  onEdit,
  onSetDefault,
  isConfirmingDelete = false,
  onAskDelete,
  onCancelDelete,
  onConfirmDelete,
  isBusy = false,
}) {
  return (
    <div className={`addr-card${selected ? ' addr-card--selected' : ''}`} aria-busy={isBusy || undefined}>
      {selectable ? (
        <label className="addr-card__main">
          <input
            type="radio"
            name={radioName}
            className="addr-card__radio"
            checked={selected}
            onChange={() => onSelect(address.id)}
          />
          <Details address={address} />
        </label>
      ) : (
        <div className="addr-card__main">
          <Details address={address} />
        </div>
      )}

      {isConfirmingDelete ? (
        <div className="addr-card__confirm" role="group" aria-label="Confirm deleting this address">
          <span>Delete this address?</span>
          <button type="button" className="addr-card__link" onClick={onCancelDelete} disabled={isBusy}>
            Cancel
          </button>
          <button type="button" className="addr-card__link addr-card__link--danger" onClick={onConfirmDelete} disabled={isBusy}>
            Delete
          </button>
        </div>
      ) : (
        <div className="addr-card__actions">
          {onSetDefault && !address.isDefault && (
            <button type="button" className="addr-card__link" onClick={() => onSetDefault(address)} disabled={isBusy}>
              Set as default
            </button>
          )}
          <button
            type="button"
            className="addr-card__icon"
            aria-label={`Edit address: ${address.fullName}, ${address.address}`}
            onClick={() => onEdit(address.id)}
            disabled={isBusy}
          >
            <PencilIcon size={20} />
          </button>
          <button
            type="button"
            className="addr-card__icon"
            aria-label={`Delete address: ${address.fullName}, ${address.address}`}
            onClick={() => onAskDelete(address.id)}
            disabled={isBusy}
          >
            <CloseIcon size={22} />
          </button>
        </div>
      )}
    </div>
  );
}
