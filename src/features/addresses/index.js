/**
 * Barrel export for the addresses feature (FE-006).
 * The request layer lives in src/api/addressApi.js + addressQueries.js.
 */
export { default as AddressesPage } from './pages/AddressesPage';
export { default as AddressManager } from './components/AddressManager/AddressManager';
export { useAddresses } from './hooks/useAddresses';
export { MAX_ADDRESSES } from './lib/addressForm';
