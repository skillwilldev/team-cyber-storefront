import React, { forwardRef } from 'react';
import './Input.css';

/**
 * Reusable Input component.
 * Uses forwardRef so React Hook Form's register() can attach its ref.
 *
 * @param {object} props
 * @param {string} [props.id]
 * @param {string} [props.type='text']
 * @param {string} [props.placeholder]
 * @param {string} [props.error] - error message (truthy = error state)
 * @param {boolean} [props.disabled=false]
 * @param {React.ComponentType} [props.icon] - icon component to render on left
 * @param {string} [props.className]
 * @param {object} rest - spread from RHF register()
 */
const Input = forwardRef(function Input(
  {
    id,
    type = 'text',
    placeholder,
    error,
    disabled = false,
    icon: Icon,
    className = '',
    ...rest
  },
  ref
) {
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
});

export default Input;
