import { MinusIcon, PlusIcon } from '@/components/icons/icons';
import { MIN_QTY } from '../../lib/cartRules';
import './QuantityStepper.css';

/**
 * − [qty] +   Bounds: "−" is disabled at 1 (0 is not allowed — use "remove"), "+" at `max` (stock or 99).
 * `disabled` is set by the parent while a request is in flight (see docs/adr/0003-cart-quantity-stepper.md).
 */
export default function QuantityStepper({ qty, max, disabled = false, label, onChange }) {
  return (
    <div className="qty-stepper" role="group" aria-label={`Quantity: ${label}`}>
      <button
        type="button"
        aria-label={`Decrease quantity of ${label}`}
        disabled={disabled || qty <= MIN_QTY}
        onClick={() => onChange(qty - 1)}
      >
        <MinusIcon size={16} />
      </button>
      <output aria-live="polite">{qty}</output>
      <button
        type="button"
        aria-label={`Increase quantity of ${label}`}
        disabled={disabled || qty >= max}
        onClick={() => onChange(qty + 1)}
      >
        <PlusIcon size={16} />
      </button>
    </div>
  );
}
