import React from 'react';
import { IconCheckCircle, IconAlertCircle, IconTerminal } from '../Icons/Icons';
import './Alert.css';

/**
 * Alert banner for form-level messages.
 *
 * @param {object} props
 * @param {'success'|'error'|'warning'} [props.type='success']
 * @param {string} props.message - message to display
 * @param {string} [props.className]
 */
export default function Alert({ type = 'success', message, className = '' }) {
  if (!message) return null;

  const iconMap = {
    success: IconCheckCircle,
    error: IconAlertCircle,
    warning: IconTerminal,
  };

  const Icon = iconMap[type] || IconAlertCircle;

  return (
    <div
      role="alert"
      aria-live="polite"
      className={`alert alert--${type} ${className}`}
    >
      <Icon className="alert__icon" size={18} />
      <div className="alert__message">{message}</div>
    </div>
  );
}
