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
};

export type Address = {
  _id: string;
  user: string;
  fullName: string;
  phoneNumber: string;
  email: string;
  district: string;
  deliveryAddress: string;
  type: string;
  isDefault?: boolean;
  createdAt: string;
  updatedAt: string;
};

export type AddressInput = {
  fullName: string;
  phoneNumber: string;
  email: string;
  district: string;
  deliveryAddress: string;
  type: string;
  isDefault?: boolean;
};

export const getMyAddresses = async (): Promise<BackendEnvelope<Address[]>> => {
  const accessToken = await getValidAccessTokenForServerHandlerGet();

  if (!accessToken) {
    return { success: false, data: [] };
  }

  return requestBackendJson<BackendEnvelope<Address[]>>('/address', {
    method: 'GET',
    token: accessToken,
    next: { tags: [CACHE_TAGS.ADDRESSES] },
  });
};

export const createAddress = async (
  data: AddressInput,
): Promise<BackendEnvelope<Address>> => {
  const accessToken = await getValidAccessTokenForServerActions();

  if (!accessToken) {
    return {
      success: false,
      message: 'Sign in to add addresses to your account.',
    };
  }

  const result = await requestBackendJson<BackendEnvelope<Address>>('/address', {
    method: 'POST',
    body: data,
    token: accessToken,
  });

  revalidateTag(CACHE_TAGS.ADDRESSES, 'max');
  return result;
};

export const updateAddress = async (
  addressId: string,
  data: Partial<AddressInput>,
): Promise<BackendEnvelope<Address>> => {
  const accessToken = await getValidAccessTokenForServerActions();

  if (!accessToken) {
    return {
      success: false,
      message: 'Sign in to update your addresses.',
    };
  }

  const result = await requestBackendJson<BackendEnvelope<Address>>(
    `/address/${addressId}`,
    {
      method: 'PATCH',
      body: data,
      token: accessToken,
    },
  );

  revalidateTag(CACHE_TAGS.ADDRESSES, 'max');
  return result;
};

export const deleteAddress = async (
  addressId: string,
): Promise<BackendEnvelope<Address>> => {
  const accessToken = await getValidAccessTokenForServerActions();

  if (!accessToken) {
    return {
      success: false,
      message: 'Sign in to delete your addresses.',
    };
  }

  const result = await requestBackendJson<BackendEnvelope<Address>>(
    `/address/${addressId}`,
    {
      method: 'DELETE',
      token: accessToken,
    },
  );

  revalidateTag(CACHE_TAGS.ADDRESSES, 'max');
  return result;
};

export const setDefaultAddress = async (
  addressId: string,
): Promise<BackendEnvelope<Address>> => {
  const accessToken = await getValidAccessTokenForServerActions();

  if (!accessToken) {
    return {
      success: false,
      message: 'Sign in to update your addresses.',
    };
  }

  const result = await requestBackendJson<BackendEnvelope<Address>>(
    `/address/${addressId}/default`,
    {
      method: 'PATCH',
      token: accessToken,
    },
  );

  revalidateTag(CACHE_TAGS.ADDRESSES, 'max');
  return result;
};
