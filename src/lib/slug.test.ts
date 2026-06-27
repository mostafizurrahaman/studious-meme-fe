import { describe, expect, it } from 'vitest';

import { slugify } from './slug';

describe('slugify', () => {
  it('normalizes names into clean slugs', () => {
    expect(slugify('  Hello World  ')).toBe('hello-world');
    expect(slugify('Brand -- Name!!!')).toBe('brand-name');
    expect(slugify('Crème Brûlée 2026')).toBe('creme-brulee-2026');
  });

  it('returns an empty string for empty input', () => {
    expect(slugify('   ')).toBe('');
  });
});
