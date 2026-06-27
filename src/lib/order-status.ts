export const ORDER_STATUS_OPTIONS = [
  'PLACED',
  'PENDING_PAYMENT',
  'CONFIRMED',
  'PROCESSING',
  'SHIPPED',
  'DELIVERED',
  'CANCELLED',
] as const;

export type OrderStatus = (typeof ORDER_STATUS_OPTIONS)[number];

