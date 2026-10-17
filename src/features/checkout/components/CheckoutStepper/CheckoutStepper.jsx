import { PaymentIcon, PinIcon, ShipmentIcon } from '@/components/icons/checkoutIcons';
import { CHECKOUT_STEPS } from '../../lib/checkoutRoutes';
import './CheckoutStepper.css';

const ICONS = {
  address: PinIcon,
  shipping: ShipmentIcon,
  payment: PaymentIcon
};

/** "Step 1 Address — Step 2 Shipping — Step 3 Payment" bar from the mockups. The current step is black, the rest grey. */
export default function CheckoutStepper({ current }) {
  return (
    <ol className="checkout-steps" aria-label="Checkout progress">
      {CHECKOUT_STEPS.map((step, index) => {
        const Icon = ICONS[step.key];
        const isCurrent = step.key === current;

        return (
          <li
            key={step.key}
            className={`checkout-steps__item${isCurrent ? ' checkout-steps__item--current' : ''}`}
            aria-current={isCurrent ? 'step' : undefined}
          >
            <span className="checkout-steps__icon">
              <Icon size={18} />
            </span>
            <span className="checkout-steps__text">
              <span className="checkout-steps__caption">Step {index + 1}</span>
              <span className="checkout-steps__label">{step.label}</span>
            </span>
          </li>
        );
      })}
    </ol>
  );
}
