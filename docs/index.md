# Project Documentation

This folder contains the technical documentation for our storefront project (architecture, setup guides, and project decisions).

## 📂 Project Modules & Features

### 1. Authentication & API Integration (FE-001 & FE-002)
* **Design System (`src/shared/ui/`):** Reusable, accessible UI components (`Button`, `Input`, `PasswordInput`, `FormField`, `Alert`) with built-in states (loading, focus, error).
* **API Client & JWT Security:** Centralized communication with the **Cyber Storefront API** (`https://shop-api-kbe6.onrender.com/api`). Features automatic `Bearer` token injection, session validation via `GET /auth/me` on startup, and automatic redirect on `401 TOKEN_EXPIRED`.
* **Error Handling Strategy:** Standardized backend error code handling (`INVALID_CREDENTIALS`, `EMAIL_TAKEN`, `VALIDATION_ERROR`, etc.) with user-friendly form mapping and top-level alert banners.
* **Password Recovery Flow:** Complete 3-step secure password reset mechanism supporting email requests, 6-digit code verification (with developer `devCode` support), and final password update via single-use `resetToken`.

### 2. Catalog & Product Page (FE-003)
* **Server-driven filters:** The filter panel is built from `GET /categories/{slug}` (`checkbox`, `radio`, `color`, `range`), so nothing is hard-coded and any category works. The default category slug is set in one place (`DEFAULT_CATEGORY` in `src/lib/catalog.js`).
* **State in the URL:** Filters, sorting, page and search live in the query string (`/?category=smartphones&brand=Apple&sort=price-asc&page=2&q=pro`). Links are shareable, the Back button works and a refresh keeps everything. Multiple values of one filter are comma-separated (OR), different filters combine with AND.
* **Data fetching (TanStack Query):** Query key = the whole request, outdated requests are cancelled via `AbortSignal`, previous results stay on screen (dimmed) while new ones load.
* **UI states:** Skeleton cards while loading, error with a retry button, empty result with a reset button.
* **Product page (`/product/:slug`):** Photo gallery, specs table, price, stock, warranty and related products.

### 3. Cart, Wishlist & User Menu
* **Shop state (`src/features/shop/`):** `ShopProvider` and the `useShop` hook keep the cart and the wishlist of the signed-in user. The API has no cart or wishlist endpoints yet, so the data is stored in `localStorage` per user (`shop:<userId>`). When the API gets these endpoints, only `ShopProvider` needs to change.
* **Guests:** Adding to the cart or wishlist redirects to `/login` and returns the user to the same page after signing in.
* **Header:** After login the user icon is replaced by an avatar circle with the first letter of the name; clicking it opens a dropdown with the name, email, an Account link and Logout. The wishlist and cart icons show counters.
* **Buttons:** The heart on product cards and the *Add to Wishlist* / *Add to Cart* buttons on the product page are connected to the shop state.

### 4. Git Workflow & Repository Structure
* **Branch Strategy:** The **`main`** branch contains only stable releases (used for deployment). All ongoing feature work is done in **`develop`**.
* **Multi-Machine Synchronization:** Before switching machines, commit and push your work. On the other machine run `git fetch`, then `git switch develop` and `git pull` to get the latest changes.
* ⚠️ `git reset --hard origin/main` discards all local uncommitted changes. Use it only when you are sure you want to throw your local work away.