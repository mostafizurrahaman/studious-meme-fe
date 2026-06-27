'use server';

import type { FieldValues } from 'react-hook-form';
import { revalidateTag } from 'next/cache';
import { requestBackendJson } from '@/lib/backend-api';
import { CACHE_TAGS } from '@/lib/cache-tags';
import { getValidAccessTokenForServerHandlerGet } from '@/lib/getValidAccessToken';

type BackendEnvelope<T> = {
  success?: boolean;
  message?: string;
  data?: T;
  error?: string;
  meta?: { page: number; limit: number; total: number; totalPages: number };
};

export type BackendContact = {
  _id: string;
  name: string;
  company?: string;
  email: string;
  phone: string;
  subject: string;
  products?: string;
  brand?: string;
  message: string;
  isReplied: boolean;
  createdAt: string;
  updatedAt?: string;
};

export const createContact = async (
  contactData: FieldValues,
): Promise<BackendEnvelope<BackendContact>> => {
  const result = await requestBackendJson<BackendEnvelope<BackendContact>>(
    '/contact',
    {
      method: 'POST',
      body: contactData as Record<string, unknown>,
    },
  );

  revalidateTag(CACHE_TAGS.CONTACTS, 'max');
  return result;
};

export const getAllContacts = async (
  page: string = '1',
  limit: string = '50',
  searchTerm: string = '',
): Promise<BackendEnvelope<BackendContact[]>> => {
  const accessToken = await getValidAccessTokenForServerHandlerGet();

  const query = new URLSearchParams({ page, limit });
  if (searchTerm.trim()) query.set('searchTerm', searchTerm.trim());

  return requestBackendJson<BackendEnvelope<BackendContact[]>>(
    `/contact?${query.toString()}`,
    {
      method: 'GET',
      token: accessToken ?? undefined,
    },
  );
};
