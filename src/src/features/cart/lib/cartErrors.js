/**
 * API error → short text for the user. Decide by `code`, never by `message` (the text may change).
 * Codes: OUT_OF_STOCK, INSUFFICIENT_STOCK (+ data.available), PRODUCT_NOT_FOUND, CART_ITEM_NOT_FOUND, VALIDATION_ERROR.
 */
export function getCartErrorMessage(error) {
  // fetch() rejects with a TypeError when there is no network at all
  if (error instanceof TypeError) return 'Network error. Check your connection and try again.';

  switch (error?.code) {
    case 'OUT_OF_STOCK':
      return 'This product is out of stock';
    case 'INSUFFICIENT_STOCK': {
      const available = error.data?.available;
      if (available === 0) return 'This product is out of stock';
      return Number.isInteger(available) ? `Only ${available} in stock` : 'Not enough items in stock';
    }
    case 'PRODUCT_NOT_FOUND':
      return 'This product no longer exists';
    case 'CART_ITEM_NOT_FOUND':
      return 'This item is no longer in your cart';
    case 'VALIDATION_ERROR':
      return 'Quantity must be between 1 and 99';
    default:
      return error?.message || 'Something went wrong. Please try again.';
  }
}
