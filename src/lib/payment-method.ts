export const CASH_ON_DELIVERY_LABEL = 'Cash on delivery' as const;
export const PORTPOS_LABEL = 'PortPOS' as const;

export const CHECKOUT_PAYMENT_OPTIONS = [
  CASH_ON_DELIVERY_LABEL,
  PORTPOS_LABEL,
] as const;

export function getCheckoutPaymentLabel(payment: string) {
  return payment === PORTPOS_LABEL ? PORTPOS_LABEL : CASH_ON_DELIVERY_LABEL;
}

export function normalizeOrderPaymentMethod(payment: string) {
  return payment === PORTPOS_LABEL ? 'PORTPOS' : 'CASH_ON_DELIVERY';
}
