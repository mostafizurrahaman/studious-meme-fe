import { describe, expect, it } from 'vitest';
import {
  getAdminsPathByRole,
  getCanonicalRoleFromSegment,
  getCanonicalRolePathFromSegment,
  getDashboardPathByRole,
  getDashboardSegmentByRole,
  getProfilePathByRole,
  getRoleLabel,
  isAllowedDashboardPath,
  isDashboardPathForRole,
  isDashboardRootPath,
  normalizeRole,
  normalizeRoleSegment,
} from './roles';

describe('auth role helpers', () => {
  it('normalizes roles from common input shapes', () => {
    expect(normalizeRole('super-admin')).toBe('SUPER_ADMIN');
    expect(normalizeRole(' admin ')).toBe('ADMIN');
    expect(normalizeRole('USER')).toBe('USER');
    expect(normalizeRole('unknown')).toBeNull();
  });

  it('normalizes dashboard segments', () => {
    expect(normalizeRoleSegment('SUPER_ADMIN')).toBe('super-admin');
    expect(normalizeRoleSegment('admin')).toBe('admin');
    expect(normalizeRoleSegment('user')).toBe('user');
    expect(normalizeRoleSegment('invalid')).toBeNull();
  });

  it('maps roles to dashboard paths', () => {
    expect(getDashboardSegmentByRole('SUPER_ADMIN')).toBe('super-admin');
    expect(getDashboardPathByRole('ADMIN')).toBe('/dashboard/admin');
    expect(getDashboardPathByRole('USER')).toBe('/dashboard/user');
    expect(getDashboardPathByRole('guest')).toBeNull();
  });

  it('maps roles to profile and admin paths', () => {
    expect(getProfilePathByRole('SUPER_ADMIN')).toBe(
      '/dashboard/super-admin/profile',
    );
    expect(getAdminsPathByRole('SUPER_ADMIN')).toBe(
      '/dashboard/super-admin/admins',
    );
    expect(getAdminsPathByRole('ADMIN')).toBeNull();
  });

  it('checks dashboard path membership and canonical mappings', () => {
    expect(isDashboardRootPath('/dashboard')).toBe(true);
    expect(isDashboardRootPath('/dashboard/')).toBe(true);
    expect(isDashboardPathForRole('ADMIN', '/dashboard/admin/products')).toBe(
      true,
    );
    expect(isDashboardPathForRole('ADMIN', '/dashboard/user')).toBe(false);
    expect(isAllowedDashboardPath('USER', '/dashboard/user/profile')).toBe(
      true,
    );
    expect(getCanonicalRolePathFromSegment('super_admin')).toBe(
      '/dashboard/super-admin',
    );
    expect(getCanonicalRoleFromSegment('super-admin')).toBe('SUPER_ADMIN');
  });

  it('returns readable labels', () => {
    expect(getRoleLabel('SUPER_ADMIN')).toBe('Super admin');
    expect(getRoleLabel('ADMIN')).toBe('Admin');
    expect(getRoleLabel('USER')).toBe('User');
    expect(getRoleLabel(null)).toBe('Guest');
  });
});
