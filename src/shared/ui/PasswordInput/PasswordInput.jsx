import { useState } from 'react';
import Input from '../Input/Input';
import { IconLock, IconEye, IconEyeOff } from '../Icons/Icons';
import './PasswordInput.css';

/**
 * Password input with show/hide toggle.
 *
 * @param {object} props
 * @param {string} [props.id]
 * @param {string} [props.placeholder]
 * @param {string} [props.error]
 * @param {boolean} [props.disabled=false]
 * @param {React.Ref} [props.ref]
 * @param {object} rest - spread from RHF register()
 */
function PasswordInput({
  id,
  placeholder = '••••••••',
  error,
  disabled = false,
  ref, // prop
  ...rest
}) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="password-input">
      <Input
        ref={ref}
        id={id}
        type={visible ? 'text' : 'password'}
        placeholder={placeholder}
        error={error}
        disabled={disabled}
        icon={IconLock}
        {...rest}
      />
      <button
        type="button"
        className="password-input__toggle"
        aria-label={visible ? 'Hide password' : 'Show password'}
        onClick={() => setVisible((prev) => !prev)}
        tabIndex={0}
      >
        {visible ? <IconEyeOff size={18} /> : <IconEye size={18} />}
      </button>
    </div>
  );
}

export default PasswordInput;