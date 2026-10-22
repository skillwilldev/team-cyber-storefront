/**
 * Checkout errors → what to show. Decide by `code`, never by `message` (the text may change).
 * Codes (POST /orders): VALIDATION_ERROR 422 (errors["card.number"], errors["shipping.phone"]), CARD_DECLINED 402,
 * CART_EMPTY 409, INSUFFICIENT_STOCK 409 (items[]).
 * Codes (confirm / resend): INVALID_PAYMENT_CODE 400, TOO_MANY_ATTEMPTS 429, ORDER_ALREADY_PAID 409,
 * INSUFFICIENT_STOCK 409, RESEND_TOO_SOON 429 (retryAfterSeconds), ORDER_NOT_FOUND 404.
 */

export const NETWORK_ERROR_MESSAGE = 'Network error. Check your connection and try again.';

/** fetch() rejects with a TypeError when there is no network at all */
export const isNetworkError = (error) => error instanceof TypeError;

/**
 * Generic fallback text for an unexpected error.
 * Pass `t` to get it in the current language (the English text is only a fallback outside React).
 * A message that came from the server is shown as the server wrote it (the API is not translated).
 */
export const getGenericMessage = (error, t) => {
  if (isNetworkError(error)) return t ? t('errors.network') : NETWORK_ERROR_MESSAGE;
  return error?.message || (t ? t('errors.generic') : 'Something went wrong. Please try again.');
};

/**
 * INSUFFICIENT_STOCK carries `items[]` — the products that no longer have enough stock.
 * The shape is not documented in detail, so every field is read defensively.
 * → [{ key, title, available }]
 */
export function getStockProblems(error, t) {
  const list = Array.isArray(error?.data?.items) ? error.data.items : [];

  return list.map((item, index) => ({
    key: item?.productId ?? item?.id ?? item?.slug ?? index,
    title: item?.title ?? item?.name ?? item?.slug ?? (t ? t('checkout.stockFallbackTitle') : 'A product from your cart'),
    available: Number.isInteger(item?.available) ? item.available : null,
  }));
}

/**
 * 422 on POST /orders → { fields, shipping, other }
 *   fields    { number: '...', holder: '...' }   for errors["card.*"] → under the card inputs
 *   shipping  ['...']                            for errors["shipping.*"] → the address must be fixed on step 1
 *   other     ['...']                            everything else → banner
 */
export function splitOrderErrors(serverErrors) {
  const result = { fields: {}, shipping: [], other: [] };

  for (const [key, message] of Object.entries(serverErrors ?? {})) {
    if (key.startsWith('card.')) result.fields[key.slice('card.'.length)] = message;
    else if (key.startsWith('shipping.')) result.shipping.push(message);
    else result.other.push(message);
  }

  return result;
}
