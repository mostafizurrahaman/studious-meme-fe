import type { CouponVerificationSummary } from '@/lib/coupons';

export const COD_MIN_SUBTOTAL_BDT = 1000;

export const SHIPPING_ZONE = {
  INSIDE_DHAKA: 'inside_dhaka',
  OUTSIDE_DHAKA: 'outside_dhaka',
} as const;

export type ShippingZone = (typeof SHIPPING_ZONE)[keyof typeof SHIPPING_ZONE];

export const SHIPPING_RULES = {
  [SHIPPING_ZONE.INSIDE_DHAKA]: {
    baseCharge: 80,
    additionalCharge: 20,
  },
  [SHIPPING_ZONE.OUTSIDE_DHAKA]: {
    baseCharge: 130,
    additionalCharge: 30,
  },
} as const;

export const COD_REASONS = {
  subtotal: `Cash on Delivery is available only for orders above ৳${COD_MIN_SUBTOTAL_BDT}.`,
  blockedByProduct:
    'One or more products in your cart are not eligible for Cash on Delivery.',
} as const;

export type FulfillmentItem = {
  unitPrice: number;
  quantity: number;
  weightKg?: number;
  isNoCOD?: boolean;
};

export function normalizeText(value?: string) {
  return (value ?? '').trim().toLowerCase();
}

export function deriveShippingZone(city?: string): ShippingZone {
  const selectedDistrict = normalizeText(city);
  return selectedDistrict === 'dhaka'
    ? SHIPPING_ZONE.INSIDE_DHAKA
    : SHIPPING_ZONE.OUTSIDE_DHAKA;
}

export function formatShippingZoneLabel(zone: ShippingZone) {
  return zone === SHIPPING_ZONE.INSIDE_DHAKA ? 'Inside Dhaka' : 'Outside Dhaka';
}

export function calculateShippingCharge({
  totalWeightKg,
  zone,
}: {
  totalWeightKg: number;
  zone: ShippingZone;
}) {
  const rules = SHIPPING_RULES[zone];

  if (!Number.isFinite(totalWeightKg) || totalWeightKg <= 0) {
    return 0;
  }

  if (totalWeightKg <= 1) {
    return rules.baseCharge;
  }

  const extraKg = Math.ceil(totalWeightKg - 1);
  return rules.baseCharge + extraKg * rules.additionalCharge;
}

export function calculateCodEligibility(
  items: Array<Pick<FulfillmentItem, 'isNoCOD'>>,
  subtotal: number,
) {
  const reasons: string[] = [];

  if (!Number.isFinite(subtotal) || subtotal <= COD_MIN_SUBTOTAL_BDT) {
    reasons.push(COD_REASONS.subtotal);
  }

  if (items.some((item) => item.isNoCOD)) {
    reasons.push(COD_REASONS.blockedByProduct);
  }

  return {
    eligible: reasons.length === 0,
    reasons,
  };
}

export function calculateFulfillmentSummary({
  items,
  city,
  // address,
  couponSummary,
}: {
  items: FulfillmentItem[];
  city?: string;
  // address?: string;
  couponSummary?: CouponVerificationSummary | null;
}) {
  // void address;

  const subtotal = items.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0,
  );
  const totalWeightKg = Number(
    items
      .reduce((sum, item) => {
        const itemWeightKg =
          typeof item.weightKg === 'number' && Number.isFinite(item.weightKg)
            ? item.weightKg
            : 0;

        return sum + itemWeightKg * item.quantity;
      }, 0)
      .toFixed(2),
  );
  const zone = deriveShippingZone(city);
  const shippingCharge = calculateShippingCharge({ totalWeightKg, zone });
  const cod = calculateCodEligibility(items, subtotal);

  if (couponSummary) {
    return {
      subtotal: couponSummary.subtotal,
      discount: couponSummary.discount,
      shippingCharge: couponSummary.shippingCharge,
      baseShippingCharge: couponSummary.baseShippingCharge,
      total: couponSummary.total,
      totalWeightKg: couponSummary.totalWeightKg,
      zone: couponSummary.shippingZone,
      codEligible: couponSummary.codEligible,
      codReasons: couponSummary.codReasons,
      coupon: couponSummary.coupon,
      couponMessage: couponSummary.message,
      payableAmount: couponSummary.payableAmount,
    };
  }

  return {
    subtotal,
    discount: 0,
    shippingCharge,
    baseShippingCharge: shippingCharge,
    total: subtotal + shippingCharge,
    totalWeightKg,
    zone,
    codEligible: cod.eligible,
    codReasons: cod.reasons,
    coupon: null,
    couponMessage: '',
    payableAmount: subtotal + shippingCharge,
  };
}
