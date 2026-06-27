import { describe, expect, it } from 'vitest';
import {
  mapBackendCartItemsToStoreItems,
  mergeBackendCartIntoLocalItems,
} from './cart-hydration';

describe('cart hydration helpers', () => {
  it('maps backend items to synced local items', () => {
    const items = mapBackendCartItemsToStoreItems([
      {
        product: { _id: 'p1' },
        quantity: 2,
        priceSnapshot: 100,
        productSnapshot: {
          title: 'Rice',
          brand: 'Brand',
          category: 'Grocery',
          image: '/rice.jpg',
          sku: 'RICE-1',
          slug: 'rice',
          price: 100,
          sellingUnit: 'kg',
          weightKg: 1,
          isNoCOD: false,
        },
      },
    ]);

    expect(items[0]).toMatchObject({
      productId: 'p1',
      sku: 'RICE-1',
      quantity: 2,
      syncedQuantity: 2,
    });
  });

  it('merges guest quantity into backend items without losing guest-only items', () => {
    const merged = mergeBackendCartIntoLocalItems(
      [
        {
          productId: 'p1',
          sku: 'RICE-1',
          title: 'Rice',
          href: '/shop',
          image: '/rice.jpg',
          brand: 'Brand',
          unitPrice: 100,
          unitPriceLabel: '৳ 100 / kg',
          quantity: 3,
          sellingUnit: 'kg',
          weightKg: 1,
          isNoCOD: false,
          syncedQuantity: 2,
        },
        {
          productId: 'p2',
          sku: 'SALT-1',
          title: 'Salt',
          href: '/shop',
          image: '/salt.jpg',
          brand: 'Brand',
          unitPrice: 20,
          unitPriceLabel: '৳ 20 / kg',
          quantity: 1,
          sellingUnit: 'kg',
          weightKg: 1,
          isNoCOD: false,
          syncedQuantity: 0,
        },
      ],
      [
        {
          productId: 'p1',
          sku: 'RICE-1',
          title: 'Rice',
          href: '/shop',
          image: '/rice.jpg',
          brand: 'Brand',
          unitPrice: 100,
          unitPriceLabel: '৳ 100 / kg',
          quantity: 2,
          sellingUnit: 'kg',
          weightKg: 1,
          isNoCOD: false,
          syncedQuantity: 2,
        },
      ],
    );

    expect(merged).toHaveLength(2);
    expect(merged[0]).toMatchObject({ quantity: 3, syncedQuantity: 3 });
    expect(merged[1]).toMatchObject({ productId: 'p2', quantity: 1 });
  });
});
