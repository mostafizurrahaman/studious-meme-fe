'use server';

import { revalidateTag } from 'next/cache';
import { requestBackendJson } from '@/lib/backend-api';
import { CACHE_TAGS } from '@/lib/cache-tags';
import {
  getValidAccessTokenForServerActions,
  getValidAccessTokenForServerHandlerGet,
} from '@/lib/getValidAccessToken';

type BackendEnvelope<T> = {
  success?: boolean;
  message?: string;
  data?: T;
  error?: string;
  meta?: { page: number; limit: number; total: number; totalPages: number };
};

export type WishlistHistoryRecord = {
  _id?: string;
  user?: unknown;
  product?: unknown;
  productSnapshot?: {
    title: string;
    brand: string;
    category: string;
    categorySlug?: string;
    images: string[];
    sku: string;
    slug: string;
    price: number;
    sellingUnit?: string;
    stock?: number | null;
    weightKg?: number;
    isNoCOD?: boolean;
  };
  createdAt?: string;
  updatedAt?: string;
};

export const addWishlistItem = async (
  productId: string,
): Promise<BackendEnvelope<WishlistHistoryRecord>> => {
  const accessToken = await getValidAccessTokenForServerActions();

  if (!accessToken) {
    return {
      success: false,
      message: 'Sign in to save wishlist items to your account.',
    };
  }

  const result = await requestBackendJson<
    BackendEnvelope<WishlistHistoryRecord>
  >('/wishlist', {
    method: 'POST',
    body: { productId },
    token: accessToken,
  });

  revalidateTag(CACHE_TAGS.WISHLIST, 'max');
  return result;
};

export const removeWishlistItem = async (
  productId: string,
): Promise<BackendEnvelope<null>> => {
  const accessToken = await getValidAccessTokenForServerActions();

  if (!accessToken) {
    return {
      success: false,
      message: 'Sign in to update wishlist items on your account.',
    };
  }

  const result = await requestBackendJson<BackendEnvelope<null>>(
    `/wishlist/${productId}`,
    {
      method: 'DELETE',
      token: accessToken,
    },
  );

  revalidateTag(CACHE_TAGS.WISHLIST, 'max');
  return result;
};

export const getMyWishlist = async (): Promise<
  BackendEnvelope<WishlistHistoryRecord[]>
> => {
  const accessToken = await getValidAccessTokenForServerHandlerGet();

  if (!accessToken) {
    return { success: false, data: [] };
  }

  return requestBackendJson<BackendEnvelope<WishlistHistoryRecord[]>>(
    '/wishlist',
    {
      method: 'GET',
      token: accessToken,
      next: { tags: [CACHE_TAGS.WISHLIST] },
    },
  );
};

type HistoryListParams = {
  page?: number;
  limit?: number;
};

const buildHistoryQuery = (params: HistoryListParams = {}) => {
  const searchParams = new URLSearchParams();

  if (params.page) searchParams.set('page', String(params.page));
  if (params.limit) searchParams.set('limit', String(params.limit));

  const query = searchParams.toString();
  return query ? `?${query}` : '';
};

export const getAllWishlist = async (
  params: HistoryListParams = {},
): Promise<BackendEnvelope<WishlistHistoryRecord[]>> => {
  const accessToken = await getValidAccessTokenForServerHandlerGet();

  return requestBackendJson<BackendEnvelope<WishlistHistoryRecord[]>>(
    `/wishlist/admin${buildHistoryQuery(params)}`,
    {
      method: 'GET',
      token: accessToken ?? undefined,
      next: { tags: [CACHE_TAGS.WISHLIST] },
    },
  );
};

export type WishlistInsightSummary = {
  total: number;
  categorySummary: Array<{
    category: string;
    count: number;
    userCount: number;
  }>;
  productSummary: Array<{ product: string; count: number; category: string }>;
  userSummary: Array<{ user: string; count: number }>;
};

export const getWishlistInsights = async (): Promise<
  BackendEnvelope<WishlistInsightSummary>
> => {
  const accessToken = await getValidAccessTokenForServerHandlerGet();

  return requestBackendJson<BackendEnvelope<WishlistInsightSummary>>(
    '/wishlist/admin/summary',
    {
      method: 'GET',
      token: accessToken ?? undefined,
      next: { tags: [CACHE_TAGS.WISHLIST] },
    },
  );
};
