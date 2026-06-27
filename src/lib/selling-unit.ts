export const SELLING_UNIT_OPTIONS = [
  'pcs',
  'set',
  'pair',
  'box',
  'pack',
  'roll',
  'meter',
  'feet',
  'kg',
  'gram',
  'liter',
  'ml',
  'bag',
  'bundle',
  'dozen',
] as const;

export type SellingUnit = (typeof SELLING_UNIT_OPTIONS)[number];

export const DEFAULT_SELLING_UNIT: SellingUnit = 'pcs';

const SELLING_UNIT_SET = new Set<string>(SELLING_UNIT_OPTIONS);

export const isSellingUnit = (value: unknown): value is SellingUnit =>
  typeof value === 'string' && SELLING_UNIT_SET.has(value);
