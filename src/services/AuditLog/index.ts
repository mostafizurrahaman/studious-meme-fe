'use server';

import { requestBackendJson } from '@/lib/backend-api';
import {
  getValidAccessTokenForServerActions,
  getValidAccessTokenForServerHandlerGet,
} from '@/lib/getValidAccessToken';

export type AuditAction =
  | 'CREATE'
  | 'UPDATE'
  | 'DELETE'
  | 'STATUS_CHANGE'
  | 'REORDER'
  | 'LOGIN'
  | 'BULK_ACTION'
  | 'OTHER';

export type AuditModule =
  | 'HERO_SECTION'
  | 'PRODUCT'
  | 'BRAND'
  | 'CATEGORY'
  | 'ORDER'
  | 'PAYMENT'
  | 'COUPON'
  | 'USER'
  | 'ADMIN'
  | 'PAGE'
  | 'AUTH'
  | 'SYSTEM';

export type BackendAuditLog = {
  _id: string;
  user?: string;
  userName: string;
  userEmail: string;
  userRole: 'USER' | 'ADMIN' | 'SUPER_ADMIN';
  userImage?: string;
  action: AuditAction;
  module: AuditModule;
  description: string;
  entityId?: string;
  method: string;
  path: string;
  statusCode: number;
  ipAddress?: string;
  userAgent?: string;
  details?: Record<string, any>;
  timestamp: string;
  createdAt?: string;
  updatedAt?: string;
};

export type AuditLogStats = {
  totalLogs: number;
  todayLogs: number;
  superAdminLogs: number;
  adminLogs: number;
  actionBreakdown: Array<{ action: AuditAction; count: number }>;
  moduleBreakdown: Array<{ module: AuditModule; count: number }>;
  topAdmins: Array<{
    email: string;
    name: string;
    role: string;
    image?: string;
    totalActions: number;
    lastAction: string;
  }>;
};

export type AuditLogQueryParams = {
  page?: number;
  limit?: number;
  searchTerm?: string;
  action?: string;
  module?: string;
  userRole?: string;
  userId?: string;
  startDate?: string;
  endDate?: string;
};

export type BackendEnvelope<T> = {
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

/**
 * Fetch paginated & filtered audit logs
 */
export const getAuditLogs = async (
  params: AuditLogQueryParams = {},
): Promise<BackendEnvelope<BackendAuditLog[]>> => {
  const accessToken = await getValidAccessTokenForServerHandlerGet();
  const searchParams = new URLSearchParams();

  if (params.page) searchParams.set('page', String(params.page));
  if (params.limit) searchParams.set('limit', String(params.limit));
  if (params.searchTerm?.trim())
    searchParams.set('searchTerm', params.searchTerm.trim());
  if (params.action && params.action !== 'ALL')
    searchParams.set('action', params.action);
  if (params.module && params.module !== 'ALL')
    searchParams.set('module', params.module);
  if (params.userRole && params.userRole !== 'ALL')
    searchParams.set('userRole', params.userRole);
  if (params.userId) searchParams.set('userId', params.userId);
  if (params.startDate) searchParams.set('startDate', params.startDate);
  if (params.endDate) searchParams.set('endDate', params.endDate);

  const query = searchParams.toString();
  const endpoint = `/audit-logs${query ? `?${query}` : ''}`;

  return requestBackendJson<BackendEnvelope<BackendAuditLog[]>>(endpoint, {
    method: 'GET',
    token: accessToken ?? undefined,
    cache: 'no-store',
  });
};

/**
 * Fetch audit log metrics & analytics
 */
export const getAuditLogStats = async (): Promise<
  BackendEnvelope<AuditLogStats>
> => {
  const accessToken = await getValidAccessTokenForServerHandlerGet();
  return requestBackendJson<BackendEnvelope<AuditLogStats>>(
    '/audit-logs/stats',
    {
      method: 'GET',
      token: accessToken ?? undefined,
      cache: 'no-store',
    },
  );
};

/**
 * Fetch single audit log entry by ID
 */
export const getAuditLogById = async (
  id: string,
): Promise<BackendEnvelope<BackendAuditLog>> => {
  const accessToken = await getValidAccessTokenForServerActions();
  return requestBackendJson<BackendEnvelope<BackendAuditLog>>(
    `/audit-logs/${id}`,
    {
      method: 'GET',
      token: accessToken ?? undefined,
      cache: 'no-store',
    },
  );
};
