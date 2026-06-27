export type CouponDiscountType =
  | 'PERCENTAGE'
  | 'DISCOUNT_AMOUNT'
  | 'FREE_SHIPPING';

export type Coupon = {
  id: string;
  code: string;
  label: string;
  description?: string;
  discountType: CouponDiscountType;
  discountValue: number;
  minSubtotal?: number;
  expiresAt: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type CouponVerificationItem = {
  unitPrice: number;
  quantity: number;
  weightKg?: number;
  isNoCOD?: boolean;
};

export type CouponVerificationPayload = {
  couponCode: string;
  items: CouponVerificationItem[];
  city?: string;
  address?: string;
};

export type CouponVerificationSummary = {
  coupon: Coupon | null;
  isValid: boolean;
  message: string;
  subtotal: number;
  discount: number;
  shippingCharge: number;
  baseShippingCharge: number;
  totalWeightKg: number;
  shippingZone: 'inside_dhaka' | 'outside_dhaka';
  codEligible: boolean;
  codAvailable: boolean;
  codReasons: string[];
  codUnavailableReasons: string[];
  total: number;
  payableAmount: number;
};
