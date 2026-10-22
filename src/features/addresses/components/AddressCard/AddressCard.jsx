import { CloseIcon, PencilIcon } from '@/components/icons/checkoutIcons';
import { useTranslation } from '@/lib/i18n';
import './AddressCard.css';

function Details({ address }) {
  const { t } = useTranslation();

  return (
    <div className="addr-card__details">
      <div className="addr-card__head">
        <span className="addr-card__name">{address.fullName}</span>
        {address.label && <span className="addr-card__tag">{address.label}</span>}
        {address.isDefault && <span className="addr-card__tag addr-card__tag--light">{t('addresses.default')}</span>}
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
  const { t } = useTranslation();

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
        <div className="addr-card__confirm" role="group" aria-label={t('addresses.deleteGroupLabel')}>
          <span>{t('addresses.deleteQuestion')}</span>
          <button type="button" className="addr-card__link" onClick={onCancelDelete} disabled={isBusy}>
            {t('common.cancel')}
          </button>
          <button type="button" className="addr-card__link addr-card__link--danger" onClick={onConfirmDelete} disabled={isBusy}>
            {t('common.delete')}
          </button>
        </div>
      ) : (
        <div className="addr-card__actions">
          {onSetDefault && !address.isDefault && (
            <button type="button" className="addr-card__link" onClick={() => onSetDefault(address)} disabled={isBusy}>
              {t('addresses.setDefault')}
            </button>
          )}
          <button
            type="button"
            className="addr-card__icon"
            aria-label={t('addresses.editAria', { name: address.fullName, address: address.address })}
            onClick={() => onEdit(address.id)}
            disabled={isBusy}
          >
            <PencilIcon size={20} />
          </button>
          <button
            type="button"
            className="addr-card__icon"
            aria-label={t('addresses.deleteAria', { name: address.fullName, address: address.address })}
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
