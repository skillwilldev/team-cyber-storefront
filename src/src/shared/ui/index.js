/**
 * Barrel export for shared UI components.
 * Usage: import { Button, Input, PasswordInput, FormField, Alert } from '../shared/ui';
 */

export { default as Button } from './Button/Button';
export { default as Input } from './Input/Input';
export { default as PasswordInput } from './PasswordInput/PasswordInput';
export { default as FormField } from './FormField/FormField';
export { default as Alert } from './Alert/Alert';

// Re-export all icons
export {
  IconMail,
  IconLock,
  IconUser,
  IconEye,
  IconEyeOff,
  IconAlertCircle,
  IconCheckCircle,
  IconLoader,
  IconArrowLeft,
  IconKeyRound,
  IconShield,
  IconLogOut,
  IconTerminal,
} from './Icons/Icons';
