import { useTranslation } from 'react-i18next';
import { IconAlertCircle } from '../Icons/Icons';
import './FormField.css';

/**
 * FormField wraps a label + input + error message.
 *
 * @param {object} props
 * @param {string} [props.label]
 * @param {string} [props.error] - error message to display below input. A `validation.*` key (from the zod
 *   schemas) is translated here; any other text (e.g. a server message) is shown as it is.
 * @param {string} [props.htmlFor] - links label to input
 * @param {React.ReactNode} props.children - the input element
 * @param {boolean} [props.required=false]
 */
export default function FormField({ label, error, htmlFor, children, required = false }) {
  const { t } = useTranslation();
  const errorText = typeof error === 'string' && error.startsWith('validation.') ? t(error) : error;

  return (
    <div className="form-field">
      {label && (
        <label htmlFor={htmlFor} className="form-field__label">
          {label}
          {required && <span className="form-field__required" aria-hidden="true">*</span>}
        </label>
      )}
      {children}
      {error && (
        <p className="form-field__error" role="alert">
          <IconAlertCircle className="form-field__error-icon" size={14} />
          <span>{errorText}</span>
        </p>
      )}
    </div>
  );
}
