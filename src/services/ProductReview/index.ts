'use server';

import { revalidateTag } from 'next/cache';
import { requestBackendJson } from '@/lib/backend-api';
import { CACHE_REVALIDATE } from '@/lib/cache-revalidate';
import { CACHE_TAGS } from '@/lib/cache-tags';
import {
  getValidAccessTokenForServerActions,
  getValidAccessTokenForServerHandlerGet,
} from '@/lib/getValidAccessToken';

export type ReviewSource = 'customer' | 'manual';
export type ReviewStatus = 'pending' | 'approved' | 'rejected' | 'hidden';

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
  summary?: Record<string, number> & { averageRating?: number };
};

export type ProductReviewUserRef =
  | {
      _id?: string;
      name?: string;
      email?: string;
      image?: string;
    }
  | string
  | null;

export type ProductReviewProductRef =
  | {
      _id?: string;
      title?: string;
      slug?: string;
      images?: string[];
    }
  | string
  | null;

export type ProductReviewRecord = {
  _id?: string;
  product?: ProductReviewProductRef;
  user?: ProductReviewUserRef;
  createdBy?: ProductReviewUserRef;
  approvedBy?: ProductReviewUserRef;
  rejectedBy?: ProductReviewUserRef;
  hiddenBy?: ProductReviewUserRef;
  displayName: string;
  displayImage: string;
  rating: number;
  comment: string;
  images?: string[];
  isVerifiedPurchase?: boolean;
  source: ReviewSource;
  status: ReviewStatus;
  approvedAt?: string;
  rejectedAt?: string;
  hiddenAt?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type PublicProductReviewRecord = Pick<
  ProductReviewRecord,
  | '_id'
  | 'displayName'
  | 'displayImage'
  | 'rating'
  | 'comment'
  | 'images'
  | 'createdAt'
>;

export type ProductReviewListResponse = BackendEnvelope<ProductReviewRecord[]>;
export type PublicProductReviewListResponse = BackendEnvelope<
  PublicProductReviewRecord[]
>;

export type CreateCustomerReviewPayload = {
  product: string;
  rating: number;
  comment: string;
  images?: Array<File | string>;
};

export type CreateManualReviewPayload = {
  product: string;
  displayName: string;
  displayImage: File | string;
  rating: number;
  comment: string;
  images?: Array<File | string>;
  status?: ReviewStatus;
};

export type UpdateReviewPayload = Partial<{
  displayName: string;
  displayImage: File | string;
  rating: number;
  comment: string;
  images: Array<File | string>;
  status: ReviewStatus;
}>;

function toFormData(payload: Record<string, unknown>) {
  const formData = new FormData();

  const { images, displayImage, ...rest } = payload as {
    images?: Array<File | string>;
    displayImage?: File | string;
    [key: string]: unknown;
  };
  const imageUrls = (images ?? []).filter(
    (item): item is string => typeof item === 'string' && Boolean(item),
  );

  formData.set(
    'data',
    JSON.stringify({
      ...rest,
      ...(imageUrls.length > 0 ? { images: imageUrls } : {}),
      ...(typeof displayImage === 'string' && displayImage.trim()
        ? { displayImage: displayImage.trim() }
        : {}),
    }),
  );

  if (displayImage instanceof File) {
    formData.append('displayImage', displayImage);
  }

  (images ?? []).forEach((item) => {
    if (item instanceof File) {
      formData.append('images', item);
    }
  });

  return formData;
}

export type ProductReviewListParams = {
  page?: number;
  limit?: number;
  status?: ReviewStatus;
  source?: ReviewSource;
  product?: string;
  user?: string;
  rating?: number;
  searchTerm?: string;
  createdFrom?: string;
  createdTo?: string;
  sort?:
    | 'createdAt-desc'
    | 'createdAt-asc'
    | 'rating-desc'
    | 'rating-asc'
    | 'status-desc'
    | 'status-asc';
};

const buildReviewQuery = (params: ProductReviewListParams = {}) => {
  const searchParams = new URLSearchParams();

  if (params.page) searchParams.set('page', String(params.page));
  if (params.limit) searchParams.set('limit', String(params.limit));
  if (params.status) searchParams.set('status', params.status);
  if (params.source) searchParams.set('source', params.source);
  if (params.product?.trim())
    searchParams.set('product', params.product.trim());
  if (params.user?.trim()) searchParams.set('user', params.user.trim());
  if (typeof params.rating === 'number')
    searchParams.set('rating', String(params.rating));
  if (params.searchTerm?.trim())
    searchParams.set('searchTerm', params.searchTerm.trim());
  if (params.createdFrom?.trim())
    searchParams.set('createdFrom', params.createdFrom.trim());
  if (params.createdTo?.trim())
    searchParams.set('createdTo', params.createdTo.trim());
  if (params.sort) searchParams.set('sort', params.sort);

  const query = searchParams.toString();
  return query ? `?${query}` : '';
};

export const createProductReview = async (
  payload: CreateCustomerReviewPayload | FormData,
): Promise<BackendEnvelope<ProductReviewRecord>> => {
  const accessToken = await getValidAccessTokenForServerActions();

  if (!accessToken) {
    return { success: false, message: 'Sign in to write a review.' };
  }

  const result = await requestBackendJson<BackendEnvelope<ProductReviewRecord>>(
    '/product-reviews',
    {
      method: 'POST',
      body: payload instanceof FormData ? payload : toFormData(payload),
      token: accessToken,
    },
  );

  revalidateTag(CACHE_TAGS.PRODUCT_REVIEWS, 'max');
  return result;
};

export const getProductReviewsByProduct = async (
  productId: string,
  params: Omit<
    ProductReviewListParams,
    'product' | 'status' | 'source' | 'user'
  > = {},
): Promise<BackendEnvelope<PublicProductReviewRecord[]>> => {
  return requestBackendJson<BackendEnvelope<PublicProductReviewRecord[]>>(
    `/product-reviews/product/${productId}${buildReviewQuery(params)}`,
    {
      method: 'GET',
      next: {
        revalidate: CACHE_REVALIDATE.DEFAULT,
        tags: [CACHE_TAGS.PRODUCT_REVIEWS, CACHE_TAGS.PRODUCT(productId)],
      },
    },
  );
};

export const getAdminProductReviews = async (
  params: ProductReviewListParams = {},
): Promise<ProductReviewListResponse> => {
  const accessToken = await getValidAccessTokenForServerHandlerGet();

  return requestBackendJson<ProductReviewListResponse>(
    `/admin/product-reviews${buildReviewQuery(params)}`,
    {
      method: 'GET',
      token: accessToken ?? undefined,
      next: {
        revalidate: CACHE_REVALIDATE.DEFAULT,
        tags: [CACHE_TAGS.PRODUCT_REVIEWS],
      },
    },
  );
};

export const createManualProductReview = async (
  payload: CreateManualReviewPayload,
): Promise<BackendEnvelope<ProductReviewRecord>> => {
  const accessToken = await getValidAccessTokenForServerActions();

  if (!accessToken) {
    return { success: false, message: 'Sign in to create a review.' };
  }

  const result = await requestBackendJson<BackendEnvelope<ProductReviewRecord>>(
    '/admin/product-reviews',
    {
      method: 'POST',
      body: toFormData(payload),
      token: accessToken,
    },
  );

  revalidateTag(CACHE_TAGS.PRODUCT_REVIEWS, 'max');
  return result;
};

export const updateProductReview = async (
  reviewId: string,
  payload: UpdateReviewPayload,
): Promise<BackendEnvelope<ProductReviewRecord>> => {
  const accessToken = await getValidAccessTokenForServerActions();

  if (!accessToken) {
    return { success: false, message: 'Sign in to update the review.' };
  }

  const result = await requestBackendJson<BackendEnvelope<ProductReviewRecord>>(
    `/admin/product-reviews/${reviewId}`,
    {
      method: 'PATCH',
      body: toFormData(payload),
      token: accessToken,
    },
  );

  revalidateTag(CACHE_TAGS.PRODUCT_REVIEWS, 'max');
  return result;
};

export const updateProductReviewStatus = async (
  reviewId: string,
  payload: { status: ReviewStatus },
): Promise<BackendEnvelope<ProductReviewRecord>> => {
  const accessToken = await getValidAccessTokenForServerActions();

  if (!accessToken) {
    return { success: false, message: 'Sign in to update review status.' };
  }

  const result = await requestBackendJson<BackendEnvelope<ProductReviewRecord>>(
    `/admin/product-reviews/${reviewId}/status`,
    {
      method: 'PATCH',
      body: payload,
      token: accessToken,
    },
  );

  revalidateTag(CACHE_TAGS.PRODUCT_REVIEWS, 'max');
  return result;
};

export const deleteProductReview = async (
  reviewId: string,
): Promise<BackendEnvelope<ProductReviewRecord>> => {
  const accessToken = await getValidAccessTokenForServerActions();

  if (!accessToken) {
    return { success: false, message: 'Sign in to delete the review.' };
  }

  const result = await requestBackendJson<BackendEnvelope<ProductReviewRecord>>(
    `/admin/product-reviews/${reviewId}`,
    {
      method: 'DELETE',
      token: accessToken,
    },
  );

  revalidateTag(CACHE_TAGS.PRODUCT_REVIEWS, 'max');
  return result;
};
