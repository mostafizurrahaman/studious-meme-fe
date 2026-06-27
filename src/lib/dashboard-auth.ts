import { redirect } from 'next/navigation';
import { getDashboardPath, isRoleSegmentMatch } from '@/lib/dashboard';
import { getCurrentUser } from '@/services/Auth';

export async function requireDashboardUser() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/my-account');
  }

  return user;
}

export async function requireRoleSegment(segment: string) {
  const user = await requireDashboardUser();

  if (!isRoleSegmentMatch(user.role, segment)) {
    redirect(getDashboardPath(user.role));
  }

  return user;
}

export async function requireDashboardRoles(roles: string[]) {
  const user = await requireDashboardUser();

  if (!roles.includes(user.role)) {
    redirect(getDashboardPath(user.role));
  }

  return user;
}
