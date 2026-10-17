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
 * Определяет бренд/систему карты по префиксу (BIN)
 */
export function detectBrand(number) {
  const digits = String(number).replace(/\D/g, '');
  if (!digits) return null;

  // 1. Mada (Saudi Arabia) - проверяется первее, т.к. может быть кобейдж с Visa/MC
  if (/^(968209|873646)/.test(digits)) return 'mada';
  if (/^(422818|486094)/.test(digits)) return 'mada'; // Mada Visa
  if (/^(529741|543357)/.test(digits)) return 'mada'; // Mada Mastercard

  // 2. PayPak
  if (/^2205(46|53)/.test(digits)) return 'paypak';

  // 3. Jaywan
  if (/^669010/.test(digits)) return 'jaywan';

  // 4. UnionPay
  if (/^(620108|621423|62)/.test(digits)) return 'unionpay';

  // 5. American Express (AMEX)
  if (/^3[47]/.test(digits)) return 'amex';

  // 6. Diners Club
  if (/^(36|38|30[0-5]|362596)/.test(digits)) return 'diners';

  // 7. JCB
  if (/^35(2[89]|[3-8]\d)/.test(digits)) return 'jcb';

  // 8. Discover
  if (/^(6011|65|64[4-9])/.test(digits)) return 'discover';

  // 9. UATP
  if (/^1354/.test(digits)) return 'uatp';

  // 10. Maestro
  if (/^(50|5[6-8]|6304|6703|6759|6761|6762|6763)/.test(digits)) return 'maestro';

  // 11. Mastercard
  if (/^(5[1-5]|2(2[2-9][1-9]|2[3-9]\d|[3-6]\d\d|7[01]\d|720))/.test(digits)) return 'mastercard';

  // 12. Visa
  if (/^4/.test(digits)) return 'visa';

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