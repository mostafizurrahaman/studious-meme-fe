'use server';

import { revalidatePath, revalidateTag } from 'next/cache';
import { requestBackendJson } from '@/lib/backend-api';
import { CACHE_REVALIDATE } from '@/lib/cache-revalidate';
import { CACHE_TAGS } from '@/lib/cache-tags';
import { getValidAccessTokenForServerActions } from '@/lib/getValidAccessToken';
import type { Brand as StorefrontBrand } from '@/lib/storefront-types';
import { slugify } from '@/lib/slug';

type BackendEnvelope<T> = {
  success?: boolean;
  message?: string;
  data?: T;
  error?: string;
  meta?: { page: number; limit: number; total: number; totalPages: number };
};

export type BackendBrand = {
  _id?: string;
  name: string;
  slug: string;
  image?: string;
  description?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export async function mapBackendBrandToStorefrontBrand(
  brand: BackendBrand,
): Promise<StorefrontBrand> {
  return {
    name: brand.name,
    slug: brand.slug,
    href: `/shop?b=${brand.slug}`,
    image: brand.image,
  };
}

type GetAllBrandsParams = {
  page?: number;
  limit?: number;
  searchTerm?: string;
};

export const getAllBrands = async (
  params: GetAllBrandsParams = {},
): Promise<BackendEnvelope<BackendBrand[]>> => {
  const searchParams = new URLSearchParams();

  if (params.page) searchParams.set('page', String(params.page));
  if (params.limit) searchParams.set('limit', String(params.limit));
  if (params.searchTerm?.trim())
    searchParams.set('searchTerm', params.searchTerm.trim());

  const query = searchParams.toString();

  return requestBackendJson<BackendEnvelope<BackendBrand[]>>(
    `/brand/brands${query ? `?${query}` : ''}`,
    {
      method: 'GET',
      next: { revalidate: CACHE_REVALIDATE.LONG, tags: [CACHE_TAGS.BRANDS] },
    },
  );
};

export const getAllBrandsAcrossPages = async (
  params: Omit<GetAllBrandsParams, 'page'> = {},
): Promise<BackendEnvelope<BackendBrand[]>> => {
  const firstPage = await getAllBrands({ ...params, page: 1 });
  const brandMap = new Map<string, BackendBrand>();

  for (const brand of firstPage.data ?? []) {
    const key = brand._id ?? brand.slug;
    if (key) {
      brandMap.set(key, brand);
    }
  }

  const totalPages = firstPage.meta?.totalPages ?? 1;
  const limit = firstPage.meta?.limit ?? params.limit ?? brandMap.size;

  if (totalPages <= 1) {
    return {
      ...firstPage,
      data: Array.from(brandMap.values()),
    };
  }

  const remainingResults = await Promise.all(
    Array.from({ length: totalPages - 1 }, (_, index) =>
      getAllBrands({ ...params, page: index + 2, ...(limit ? { limit } : {}) }),
    ),
  );

  remainingResults.forEach((result) => {
    if (Array.isArray(result.data)) {
      for (const brand of result.data) {
        const key = brand._id ?? brand.slug;
        if (key) {
          brandMap.set(key, brand);
        }
      }
    }
  });

  return {
    ...firstPage,
    data: Array.from(brandMap.values()),
    meta: {
      ...firstPage.meta,
      page: 1,
      limit,
      total: firstPage.meta?.total ?? brandMap.size,
      totalPages,
    },
  };
};

export const getActiveBrands = async (): Promise<
  BackendEnvelope<BackendBrand[]>
> => {
  return requestBackendJson<BackendEnvelope<BackendBrand[]>>(
    '/brand/brands/active',
    {
      method: 'GET',
      next: { revalidate: CACHE_REVALIDATE.LONG, tags: [CACHE_TAGS.BRANDS] },
    },
  );
};

export const getBrandBySlug = async (
  slug: string,
): Promise<BackendEnvelope<BackendBrand>> => {
  return requestBackendJson<BackendEnvelope<BackendBrand>>(
    `/brand/brands/${slug}`,
    {
      method: 'GET',
      next: {
        revalidate: CACHE_REVALIDATE.LONG,
        tags: [CACHE_TAGS.BRANDS, CACHE_TAGS.BRAND(slug)],
      },
    },
  );
};

export const getActiveBrandBySlug = async (
  slug: string,
): Promise<BackendEnvelope<BackendBrand | null>> => {
  return requestBackendJson<BackendEnvelope<BackendBrand | null>>(
    `/brand/brands/active/${slug}`,
    {
      method: 'GET',
      next: {
        revalidate: CACHE_REVALIDATE.LONG,
        tags: [CACHE_TAGS.BRANDS, CACHE_TAGS.BRAND(slug)],
      },
    },
  );
};

type BrandMutationPayload = {
  name: string;
  slug: string;
  image?: File | string;
  description?: string;
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

export const createBrand = async (
  payload: BrandMutationPayload,
): Promise<BackendEnvelope<BackendBrand>> => {
  const accessToken = await getValidAccessTokenForServerActions();

  const result = await requestBackendJson<BackendEnvelope<BackendBrand>>(
    '/brand/brands',
    {
      method: 'POST',
      body: toFormData({
        ...payload,
        slug: slugify(payload.slug),
      }),
      token: accessToken ?? undefined,
    },
  );

  revalidateTag(CACHE_TAGS.BRANDS, 'max');

  revalidatePath('/shop-by-brands');
  revalidatePath('/dashboard/admin/brands');
  revalidatePath('/dashboard/super-admin/brands');
  return result;
};

export const updateBrand = async (
  slug: string,
  payload: Partial<BrandMutationPayload>,
): Promise<BackendEnvelope<BackendBrand>> => {
  const accessToken = await getValidAccessTokenForServerActions();
  const result = await requestBackendJson<BackendEnvelope<BackendBrand>>(
    `/brand/brands/${slug}`,
    {
      method: 'PATCH',
      body: toFormData({
        ...payload,
        slug: payload.slug ? slugify(payload.slug) : payload.slug,
      }),
      token: accessToken ?? undefined,
    },
  );

  revalidateTag(CACHE_TAGS.BRANDS, 'max');
  revalidatePath('/dashboard/admin/brands');
  revalidatePath('/dashboard/super-admin/brands');
  return result;
};

export const deleteBrand = async (
  slug: string,
): Promise<BackendEnvelope<BackendBrand>> => {
  const accessToken = await getValidAccessTokenForServerActions();
  const result = await requestBackendJson<BackendEnvelope<BackendBrand>>(
    `/brand/brands/${slug}`,
    {
      method: 'DELETE',
      token: accessToken ?? undefined,
    },
  );

  revalidateTag(CACHE_TAGS.BRANDS, 'max');
  revalidatePath('/dashboard/admin/brands');
  revalidatePath('/dashboard/super-admin/brands');
  return result;
};
