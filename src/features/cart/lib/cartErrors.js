/**
 * API error → short text for the user. Decide by `code`, never by `message` (the text may change).
 * Codes: OUT_OF_STOCK, INSUFFICIENT_STOCK (+ data.available), PRODUCT_NOT_FOUND, CART_ITEM_NOT_FOUND, VALIDATION_ERROR.
 *
 * If a `t` function is passed, the messages are localized. Otherwise English fallback is used.
 */
export function getCartErrorMessage(error, t) {
  // fetch() rejects with a TypeError when there is no network at all
  if (error instanceof TypeError) return t ? t('cartErrors.networkError') : 'Network error. Check your connection and try again.';

  switch (error?.code) {
    case 'OUT_OF_STOCK':
      return t ? t('cartErrors.outOfStock') : 'This product is out of stock';
    case 'INSUFFICIENT_STOCK': {
      const available = error.data?.available;
      if (available === 0) return t ? t('cartErrors.outOfStock') : 'This product is out of stock';
      if (Number.isInteger(available)) return t ? t('cartErrors.onlyNInStock', { count: available }) : `Only ${available} in stock`;
      return t ? t('cartErrors.notEnoughStock') : 'Not enough items in stock';
    }
    case 'PRODUCT_NOT_FOUND':
      return t ? t('cartErrors.productNotFound') : 'This product no longer exists';
    case 'CART_ITEM_NOT_FOUND':
      return t ? t('cartErrors.itemNotInCart') : 'This item is no longer in your cart';
    case 'VALIDATION_ERROR':
      return t ? t('cartErrors.qtyRange') : 'Quantity must be between 1 and 99';
    default:
      return t ? t('cartErrors.genericError') : (error?.message || 'Something went wrong. Please try again.');
  }
}
