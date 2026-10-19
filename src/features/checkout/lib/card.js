import { z } from 'zod';

/**
 * Bank-card helpers (FE-006). Pure functions, no React.
 */

export function formatCardNumber(value) {
  const digits = String(value).replace(/\D/g, '').slice(0, 19);
  return digits.replace(/(\d{4})(?=\d)/g, '$1 ');
}

export function formatExpiry(value, { deleting = false } = {}) {
  const digits = String(value).replace(/\D/g, '').slice(0, 4);
  if (digits.length > 2) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  if (digits.length === 2 && !deleting) return `${digits}/`;
  return digits;
}

export function passesLuhn(number) {
  const digits = String(number).replace(/\D/g, '');
  if (!digits) return false;
  let sum = 0;
  let double = false;
  for (let i = digits.length - 1; i >= 0; i -= 1) {
    let d = Number(digits[i]);
    if (double) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
    double = !double;
  }
  return sum % 10 === 0;
}

export function isExpiryValid(expiry, now = new Date()) {
  const match = /^(\d{2})\/(\d{2})$/.exec(expiry);
  if (!match) return false;
  const month = Number(match[1]);
  const year = 2000 + Number(match[2]);
  if (month < 1 || month > 12) return false;
  return year > now.getFullYear() || (year === now.getFullYear() && month >= now.getMonth() + 1);
}

/**
 * Detects the card brand/network by prefix (BIN)
 */
export function detectBrand(number) {
  const digits = String(number).replace(/\D/g, '');
  if (!digits) return null;
  if (/^4/.test(digits)) return 'visa';
  if (/^(5[1-5]|2[2-7])/.test(digits)) return 'mastercard';
  if (/^3[47]/.test(digits)) return 'amex';
  return null;
}

export const cardSchema = z.object({
  number: z
    .string()
    .refine((v) => /^\d{13,19}$/.test(v.replace(/\s/g, '')), 'Card number must have 13–19 digits')
    .refine((v) => passesLuhn(v), 'Enter a valid card number'),
  holder: z.string().trim().min(2, 'Enter the name on the card'),
  expiry: z
    .string()
    .regex(/^\d{2}\/\d{2}$/, 'Use the format MM/YY')
    .refine((v) => isExpiryValid(v), 'The card is expired or the date is not valid'),
  cvc: z.string().regex(/^\d{3,4}$/, 'CVV must be 3 or 4 digits'),
});