import { detectBrand } from '../../lib/card';
import { CardChipIcon, ContactlessIcon } from '@/components/icons/checkoutIcons';
import './CardPreview.css';

export default function CardPreview({ number = '', holder = '' }) {
  const brand = detectBrand(number);

  return (
    <div className="card-preview" aria-hidden="true">
      <div className="card-preview__top">
        <CardChipIcon size={20} />
        <ContactlessIcon size={11} className="card-preview__wave" />
      </div>

      <div className="card-preview__number">{number || '•••• •••• •••• ••••'}</div>

      <div className="card-preview__bottom">
        <span className="card-preview__holder">{holder.trim() || 'Cardholder'}</span>
        
        {brand === 'mastercard' && (
          <span className="card-preview__mc">
            <i />
            <i />
          </span>
        )}
        {brand === 'visa' && <span className="card-preview__brand card-preview__visa">VISA</span>}
        {brand === 'mada' && <span className="card-preview__brand card-preview__mada">mada</span>}
        {brand === 'paypak' && <span className="card-preview__brand card-preview__paypak">PayPak</span>}
        {brand === 'jaywan' && <span className="card-preview__brand card-preview__jaywan">Jaywan</span>}
        {brand === 'unionpay' && <span className="card-preview__brand card-preview__unionpay">UnionPay</span>}
        {brand === 'amex' && <span className="card-preview__brand card-preview__amex">AMEX</span>}
        {brand === 'diners' && <span className="card-preview__brand card-preview__diners">Diners Club</span>}
        {brand === 'jcb' && <span className="card-preview__brand card-preview__jcb">JCB</span>}
        {brand === 'discover' && <span className="card-preview__brand card-preview__discover">Discover</span>}
        {brand === 'maestro' && <span className="card-preview__brand card-preview__maestro">Maestro</span>}
        {brand === 'uatp' && <span className="card-preview__brand card-preview__uatp">UATP</span>}
      </div>
    </div>
  );
}