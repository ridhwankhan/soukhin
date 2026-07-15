import { BRAND_CONFIG } from '../config';

/** Price of 0 means the seller has not set a price yet. */
export function isUndeclaredPrice(price: number): boolean {
  return price <= 0;
}

export function formatProductPrice(price: number, salePrice?: number): string {
  const effective = salePrice && salePrice > 0 ? salePrice : price;
  if (isUndeclaredPrice(effective)) return 'UNDECLARED';
  return `${BRAND_CONFIG.currency.symbol}${effective.toLocaleString()}`;
}
