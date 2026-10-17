import { Link } from 'react-router-dom';
import { IconLoader } from '@shared/ui';
import './ActionButton.css';

/**
 * Big black / outlined button from the Cyber mockups (Back / Next / Pay, "Go to Checkout").
 *
 *   <ActionButton to="/cart" variant="outline">Back</ActionButton>      → <Link>
 *   <ActionButton type="submit" isLoading={pending}>Pay</ActionButton>  → <button>
 *
 * While `isLoading` the button is disabled (no double click) and the spinner replaces the label's place,
 * so the button never changes its width.
 */
export default function ActionButton({
  children,
  to,
  variant = 'solid',
  type = 'button',
  isLoading = false,
  disabled = false,
  onClick,
  className = '',
}) {
  const classes = ['action-btn', `action-btn--${variant}`, className].filter(Boolean).join(' ');

  if (to && !disabled) {
    return (
      <Link to={to} className={classes} onClick={onClick}>
        {children}
      </Link>
    );
  }

  return (
    <button
      type={type}
      className={classes}
      disabled={disabled || isLoading}
      aria-busy={isLoading || undefined}
      onClick={onClick}
    >
      <span className={isLoading ? 'action-btn__label action-btn__label--hidden' : 'action-btn__label'}>{children}</span>
      {isLoading && <IconLoader className="action-btn__spinner" size={22} />}
    </button>
  );
}
