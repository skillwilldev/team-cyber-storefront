import { IconLoader } from '../Icons/Icons';
import './Button.css';

/**
 * Reusable Button component.
 *
 * @param {object} props
 * @param {React.ReactNode} props.children
 * @param {'primary'|'secondary'} [props.variant='primary']
 * @param {boolean} [props.isLoading=false]
 * @param {boolean} [props.disabled=false]
 * @param {'submit'|'button'|'reset'} [props.type='submit']
 * @param {function} [props.onClick]
 * @param {string} [props.className]
 */
export default function Button({
  children,
  variant = 'primary',
  isLoading = false,
  disabled = false,
  type = 'submit',
  onClick,
  className = '',
}) {
  const classes = [
    'button',
    `button--${variant}`,
    isLoading ? 'button--loading' : '',
    className,
  ].filter(Boolean).join(' ');

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      onClick={onClick}
      className={classes}
    >
      {isLoading && <IconLoader className="button__spinner" size={18} />}
      {children}
    </button>
  );
}
