import { z } from 'zod';

/**
 * Zod validation schemas for all auth forms.
 * Reusable — import any schema in any form that needs it.
 */

// ---- Login: email required + valid format; password required only ----
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Enter a valid email address'),
  password: z
    .string()
    .min(1, 'Password is required'),
  // No strength rules on login — user's password may be from older policy
});

// ---- Register: name min 2, email valid, password min 8 + letter + digit, confirm match ----
export const registerSchema = z
  .object({
    name: z
      .string()
      .min(2, 'Name must be at least 2 characters'),
    email: z
      .string()
      .min(1, 'Email is required')
      .email('Enter a valid email address'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[a-zA-Z]/, 'Password must contain at least one letter')
      .regex(/\d/, 'Password must contain at least one digit'),
    confirmPassword: z
      .string()
      .min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

// ---- Forgot password step 1: email required + valid ----
export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Enter a valid email address'),
});

// ---- Forgot password step 2: verification code ----
export const verifyCodeSchema = z.object({
  code: z
    .string()
    .min(1, 'Verification code is required')
    .regex(/^\d{6}$/, 'Code must be exactly 6 digits'),
});

// ---- Forgot password step 3: new password ----
export const resetPasswordSchema = z.object({
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[a-zA-Z]/, 'Password must contain at least one letter')
    .regex(/\d/, 'Password must contain at least one digit'),
});

// ---- Profile edit (PATCH /auth/me) — FE-004 ----
// Rules mirror the server. Optional fields: '' is allowed and means "clear" (phone/city/address)
// or "don't change" (newPassword). The confirmation field exists ONLY on the front end.
const optionalMin = (min, message) =>
  z
    .string()
    .trim()
    .refine((v) => v === '' || v.length >= min, message);

export const profileSchema = z
  .object({
    name: z.string().trim().min(2, 'Name must be at least 2 characters'),
    email: z.string().trim().min(1, 'Email is required').email('Enter a valid email address'),
    phone: z
      .string()
      .trim()
      .refine((v) => v === '' || /^\+?[\d\s()-]{9,20}$/.test(v), 'Use a format like +995 555 12 34 56'),
    city: optionalMin(2, 'City must be at least 2 characters'),
    address: optionalMin(5, 'Address must be at least 5 characters'),
    newPassword: z
      .string()
      .refine((v) => v === '' || v.length >= 8, 'Password must be at least 8 characters')
      .refine((v) => v === '' || /[a-zA-Z]/.test(v), 'Password must contain at least one letter')
      .refine((v) => v === '' || /\d/.test(v), 'Password must contain at least one digit'),
    confirmNewPassword: z.string(),
    currentPassword: z.string().min(1, 'Enter your current password to save changes'),
  })
  .refine((d) => d.newPassword === d.confirmNewPassword, {
    message: 'Passwords do not match',
    path: ['confirmNewPassword'],
  });
