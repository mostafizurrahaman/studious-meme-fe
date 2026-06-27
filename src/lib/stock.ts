export type StockValue = number | null | undefined;

export function formatStockLabel(stock: StockValue) {
  if (typeof stock !== 'number' || !Number.isFinite(stock)) {
    return 'In stock';
  }

  return stock > 0 ? `${stock} in stock` : 'Out of stock';
}

export function isInStockLabel(stock: string) {
  const normalized = stock.trim().toLowerCase();

  return normalized === 'in stock' || normalized.endsWith(' in stock');
}

export function isOutOfStockLabel(stock: string) {
  return stock.trim().toLowerCase() === 'out of stock';
}
