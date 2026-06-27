import type { AuthRole } from '@/types';

import {
  getDashboardPathByRole,
  getDashboardSegmentByRole,
  isDashboardPathForRole,
  normalizeRoleSegment,
} from './auth/roles';

export type DashboardRole = AuthRole;

export const getDashboardRoleSegment = (role: string) =>
  getDashboardSegmentByRole(role) ?? 'user';

export const getDashboardPath = (role: string) =>
  getDashboardPathByRole(role) ?? '/dashboard';

export const isRoleSegmentMatch = (role: string, segment: string) =>
  normalizeRoleSegment(segment) === getDashboardSegmentByRole(role) &&
  isDashboardPathForRole(role, `/dashboard/${segment}`);
