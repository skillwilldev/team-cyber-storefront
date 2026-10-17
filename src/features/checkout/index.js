/**
 * Barrel export for the checkout feature (FE-006): 3 steps → code → order page.
 * The request layer lives in src/api/checkoutApi.js + checkoutQueries.js.
 */
export { default as CheckoutLayout } from './pages/CheckoutLayout/CheckoutLayout';
export { default as AddressStep } from './pages/AddressStep/AddressStep';
export { default as ShippingStep } from './pages/ShippingStep/ShippingStep';
export { default as PaymentStep } from './pages/PaymentStep/PaymentStep';
export { default as ConfirmPage } from './pages/ConfirmPage/ConfirmPage';
export { default as OrderPage } from './pages/OrderPage/OrderPage';
export { default as OrdersPage } from './pages/OrdersPage/OrdersPage';
