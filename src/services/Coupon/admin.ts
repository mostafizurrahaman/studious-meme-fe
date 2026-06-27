'use server';

import { revalidateTag } from 'next/cache';
import { requestBackendJson } from '@/lib/backend-api';
import { CACHE_TAGS } from '@/lib/cache-tags';
import {
  getValidAccessTokenForServerActions,
  getValidAccessTokenForServerHandlerGet,
} from '@/lib/getValidAccessToken';
import type { Coupon, CouponDiscountType } from '@/lib/coupons';

type BackendEnvelope<T> = {
  success?: boolean;
  message?: string;
  data?: T;
  error?: string;
  meta?: { page: number; limit: number; total: number; totalPages: number };
};

export type CouponMutationPayload = {
  code: string;
  label: string;
  description?: string;
  discountType: CouponDiscountType;
  discountValue: number;
  minSubtotal?: number;
  expiresAt: string | Date;
  isActive?: boolean;
};

type CouponQueryParams = {
  page?: number;
  limit?: number;
  searchTerm?: string;
  isActive?: boolean;
  discountType?: CouponDiscountType;
};

// const COUPON_TAG = "COUPONS";

const normalizeOptionalText = (value?: string) => {
  const text = value?.trim();

  return text ? text : undefined;
};

const toIsoDateString = (value: string | Date) => {
  const date = value instanceof Date ? value : new Date(value);

  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
};

const normalizeCouponPayload = (payload: Partial<CouponMutationPayload>) => {
  const normalized: Record<string, unknown> = {};

  if (typeof payload.code === 'string') {
    normalized.code = payload.code.trim().toUpperCase();
  }

  if (typeof payload.label === 'string') {
    normalized.label = payload.label.trim();
  }

  if (typeof payload.description === 'string') {
    const description = normalizeOptionalText(payload.description);

    if (description) {
      normalized.description = description;
    }
  }

  if (typeof payload.discountType === 'string') {
    normalized.discountType = payload.discountType;
  }

  if (
    typeof payload.discountValue === 'number' &&
    Number.isFinite(payload.discountValue)
  ) {
    normalized.discountValue = payload.discountValue;
  }

  if (
    typeof payload.minSubtotal === 'number' &&
    Number.isFinite(payload.minSubtotal)
  ) {
    normalized.minSubtotal = payload.minSubtotal;
  }

  if (
    payload.expiresAt instanceof Date ||
    typeof payload.expiresAt === 'string'
  ) {
    const expiresAt = toIsoDateString(payload.expiresAt);

    if (expiresAt) {
      normalized.expiresAt = expiresAt;
    }
  }

  if (typeof payload.isActive === 'boolean') {
    normalized.isActive = payload.isActive;
  }

  return normalized;
};

export const getAllCoupons = async (
  params: CouponQueryParams = {},
): Promise<BackendEnvelope<Coupon[]>> => {
  const accessToken = await getValidAccessTokenForServerHandlerGet();
  const searchParams = new URLSearchParams();

  if (params.page) searchParams.set('page', String(params.page));
  if (params.limit) searchParams.set('limit', String(params.limit));
  if (params.searchTerm?.trim())
    searchParams.set('searchTerm', params.searchTerm.trim());
  if (typeof params.isActive === 'boolean')
    searchParams.set('isActive', String(params.isActive));
  if (params.discountType)
    searchParams.set('discountType', params.discountType);

  const query = searchParams.toString();

  return requestBackendJson<BackendEnvelope<Coupon[]>>(
    `/coupon/admin${query ? `?${query}` : ''}`,
    {
      method: 'GET',
      token: accessToken ?? undefined,
    },
  );
};

export const getCouponById = async (
  couponId: string,
): Promise<BackendEnvelope<Coupon>> => {
  const accessToken = await getValidAccessTokenForServerHandlerGet();

  return requestBackendJson<BackendEnvelope<Coupon>>(
    `/coupon/admin/${couponId}`,
    {
      method: 'GET',
      token: accessToken ?? undefined,
    },
  );
};

export const createCoupon = async (
  payload: CouponMutationPayload,
): Promise<BackendEnvelope<Coupon>> => {
  const accessToken = await getValidAccessTokenForServerActions();
  const result = await requestBackendJson<BackendEnvelope<Coupon>>(
    '/coupon/admin',
    {
      method: 'POST',
      body: normalizeCouponPayload(payload),
      token: accessToken ?? undefined,
    },
  );

  revalidateTag(CACHE_TAGS.COUPONS, 'max');
  return result;
};

export const updateCoupon = async (
  couponId: string,
  payload: Partial<CouponMutationPayload>,
): Promise<BackendEnvelope<Coupon>> => {
  const accessToken = await getValidAccessTokenForServerActions();
  const result = await requestBackendJson<BackendEnvelope<Coupon>>(
    `/coupon/admin/${couponId}`,
    {
      method: 'PATCH',
      body: normalizeCouponPayload(payload),
      token: accessToken ?? undefined,
    },
  );

  revalidateTag(CACHE_TAGS.COUPONS, 'max');
  return result;
};

export const updateCouponStatus = async (
  couponId: string,
  isActive: boolean,
): Promise<BackendEnvelope<Coupon>> => {
  const accessToken = await getValidAccessTokenForServerActions();
  const result = await requestBackendJson<BackendEnvelope<Coupon>>(
    `/coupon/admin/${couponId}/status`,
    {
      method: 'PATCH',
      body: { isActive },
      token: accessToken ?? undefined,
    },
  );

  revalidateTag(CACHE_TAGS.COUPONS, 'max');
  return result;
};

export const deleteCoupon = async (
  couponId: string,
): Promise<BackendEnvelope<Coupon>> => {
  const accessToken = await getValidAccessTokenForServerActions();
  const result = await requestBackendJson<BackendEnvelope<Coupon>>(
    `/coupon/admin/${couponId}`,
    {
      method: 'DELETE',
      token: accessToken ?? undefined,
    },
  );

  revalidateTag(CACHE_TAGS.COUPONS, 'max');
  return result;
};
