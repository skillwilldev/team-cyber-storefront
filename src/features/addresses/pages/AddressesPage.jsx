import AddressManager from '../components/AddressManager/AddressManager';
import './AddressesPage.css';

/**
 * /addresses (protected) — "Address" in the profile menu.
 * Add several delivery addresses, edit them, delete them, choose the default one.
 * At checkout step 1 the user picks one of THESE addresses (same data, same component).
 */
export default function AddressesPage() {
  return (
    <>
      <title>My addresses — Cyber</title>
      <div className="container addresses-page">
        <h1 className="addresses-page__title">My addresses</h1>
        <p className="addresses-page__lead">
          Save up to 10 delivery addresses. The default one is preselected when you place an order.
        </p>
        <AddressManager />
      </div>
    </>
  );
}
