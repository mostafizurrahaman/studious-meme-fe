import { describe, expect, it } from 'vitest';
import { buildDashboardActivityCards } from './dashboard-activity';

describe('dashboard activity helpers', () => {
  it('groups add and remove events into one card', () => {
    const cards = buildDashboardActivityCards([
      {
        _id: '1',
        user: { _id: 'user-1', name: 'Ayesha', email: 'ayesha@example.com' },
        product: { _id: 'product-1' },
        productSnapshot: {
          title: 'Safety Gloves',
          brand: 'Malamal',
          category: 'PPE',
          image: '/gloves.jpg',
          sku: 'SKU-1',
          slug: 'safety-gloves',
          price: 500,
          stock: 12,
        },
        action: 'add',
        createdAt: '2026-04-20T10:00:00.000Z',
      },
      {
        _id: '2',
        user: { _id: 'user-1', name: 'Ayesha', email: 'ayesha@example.com' },
        product: { _id: 'product-1' },
        productSnapshot: {
          title: 'Safety Gloves',
          brand: 'Malamal',
          category: 'PPE',
          image: '/gloves.jpg',
          sku: 'SKU-1',
          slug: 'safety-gloves',
          price: 500,
          stock: 12,
        },
        action: 'remove',
        createdAt: '2026-04-22T10:00:00.000Z',
      },
    ]);

    expect(cards).toHaveLength(1);
    expect(cards[0]).toMatchObject({
      userName: 'Ayesha',
      userEmail: 'ayesha@example.com',
      title: 'Safety Gloves',
      brand: 'Malamal',
      sku: 'SKU-1',
      addedAt: '2026-04-20T10:00:00.000Z',
      removedAt: '2026-04-22T10:00:00.000Z',
      lastAction: 'remove',
      eventCount: 2,
      isActive: false,
    });
  });

  it('keeps cart clear events as standalone cards', () => {
    const cards = buildDashboardActivityCards([
      {
        _id: 'clear-1',
        user: { _id: 'user-2', name: 'Rahim', email: 'rahim@example.com' },
        action: 'clear',
        createdAt: '2026-04-21T08:00:00.000Z',
      },
    ]);

    expect(cards).toHaveLength(1);
    expect(cards[0]).toMatchObject({
      title: 'Cart cleared',
      brand: 'Cart',
      sku: 'CLEAR',
      lastAction: 'clear',
      isActive: false,
    });
  });

  it('marks prior cart items as cleared when a clear event arrives', () => {
    const cards = buildDashboardActivityCards([
      {
        _id: 'add-1',
        user: { _id: 'user-3', name: 'Nadia', email: 'nadia@example.com' },
        product: { _id: 'product-2' },
        productSnapshot: {
          title: 'Helmet',
          brand: 'Malamal',
          category: 'Safety',
          image: '/helmet.jpg',
          sku: 'SKU-2',
          slug: 'helmet',
          price: 900,
          stock: 5,
        },
        action: 'add',
        createdAt: '2026-04-24T10:00:00.000Z',
      },
      {
        _id: 'clear-2',
        user: { _id: 'user-3', name: 'Nadia', email: 'nadia@example.com' },
        action: 'clear',
        createdAt: '2026-04-24T11:00:00.000Z',
      },
    ]);

    const itemCard = cards.find((card) => card.sku === 'SKU-2');

    expect(itemCard).toMatchObject({
      addedAt: '2026-04-24T10:00:00.000Z',
      clearedAt: '2026-04-24T11:00:00.000Z',
      lastAction: 'clear',
      isActive: false,
    });
  });

  it('uses the same background tone for the same user', () => {
    const cards = buildDashboardActivityCards([
      {
        _id: 'add-2',
        user: { _id: 'user-4', name: 'Sam', email: 'sam@example.com' },
        product: { _id: 'product-3' },
        productSnapshot: {
          title: 'Jacket',
          brand: 'Malamal',
          category: 'Apparel',
          image: '/jacket.jpg',
          sku: 'SKU-3',
          slug: 'jacket',
          price: 1500,
          stock: 8,
        },
        action: 'add',
        createdAt: '2026-04-24T09:00:00.000Z',
      },
      {
        _id: 'add-3',
        user: { _id: 'user-4', name: 'Sam', email: 'sam@example.com' },
        product: { _id: 'product-4' },
        productSnapshot: {
          title: 'Boots',
          brand: 'Malamal',
          category: 'Apparel',
          image: '/boots.jpg',
          sku: 'SKU-4',
          slug: 'boots',
          price: 2500,
          stock: 4,
        },
        action: 'add',
        createdAt: '2026-04-24T10:00:00.000Z',
      },
    ]);

    expect(cards[0]?.toneClass).toBe(cards[1]?.toneClass);
  });
});
