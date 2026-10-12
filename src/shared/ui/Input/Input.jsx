import './Input.css';

/**
 * Reusable Input component for React 19.
 */
function Input({
  id,
  type = 'text',
  placeholder,
  error,
  disabled = false,
  icon: Icon,
  className = '',
  ref, // prop
  ...rest
}) {
  const inputClasses = [
    'input',
    Icon ? 'input--with-icon' : '',
    error ? 'input--error' : '',
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className="input-wrapper">
      {Icon && (
        <div className="input-wrapper__icon">
          <Icon size={18} />
        </div>
      )}
      <input
        ref={ref}
        id={id}
        type={type}
        placeholder={placeholder}
        disabled={disabled}
        className={inputClasses}
        aria-invalid={error ? 'true' : 'false'}
        {...rest}
      />
    </div>
  );
}

export default Input;