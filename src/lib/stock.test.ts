import { describe, expect, it } from 'vitest';
import { formatStockLabel, isInStockLabel } from './stock';

describe('stock helpers', () => {
  it('treats missing stock as in stock', () => {
    expect(formatStockLabel(undefined)).toBe('In stock');
    expect(formatStockLabel(null)).toBe('In stock');
  });

  it('detects in-stock labels', () => {
    expect(isInStockLabel('In stock')).toBe(true);
    expect(isInStockLabel('12 in stock')).toBe(true);
    expect(isInStockLabel('Out of stock')).toBe(false);
  });
});
