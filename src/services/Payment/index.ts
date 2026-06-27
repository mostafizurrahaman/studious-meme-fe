'use server';

import { requestBackendJson } from '@/lib/backend-api';
import {
  getValidAccessTokenForServerActions,
  getValidAccessTokenForServerHandlerGet,
} from '@/lib/getValidAccessToken';

type BackendEnvelope<T> = {
  success?: boolean;
  message?: string;
  data?: T;
  error?: string;
  meta?: { page: number; limit: number; total: number; totalPages: number };
  summary?: { total?: number; totalAmount?: number };
};

export type BackendPayment = {
  _id: string;
  transactionId: string;
  order: string | { orderId: string };
  amount: number;
  status: 'PENDING' | 'SUCCEEDED' | 'FAILED' | 'CANCELED';
  createdAt: string;
  bankTranId?: string;
  valId?: string;
};

export type PaginatedBackendEnvelope<T> = BackendEnvelope<T> & {
  meta?: { page: number; limit: number; total: number; totalPages: number };
};

export const initiatePortPosPayment = async (
  orderId: string,
): Promise<BackendEnvelope<{ url?: string; paymentUrl?: string; transactionId?: string }>> => {
  const accessToken = await getValidAccessTokenForServerActions();
  return requestBackendJson<
    BackendEnvelope<{ url?: string; paymentUrl?: string; transactionId?: string }>
  >(`/payment/portpos/init/${orderId}`, {
    method: 'POST',
    token: accessToken ?? undefined,
  });
};

export type PortPosVerificationResult = {
  orderId: string;
  invoiceId: string;
  paymentStatus: string;
  orderStatus: string;
  verifiedStatus?: string;
};

export const verifyPortPosPayment = async (
  orderId: string,
): Promise<BackendEnvelope<PortPosVerificationResult>> => {
  const accessToken = await getValidAccessTokenForServerHandlerGet();
  return requestBackendJson<BackendEnvelope<PortPosVerificationResult>>(
    `/payment/portpos/verify/${orderId}`,
    {
      method: 'GET',
      token: accessToken ?? undefined,
    },
  );
};

type UserListParams = {
  page?: number;
  limit?: number;
};

const buildUserListQuery = (params: UserListParams = {}) => {
  const searchParams = new URLSearchParams();

  if (params.page) searchParams.set('page', String(params.page));
  if (params.limit) searchParams.set('limit', String(params.limit));

  const query = searchParams.toString();
  return query ? `?${query}` : '';
};

export const getMyPayments = async (
  params: UserListParams = {},
): Promise<PaginatedBackendEnvelope<BackendPayment[]>> => {
  const accessToken = await getValidAccessTokenForServerHandlerGet();
  return requestBackendJson<PaginatedBackendEnvelope<BackendPayment[]>>(
    `/payment/my-payments${buildUserListQuery(params)}`,
    {
      method: 'GET',
      token: accessToken ?? undefined,
    },
  );
};

type AdminPaymentParams = {
  page?: number;
  limit?: number;
};

export const getAllPaymentsForAdmin = async (
  params: AdminPaymentParams = {},
): Promise<BackendEnvelope<BackendPayment[]>> => {
  const accessToken = await getValidAccessTokenForServerHandlerGet();
  const searchParams = new URLSearchParams();

  if (params.page) searchParams.set('page', String(params.page));
  if (params.limit) searchParams.set('limit', String(params.limit));

  const query = searchParams.toString();

  return requestBackendJson<BackendEnvelope<BackendPayment[]>>(
    `/payment/admin${query ? `?${query}` : ''}`,
    {
      method: 'GET',
      token: accessToken ?? undefined,
    },
  );
};
