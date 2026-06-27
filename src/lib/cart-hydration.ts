import { formatPriceLabelWithUnit, type CartItem } from '@/lib/cart';

type BackendCartItemLike = {
  product?: unknown;
  quantity: number;
  priceSnapshot: number;
  productSnapshot?: {
    title: string;
    brand: string;
    category: string;
    categorySlug?: string;
    image: string;
    sku: string;
    slug: string;
    price: number;
    sellingUnit?: string;
    stock?: number | null;
    weightKg?: number;
    isNoCOD?: boolean;
  };
};

function getProductId(product: unknown) {
  if (!product || typeof product !== 'object') {
    return typeof product === 'string' ? product : undefined;
  }

  const value = product as { _id?: string; id?: string };
  return value._id ?? value.id;
}

function mapBackendCartItem(item: BackendCartItemLike): CartItem | null {
  if (!item.productSnapshot) {
    return null;
  }

  if (typeof item.productSnapshot.stock === 'number' && item.productSnapshot.stock <= 0) {
    return null;
  }

  const productId = getProductId(item.product);

  return {
    productId,
    sku: item.productSnapshot.sku,
    title: item.productSnapshot.title,
    href: '/shop',
    image: item.productSnapshot.image,
    brand: item.productSnapshot.brand,
    unitPrice: item.priceSnapshot,
    unitPriceLabel: formatPriceLabelWithUnit(
      item.priceSnapshot,
      item.productSnapshot.sellingUnit,
    ),
    oldPriceLabel: undefined,
    quantity: item.quantity,
    sellingUnit: item.productSnapshot.sellingUnit,
    weightKg: item.productSnapshot.weightKg as number,
    isNoCOD: Boolean(item.productSnapshot.isNoCOD),
    syncedQuantity: item.quantity,
  };
}

function getItemKey(item: Pick<CartItem, 'productId' | 'sku'>) {
  return item.productId ?? item.sku;
}

export function mapBackendCartItemsToStoreItems(
  items: BackendCartItemLike[],
): CartItem[] {
  return items.map(mapBackendCartItem).filter(Boolean) as CartItem[];
}

export function mergeBackendCartIntoLocalItems(
  localItems: CartItem[],
  backendItems: CartItem[],
): CartItem[] {
  if (backendItems.length === 0) {
    return localItems;
  }

  const localMap = new Map(localItems.map((item) => [getItemKey(item), item]));
  const merged: CartItem[] = [];
  const handled = new Set<string>();

  for (const backendItem of backendItems) {
    const key = getItemKey(backendItem);
    const localItem = localMap.get(key);
    const guestQuantity = localItem
      ? Math.max(localItem.quantity - (localItem.syncedQuantity ?? 0), 0)
      : 0;
    const quantity = backendItem.quantity + guestQuantity;

    merged.push({
      ...backendItem,
      quantity,
      syncedQuantity: quantity,
    });
    handled.add(key);
  }

  for (const localItem of localItems) {
    const key = getItemKey(localItem);
    if (handled.has(key)) {
      continue;
    }

    merged.push(localItem);
  }

  return merged;
}
