'use server';

import { revalidateTag } from 'next/cache';
import { CACHE_TAGS } from '@/lib/cache-tags';
import { requestBackendJson } from '@/lib/backend-api';
import {
  getValidAccessTokenForServerActions,
  getValidAccessTokenForServerHandlerGet,
} from '@/lib/getValidAccessToken';

type AdminCreatePayload = {
  name: string;
  email: string;
  phone?: string;
  password: string;
  image?: File | string;
};

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

const unsupported = <T>(message: string): BackendEnvelope<T> => ({
  success: false,
  message,
});

export const getDashboardMetaData = async (): Promise<
  BackendEnvelope<unknown>
> => unsupported('Endpoint not supported by current backend.');

export const updateNewsStatus = async (): Promise<BackendEnvelope<unknown>> =>
  unsupported('Endpoint not supported by current backend.');

type GetAllUsersParams = {
  page?: number;
  limit?: number;
  searchTerm?: string;
};

export const getAllUsers = async (
  params: GetAllUsersParams = {},
): Promise<BackendEnvelope<unknown>> => {
  const accessToken = await getValidAccessTokenForServerHandlerGet();
  const searchParams = new URLSearchParams();

  if (params.page) searchParams.set('page', String(params.page));
  if (params.limit) searchParams.set('limit', String(params.limit));
  if (params.searchTerm?.trim())
    searchParams.set('searchTerm', params.searchTerm.trim());

  const query = searchParams.toString();

  return requestBackendJson<BackendEnvelope<unknown>>(
    `/user/admin-get-all${query ? `?${query}` : ''}`,
    {
      method: 'GET',
      token: accessToken ?? undefined,
    },
  );
};

export const getAllAdmins = async (): Promise<BackendEnvelope<unknown>> => {
  const accessToken = await getValidAccessTokenForServerHandlerGet();
  return requestBackendJson<BackendEnvelope<unknown>>('/admin/admins', {
    method: 'GET',
    token: accessToken ?? undefined,
  });
};

export const blockUnblockSingleUserById = async (): Promise<
  BackendEnvelope<unknown>
> => unsupported('Endpoint not supported by current backend.');

export const updateUserStatus = async (
  userId: string,
  isActive: boolean,
): Promise<BackendEnvelope<unknown>> => {
  const accessToken = await getValidAccessTokenForServerActions();
  const result = await requestBackendJson<BackendEnvelope<unknown>>(
    `/user/admin-users/${userId}/status`,
    {
      method: 'PATCH',
      body: { isActive },
      token: accessToken ?? undefined,
    },
  );

  revalidateTag(CACHE_TAGS.USERS, 'max');
  return result;
};

export const deleteUserById = async (
  userId: string,
): Promise<BackendEnvelope<unknown>> => {
  const accessToken = await getValidAccessTokenForServerActions();
  const result = await requestBackendJson<BackendEnvelope<unknown>>(
    `/user/admin-users/${userId}`,
    {
      method: 'DELETE',
      token: accessToken ?? undefined,
    },
  );

  revalidateTag(CACHE_TAGS.USERS, 'max');
  return result;
};

export const createUser = async (
  payload: AdminCreatePayload,
): Promise<BackendEnvelope<unknown>> => {
  const accessToken = await getValidAccessTokenForServerActions();
  const formData = new FormData();

  const { image, ...rest } = payload;
  formData.set(
    'data',
    JSON.stringify({
      name: rest.name.trim(),
      email: rest.email.trim().toLowerCase(),
      phone: rest.phone,
      password: rest.password,
      ...(typeof image === 'string' && image ? { image } : {}),
    }),
  );

  if (image instanceof File) {
    formData.append('image', image);
  }

  const result = await requestBackendJson<BackendEnvelope<unknown>>(
    '/admin/admins',
    {
      method: 'POST',
      body: formData,
      token: accessToken ?? undefined,
    },
  );

  revalidateTag(CACHE_TAGS.ADMINS, 'max');
  return result;
};

export const updateAdmin = async (
  userId: string,
  payload: {
    name?: string;
    email?: string;
    phone?: string;
    isActive?: boolean;
    image?: File | string;
  },
): Promise<BackendEnvelope<unknown>> => {
  const accessToken = await getValidAccessTokenForServerActions();
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

  const result = await requestBackendJson<BackendEnvelope<unknown>>(
    `/admin/admins/${userId}`,
    {
      method: 'PATCH',
      body: formData,
      token: accessToken ?? undefined,
    },
  );

  revalidateTag(CACHE_TAGS.ADMINS, 'max');
  return result;
};

export const deleteAdmin = async (
  userId: string,
): Promise<BackendEnvelope<unknown>> => {
  const accessToken = await getValidAccessTokenForServerActions();
  const result = await requestBackendJson<BackendEnvelope<unknown>>(
    `/admin/admins/${userId}`,
    {
      method: 'DELETE',
      token: accessToken ?? undefined,
    },
  );

  revalidateTag(CACHE_TAGS.ADMINS, 'max');
  return result;
};
