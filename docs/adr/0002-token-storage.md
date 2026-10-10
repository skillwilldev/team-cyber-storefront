# ADR 0002: Where to store the access token

- **Status:** Accepted
- **Date:** 2026-10-11
- **Ticket:** FE-002

## Context

After `POST /auth/login` or `POST /auth/register` the API returns `{ accessToken, user }` in the **JSON body**. Every protected request must send the token as `Authorization: Bearer <token>`. The token has to survive a page refresh, otherwise the user would have to sign in again every time.

The token must be stored somewhere in the browser. The realistic options are `localStorage` or an **httpOnly cookie**. The main security question is **XSS** (cross-site scripting): if an attacker manages to run a script on the page, which storage can that script read?

Constraints:

- The API is a separate service on another domain (`shop-api-kbe6.onrender.com`) and hands the token out in the response body, not through `Set-Cookie`.
- The front end cannot change the API.

## Decision

Store the token in **`localStorage`** under the key `accessToken`, and send it in the `Authorization` header from one place: `apiRequest()` in `src/shared/api/apiClient.js`.

Helpers: `getToken()`, `setToken()`, `removeToken()`.

To reduce the damage of the known XSS risk, the following rules are applied:

1. **One place touches the token.** Only `apiClient.js` and `AuthProvider` read or write it.
2. **Public requests do not carry the token** (`auth: false` for the catalog), so an expired or invalid token can never break browsing.
3. **Session loss is handled centrally.** On `401` with `TOKEN_EXPIRED` or `INVALID_TOKEN` the token is removed and the user is redirected to `/login`. The exceptions are `POST /auth/login`, `POST /auth/register` (a 401 there is a normal form error) and the startup check `GET /auth/me`, which `AuthProvider` handles by itself.
4. **Logout always removes the token**, even if `POST /auth/logout` fails (`try / finally`), and also clears the cached cart so the next person on the same browser sees nothing.
5. **Short-lived secrets stay out of storage.** The password-reset `resetToken` lives only in component state and is never written to `localStorage`.
6. **No dangerous rendering paths.** The code base does not use `dangerouslySetInnerHTML`, `innerHTML` or `eval`; React escapes all rendered text by default. The only script in `index.html` is the Vite module entry.
7. **Few third-party scripts.** Dependencies are limited to the packages in `package.json`.

## Alternatives considered

| Option | Pros | Why it was not chosen |
| --- | --- | --- |
| **httpOnly, Secure, SameSite cookie** | JavaScript cannot read it, so an XSS attack cannot steal the token. This is the more secure option. | The API returns the token in the response body and expects a Bearer header; it does not set cookies. Using cookies would also need server support for `credentials: 'include'`, a strict CORS configuration and **CSRF protection**. These are back-end changes outside this project. |
| `sessionStorage` | Cleared when the tab closes. | Same XSS exposure as `localStorage`, and the user would be signed out every time a new tab is opened. |
| Token only in memory (React state) | Not readable from storage. | The user would be signed out on every refresh; unacceptable for a shop. |

## Consequences

**Positive**

- Simple and works with the existing API without changes.
- Easy to debug and to test.
- Session restore on refresh is one request (`GET /auth/me`) in `AuthProvider`.

**Negative / risk accepted**

- **Any script that runs on the page can read the token.** If an XSS hole ever appears (for example through a compromised dependency or unsafe HTML rendering), the token can be stolen. This is the main risk of the decision.
- Tokens in `localStorage` are shared between all tabs of the same origin.

**If the API changes later**

If the back end starts issuing the token as an httpOnly cookie, `apiClient.js` should switch to `credentials: 'include'`, `getToken` / `setToken` / `removeToken` should be removed, and CSRF protection should be added together with the server. This ADR would then be superseded by a new one.
