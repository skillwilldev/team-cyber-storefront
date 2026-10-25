import { z } from 'zod';

/**
 * Zod validation schemas for all auth forms.
 * Messages are `validation.*` KEYS, not text: <FormField> translates them (ka / en) when it renders the error.
 * Reusable — import any schema in any form that needs it.
 */

// ---- Login: email required + valid format; password required only ----
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'validation.emailRequired')
    .email('validation.emailInvalid'),
  password: z
    .string()
    .min(1, 'validation.passwordRequired'),
  // No strength rules on login — user's password may be from older policy
});

// ---- Register: name min 2, email valid, password min 8 + letter + digit, confirm match ----
export const registerSchema = z
  .object({
    name: z
      .string()
      .min(2, 'validation.nameMin'),
    email: z
      .string()
      .min(1, 'validation.emailRequired')
      .email('validation.emailInvalid'),
    password: z
      .string()
      .min(8, 'validation.passwordMin')
      .regex(/[a-zA-Z]/, 'validation.passwordLetter')
      .regex(/\d/, 'validation.passwordDigit'),
    confirmPassword: z
      .string()
      .min(1, 'validation.confirmRequired'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'validation.passwordsMismatch',
    path: ['confirmPassword'],
  });

// ---- Forgot password step 1: email required + valid ----
export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, 'validation.emailRequired')
    .email('validation.emailInvalid'),
});

// ---- Forgot password step 2: verification code ----
export const verifyCodeSchema = z.object({
  code: z
    .string()
    .min(1, 'validation.codeRequired')
    .regex(/^\d{6}$/, 'validation.codeSixDigits'),
});

// ---- Forgot password step 3: new password ----
export const resetPasswordSchema = z.object({
  password: z
    .string()
    .min(8, 'validation.passwordMin')
    .regex(/[a-zA-Z]/, 'validation.passwordLetter')
    .regex(/\d/, 'validation.passwordDigit'),
});

// ---- Profile edit (PATCH /auth/me) — FE-004 ----
// Rules mirror the server. The profile is name + email + password only: phone and address moved to
// /addresses (FE-006), so they are NOT part of this form any more.
// `newPassword` '' means "don't change". The confirmation field exists ONLY on the front end.
export const profileSchema = z
  .object({
    name: z.string().trim().min(2, 'validation.nameMin'),
    email: z.string().trim().min(1, 'validation.emailRequired').email('validation.emailInvalid'),
    newPassword: z
      .string()
      .refine((v) => v === '' || v.length >= 8, 'validation.passwordMin')
      .refine((v) => v === '' || /[a-zA-Z]/.test(v), 'validation.passwordLetter')
      .refine((v) => v === '' || /\d/.test(v), 'validation.passwordDigit'),
    confirmNewPassword: z.string(),
    currentPassword: z.string().min(1, 'validation.currentPasswordRequired'),
  })
  .refine((d) => d.newPassword === d.confirmNewPassword, {
    message: 'validation.passwordsMismatch',
    path: ['confirmNewPassword'],
  });

// ---- Delivery address (POST / PATCH /addresses) — FE-006 ----
// Rules mirror the server (AddressInput): label ≤ 30 (optional), fullName ≥ 2, phone 9–20 chars,
// city ≥ 2, address ≥ 5. The same phone format is used at checkout (shipping.phone).
export const addressSchema = z.object({
  label: z.string().trim().max(30, 'validation.labelMax'),
  fullName: z.string().trim().min(2, 'validation.fullNameMin'),
  phone: z
    .string()
    .trim()
    .min(1, 'validation.phoneRequired')
    .regex(/^\+?[\d\s()-]{9,20}$/, 'validation.phoneFormat'),
  city: z.string().trim().min(2, 'validation.cityMin'),
  address: z.string().trim().min(5, 'validation.addressMin'),
  isDefault: z.boolean(),
});
