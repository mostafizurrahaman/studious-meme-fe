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

export type BackendCartItem = {
  product?: unknown;
  quantity: number;
  priceSnapshot: number;
  productSnapshot: {
    title: string;
    brand: string;
    category: string;
    categorySlug?: string;
    image: string;
    sku: string;
    slug: string;
    price: number;
    sellingUnit?: string;
    stock?: number | null;
    weightKg?: number;
    isNoCOD?: boolean;
  };
};

export type BackendCart = {
  _id?: string;
  user?: unknown;
  items: BackendCartItem[];
  subtotal: number;
  totalItems: number;
  createdAt?: string;
  updatedAt?: string;
};

export type CartHistoryRecord = {
  _id?: string;
  user?:
    | {
        _id?: string;
        name?: string;
        email?: string;
        phone?: string;
        image?: string;
      }
    | string;
  product?: { _id?: string } | string | null;
  productSnapshot?: {
    title: string;
    brand: string;
    category: string;
    categorySlug?: string;
    image: string;
    sku: string;
    slug: string;
    price: number;
    sellingUnit?: string;
    stock?: number | null;
    weightKg?: number;
    isNoCOD?: boolean;
  };
  action?: 'add' | 'update' | 'remove' | 'clear';
  quantity?: number;
  createdAt?: string;
  updatedAt?: string;
};

export const getMyCart = async (): Promise<BackendEnvelope<BackendCart>> => {
  const accessToken = await getValidAccessTokenForServerHandlerGet();

  if (!accessToken) {
    return { success: false, data: { items: [], subtotal: 0, totalItems: 0 } };
  }

  return requestBackendJson<BackendEnvelope<BackendCart>>('/cart', {
    method: 'GET',
    token: accessToken,
    next: { tags: [CACHE_TAGS.CART] },
  });
};

export const addCartItem = async (
  productId: string,
  quantity = 1,
): Promise<BackendEnvelope<BackendCart>> => {
  const accessToken = await getValidAccessTokenForServerActions();

  if (!accessToken) {
    return {
      success: false,
      message: 'Sign in to save cart items to your account.',
    };
  }

  const result = await requestBackendJson<BackendEnvelope<BackendCart>>(
    '/cart/items',
    {
      method: 'POST',
      body: { productId, quantity },
      token: accessToken,
    },
  );

  revalidateTag(CACHE_TAGS.CART, 'max');
  return result;
};

export const updateCartItem = async (
  productId: string,
  quantity: number,
): Promise<BackendEnvelope<BackendCart>> => {
  const accessToken = await getValidAccessTokenForServerActions();

  if (!accessToken) {
    return {
      success: false,
      message: 'Sign in to update cart items on your account.',
    };
  }

  const result = await requestBackendJson<BackendEnvelope<BackendCart>>(
    '/cart/items',
    {
      method: 'PATCH',
      body: { productId, quantity },
      token: accessToken,
    },
  );

  revalidateTag(CACHE_TAGS.CART, 'max');
  return result;
};

export const removeCartItem = async (
  productId: string,
): Promise<BackendEnvelope<BackendCart>> => {
  const accessToken = await getValidAccessTokenForServerActions();

  if (!accessToken) {
    return {
      success: false,
      message: 'Sign in to update cart items on your account.',
    };
  }

  const result = await requestBackendJson<BackendEnvelope<BackendCart>>(
    `/cart/items/${productId}`,
    {
      method: 'DELETE',
      token: accessToken,
    },
  );

  revalidateTag(CACHE_TAGS.CART, 'max');
  return result;
};

export const clearCart = async (): Promise<BackendEnvelope<BackendCart>> => {
  const accessToken = await getValidAccessTokenForServerActions();

  if (!accessToken) {
    return {
      success: false,
      message: 'Sign in to clear cart items on your account.',
    };
  }

  const result = await requestBackendJson<BackendEnvelope<BackendCart>>(
    '/cart/clear',
    {
      method: 'DELETE',
      token: accessToken,
    },
  );

  revalidateTag(CACHE_TAGS.CART, 'max');
  return result;
};

type AdminListParams = { page?: number; limit?: number };

const buildAdminQuery = (params: AdminListParams = {}) => {
  const searchParams = new URLSearchParams();
  if (params.page) searchParams.set('page', String(params.page));
  if (params.limit) searchParams.set('limit', String(params.limit));
  const query = searchParams.toString();
  return query ? `?${query}` : '';
};

export const getAllCarts = async (
  params: AdminListParams = {},
): Promise<BackendEnvelope<CartHistoryRecord[]>> => {
  const accessToken = await getValidAccessTokenForServerHandlerGet();

  return requestBackendJson<BackendEnvelope<CartHistoryRecord[]>>(
    `/cart/admin${buildAdminQuery(params)}`,
    {
      method: 'GET',
      token: accessToken ?? undefined,
      next: { tags: [CACHE_TAGS.CART] },
    },
  );
};

export type CartInsightSummary = {
  total: number;
  categorySummary: Array<{
    category: string;
    count: number;
    userCount: number;
  }>;
  productSummary: Array<{ product: string; count: number; category: string }>;
  userSummary: Array<{ user: string; count: number }>;
};

export const getCartInsights = async (): Promise<
  BackendEnvelope<CartInsightSummary>
> => {
  const accessToken = await getValidAccessTokenForServerHandlerGet();

  return requestBackendJson<BackendEnvelope<CartInsightSummary>>(
    '/cart/admin/summary',
    {
      method: 'GET',
      token: accessToken ?? undefined,
      next: { tags: [CACHE_TAGS.CART] },
    },
  );
};
