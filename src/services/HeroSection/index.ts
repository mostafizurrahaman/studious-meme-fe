'use server';

import { revalidateTag } from 'next/cache';
import { requestBackendJson } from '@/lib/backend-api';
import { CACHE_REVALIDATE } from '@/lib/cache-revalidate';
import { CACHE_TAGS } from '@/lib/cache-tags';
import { getValidAccessTokenForServerActions } from '@/lib/getValidAccessToken';
import type { BackendBrand } from '@/services/Brand';
import type { BackendCategory } from '@/services/Category/mappers';
import type { BackendProduct } from '@/services/Product';

export type BackendEnvelope<T> = {
  success?: boolean;
  message?: string;
  data?: T;
  error?: string;
};

// --- Atomic Hero Banner Types ---
export type BackendHeroBanner = {
  _id: string;
  title: string;
  description?: string;
  image: string;
  imageAlt: string;
  clickUrl: string;
  slot: 'SLIDE' | 'FEATURE';
  order: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type HeroBannerMutationPayload = {
  title: string;
  description?: string;
  image: string | File | null;
  imageAlt: string;
  clickUrl: string;
  slot: 'SLIDE' | 'FEATURE';
  order?: number;
  isActive?: boolean;
};

// --- Legacy Types ---
export type BackendHeroCard = {
  _id?: string;
  image: string;
  imageAlt: string;
  title: string;
  description: string;
  clickUrl: string;
  slot?: 'SLIDE' | 'FEATURE';
  order?: number;
  isActive?: boolean;
};

export type HeroSectionFormCard = {
  image: string | File | null;
  imageAlt: string;
  title: string;
  description: string;
  clickUrl: string;
};

export type BackendHeroSection = {
  _id?: string;
  slides: BackendHeroCard[];
  features: BackendHeroCard[];
  isActive: boolean;
};

type GetHomeContentParams = {
  brandLimit?: number;
  categoryLimit?: number;
};

// 1. getHomeContent (Storefront Public API)
export const getHomeContent = async (
  params: GetHomeContentParams = {
    brandLimit: 16,
    categoryLimit: 8,
  },
): Promise<
  BackendEnvelope<{
    heroSection: BackendHeroSection;
    brands: BackendBrand[];
    categories: BackendCategory[];
    featuredProducts: BackendProduct[];
    latestProducts: BackendProduct[];
  }>
> => {
  const searchParams = new URLSearchParams();

  if (params.brandLimit)
    searchParams.set('brandLimit', String(params.brandLimit));
  if (params.categoryLimit)
    searchParams.set('categoryLimit', String(params.categoryLimit));

  const query = searchParams.toString();

  return requestBackendJson<
    BackendEnvelope<{
      heroSection: BackendHeroSection;
      brands: BackendBrand[];
      categories: BackendCategory[];
      featuredProducts: BackendProduct[];
      latestProducts: BackendProduct[];
    }>
  >(`/hero/home${query ? `?${query}` : ''}`, {
    method: 'GET',
    next: {
      revalidate: CACHE_REVALIDATE.LONG,
      tags: [
        CACHE_TAGS.HOME_CONTENT,
        CACHE_TAGS.MARKETING_CONTENT,
        CACHE_TAGS.HERO,
        CACHE_TAGS.PRODUCTS,
        CACHE_TAGS.FEATURED_PRODUCTS,
        CACHE_TAGS.LATEST_PRODUCTS,
        CACHE_TAGS.BRANDS,
        CACHE_TAGS.CATEGORIES,
      ],
    },
  });
};

// Helper to convert atomic banner mutation to FormData
function bannerToFormData(payload: Partial<HeroBannerMutationPayload>) {
  const formData = new FormData();
  const { image, ...rest } = payload;

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

// 2. Atomic Hero Banner Server Actions
export const getAllHeroBanners = async (
  params: { slot?: string; isActive?: boolean; searchTerm?: string } = {},
): Promise<BackendEnvelope<BackendHeroBanner[]>> => {
  const searchParams = new URLSearchParams();
  if (params.slot) searchParams.set('slot', params.slot);
  if (params.isActive !== undefined)
    searchParams.set('isActive', String(params.isActive));
  if (params.searchTerm?.trim())
    searchParams.set('searchTerm', params.searchTerm.trim());

  const query = searchParams.toString();

  return requestBackendJson<BackendEnvelope<BackendHeroBanner[]>>(
    `/hero/banners${query ? `?${query}` : ''}`,
    {
      method: 'GET',
      next: {
        revalidate: CACHE_REVALIDATE.LONG,
        tags: [CACHE_TAGS.HERO, CACHE_TAGS.MARKETING_CONTENT],
      },
    },
  );
};

export const getHeroBannerById = async (
  id: string,
): Promise<BackendEnvelope<BackendHeroBanner>> => {
  return requestBackendJson<BackendEnvelope<BackendHeroBanner>>(
    `/hero/banners/${id}`,
    {
      method: 'GET',
      next: {
        revalidate: CACHE_REVALIDATE.LONG,
        tags: [CACHE_TAGS.HERO, CACHE_TAGS.MARKETING_CONTENT],
      },
    },
  );
};

export const createHeroBanner = async (
  payload: HeroBannerMutationPayload,
): Promise<BackendEnvelope<BackendHeroBanner>> => {
  const accessToken = await getValidAccessTokenForServerActions();
  const result = await requestBackendJson<BackendEnvelope<BackendHeroBanner>>(
    '/hero/banners',
    {
      method: 'POST',
      body: bannerToFormData(payload),
      token: accessToken ?? undefined,
    },
  );

  revalidateTag(CACHE_TAGS.HERO, 'max');
  revalidateTag(CACHE_TAGS.HOME_CONTENT, 'max');
  revalidateTag(CACHE_TAGS.MARKETING_CONTENT, 'max');
  return result;
};

export const updateHeroBanner = async (
  id: string,
  payload: Partial<HeroBannerMutationPayload>,
): Promise<BackendEnvelope<BackendHeroBanner>> => {
  const accessToken = await getValidAccessTokenForServerActions();
  const result = await requestBackendJson<BackendEnvelope<BackendHeroBanner>>(
    `/hero/banners/${id}`,
    {
      method: 'PATCH',
      body: bannerToFormData(payload),
      token: accessToken ?? undefined,
    },
  );

  revalidateTag(CACHE_TAGS.HERO, 'max');
  revalidateTag(CACHE_TAGS.HOME_CONTENT, 'max');
  revalidateTag(CACHE_TAGS.MARKETING_CONTENT, 'max');
  return result;
};

export const updateHeroBannerStatus = async (
  id: string,
  isActive: boolean,
): Promise<BackendEnvelope<BackendHeroBanner>> => {
  const accessToken = await getValidAccessTokenForServerActions();
  const result = await requestBackendJson<BackendEnvelope<BackendHeroBanner>>(
    `/hero/banners/${id}/status`,
    {
      method: 'PATCH',
      body: { isActive },
      token: accessToken ?? undefined,
    },
  );

  revalidateTag(CACHE_TAGS.HERO, 'max');
  revalidateTag(CACHE_TAGS.HOME_CONTENT, 'max');
  revalidateTag(CACHE_TAGS.MARKETING_CONTENT, 'max');
  return result;
};

export const reorderHeroBanners = async (
  items: Array<{ id: string; order: number }>,
): Promise<BackendEnvelope<{ updatedCount: number }>> => {
  const accessToken = await getValidAccessTokenForServerActions();
  const result = await requestBackendJson<
    BackendEnvelope<{ updatedCount: number }>
  >('/hero/banners/reorder', {
    method: 'PATCH',
    body: { items },
    token: accessToken ?? undefined,
  });

  revalidateTag(CACHE_TAGS.HERO, 'max');
  revalidateTag(CACHE_TAGS.HOME_CONTENT, 'max');
  revalidateTag(CACHE_TAGS.MARKETING_CONTENT, 'max');
  return result;
};

export const deleteHeroBanner = async (
  id: string,
): Promise<BackendEnvelope<BackendHeroBanner>> => {
  const accessToken = await getValidAccessTokenForServerActions();
  const result = await requestBackendJson<BackendEnvelope<BackendHeroBanner>>(
    `/hero/banners/${id}`,
    {
      method: 'DELETE',
      token: accessToken ?? undefined,
    },
  );

  revalidateTag(CACHE_TAGS.HERO, 'max');
  revalidateTag(CACHE_TAGS.HOME_CONTENT, 'max');
  revalidateTag(CACHE_TAGS.MARKETING_CONTENT, 'max');
  return result;
};

// --- Legacy Actions (Backward Compatibility) ---
type HeroMutationPayload = {
  slides: HeroSectionFormCard[];
  features: HeroSectionFormCard[];
  isActive?: boolean;
};

function legacyToFormData(payload: Partial<HeroMutationPayload>) {
  const formData = new FormData();
  const slides = payload.slides ?? [];
  const features = payload.features ?? [];

  const normalizedPayload = {
    ...payload,
    slides: slides.map(({ image, ...slide }) => ({
      ...slide,
      ...(typeof image === 'string' && image ? { image } : {}),
    })),
    features: features.map(({ image, ...feature }) => ({
      ...feature,
      ...(typeof image === 'string' && image ? { image } : {}),
    })),
  };

  formData.set('data', JSON.stringify(normalizedPayload));

  slides.forEach((card, index) => {
    if (card.image instanceof File) {
      formData.append(`slides.${index}.image`, card.image);
    }
  });

  features.forEach((card, index) => {
    if (card.image instanceof File) {
      formData.append(`features.${index}.image`, card.image);
    }
  });

  return formData;
}

export const getAllHeroSections = async (): Promise<
  BackendEnvelope<BackendHeroSection[]>
> => {
  return requestBackendJson<BackendEnvelope<BackendHeroSection[]>>(
    '/hero/heroes',
    {
      method: 'GET',
      next: {
        revalidate: CACHE_REVALIDATE.LONG,
        tags: [CACHE_TAGS.HERO, CACHE_TAGS.MARKETING_CONTENT],
      },
    },
  );
};

export const getHeroSectionById = async (
  id: string,
): Promise<BackendEnvelope<BackendHeroSection>> => {
  return requestBackendJson<BackendEnvelope<BackendHeroSection>>(
    `/hero/heroes/${id}`,
    {
      method: 'GET',
      next: {
        revalidate: CACHE_REVALIDATE.LONG,
        tags: [CACHE_TAGS.HERO, CACHE_TAGS.MARKETING_CONTENT],
      },
    },
  );
};

export const createHeroSection = async (
  payload: HeroMutationPayload,
): Promise<BackendEnvelope<BackendHeroSection>> => {
  const accessToken = await getValidAccessTokenForServerActions();
  const result = await requestBackendJson<BackendEnvelope<BackendHeroSection>>(
    '/hero/heroes',
    {
      method: 'POST',
      body: legacyToFormData(payload),
      token: accessToken ?? undefined,
    },
  );

  revalidateTag(CACHE_TAGS.HERO, 'max');
  revalidateTag(CACHE_TAGS.HOME_CONTENT, 'max');
  revalidateTag(CACHE_TAGS.MARKETING_CONTENT, 'max');
  return result;
};

export const updateHeroSection = async (
  id: string,
  payload: Partial<HeroMutationPayload>,
): Promise<BackendEnvelope<BackendHeroSection>> => {
  const accessToken = await getValidAccessTokenForServerActions();
  const result = await requestBackendJson<BackendEnvelope<BackendHeroSection>>(
    `/hero/heroes/${id}`,
    {
      method: 'PATCH',
      body: legacyToFormData(payload),
      token: accessToken ?? undefined,
    },
  );

  revalidateTag(CACHE_TAGS.HERO, 'max');
  revalidateTag(CACHE_TAGS.HOME_CONTENT, 'max');
  revalidateTag(CACHE_TAGS.MARKETING_CONTENT, 'max');
  return result;
};

export const deleteHeroSection = async (
  id: string,
): Promise<BackendEnvelope<BackendHeroSection>> => {
  const accessToken = await getValidAccessTokenForServerActions();
  const result = await requestBackendJson<BackendEnvelope<BackendHeroSection>>(
    `/hero/heroes/${id}`,
    {
      method: 'DELETE',
      token: accessToken ?? undefined,
    },
  );

  revalidateTag(CACHE_TAGS.HERO, 'max');
  revalidateTag(CACHE_TAGS.HOME_CONTENT, 'max');
  revalidateTag(CACHE_TAGS.MARKETING_CONTENT, 'max');
  return result;
};
