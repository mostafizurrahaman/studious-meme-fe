import { describe, expect, it } from 'vitest';
import { getSafeRedirectPath } from './redirect';

describe('safe redirect helper', () => {
  it('accepts internal paths', () => {
    expect(getSafeRedirectPath('/checkout')).toBe('/checkout');
    expect(getSafeRedirectPath('/checkout?step=shipping')).toBe(
      '/checkout?step=shipping',
    );
  });

  it('rejects unsafe redirect values', () => {
    expect(getSafeRedirectPath('https://example.com')).toBeNull();
    expect(getSafeRedirectPath('//example.com')).toBeNull();
    expect(getSafeRedirectPath('checkout')).toBeNull();
    expect(getSafeRedirectPath('')).toBeNull();
  });
});
