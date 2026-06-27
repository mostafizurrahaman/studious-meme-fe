'use server';

import { revalidateTag } from 'next/cache';
import { requestBackendJson } from '@/lib/backend-api';
import { CACHE_REVALIDATE } from '@/lib/cache-revalidate';
import { CACHE_TAGS } from '@/lib/cache-tags';
import {
  getValidAccessTokenForServerActions,
  getValidAccessTokenForServerHandlerGet,
} from '@/lib/getValidAccessToken';

export type ProductQuestionStatus = 'pending' | 'answered' | 'hidden';

type BackendEnvelope<T> = {
  success?: boolean;
  message?: string;
  data?: T;
  error?: string;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
};

export type ProductQuestionUserRef =
  | {
      _id?: string;
      name?: string;
      email?: string;
    }
  | string
  | null;

export type ProductQuestionProductRef =
  | {
      _id?: string;
      title?: string;
      slug?: string;
      images?: string[];
    }
  | string
  | null;

export type ProductQuestionRecord = {
  _id?: string;
  product?: ProductQuestionProductRef;
  user?: ProductQuestionUserRef;
  question: string;
  answer?: string;
  answeredBy?: ProductQuestionUserRef;
  status: ProductQuestionStatus;
  answeredAt?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type ProductQuestionListResponse = BackendEnvelope<
  ProductQuestionRecord[]
>;
export type CreateProductQuestionPayload = {
  product: string;
  question: string;
};
export type AnswerProductQuestionPayload = {
  answer: string;
};

export type ProductQuestionListSort =
  | 'createdAt-desc'
  | 'createdAt-asc'
  | 'answeredAt-desc'
  | 'answeredAt-asc'
  | 'status-desc'
  | 'status-asc';

export type ProductQuestionListParams = {
  page?: number;
  limit?: number;
  status?: ProductQuestionStatus;
  product?: string;
  user?: string;
  searchTerm?: string;
  sort?: ProductQuestionListSort;
};

const buildQuestionQuery = (params: ProductQuestionListParams = {}) => {
  const searchParams = new URLSearchParams();

  if (params.page) searchParams.set('page', String(params.page));
  if (params.limit) searchParams.set('limit', String(params.limit));
  if (params.status) searchParams.set('status', params.status);
  if (params.product?.trim())
    searchParams.set('product', params.product.trim());
  if (params.user?.trim()) searchParams.set('user', params.user.trim());
  if (params.searchTerm?.trim())
    searchParams.set('searchTerm', params.searchTerm.trim());
  if (params.sort) searchParams.set('sort', params.sort);

  const query = searchParams.toString();
  return query ? `?${query}` : '';
};

export const createProductQuestion = async (
  payload: CreateProductQuestionPayload,
): Promise<BackendEnvelope<ProductQuestionRecord>> => {
  const accessToken = await getValidAccessTokenForServerActions();

  if (!accessToken) {
    return {
      success: false,
      message: 'Sign in to ask a question.',
    };
  }

  const result = await requestBackendJson<
    BackendEnvelope<ProductQuestionRecord>
  >('/product-questions', {
    method: 'POST',
    body: {
      product: payload.product,
      question: payload.question,
    },
    token: accessToken,
  });

  revalidateTag(CACHE_TAGS.PRODUCT_QUESTIONS, 'max');
  return result;
};

export const getAnsweredProductQuestionsByProduct = async (
  productId: string,
  params: Omit<ProductQuestionListParams, 'product' | 'status'> = {},
): Promise<ProductQuestionListResponse> => {
  return requestBackendJson<ProductQuestionListResponse>(
    `/product-questions/product/${productId}${buildQuestionQuery(params)}`,
    {
      method: 'GET',
      next: {
        revalidate: CACHE_REVALIDATE.DEFAULT,
        tags: [CACHE_TAGS.PRODUCT_QUESTIONS, CACHE_TAGS.PRODUCT(productId)],
      },
    },
  );
};

export const getAllProductQuestions = async (
  params: ProductQuestionListParams = {},
): Promise<ProductQuestionListResponse> => {
  const accessToken = await getValidAccessTokenForServerHandlerGet();

  return requestBackendJson<ProductQuestionListResponse>(
    `/admin/product-questions${buildQuestionQuery(params)}`,
    {
      method: 'GET',
      token: accessToken ?? undefined,
      next: {
        revalidate: CACHE_REVALIDATE.DEFAULT,
        tags: [CACHE_TAGS.PRODUCT_QUESTIONS],
      },
    },
  );
};

export const answerProductQuestion = async (
  questionId: string,
  payload: AnswerProductQuestionPayload,
): Promise<BackendEnvelope<ProductQuestionRecord>> => {
  const accessToken = await getValidAccessTokenForServerActions();

  if (!accessToken) {
    return {
      success: false,
      message: 'Sign in to answer questions.',
    };
  }

  const result = await requestBackendJson<
    BackendEnvelope<ProductQuestionRecord>
  >(`/admin/product-questions/${questionId}/answer`, {
    method: 'PATCH',
    body: payload,
    token: accessToken,
  });

  revalidateTag(CACHE_TAGS.PRODUCT_QUESTIONS, 'max');
  return result;
};

export const updateProductQuestionStatus = async (
  questionId: string,
  payload: { status: ProductQuestionStatus },
): Promise<BackendEnvelope<ProductQuestionRecord>> => {
  const accessToken = await getValidAccessTokenForServerActions();

  if (!accessToken) {
    return {
      success: false,
      message: 'Sign in to update question status.',
    };
  }

  const result = await requestBackendJson<
    BackendEnvelope<ProductQuestionRecord>
  >(`/admin/product-questions/${questionId}/status`, {
    method: 'PATCH',
    body: payload,
    token: accessToken,
  });

  revalidateTag(CACHE_TAGS.PRODUCT_QUESTIONS, 'max');
  return result;
};

export const deleteProductQuestion = async (
  questionId: string,
): Promise<BackendEnvelope<ProductQuestionRecord>> => {
  const accessToken = await getValidAccessTokenForServerActions();

  if (!accessToken) {
    return {
      success: false,
      message: 'Sign in to delete questions.',
    };
  }

  const result = await requestBackendJson<
    BackendEnvelope<ProductQuestionRecord>
  >(`/admin/product-questions/${questionId}`, {
    method: 'DELETE',
    token: accessToken,
  });

  revalidateTag(CACHE_TAGS.PRODUCT_QUESTIONS, 'max');
  return result;
};
