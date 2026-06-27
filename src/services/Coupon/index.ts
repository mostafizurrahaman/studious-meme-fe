import { requestBackendJson } from '@/lib/backend-api';
import type {
  CouponVerificationPayload,
  CouponVerificationSummary,
} from '@/lib/coupons';

type BackendEnvelope<T> = {
  success?: boolean;
  message?: string;
  data?: T;
  error?: string;
};

export const verifyCoupon = async (
  payload: CouponVerificationPayload,
): Promise<BackendEnvelope<CouponVerificationSummary>> => {
  return requestBackendJson<BackendEnvelope<CouponVerificationSummary>>(
    '/coupon/verify',
    {
      method: 'POST',
      body: payload,
    },
  );
};
