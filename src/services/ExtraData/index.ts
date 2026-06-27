'use server';

import { revalidateTag } from 'next/cache';
import { requestBackendJson } from '@/lib/backend-api';
import { CACHE_REVALIDATE } from '@/lib/cache-revalidate';
import { CACHE_TAGS } from '@/lib/cache-tags';
import { getValidAccessTokenForServerActions } from '@/lib/getValidAccessToken';

type BackendEnvelope<T> = {
  success?: boolean;
  message?: string;
  data?: T;
  error?: string;
};

export const getAllUrls = async (): Promise<BackendEnvelope<unknown>> => {
  return requestBackendJson<BackendEnvelope<unknown>>('/data', {
    method: 'GET',
    next: {
      revalidate: CACHE_REVALIDATE.LONG,
      tags: [CACHE_TAGS.EXTRA_DATA_URLS, CACHE_TAGS.MARKETING_CONTENT],
    },
  });
};

export const updateSponsorLogoUrl = async (
  data: FormData,
): Promise<BackendEnvelope<unknown>> => {
  const accessToken = await getValidAccessTokenForServerActions();
  const result = await requestBackendJson<BackendEnvelope<unknown>>(
    '/data/sponsorLogoUrl',
    {
      method: 'PUT',
      body: data,
      token: accessToken ?? undefined,
    },
  );

  revalidateTag(CACHE_TAGS.EXTRA_DATA_URLS, 'max');
  revalidateTag(CACHE_TAGS.MARKETING_CONTENT, 'max');
  return result;
};

export const updateSingleLink = async (
  platform: string,
  link: string,
): Promise<BackendEnvelope<unknown>> => {
  const accessToken = await getValidAccessTokenForServerActions();
  const result = await requestBackendJson<BackendEnvelope<unknown>>(
    `/data/${platform}`,
    {
      method: 'PUT',
      body: { url: link },
      token: accessToken ?? undefined,
    },
  );

  revalidateTag(CACHE_TAGS.EXTRA_DATA_URLS, 'max');
  revalidateTag(CACHE_TAGS.MARKETING_CONTENT, 'max');
  return result;
};

export const updatePrintStory = async (
  data: FormData,
): Promise<BackendEnvelope<unknown>> => {
  const accessToken = await getValidAccessTokenForServerActions();
  const result = await requestBackendJson<BackendEnvelope<unknown>>(
    '/data/print-story',
    {
      method: 'PUT',
      body: data,
      token: accessToken ?? undefined,
    },
  );

  revalidateTag(CACHE_TAGS.EXTRA_DATA_URLS, 'max');
  revalidateTag(CACHE_TAGS.MARKETING_CONTENT, 'max');
  return result;
};
