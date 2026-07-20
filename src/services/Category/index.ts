'use server';

import { revalidatePath, revalidateTag } from 'next/cache';
import { requestBackendJson } from '@/lib/backend-api';
import { CACHE_REVALIDATE } from '@/lib/cache-revalidate';
import { CACHE_TAGS } from '@/lib/cache-tags';
import { getValidAccessTokenForServerActions } from '@/lib/getValidAccessToken';
import { slugify } from '@/lib/slug';
import type {
  BackendCategory,
  BackendSubCategory,
  BackendSubCategoryExtendedVersion,
} from './mappers';

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

type CategorySubCategoryPayload = {
  name: string;
  slug: string;
  image?: File | string;
  description?: string;
  metaTitle?: string;
  metaDescription?: string;
  accent?: string;
  isActive?: boolean;
};

function toFormData(payload: Record<string, unknown>) {
  const formData = new FormData();

  const { image, ...rest } = payload as {
    image?: File | string;
    [key: string]: unknown;
  };

  formData.set(
    'data',
    JSON.stringify({
      ...rest,
      ...(typeof image === 'string' && image ? { image } : {}),
    }),
  );

  if (image instanceof File) {
    formData.append('image', image);
  }

  return formData;
}

type CategoryMutationPayload = {
  name: string;
  slug: string;
  image?: File | string;
  description?: string;
  metaTitle?: string;
  metaDescription?: string;
  accent?: string;
  isActive?: boolean;
};

export const getAllCategories = async (): Promise<BackendEnvelope<unknown>> => {
  return requestBackendJson<BackendEnvelope<unknown>>('/category/categories', {
    method: 'GET',
    next: { revalidate: CACHE_REVALIDATE.LONG, tags: [CACHE_TAGS.CATEGORIES] },
  });
};

export const getActiveCategories = async (): Promise<
  BackendEnvelope<BackendCategory[]>
> => {
  return requestBackendJson<BackendEnvelope<BackendCategory[]>>(
    '/category/categories/active',
    {
      method: 'GET',
      next: {
        revalidate: CACHE_REVALIDATE.LONG,
        tags: [CACHE_TAGS.CATEGORIES],
      },
    },
  );
};

export const getAllCategoriesNameAndId = async (): Promise<
  BackendEnvelope<unknown>
> => {
  return requestBackendJson<BackendEnvelope<unknown>>('/category/categories', {
    method: 'GET',
    next: { revalidate: CACHE_REVALIDATE.LONG, tags: [CACHE_TAGS.CATEGORIES] },
  });
};

export const getCategoryBySlug = async (
  slug: string,
): Promise<BackendEnvelope<BackendCategory>> => {
  return requestBackendJson<BackendEnvelope<BackendCategory>>(
    `/category/categories/${slug}`,
    {
      method: 'GET',
      next: {
        revalidate: CACHE_REVALIDATE.LONG,
        tags: [CACHE_TAGS.CATEGORIES, CACHE_TAGS.CATEGORY(slug)],
      },
    },
  );
};

export const getActiveCategoryBySlug = async (
  slug: string,
): Promise<BackendEnvelope<BackendCategory | null>> => {
  return requestBackendJson<BackendEnvelope<BackendCategory | null>>(
    `/category/categories/active/${slug}`,
    {
      method: 'GET',
      next: {
        revalidate: CACHE_REVALIDATE.LONG,
        tags: [CACHE_TAGS.CATEGORIES, CACHE_TAGS.CATEGORY(slug)],
      },
    },
  );
};

export const createCategory = async (
  payload: CategoryMutationPayload,
): Promise<BackendEnvelope<unknown>> => {
  const accessToken = await getValidAccessTokenForServerActions();
  const result = await requestBackendJson<BackendEnvelope<unknown>>(
    '/category/categories',
    {
      method: 'POST',
      body: toFormData({
        name: payload.name.trim(),
        slug: slugify(payload.slug ?? payload.name),
        image: payload.image,
        description: payload.description,
        accent: payload.accent,
        metaTitle: payload.metaTitle,

        metaDescription: payload.metaDescription,
        isActive: payload.isActive,
      }),
      token: accessToken ?? undefined,
    },
  );

  revalidateTag(CACHE_TAGS.CATEGORIES, 'max');

  revalidatePath(`/category/${slugify(payload.slug ?? payload.name)}`);
  revalidatePath('/dashboard/admin/categories');
  revalidatePath('/dashboard/super-admin/categories');
  return result;
};

export const updateCategory = async (
  id: string,
  payload: CategoryMutationPayload,
): Promise<BackendEnvelope<unknown>> => {
  const accessToken = await getValidAccessTokenForServerActions();
  const result = await requestBackendJson<BackendEnvelope<unknown>>(
    `/category/categories/${id}`,
    {
      method: 'PATCH',
      body: toFormData({
        name: payload.name.trim(),
        slug: slugify(payload.slug ?? payload.name),
        image: payload.image,
        description: payload.description,
        metaTitle: payload.metaTitle,

        metaDescription: payload.metaDescription,
        accent: payload.accent,
        isActive: payload.isActive,
      }),
      token: accessToken ?? undefined,
    },
  );

  await new Promise(resolve => setTimeout(resolve, 1000));

  revalidateTag(CACHE_TAGS.CATEGORIES, 'max');
  revalidatePath('/dashboard/admin/categories');
  revalidatePath('/dashboard/super-admin/categories');
  revalidatePath(`/category/${id}`);
  revalidatePath(`/category/${payload.slug}`);

  return result;
};

export const deleteCategory = async (
  id: string,
): Promise<BackendEnvelope<unknown>> => {
  const accessToken = await getValidAccessTokenForServerActions();
  const result = await requestBackendJson<BackendEnvelope<unknown>>(
    `/category/categories/${id}`,
    {
      method: 'DELETE',
      token: accessToken ?? undefined,
    },
  );

  revalidateTag(CACHE_TAGS.CATEGORIES, 'max');
  revalidatePath('/dashboard/admin/categories');
  revalidatePath('/dashboard/super-admin/categories');
  return result;
};

export const createCategorySubCategory = async (
  categorySlug: string,
  payload: CategorySubCategoryPayload,
): Promise<BackendEnvelope<unknown>> => {
  const accessToken = await getValidAccessTokenForServerActions();
  const result = await requestBackendJson<BackendEnvelope<unknown>>(
    `/category/categories/${categorySlug}/sub-categories`,
    {
      method: 'POST',
      body: toFormData({
        ...payload,
        slug: slugify(payload.slug),
      }),
      token: accessToken ?? undefined,
    },
  );

  revalidateTag(CACHE_TAGS.CATEGORIES, 'max');
  revalidatePath('/dashboard/admin/categories');
  revalidatePath('/dashboard/super-admin/categories');
  return result;
};

export const updateCategorySubCategory = async (
  categorySlug: string,
  subCategorySlug: string,
  payload: Partial<CategorySubCategoryPayload>,
): Promise<BackendEnvelope<unknown>> => {
  const accessToken = await getValidAccessTokenForServerActions();
  const result = await requestBackendJson<BackendEnvelope<unknown>>(
    `/category/categories/${categorySlug}/sub-categories/${subCategorySlug}`,
    {
      method: 'PATCH',
      body: toFormData({
        ...payload,
        slug: payload.slug ? slugify(payload.slug) : payload.slug,
      }),
      token: accessToken ?? undefined,
    },
  );

  revalidateTag(CACHE_TAGS.CATEGORIES, 'max');
  revalidatePath('/dashboard/admin/categories');
  revalidatePath('/dashboard/super-admin/categories');

  revalidatePath(`/category/${categorySlug}/${subCategorySlug}`);
  return result;
};

export const deleteCategorySubCategory = async (
  categorySlug: string,
  subCategorySlug: string,
): Promise<BackendEnvelope<unknown>> => {
  const accessToken = await getValidAccessTokenForServerActions();
  const result = await requestBackendJson<BackendEnvelope<unknown>>(
    `/category/categories/${categorySlug}/sub-categories/${subCategorySlug}`,
    {
      method: 'DELETE',
      token: accessToken ?? undefined,
    },
  );

  revalidateTag(CACHE_TAGS.CATEGORIES, 'max');
  return result;
};

export type SubCategoryListParams = {
  categoryId?: string;
  categorySlug?: string;
  includeInActive?: boolean;
  searchTerm?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
};

export const getSubCategoriesByCategoryId = async (
  params: SubCategoryListParams,
): Promise<BackendEnvelope<BackendSubCategoryExtendedVersion[]>> => {
  const searchParams = new URLSearchParams();

  if (params.categoryId && !params.categorySlug) {
    searchParams.set('categorySlug', params.categoryId);
  }

  if (!params.categoryId && params.categorySlug) {
    searchParams.set('categorySlug', params.categorySlug);
  }

  if (params.categoryId && params.categorySlug) {
    if (params.categoryId) searchParams.set('categoryId', params.categoryId);
  }

  if (params.includeInActive !== undefined)
    searchParams.set('includeInActive', String(params.includeInActive));
  if (params.searchTerm) searchParams.set('searchTerm', params.searchTerm);
  if (params.sortBy) searchParams.set('sortBy', params.sortBy);
  if (params.sortOrder) searchParams.set('sortOrder', params.sortOrder);
  if (params.page) searchParams.set('page', String(params.page));
  if (params.limit) searchParams.set('limit', String(params.limit));

  return requestBackendJson<
    BackendEnvelope<BackendSubCategoryExtendedVersion[]>
  >(`/category/sub-categories/all?${searchParams.toString()}`, {
    method: 'GET',
    next: {
      revalidate: CACHE_REVALIDATE.LONG,
      tags: [CACHE_TAGS.CATEGORIES],
    },
  });
};

export const getActiveSubCategoryBySlug = async (
  slug: string,
): Promise<BackendEnvelope<BackendSubCategoryExtendedVersion>> => {
  return requestBackendJson<BackendEnvelope<BackendSubCategoryExtendedVersion>>(
    `/category/sub-categories/${slug}`,
    {
      method: 'GET',
      next: {
        revalidate: CACHE_REVALIDATE.LONG,
        tags: [CACHE_TAGS.CATEGORIES],
      },
    },
  );
};
