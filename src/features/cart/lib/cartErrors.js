/**
 * API error → short text for the user, in the current language.
 * Decide by `code`, never by `message` (the text may change). `t` comes from useTranslation().
 * Codes: OUT_OF_STOCK, INSUFFICIENT_STOCK (+ data.available), PRODUCT_NOT_FOUND, CART_ITEM_NOT_FOUND, VALIDATION_ERROR.
 */
export function getCartErrorMessage(error, t) {
  // fetch() rejects with a TypeError when there is no network at all
  if (error instanceof TypeError) return t('cartErrors.networkError');

  switch (error?.code) {
    case 'OUT_OF_STOCK':
      return t('cartErrors.outOfStock');
    case 'INSUFFICIENT_STOCK': {
      const available = error.data?.available;
      if (available === 0) return t('cartErrors.outOfStock');
      if (Number.isInteger(available)) return t('cartErrors.onlyNInStock', { count: available });
      return t('cartErrors.notEnoughStock');
    }
    case 'PRODUCT_NOT_FOUND':
      return t('cartErrors.productNotFound');
    case 'CART_ITEM_NOT_FOUND':
      return t('cartErrors.itemNotInCart');
    case 'VALIDATION_ERROR':
      return t('cartErrors.qtyRange');
    default:
      return t('cartErrors.genericError');
  }
}
