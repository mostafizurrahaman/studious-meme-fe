import { getProductPrimaryImage, type Product } from '@/lib/storefront-types';

export type CartItem = {
  productId?: string;
  sku: string;
  title: string;
  href: Product['href'];
  image: string;
  brand: string;
  unitPrice: number;
  unitPriceLabel: string;
  oldPriceLabel?: string;
  quantity: number;
  sellingUnit?: string;
  weightKg: number;
  isNoCOD: boolean;
  syncedQuantity?: number;
};

export function parseMoney(value: string) {
  return Number(value.replace(/[^0-9.]/g, ''));
}

export function formatMoney(value: number) {
  return `৳ ${value.toLocaleString('en-BD')}`;
}

export function formatPrice(amount: number) {
  return formatMoney(amount);
}

export function resolveSellingUnitLabel(value?: string) {
  const normalized = value?.trim();
  return normalized || 'pcs';
}

export function formatPriceLabelWithUnit(
  value: string | number,
  sellingUnit?: string,
) {
  const label =
    typeof value === 'number'
      ? formatMoney(value)
      : Number.isFinite(Number(value))
        ? formatMoney(Number(value))
        : value;

  return `${label} / ${resolveSellingUnitLabel(sellingUnit)}`;
}

export function formatPriceWithUnit(
  value: string | number,
  sellingUnit?: string,
) {
  return formatPriceLabelWithUnit(value, sellingUnit);
}

export function toCartItem(product: Product): CartItem {
  return {
    productId: product.id,
    sku: product.sku,
    title: product.title,
    href: product.href,
    image: getProductPrimaryImage(product),
    brand: product.brand,
    unitPrice: parseMoney(product.price),
    unitPriceLabel: formatPriceLabelWithUnit(
      product.price,
      product.sellingUnit,
    ),
    oldPriceLabel: product.oldPrice
      ? formatMoney(parseMoney(product.oldPrice))
      : undefined,
    quantity: 1,
    sellingUnit: product.sellingUnit,
    weightKg: product.weightKg as number,
    isNoCOD: Boolean(product.isNoCOD),
    syncedQuantity: 0,
  };
}
