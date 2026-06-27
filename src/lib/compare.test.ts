import { describe, expect, it } from 'vitest';
import {
  MAX_COMPARE_ITEMS,
  buildCompareSpecRows,
  canAddToCompare,
  comparisonHistoryRecordToProduct,
  getComparisonHistoryProductId,
} from './compare';

describe('compare helpers', () => {
  it('maps compare history snapshots into storefront products', () => {
    const product = comparisonHistoryRecordToProduct({
      _id: 'record-1',
      product: 'product-1',
      productSnapshot: {
        title: 'Smart TV',
        brand: 'Malamal',
        category: 'Electronics',
        categorySlug: 'electronics',
        subCategorySlug: 'tv',
        image: 'https://example.com/tv.jpg',
        sku: 'TV-001',
        slug: 'smart-tv',
        price: 45000,
        stock: 3,
        rating: 4.8,
        oldPrice: 52000,
        isFeatured: true,
        weightKg: 11.5,
        isNoCOD: false,
      },
    });

    expect(product).toEqual({
      id: 'product-1',
      title: 'Smart TV',
      slug: 'smart-tv',
      href: '/shop',
      images: ['https://example.com/tv.jpg'],
      price: '45000',
      oldPrice: '52000',
      brand: 'Malamal',
      sku: 'TV-001',
      stock: '3 in stock',
      rating: '4.8',
      category: 'Electronics',
      categorySlug: 'electronics',
      isFeatured: true,
      isNoCOD: false,
      weightKg: 11.5,
    });
  });

  it('treats missing compare stock as in stock', () => {
    const product = comparisonHistoryRecordToProduct({
      productSnapshot: {
        title: 'Bulk Item',
        brand: 'Malamal',
        category: 'Hardware',
        image: 'https://example.com/item.jpg',
        sku: 'BULK-001',
        slug: 'bulk-item',
        price: 1000,
        stock: null,
        rating: 5,
        isFeatured: false,
        weightKg: 2,
        isNoCOD: false,
      },
    } as never);

    expect(product?.stock).toBe('In stock');
  });

  it('resolves compare history product ids from multiple shapes', () => {
    expect(
      getComparisonHistoryProductId({ product: 'product-1' } as never),
    ).toBe('product-1');
    expect(
      getComparisonHistoryProductId({ product: { _id: 'product-2' } } as never),
    ).toBe('product-2');
    expect(getComparisonHistoryProductId({ _id: 'record-3' } as never)).toBe(
      'record-3',
    );
  });

  it('enforces max items and same category in the UI helper', () => {
    const products = Array.from({ length: MAX_COMPARE_ITEMS }, (_, index) => ({
      id: `product-${index + 1}`,
      title: `Product ${index + 1}`,
      slug: `product-${index + 1}`,
      href: '/shop' as const,
      image: 'https://example.com/product.jpg',
      price: '100',
      brand: 'Brand A',
      sku: `SKU-${index + 1}`,
      stock: 'In stock',
      rating: '4.5',
      category: 'Electronics',
      isFeatured: false,
      isNoCOD: false,
      weightKg: 1,
    }));

    expect(
      canAddToCompare(products, {
        id: 'product-5',
        title: 'Product 5',
        slug: 'product-5',
        href: '/shop',
        image: 'https://example.com/product-5.jpg',
        price: '120',
        brand: 'Brand B',
        sku: 'SKU-5',
        stock: 'In stock',
        rating: '4.7',
        category: 'Electronics',
        isFeatured: false,
        isNoCOD: false,
        weightKg: 1,
      }),
    ).toEqual({
      allowed: false,
      message: `You can compare up to ${MAX_COMPARE_ITEMS} products at a time.`,
    });

    expect(
      canAddToCompare(products.slice(0, 1), {
        id: 'product-6',
        title: 'Product 6',
        slug: 'product-6',
        href: '/shop',
        image: 'https://example.com/product-6.jpg',
        price: '130',
        brand: 'Brand C',
        sku: 'SKU-6',
        stock: 'In stock',
        rating: '4.9',
        category: 'Home Appliances',
        isFeatured: false,
        isNoCOD: false,
        weightKg: 1,
      }),
    ).toEqual({
      allowed: false,
      message: 'You can compare only products from the same category.',
    });

    expect(
      canAddToCompare(products.slice(0, 1), {
        id: 'product-7',
        title: 'Product 7',
        slug: 'product-7',
        href: '/shop',
        image: 'https://example.com/product-7.jpg',
        price: '140',
        brand: 'Brand D',
        sku: 'SKU-1',
        stock: 'In stock',
        rating: '4.2',
        category: 'Electronics',
        isFeatured: false,
        isNoCOD: false,
        weightKg: 1,
      }),
    ).toEqual({ allowed: true });
  });

  it('builds readable comparison rows', () => {
    const rows = buildCompareSpecRows([
      {
        id: '1',
        title: 'One',
        slug: 'one',
        href: '/shop',
        image: 'https://example.com/one.jpg',
        price: '100',
        oldPrice: '120',
        brand: 'Brand One',
        sku: 'SKU-1',
        stock: '3 in stock',
        rating: '4.5',
        category: 'Category One',
        isFeatured: true,
        isNoCOD: false,
        weightKg: 1.5,
      },
    ]);

    expect(rows).toEqual(
      expect.arrayContaining([
        { label: 'Brand', values: ['Brand One'] },
        { label: 'Category', values: ['Category One'] },
        { label: 'Price', values: ['৳ 100 / pcs'] },
        { label: 'Old price', values: ['৳ 120 / pcs'] },
        { label: 'Stock', values: ['3 in stock'] },
        { label: 'Rating', values: ['4.5'] },
        { label: 'SKU', values: ['SKU-1'] },
        { label: 'Weight', values: ['1.5 kg'] },
        { label: 'COD', values: ['Available'] },
      ]),
    );
  });
});
