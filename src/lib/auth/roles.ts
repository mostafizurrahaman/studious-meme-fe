import type { AuthRole, DashboardRouteSegment } from '@/types';

const ROLE_TO_SEGMENT: Record<AuthRole, DashboardRouteSegment> = {
  SUPER_ADMIN: 'super-admin',
  ADMIN: 'admin',
  USER: 'user',
};

const SEGMENT_TO_ROLE: Record<DashboardRouteSegment, AuthRole> = {
  'super-admin': 'SUPER_ADMIN',
  admin: 'ADMIN',
  user: 'USER',
};

export function normalizeRole(
  role: string | null | undefined,
): AuthRole | null {
  if (!role) return null;

  const normalized = role.trim().toUpperCase().replace(/-/g, '_') as AuthRole;
  return normalized in ROLE_TO_SEGMENT ? normalized : null;
}

export function normalizeRoleSegment(
  segment: string | null | undefined,
): DashboardRouteSegment | null {
  if (!segment) return null;

  const normalized = segment
    .trim()
    .toLowerCase()
    .replace(/_/g, '-') as DashboardRouteSegment;
  return normalized in SEGMENT_TO_ROLE ? normalized : null;
}

export function getDashboardSegmentByRole(
  role: string | null | undefined,
): DashboardRouteSegment | null {
  const normalized = normalizeRole(role);
  return normalized ? ROLE_TO_SEGMENT[normalized] : null;
}

export function getDashboardPathByRole(
  role: string | null | undefined,
): string | null {
  const segment = getDashboardSegmentByRole(role);
  return segment ? `/dashboard/${segment}` : null;
}

export function getProfilePathByRole(
  role: string | null | undefined,
): string | null {
  const dashboardPath = getDashboardPathByRole(role);
  return dashboardPath ? `${dashboardPath}/profile` : null;
}

export function getAdminsPathByRole(
  role: string | null | undefined,
): string | null {
  return normalizeRole(role) === 'SUPER_ADMIN'
    ? '/dashboard/super-admin/admins'
    : null;
}

export function isDashboardRootPath(pathname: string): boolean {
  return pathname === '/dashboard' || pathname === '/dashboard/';
}

export function isDashboardPathForRole(
  role: string | null | undefined,
  pathname: string,
): boolean {
  const dashboardPath = getDashboardPathByRole(role);

  if (!dashboardPath) {
    return false;
  }

  return pathname === dashboardPath || pathname.startsWith(`${dashboardPath}/`);
}

export function isAllowedDashboardPath(
  role: string | null | undefined,
  pathname: string,
): boolean {
  return (
    isDashboardRootPath(pathname) || isDashboardPathForRole(role, pathname)
  );
}

export function getCanonicalRolePathFromSegment(
  segment: string | null | undefined,
): string | null {
  const normalizedSegment = normalizeRoleSegment(segment);

  if (!normalizedSegment) {
    return null;
  }

  return `/dashboard/${normalizedSegment}`;
}

export function getCanonicalRoleFromSegment(
  segment: string | null | undefined,
): AuthRole | null {
  const normalizedSegment = normalizeRoleSegment(segment);
  return normalizedSegment ? SEGMENT_TO_ROLE[normalizedSegment] : null;
}

export function getRoleLabel(role: string | null | undefined): string {
  const normalized = normalizeRole(role);

  switch (normalized) {
    case 'SUPER_ADMIN':
      return 'Super admin';
    case 'ADMIN':
      return 'Admin';
    case 'USER':
      return 'User';
    default:
      return 'Guest';
  }
}
