'use server';

import { requestBackendJson } from '@/lib/backend-api';
import type { OrderStatus } from '@/lib/order-status';
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
};

export type BackendOrderItem = {
  title: string;
  slug: string;
  sku: string;
  image: string;
  brand: string;
  category: string;
  unitPrice: number;
  sellingUnit?: string;
  weightKg: number;
  isNoCOD: boolean;
  quantity: number;
  lineTotal: number;
};

export type BackendOrder = {
  _id: string;
  orderId: string;
  items: BackendOrderItem[];
  customer: {
    name: string;
    phone: string;
    email?: string;
    address: string;
    city: string;
    note?: string;
  };
  subtotal: number;
  discount: number;
  delivery: number;
  shippingZone?: 'inside_dhaka' | 'outside_dhaka';
  shippingCharge?: number;
  totalWeightKg?: number;
  codEligible?: boolean;
  codReasons?: string[];
  total: number;
  couponCode?: string;
  paymentMethod: 'CASH_ON_DELIVERY' | 'PORTPOS';
  paymentStatus:
    | 'UNPAID'
    | 'PENDING'
    | 'PENDING_PAYMENT'
    | 'PAID'
    | 'FAILED'
    | 'CANCELLED'
    | 'REFUNDED';
  status: OrderStatus;
  transactionId?: string;
  paymentUrl?: string;
  gatewayUrl?: string;
  createdAt: string;
  updatedAt: string;
};

export type PaginatedBackendEnvelope<T> = BackendEnvelope<T> & {
  meta?: { page: number; limit: number; total: number; totalPages: number };
};

export type CreateOrderPayload = {
  items: Array<{ sku: string; quantity: number }>;
  customer: {
    name: string;
    phone: string;
    email?: string;
    address: string;
    city: string;
    note?: string;
  };
  couponCode?: string;
  paymentMethod: 'CASH_ON_DELIVERY' | 'PORTPOS';
};

export type PreviewCheckoutPayload = CreateOrderPayload;

export type CheckoutPreview = {
  items: BackendOrderItem[];
  subtotal: number;
  discount: number;
  shippingZone: 'inside_dhaka' | 'outside_dhaka';
  shippingCharge: number;
  totalWeightKg: number;
  codEligible: boolean;
  codReasons: string[];
  total: number;
};

export const createOrder = async (
  payload: CreateOrderPayload,
): Promise<BackendEnvelope<BackendOrder>> => {
  const accessToken = await getValidAccessTokenForServerActions();
  return requestBackendJson<BackendEnvelope<BackendOrder>>('/order/checkout', {
    method: 'POST',
    body: payload,
    token: accessToken ?? undefined,
  });
};

export const previewCheckout = async (
  payload: PreviewCheckoutPayload,
): Promise<BackendEnvelope<CheckoutPreview>> => {
  const accessToken = await getValidAccessTokenForServerActions();
  return requestBackendJson<BackendEnvelope<CheckoutPreview>>(
    '/order/checkout-preview',
    {
      method: 'POST',
      body: payload,
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

export const getMyOrders = async (
  params: UserListParams = {},
): Promise<PaginatedBackendEnvelope<BackendOrder[]>> => {
  const accessToken = await getValidAccessTokenForServerHandlerGet();
  return requestBackendJson<PaginatedBackendEnvelope<BackendOrder[]>>(
    `/order/my-orders${buildUserListQuery(params)}`,
    {
      method: 'GET',
      token: accessToken ?? undefined,
    },
  );
};

export const getMyOrderById = async (
  orderId: string,
): Promise<BackendEnvelope<BackendOrder>> => {
  const accessToken = await getValidAccessTokenForServerHandlerGet();
  return requestBackendJson<BackendEnvelope<BackendOrder>>(
    `/order/my-orders/${orderId}`,
    {
      method: 'GET',
      token: accessToken ?? undefined,
    },
  );
};

type AdminListParams = {
  page?: number;
  limit?: number;
  status?: string;
};

const buildAdminListQuery = (params: AdminListParams = {}) => {
  const searchParams = new URLSearchParams();

  if (params.page) searchParams.set('page', String(params.page));
  if (params.limit) searchParams.set('limit', String(params.limit));
  if (params.status?.trim()) searchParams.set('status', params.status.trim());

  const query = searchParams.toString();
  return query ? `?${query}` : '';
};

export const getAllOrdersForAdmin = async (
  params: AdminListParams = {},
): Promise<BackendEnvelope<BackendOrder[]>> => {
  const accessToken = await getValidAccessTokenForServerHandlerGet();
  return requestBackendJson<BackendEnvelope<BackendOrder[]>>(
    `/order/admin/orders${buildAdminListQuery(params)}`,
    {
      method: 'GET',
      token: accessToken ?? undefined,
    },
  );
};

export const getOrderById = async (
  orderId: string,
): Promise<BackendEnvelope<BackendOrder>> => {
  const accessToken = await getValidAccessTokenForServerHandlerGet();
  return requestBackendJson<BackendEnvelope<BackendOrder>>(
    `/order/orders/${orderId}`,
    {
      method: 'GET',
      token: accessToken ?? undefined,
    },
  );
};

export const updateOrderStatus = async (
  orderId: string,
  status: BackendOrder['status'],
): Promise<BackendEnvelope<BackendOrder>> => {
  const accessToken = await getValidAccessTokenForServerActions();
  return requestBackendJson<BackendEnvelope<BackendOrder>>(
    `/order/admin/orders/${orderId}/status`,
    {
      method: 'PATCH',
      body: { status },
      token: accessToken ?? undefined,
    },
  );
};
