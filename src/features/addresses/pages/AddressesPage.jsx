import { useTranslation } from 'react-i18next';
import AddressManager from '../components/AddressManager/AddressManager';
import { MAX_ADDRESSES } from '../lib/addressForm';
import './AddressesPage.css';

/**
 * /addresses (protected) — "Address" in the profile menu.
 * Add several delivery addresses, edit them, delete them, choose the default one.
 * At checkout step 1 the user picks one of THESE addresses (same data, same component).
 */
export default function AddressesPage() {
  const { t } = useTranslation();

  return (
    <>
      <title>{t('addresses.pageTitle')} — Cyber</title>
      <div className="container addresses-page">
        <h1 className="addresses-page__title">{t('addresses.pageTitle')}</h1>
        <p className="addresses-page__lead">
          {t('addresses.lead', { max: MAX_ADDRESSES })}
        </p>
        <AddressManager />
      </div>
    </>
  );
}
