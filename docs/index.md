# Project Documentation

This folder contains the technical documentation for our storefront project (architecture, setup guides, and project decisions).

## 📂 Project Modules & Features

### 1. Authentication & API Integration (FE-001 & FE-002)
* **Design System (`src/shared/ui/`):** Reusable, accessible UI components (`Button`, `Input`, `PasswordInput`, `FormField`, `Alert`) with built-in states (loading, focus, error).
* **API Client & JWT Security:** Centralized communication with the **Cyber Storefront API** (`https://shop-api-kbe6.onrender.com/api`). Features automatic `Bearer` token injection, session validation via `GET /auth/me` on startup, and automatic redirect on `401 TOKEN_EXPIRED`.
* **Error Handling Strategy:** Standardized backend error code handling (`INVALID_CREDENTIALS`, `EMAIL_TAKEN`, `VALIDATION_ERROR`, etc.) with user-friendly form mapping and top-level alert banners.
* **Password Recovery Flow:** Complete 3-step secure password reset mechanism supporting email requests, 6-digit code verification (with developer `devCode` support), and final password update via single-use `resetToken`.