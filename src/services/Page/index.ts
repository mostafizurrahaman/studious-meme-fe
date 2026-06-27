'use server';

import type { FieldValues } from 'react-hook-form';
import { revalidateTag } from 'next/cache';
import { requestBackendJson } from '@/lib/backend-api';
import { CACHE_REVALIDATE } from '@/lib/cache-revalidate';
import { CACHE_TAGS } from '@/lib/cache-tags';
import { getValidAccessTokenForServerActions } from '@/lib/getValidAccessToken';
import type { BackendPage } from '@/lib/page-content';

type BackendEnvelope<T> = {
  success?: boolean;
  message?: string;
  data?: T;
  error?: string;
};

export const getAllPages = async (): Promise<
  BackendEnvelope<BackendPage[]>
> => {
  return requestBackendJson<BackendEnvelope<BackendPage[]>>('/page/retrieve', {
    method: 'GET',
    next: {
      revalidate: CACHE_REVALIDATE.LONG,
      tags: [CACHE_TAGS.PAGES, CACHE_TAGS.MARKETING_CONTENT],
    },
  });
};

export const getPageByType = async (
  type: string,
): Promise<BackendEnvelope<BackendPage | null>> => {
  return requestBackendJson<BackendEnvelope<BackendPage | null>>(
    `/page/retrieve/${type}`,
    {
      method: 'GET',
      next: {
        revalidate: CACHE_REVALIDATE.LONG,
        tags: [CACHE_TAGS.PAGES, CACHE_TAGS.MARKETING_CONTENT],
      },
    },
  );
};

export const createOrUpdatePageByType = async (
  data: FieldValues,
): Promise<BackendEnvelope<BackendPage>> => {
  const accessToken = await getValidAccessTokenForServerActions();
  const result = await requestBackendJson<BackendEnvelope<BackendPage>>(
    '/page/create-or-update',
    {
      method: 'PUT',
      body: data as Record<string, unknown>,
      token: accessToken ?? undefined,
    },
  );

  revalidateTag(CACHE_TAGS.PAGES, 'max');
  revalidateTag(CACHE_TAGS.MARKETING_CONTENT, 'max');
  return result;
};
