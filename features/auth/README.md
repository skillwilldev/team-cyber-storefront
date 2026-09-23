# Cyber Storefront — Auth Module

Full-featured authentication UI with real API integration. Built as a portable, reusable module that can be dropped into any React project.

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Path Aliases](#path-aliases)
- [Design System](#design-system)
- [Shared UI Components](#shared-ui-components)
- [Validation Schemas](#validation-schemas)
- [API Client](#api-client)
- [Authentication Flow](#authentication-flow)
- [Pages](#pages)
- [Routing & Navigation](#routing--navigation)
- [Error Handling](#error-handling)
- [Password Reset Flow](#password-reset-flow)
- [Responsive Design](#responsive-design)
- [Accessibility](#accessibility)
- [Architecture Decisions](#architecture-decisions)

---

## Overview

This project implements three authentication screens — **Login**, **Register**, and **Forgot Password** — connected to a live REST API. It was built following **FE-001** (markup + client-side validation) and **FE-002** (API integration) specifications.

**Key principles:**
- Every reusable piece lives in `src/shared/ui/` — the same components will be used by cart, checkout, and profile features later
- No hardcoded colors or sizes — everything comes from CSS custom property tokens
- One centralized API client — no `fetch()` calls inside components
- Three auth states (`loading → authenticated | unauthenticated`) — no login screen flash on page refresh

---

## Tech Stack

| Technology | Version | Purpose |
|-----------|---------|---------|
| [React](https://react.dev) | 19.x | UI library |
| [Vite](https://vite.dev) | 8.x | Build tool & dev server |
| [React Router DOM](https://reactrouter.com) | 7.x | Client-side routing (`BrowserRouter`) |
| [React Hook Form](https://react-hook-form.com) | 7.x | Form state management, validation, error handling |
| [Zod](https://zod.dev) | 3.x | Schema-based validation (used with `@hookform/resolvers`) |
| [@hookform/resolvers](https://github.com/react-hook-form/resolvers) | 5.x | Connects Zod schemas to React Hook Form |
| Vanilla CSS | — | Styling with BEM naming convention |
| CSS Custom Properties | — | Design tokens (colors, spacing, typography, shadows) |

**No additional UI libraries.** All icons are hand-crafted SVG React components — zero icon library dependencies.

---

## Project Structure

```
src/
├── main.jsx                              # App entry point
├── index.css                             # Design tokens + global CSS reset
├── App.jsx                               # Root: AuthProvider + BrowserRouter + Routes
├── App.css                               # Page layout (centered card, gradient background)
│
├── shared/                               # Reusable across all features
│   ├── ui/                               # UI component library
│   │   ├── Icons/
│   │   │   └── Icons.jsx                 # 13 SVG icons as React components
│   │   ├── Button/
│   │   │   ├── Button.jsx                # Primary/secondary variants, loading state
│   │   │   └── Button.css
│   │   ├── Input/
│   │   │   ├── Input.jsx                 # Text input with icon, error state, forwardRef
│   │   │   └── Input.css
│   │   ├── PasswordInput/
│   │   │   ├── PasswordInput.jsx         # Password field with show/hide toggle, forwardRef
│   │   │   └── PasswordInput.css
│   │   ├── FormField/
│   │   │   ├── FormField.jsx             # Label + input wrapper + error message
│   │   │   └── FormField.css
│   │   ├── Alert/
│   │   │   ├── Alert.jsx                 # Success/error/warning banner
│   │   │   └── Alert.css
│   │   └── index.js                      # Barrel export for all UI components
│   │
│   ├── api/
│   │   └── apiClient.js                  # Centralized fetch wrapper, token management
│   │
│   └── lib/
│       └── validators.js                 # 5 Zod schemas for all forms
│
├── features/
│   └── auth/
│       ├── context/
│       │   └── AuthContext.jsx            # Auth state provider (3 states)
│       ├── components/
│       │   └── ProtectedRoute.jsx         # Route guard with redirect memory
│       ├── pages/
│       │   ├── LoginPage/
│       │   │   ├── LoginPage.jsx
│       │   │   └── LoginPage.css          # Shared auth page styles (used by all pages)
│       │   ├── RegisterPage/
│       │   │   ├── RegisterPage.jsx
│       │   │   └── RegisterPage.css
│       │   ├── ForgotPasswordPage/
│       │   │   ├── ForgotPasswordPage.jsx # 3-step flow on a single URL
│       │   │   └── ForgotPasswordPage.css
│       │   └── HomePage/
│       │       ├── HomePage.jsx           # Minimal post-login page
│       │       └── HomePage.css
│       └── index.js                       # Barrel export for auth feature
│
├── .env                                   # VITE_API_URL
└── vite.config.js                         # Vite config with path aliases
```

---

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

The app runs at `http://localhost:5173` by default.

---

## Path Aliases

Configured in `vite.config.js` to eliminate deep relative imports:

| Alias | Resolves To | Example |
|-------|-------------|---------|
| `@` | `src/` | `import App from '@/App'` |
| `@shared` | `src/shared/` | `import { Button } from '@shared/ui'` |
| `@features` | `src/features/` | `import { useAuth } from '@features/auth/context/AuthContext'` |

---

## Design System

All visual values are defined as **CSS custom properties** in `src/index.css`. Nothing is hardcoded in component styles.

### Color Tokens

| Token | Value | Usage |
|-------|-------|-------|
| `--color-primary` | `#4F46E5` (Indigo 600) | Buttons, links, focus rings |
| `--color-primary-hover` | `#4338CA` (Indigo 700) | Button hover state |
| `--color-primary-light` | `#EEF2FF` (Indigo 50) | Light backgrounds |
| `--color-primary-ring` | `rgba(79,70,229,0.18)` | Focus ring shadow |
| `--color-error` | `#DC2626` (Red 600) | Error borders, text |
| `--color-error-light` | `#FEF2F2` (Red 50) | Error alert background |
| `--color-success` | `#059669` (Emerald 600) | Success icons |
| `--color-success-light` | `#ECFDF5` (Emerald 50) | Success alert background |
| `--color-warning` | `#D97706` (Amber 600) | Dev code banner |
| `--color-bg` | `#F1F5F9` (Slate 100) | Page background |
| `--color-surface` | `#FFFFFF` | Card background |
| `--color-text` | `#111827` (Gray 900) | Primary text |
| `--color-text-secondary` | `#4B5563` (Gray 600) | Subtitles |
| `--color-text-muted` | `#9CA3AF` (Gray 400) | Placeholders, icons |
| `--color-border` | `#D1D5DB` (Gray 300) | Input borders |

### Spacing Scale

| Token | Value |
|-------|-------|
| `--space-1` | 4px |
| `--space-2` | 8px |
| `--space-3` | 12px |
| `--space-4` | 16px |
| `--space-5` | 20px |
| `--space-6` | 24px |
| `--space-8` | 32px |
| `--space-10` | 40px |

### Typography

- **Font family:** Inter (Google Fonts), with system-ui fallback
- **Sizes:** `--font-size-xs` (12px) through `--font-size-2xl` (24px)
- **Weights:** 400 (normal), 500 (medium), 600 (semibold), 700 (bold)

### Other Tokens

- **Border radius:** `--radius-sm` (8px), `--radius-md` (12px), `--radius-lg` (16px)
- **Shadows:** `--shadow-xs` through `--shadow-xl`
- **Transitions:** `--transition-fast` (150ms), `--transition-normal` (200ms), `--transition-slow` (300ms)

---

## Shared UI Components

All live in `src/shared/ui/`. Import via barrel:

```jsx
import { Button, Input, PasswordInput, FormField, Alert, IconMail } from '@shared/ui';
```

### `<Button>`

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ReactNode` | — | Button content |
| `variant` | `'primary' \| 'secondary'` | `'primary'` | Visual style |
| `isLoading` | `boolean` | `false` | Shows spinner, disables button |
| `disabled` | `boolean` | `false` | Disabled state |
| `type` | `'submit' \| 'button' \| 'reset'` | `'submit'` | HTML button type |
| `onClick` | `function` | — | Click handler |

**States:** default → hover → active → focus (ring) → disabled → loading (spinner).
Button width does **not** change when switching to loading state.

### `<Input>`

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `id` | `string` | — | HTML id |
| `type` | `string` | `'text'` | Input type |
| `placeholder` | `string` | — | Placeholder text |
| `error` | `string` | — | Truthy = error state (red border) |
| `disabled` | `boolean` | `false` | Disabled state |
| `icon` | `Component` | — | Icon component rendered on the left |
| `...rest` | — | — | Spread from React Hook Form `register()` |

Uses `React.forwardRef` so React Hook Form can attach its ref to the DOM element.

### `<PasswordInput>`

Same props as `Input` (minus `type` and `icon` — hardcoded to password + lock icon).

**Additional behavior:**
- Show/hide toggle button with `<IconEye>` / `<IconEyeOff>`
- `aria-label` updates: "Show password" ↔ "Hide password"
- Uses `React.forwardRef` for React Hook Form compatibility

### `<FormField>`

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | — | Field label |
| `error` | `string` | — | Error message (shown below input) |
| `htmlFor` | `string` | — | Links label to input |
| `children` | `ReactNode` | — | The input component |
| `required` | `boolean` | `false` | Shows red asterisk |

Error message appears with a slide-in animation and includes an `AlertCircle` icon. Uses `role="alert"` for screen readers.

### `<Alert>`

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `type` | `'success' \| 'error' \| 'warning'` | `'success'` | Alert style |
| `message` | `string` | — | Message to display |

Returns `null` if `message` is falsy. Uses `role="alert"` and `aria-live="polite"`.

### Icons

13 SVG icons as React components in `Icons/Icons.jsx`:

`IconMail`, `IconLock`, `IconUser`, `IconEye`, `IconEyeOff`, `IconAlertCircle`, `IconCheckCircle`, `IconLoader`, `IconArrowLeft`, `IconKeyRound`, `IconShield`, `IconLogOut`, `IconTerminal`

Each accepts `className` and `size` (default 20). All use `currentColor` — color is controlled by parent CSS.

---

## Validation Schemas

Defined in `src/shared/lib/validators.js` using Zod:

### `loginSchema`

| Field | Rules |
|-------|-------|
| `email` | Required, valid email format |
| `password` | Required only (no strength rules — user's existing password may predate current policy) |

### `registerSchema`

| Field | Rules |
|-------|-------|
| `name` | Minimum 2 characters |
| `email` | Required, valid email format |
| `password` | Minimum 8 characters, at least 1 letter, at least 1 digit |
| `confirmPassword` | Must match `password` |

### `forgotPasswordSchema`

| Field | Rules |
|-------|-------|
| `email` | Required, valid email format |

### `verifyCodeSchema`

| Field | Rules |
|-------|-------|
| `code` | Required, exactly 6 digits |

### `resetPasswordSchema`

| Field | Rules |
|-------|-------|
| `password` | Minimum 8 characters, at least 1 letter, at least 1 digit |

> **Important:** Login intentionally does NOT validate password strength. This is by design — a user's existing password may have been created under an older policy.

---

## API Client

`src/shared/api/apiClient.js` — the **only** file that touches `fetch` and `localStorage`.

### Exports

| Function | Description |
|----------|-------------|
| `apiRequest(endpoint, options)` | Central fetch wrapper — attaches token, parses JSON, throws `ApiError` |
| `getToken()` | Read `accessToken` from localStorage |
| `setToken(token)` | Save `accessToken` to localStorage |
| `removeToken()` | Delete `accessToken` from localStorage |
| `ApiError` | Custom error class with `status`, `code`, `message`, `errors` |

### How it works

1. Reads token from `localStorage` and attaches `Authorization: Bearer <token>` header
2. Sends request to `VITE_API_URL + endpoint`
3. Parses JSON response
4. If `!response.ok` — throws `ApiError` with structured data
5. On `401 TOKEN_EXPIRED` (except auth endpoints) — removes token, redirects to `/login`

### Environment Variable

```env
VITE_API_URL=https://shop-api-kbe6.onrender.com/api
```

> Note: `VITE_` variables are not secret — they are embedded in the production bundle.

---

## Authentication Flow

### AuthContext (`src/features/auth/context/AuthContext.jsx`)

Provides three states — **not two**:

| State | `isLoading` | `user` | Meaning |
|-------|-------------|--------|---------|
| Loading | `true` | `null` | Checking token on app startup (GET /auth/me) |
| Authenticated | `false` | `{...}` | Valid token, user data available |
| Unauthenticated | `false` | `null` | No token or token invalid/expired |

**Why three states matter:** Without the loading state, a page refresh would momentarily flash the login screen before confirming the user is authenticated.

### Context API

| Value | Type | Description |
|-------|------|-------------|
| `user` | `object \| null` | Current user data (`id`, `name`, `email`, `createdAt`) |
| `isLoading` | `boolean` | True during initial auth check |
| `isAuthenticated` | `boolean` | `!!user` |
| `login(token, user)` | `function` | Save token + set user |
| `logout()` | `function` | Remove token + clear user |

### On App Startup

1. Check `localStorage` for `accessToken`
2. If no token → set state to unauthenticated immediately
3. If token exists → call `GET /auth/me`
   - `200` → user is authenticated, store user data
   - `401` → token expired/invalid, remove it, set unauthenticated

### ProtectedRoute

`src/features/auth/components/ProtectedRoute.jsx`

- **Loading** → renders a spinner (prevents login flash)
- **Unauthenticated** → `<Navigate to="/login" state={{ from: location }} />` (saves where user was trying to go)
- **Authenticated** → renders children

After login, the user is redirected **back to the page they were trying to access**.

---

## Pages

### Login (`/login`)

- **Fields:** Email, Password (with show/hide toggle)
- **Validation:** `loginSchema` (email format + password required)
- **API:** `POST /auth/login`
- **On success:** Save token → redirect to saved location (or `/`)
- **On 401 INVALID_CREDENTIALS:** Banner: "Incorrect email or password"
- **On 422 VALIDATION_ERROR:** Map server errors to individual fields
- **Navigation:** "Create an account" → `/register`, "Forgot password?" → `/forgot-password`

### Register (`/register`)

- **Fields:** Name, Email, Password, Confirm Password
- **Validation:** `registerSchema` (name min 2, email format, password min 8 + letter + digit, confirm match)
- **API:** `POST /auth/register`
- **On success:** Save token → redirect to `/`
- **On 409 EMAIL_TAKEN:** Error on email field: "This email is already registered"
- **On 422 VALIDATION_ERROR:** Map server errors to fields via `setError()`
- **Navigation:** "Already have an account?" → `/login`

### Forgot Password (`/forgot-password`)

Three steps on a single URL — see [Password Reset Flow](#password-reset-flow).

### Home (`/`)

- **Protected** by `ProtectedRoute`
- Shows user info: name, email, ID, creation date
- Sign Out button (removes token, redirects to `/login`)

---

## Routing & Navigation

| Route | Page | Auth Required |
|-------|------|---------------|
| `/login` | LoginPage | No |
| `/register` | RegisterPage | No |
| `/forgot-password` | ForgotPasswordPage | No |
| `/` | HomePage | Yes (ProtectedRoute) |

**Navigation links:**

| From | Link Text | To |
|------|-----------|-----|
| `/login` | "Create an account" | `/register` |
| `/login` | "Forgot password?" | `/forgot-password` |
| `/register` | "Already have an account? Sign in" | `/login` |
| `/forgot-password` | "Back to sign in" | `/login` |

---

## Error Handling

### Two Layers of Validation

1. **Client-side (Zod):** Instant feedback, runs before any API call
2. **Server-side (API):** The source of truth — server errors supplement client errors, never replace them

### Error Display Strategy

| Error Type | Where Displayed |
|-----------|-----------------|
| Field validation (422, EMAIL_TAKEN) | Below the specific field + red border |
| Form-level (INVALID_CREDENTIALS, network) | Alert banner above the form |

### Validation Behavior

- **Validate on submit** — first attempt shows all errors
- **After first submit, re-validate on change** — errors clear as user fixes them (via RHF `mode: 'onSubmit'` + `reValidateMode: 'onChange'`)
- **Submit button is never disabled** on invalid form — let the user submit and show what's wrong
- **Focus jumps to first invalid field** on submit

### Server Error Codes

| Code | HTTP Status | Handling |
|------|-------------|----------|
| `VALIDATION_ERROR` | 422 | Map `errors` object to form fields |
| `EMAIL_TAKEN` | 409 | Error on email field |
| `INVALID_CREDENTIALS` | 401 | Banner above form |
| `TOKEN_EXPIRED` | 401 | Central: remove token, redirect to `/login` |
| `INVALID_RESET_CODE` | 400 | Error on code field |
| `TOO_MANY_ATTEMPTS` | 429 | Banner + redirect back to step 1 |
| `RESET_TOKEN_USED` | 400 | Banner message |

---

## Password Reset Flow

Three steps on a single URL (`/forgot-password`), managed by component state:

### Step 1 — Request Code

- **Form:** Email
- **API:** `POST /auth/forgot-password`
- **Response:** Always 200 — never reveals whether the email is registered (prevents account enumeration)
- **On success:** Shows neutral message + dev code banner (for testing), advances to step 2

### Step 2 — Verify Code

- **Form:** 6-digit verification code
- **API:** `POST /auth/verify-reset-code` with `{ email, code }`
- **On success:** Receives `resetToken` (stored in **component state only** — NOT localStorage), advances to step 3
- **On 400 INVALID_RESET_CODE:** Error on code field
- **On 429 TOO_MANY_ATTEMPTS:** Banner + auto-redirect to step 1

### Step 3 — New Password

- **Form:** New password (min 8 chars, 1 letter, 1 digit)
- **API:** `POST /auth/reset-password` with `{ resetToken, password }`
- **On success:** Success screen with "Back to sign in" link
- **On 400 RESET_TOKEN_USED:** Banner message

> **Security note:** The `resetToken` is one-time-use with a 10-minute TTL. It is intentionally stored in component state (lost on navigation) rather than localStorage.

> **Testing note:** The API returns `devCode` in the response for testing purposes. It is displayed in a warning-styled banner but is never auto-filled into the code input.

---

## Responsive Design

The layout adapts to three breakpoints:

| Viewport | Behavior |
|----------|----------|
| **≤ 400px** (mobile) | Full-screen layout, no card border/shadow, no border-radius |
| **401–639px** (small) | Centered card with standard padding |
| **≥ 640px** (desktop) | Centered card with larger padding, max-width 440px |

The background uses a subtle gradient: `linear-gradient(135deg, #EEF2FF, #F1F5F9, #F0FDF4)`.

---

## Accessibility

- **Keyboard navigation:** All interactive elements are reachable via Tab
- **Visible focus rings:** Custom `:focus-visible` styles with `outline: 2px solid var(--color-primary)`
- **ARIA attributes:**
  - `aria-invalid="true"` on inputs in error state
  - `aria-label` on password toggle button (updates with state)
  - `role="alert"` on error messages and alert banners
  - `aria-live="polite"` on alert banners
  - `aria-hidden="true"` on decorative required asterisks
- **Semantic HTML:** `<form>`, `<label>`, `<button>`, proper heading hierarchy (`<h1>` per page)
- **No disabled submit buttons** on invalid forms — let users submit and see what's wrong

---

## Architecture Decisions

### Why localStorage for tokens (not httpOnly cookies)?

The API is designed for SPA consumption and returns tokens in the JSON response body. `httpOnly` cookies require server-side `Set-Cookie` headers and CORS configuration that this API doesn't provide.

**Known risk:** localStorage is vulnerable to XSS attacks. If an attacker can execute JavaScript on the page, they can steal the token. Mitigation: sanitize all user inputs, use Content Security Policy headers in production.

### Why `forwardRef` on Input and PasswordInput?

React Hook Form's `register()` returns `{ ref, name, onChange, onBlur }`. The `ref` must reach the actual `<input>` DOM element for RHF to track focus, scroll-to-error, and value reading. Without `forwardRef`, the ref is silently dropped and forms break.

### Why separate Zod schemas (not inline validation)?

- Schemas are testable independently
- Can be shared between client and server
- Changing a validation rule = one file, not hunting through components

### Why 3 auth states instead of 2?

Without a `loading` state, refreshing the page causes:
1. App renders → no user yet → shows login screen
2. `GET /auth/me` returns → user exists → redirects away

This creates a visible flash of the login page. The `loading` state shows a spinner instead until the auth check completes.

### Why CSS custom properties (not Sass/Tailwind)?

- Zero build dependencies for styling
- Runtime-switchable (future dark mode)
- Works with any CSS methodology
- No learning curve for new team members

---

## API Reference

Base URL: `https://shop-api-kbe6.onrender.com/api`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/auth/register` | Create account → returns `{ user, accessToken }` |
| `POST` | `/auth/login` | Sign in → returns `{ user, accessToken }` |
| `GET` | `/auth/me` | Get current user (requires Bearer token) |
| `POST` | `/auth/logout` | Returns 204 (token deletion is client-side) |
| `POST` | `/auth/forgot-password` | Request reset code (always returns 200) |
| `POST` | `/auth/verify-reset-code` | Verify 6-digit code → returns `{ resetToken }` |
| `POST` | `/auth/reset-password` | Set new password using resetToken |

Full API documentation: https://shop-api-kbe6.onrender.com/docs
