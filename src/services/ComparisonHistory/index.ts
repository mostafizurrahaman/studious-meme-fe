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

export type ComparisonHistoryRecord = {
  _id?: string;
  user?: unknown;
  product?: unknown;
  productSnapshot?: {
    title: string;
    brand: string;
    category: string;
    categorySlug?: string;
    subCategorySlug?: string;
    image: string;
    sku: string;
    slug: string;
    price: number;
    sellingUnit?: string;
    stock?: number | null;
    rating: number;
    oldPrice?: number;
    isFeatured: boolean;
    weightKg?: number;
    isNoCOD?: boolean;
  };
  createdAt?: string;
  updatedAt?: string;
};

export const addCompareItem = async (
  productId: string,
): Promise<BackendEnvelope<ComparisonHistoryRecord | null>> => {
  const accessToken = await getValidAccessTokenForServerActions();

  if (!accessToken) {
    return {
      success: false,
      message: 'Sign in to save comparison items to your account.',
    };
  }

  const result = await requestBackendJson<
    BackendEnvelope<ComparisonHistoryRecord | null>
  >('/compare', {
    method: 'POST',
    body: { productId },
    token: accessToken,
  });

  revalidateTag(CACHE_TAGS.COMPARISON_HISTORY, 'max');
  return result;
};

export const removeCompareItem = async (
  productId: string,
): Promise<BackendEnvelope<null>> => {
  const accessToken = await getValidAccessTokenForServerActions();

  if (!accessToken) {
    return {
      success: false,
      message: 'Sign in to update comparison items on your account.',
    };
  }

  const result = await requestBackendJson<BackendEnvelope<null>>(
    `/compare/${productId}`,
    {
      method: 'DELETE',
      token: accessToken,
    },
  );

  revalidateTag(CACHE_TAGS.COMPARISON_HISTORY, 'max');
  return result;
};

export const getMyComparisonHistory = async (): Promise<
  BackendEnvelope<ComparisonHistoryRecord[]>
> => {
  const accessToken = await getValidAccessTokenForServerHandlerGet();

  if (!accessToken) {
    return { success: false, data: [] };
  }

  return requestBackendJson<BackendEnvelope<ComparisonHistoryRecord[]>>(
    '/compare/my-items',
    {
      method: 'GET',
      token: accessToken,
      next: { tags: [CACHE_TAGS.COMPARISON_HISTORY] },
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

export const getAllComparisonHistory = async (
  params: HistoryListParams = {},
): Promise<BackendEnvelope<ComparisonHistoryRecord[]>> => {
  const accessToken = await getValidAccessTokenForServerHandlerGet();

  return requestBackendJson<BackendEnvelope<ComparisonHistoryRecord[]>>(
    `/compare/admin${buildHistoryQuery(params)}`,
    {
      method: 'GET',
      token: accessToken ?? undefined,
      next: { tags: [CACHE_TAGS.COMPARISON_HISTORY] },
    },
  );
};

export type ComparisonInsightSummary = {
  total: number;
  categorySummary: Array<{
    category: string;
    count: number;
    userCount: number;
  }>;
  productSummary: Array<{ product: string; count: number; category: string }>;
  userSummary: Array<{ user: string; count: number }>;
};

export const getComparisonInsights = async (): Promise<
  BackendEnvelope<ComparisonInsightSummary>
> => {
  const accessToken = await getValidAccessTokenForServerHandlerGet();

  return requestBackendJson<BackendEnvelope<ComparisonInsightSummary>>(
    '/compare/admin/summary',
    {
      method: 'GET',
      token: accessToken ?? undefined,
      next: { tags: [CACHE_TAGS.COMPARISON_HISTORY] },
    },
  );
};
