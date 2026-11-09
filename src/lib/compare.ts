import type { Product } from '@/lib/storefront-types';
import { formatPriceLabelWithUnit } from '@/lib/cart';
import { formatStockLabel } from './stock';
import type { ComparisonHistoryRecord } from '@/services/ComparisonHistory';

export const MAX_COMPARE_ITEMS = 4;

export type CompareSpecRow = {
  label: string;
  values: string[];
};

export type CompareCheck = {
  allowed: boolean;
  message?: string;
};

export function comparisonHistoryRecordToProduct(
  record: ComparisonHistoryRecord,
): Product | null {
  const snapshot = record.productSnapshot;

  if (!snapshot) {
    return null;
  }

  const rawImages: string[] = [];

  if (Array.isArray(snapshot.images)) {
    for (const img of snapshot.images) {
      if (typeof img === 'string' && img.trim().length > 0) {
        rawImages.push(img.trim());
      }
    }
  }

  if (
    rawImages.length === 0 &&
    typeof snapshot.image === 'string' &&
    snapshot.image.trim().length > 0
  ) {
    rawImages.push(snapshot.image.trim());
  }

  if (
    rawImages.length === 0 &&
    typeof record.product === 'object' &&
    record.product !== null &&
    'images' in record.product
  ) {
    const productImages = (record.product as { images?: unknown }).images;
    if (Array.isArray(productImages)) {
      for (const img of productImages) {
        if (typeof img === 'string' && img.trim().length > 0) {
          rawImages.push(img.trim());
        }
      }
    }
  }

  return {
    id: getComparisonHistoryProductId(record) ?? undefined,
    title: snapshot.title,
    slug: snapshot.slug,
    href: '/shop',
    images: rawImages.length > 0 ? rawImages : ['/icon.png'],
    price: String(snapshot.price),
    oldPrice:
      snapshot.oldPrice === undefined ? undefined : String(snapshot.oldPrice),
    brand: snapshot.brand,
    sku: snapshot.sku,
    stock: formatStockLabel(snapshot.stock),
    rating: String(snapshot.rating),
    category: snapshot.category,
    categorySlug: snapshot.categorySlug ?? undefined,
    isFeatured: snapshot.isFeatured,
    isNoCOD: snapshot.isNoCOD,
    sellingUnit: snapshot.sellingUnit,
    weightKg: typeof snapshot.weightKg === 'number' ? snapshot.weightKg : 1,
  };
}

function getCategoryKey(product: Product): string {
  return (product.categorySlug ?? product.category).trim().toLowerCase();
}

export function getComparisonHistoryProductId(
  record: ComparisonHistoryRecord,
): string | null {
  const product = record.product;

  if (typeof product === 'string') {
    return product;
  }

  if (product && typeof product === 'object' && '_id' in product) {
    const id = (product as { _id?: unknown })._id;
    if (typeof id === 'string') {
      return id;
    }
  }

  if (typeof record._id === 'string') {
    return record._id;
  }

  return null;
}

export function canAddToCompare(
  items: Product[],
  product: Product,
): CompareCheck {
  if (items.some((item) => item.sku === product.sku)) {
    return { allowed: true };
  }

  if (items.length >= MAX_COMPARE_ITEMS) {
    return {
      allowed: false,
      message: `You can compare up to ${MAX_COMPARE_ITEMS} products at a time.`,
    };
  }

  if (
    items.length > 0 &&
    getCategoryKey(items[0]) !== getCategoryKey(product)
  ) {
    return {
      allowed: false,
      message: 'You can compare only products from the same category.',
    };
  }

  return { allowed: true };
}

export function buildCompareSpecRows(products: Product[]): CompareSpecRow[] {
  return [
    { label: 'Brand', values: products.map((product) => product.brand) },
    { label: 'Category', values: products.map((product) => product.category) },
    {
      label: 'Price',
      values: products.map((product) =>
        formatPriceLabelWithUnit(product.price, product.sellingUnit),
      ),
    },
    {
      label: 'Old price',
      values: products.map((product) =>
        product.oldPrice
          ? formatPriceLabelWithUnit(product.oldPrice, product.sellingUnit)
          : '—',
      ),
    },
    { label: 'Stock', values: products.map((product) => product.stock) },
    { label: 'Rating', values: products.map((product) => product.rating) },
    { label: 'SKU', values: products.map((product) => product.sku) },
    {
      label: 'Weight',
      values: products.map((product) => `${product.weightKg} kg`),
    },
    {
      label: 'COD',
      values: products.map((product) =>
        product.isNoCOD ? 'Unavailable' : 'Available',
      ),
    },
  ];
}

export function compareProductsSignature(products: Product[]): string {
  return products
    .map((product) =>
      [
        product.sku,
        product.price,
        product.oldPrice ?? '',
        product.stock,
        product.rating,
        product.sellingUnit ?? '',
      ].join('|'),
    )
    .join('::');
}
