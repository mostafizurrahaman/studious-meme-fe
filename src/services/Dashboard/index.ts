'use server';

import { requestBackendJson } from '@/lib/backend-api';
import { getValidAccessTokenForServerHandlerGet } from '@/lib/getValidAccessToken';
import { BackendOrder } from '../Order';

type BackendEnvelope<T> = {
  success?: boolean;
  message?: string;
  data?: T;
  error?: string;
};

export type DashboardOverview = {
  categories?: number;
  brands?: number;
  products?: number;
  users?: number;
  orders?: number;
  payments?: number;
  admins?: number;
  pendingPayments?: number;
  delivered?: number;
  recentOrders?: BackendOrder[];
};

export const getDashboardOverview = async (): Promise<
  BackendEnvelope<DashboardOverview>
> => {
  const accessToken = await getValidAccessTokenForServerHandlerGet();
  return requestBackendJson<BackendEnvelope<DashboardOverview>>(
    '/dashboard/overview',
    {
      method: 'GET',
      token: accessToken ?? undefined,
      next: { revalidate: 0 },
    },
  );
};
