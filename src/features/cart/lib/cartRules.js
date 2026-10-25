export const MIN_QTY = 1;
export const MAX_QTY = 99;

/** The highest quantity the stepper may reach: the stock, but never more than the API allows (99). */
export const getMaxQty = (product) => Math.min(Math.max(Number(product?.stock) || 0, 0), MAX_QTY);

/**
 * Stock problem of a cart line (somebody bought the product while it was in our cart), or null.
 * A line with a problem blocks the checkout until the user fixes it.
 * If `t` is provided, messages are localized.
 */
export function getStockIssue({ qty, product }, t) {
  if (!product.inStock || !(product.stock > 0))
    return t ? t('cartRules.outOfStockRemove') : 'Out of stock — remove this item to continue';
  if (product.stock < qty)
    return t ? t('cartRules.onlyNReduce', { count: product.stock }) : `Only ${product.stock} in stock — reduce the quantity`;
  return null;
}
