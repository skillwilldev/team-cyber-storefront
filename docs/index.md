# Project Documentation

This folder contains the technical documentation for our storefront project (architecture, setup guides, and project decisions).

## 📂 Project Modules & Features

### 1. Authentication & API Integration (FE-001 & FE-002)
* **Design System (`src/shared/ui/`):** Reusable, accessible UI components (`Button`, `Input`, `PasswordInput`, `FormField`, `Alert`, `Toast`) with built-in states (loading, focus, error).
* **API Client & JWT Security:** Centralized communication with the **Cyber Storefront API** (`https://shop-api-kbe6.onrender.com/api`). Features automatic `Bearer` token injection, session validation via `GET /auth/me` on startup, and automatic redirect to `/login` on `401 TOKEN_EXPIRED` / `INVALID_TOKEN` (see FE-004 for the exact exceptions).
* **Error Handling Strategy:** Standardized backend error code handling (`INVALID_CREDENTIALS`, `EMAIL_TAKEN`, `VALIDATION_ERROR`, etc.) with user-friendly form mapping and top-level alert banners. `ApiError` keeps the full response body in `error.data` (e.g. `available` for `INSUFFICIENT_STOCK`).
* **Password Recovery Flow:** Complete 3-step secure password reset mechanism supporting email requests, 6-digit code verification (with developer `devCode` support), and final password update via single-use `resetToken`.

### 2. Catalog & Product Page (FE-003)
* **Server-driven filters:** The filter panel is built from `GET /categories/{slug}` (`checkbox`, `radio`, `color`, `range`), so nothing is hard-coded and any category works. The default category slug is set in one place (`DEFAULT_CATEGORY` in `src/lib/catalog.js`).
* **State in the URL:** Filters, sorting, page and search live in the query string (`/?category=smartphones&brand=Apple&sort=price-asc&page=2&q=pro`). Links are shareable, the Back button works and a refresh keeps everything. Multiple values of one filter are comma-separated (OR), different filters combine with AND.
* **Search:** The header search is debounced (400 ms, Enter searches immediately). It keeps the current category and filters, and resets the page to 1.
* **Sorting & pagination:** Seven sort options (`rating-desc`, `price-asc`, `price-desc`, `newest`, `oldest`, `popular`, `title-asc`). Changing a filter or the sort returns to page 1. Below the grid the page shows "Showing 13–24 of 40" and the page numbers; the page scrolls to the top when the page changes.
* **Product card:** Image (lazy loaded, `alt` = product title), brand, title, rating with reviews count, price with old price and discount badge, stock state, *Add to Cart* button.
* **Data fetching (TanStack Query):** Query key = the whole request, outdated requests are cancelled via `AbortSignal`, previous results stay on screen (dimmed) while new ones load.
* **UI states:** Skeleton cards while loading, error with a retry button, empty result with a reset button.
* **Product page (`/product/:slug`):** Photo gallery, specs table, price, stock, warranty and related products.

### 3. Wishlist & User Menu
* **Wishlist state (`src/features/shop/`):** `ShopProvider` and the `useShop` hook keep the wishlist of the signed-in user. The API has no wishlist endpoints yet, so the data is stored in `localStorage` per user (`shop:<userId>`). When the API gets these endpoints, only `ShopProvider` needs to change. (The cart is **not** here any more — see FE-005.)
* **Guests:** Adding to the wishlist redirects to `/login` and returns the user to the same page after signing in.
* **Header:** After login the user icon is replaced by an avatar circle with the first letter of the name; clicking it opens a dropdown with the name, email, an Account link and Logout. The wishlist and cart icons show counters.
* **Buttons:** The heart on product cards and the *Add to Wishlist* button on the product page are connected to the wishlist state.

### 4. Profile Edit (FE-004)
* **Page (`/account`, protected):** The form edits name, email, phone, city, address and password via `PATCH /auth/me`. It is filled from the current user in `AuthContext` (loaded by `GET /auth/me`). The saved phone / city / address are used to prefill the shipping address at checkout.
* **Only changed fields are sent:** The request body is built from React Hook Form `dirtyFields` and compared with the user stored on the server (`src/features/auth/lib/profileForm.js`). Reverting a field to its original value sends nothing. An empty phone / city / address is sent as `""` and clears the field on the server.
* **Current password is always required** (even for a name change). It is a regular field at the end of the form — see [ADR-004](./adr/ADR-004-current-password.md) for why it is not a modal.
* **Validation:** Zod `profileSchema` mirrors the server rules (name ≥ 2, valid email, phone format 9–20 chars, city ≥ 2, address ≥ 5, new password ≥ 8 with a letter and a digit). "Repeat new password" is checked on the front end only and is never sent.
* **Server errors go to the right field:** `400 INVALID_CURRENT_PASSWORD` → under *Current password* (the user stays signed in); `409 EMAIL_TAKEN` → under *Email*; `422 VALIDATION_ERROR` → each message under its own field; `422` with `errors._` ("nothing to change") → banner on top.
* **Save button:** Disabled until a profile field changes (typing only the current password does not count); shows a spinner and blocks double submit while saving. After success the password fields are cleared and the form is clean again.
* **Instant update everywhere:** On `200` the returned `user` is written to `AuthContext` with `setUser`, so the Header, UserMenu and any other place showing the name or email update without a page refresh.
* **API client change:** The central session-expired redirect now also applies to `PATCH /auth/me` and to `401 INVALID_TOKEN`. It is skipped only for `POST /auth/login`, `POST /auth/register` and the startup check `GET /auth/me`. A wrong current password is `400`, so it never logs the user out.
* **Layout:** `/account` lives outside the narrow `AuthLayout` and uses a wider card; two-column rows from 640 px, one column below. Checked at 360 / 768 / 1440 px and with keyboard navigation.
* **Demo video:** [FE-004 demo — name change → wrong password → password change → sign in again](https://drive.google.com/file/d/1QC058a6wSEBuauudA5qO5BinIUMseQt9/view?usp=sharing)

### 5. Cart (FE-005)
* **The cart lives on the server.** It is bound to the user, so a page refresh (F5) or another device shows the same cart. Nothing is saved in `localStorage`. Every cart request needs the token (`401` without it).
* **One source of truth:** The cart is a single TanStack Query cache entry `[cart]`, read with `useCart()` (`src/features/cart/hooks/useCart.js`). The header badge, the cart page and the future checkout read the same data. Every cart request returns the **whole updated cart**, which is written straight into the cache with `setQueryData` — no extra `GET /cart`.
* **Totals come from the server:** `lineTotal`, `subtotal` and `totalQty` are never calculated on the front end, so two places can never show different numbers.
* **Request layer:** `src/api/cartApi.js` (plain fetch functions) and `src/api/cartQueries.js` (`cartQuery`, `useAddCartItem`, `useUpdateCartItem`, `useRemoveCartItem`). Two different ids: `productId` (product `id`, only for `POST /cart/items`) and `items[].id` (the cart line, for `PATCH` / `DELETE`).
* **Adding (`useAddToCart`):** Used by the product card and the product page. A guest (or `401 UNAUTHORIZED`) goes to `/login` and returns to the same product page after signing in. Success → the badge updates and a toast "Added to cart" is shown. Adding the same product again increases the quantity (no new line).
* **Cart page (`/cart`, protected):** Lines with image, brand, title, unit price (and old price), quantity stepper, line total and a remove button. Summary with items count and subtotal. Empty cart → "Your cart is empty" with a "Back to catalog" button. The page re-checks the server on every open (`refetchOnMount: always`) while showing the cached cart immediately.
* **Stepper:** `−` is disabled at `1`, `+` at `min(stock, 99)`. `0` is not allowed — the trash button calls `DELETE`. Buttons have `aria-label`s and the number is an `<output aria-live="polite">`.
* **Rapid clicks:** A line is locked while its request is running, and all cart mutations share one TanStack Query `scope`, so they run one after another and the last response is always the newest — see [ADR-005](./adr/ADR-005-cart-quantity-stepper.md).
* **Errors by `code`:** `OUT_OF_STOCK`, `INSUFFICIENT_STOCK` ("Only N in stock", from `error.data.available`), `PRODUCT_NOT_FOUND`, `CART_ITEM_NOT_FOUND`, `VALIDATION_ERROR` and network errors (`src/features/cart/lib/cartErrors.js`). Add errors are shown as toasts, stepper / remove errors as a message under the line. On `404` / `409` the cart is reloaded to get the actual stock.
* **Stock changed by someone else:** If `product.stock < qty` (or the product is out of stock) the line shows a warning and "Go to Checkout" is disabled until the user fixes it.
* **Sign out:** The `[cart]` cache is removed on login and logout, so the next person in the same browser never sees the previous cart (it stays on the server).
* **Header:** The cart icon is a link to `/cart` (also added to the mobile menu, where the icon row is hidden). The badge shows the server `totalQty`.
* **Placeholder:** `/checkout` is a protected stub until FE-006.
* **Not done:** Optimistic update (optional bonus) and a "Clear cart" button (`DELETE /cart` exists in the API).

### 6. Git Workflow & Repository Structure
* **Branch Strategy:** The **`main`** branch contains only stable releases (used for deployment). All ongoing feature work is done in **`develop`**.
* **Multi-Machine Synchronization:** Before switching machines, commit and push your work. On the other machine run `git fetch`, then `git switch develop` and `git pull` to get the latest changes.
* ⚠️ `git reset --hard origin/main` discards all local uncommitted changes. Use it only when you are sure you want to throw your local work away.
