# Development Journal — Week 1

- Initialized the project and set up the GitHub repository structure.
- Created and configured the ClickUp task tracking board.
- Outlined the primary team tasks and project roadmap.
- **Implemented FE-001:** Built the core design system components (Button, Input, PasswordInput, FormField, Alert) and set up local form validation with focus management.
- **Implemented FE-002:** Integrated Cyber Storefront API (`/auth/login`, `/auth/register`, `/auth/me`, `/auth/logout`) with JWT token handling in `localStorage`.
- **Completed Password Recovery Flow:** Implemented the 3-step password reset mechanism (`forgot-password`, `verify-reset-code` with devCode support, and `reset-password`).
- **Implemented FE-003 (Catalog):** Built the catalog page with server-driven filters, sorting, pagination and search. All state lives in the URL, data fetching uses TanStack Query with skeleton, error and empty states. Added the product page with gallery, specs table and related products.
- **Catalog improvements:** Added a debounced header search (400 ms) that keeps the current filters, brand and rating with reviews count on the product card, the `oldest` sort option, a "Showing X–Y of Z" line under the grid, and a proper `alt` for product images. Removed debug `console.log` calls.
- **Added Cart & Wishlist:** Created the `features/shop` module (`ShopProvider`, `useShop`) that stores the cart and wishlist per user in `localStorage`, since the API has no such endpoints yet. Guests are redirected to `/login` and returned to the same page after signing in.
- **Added User Menu:** After login the header shows an avatar circle with the first letter of the user's name. Clicking it opens a dropdown with the user's name, email, Account link and Logout.
- **Header counters:** The wishlist and cart icons in the header show the number of added items.
- **Product actions:** Connected the heart button on product cards and the Add to Wishlist / Add to Cart buttons on the product page.