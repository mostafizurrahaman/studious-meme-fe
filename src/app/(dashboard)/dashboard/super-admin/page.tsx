import type { Metadata } from 'next';

import { RoleDashboardPage } from '@/components/dashboard/RoleDashboardPage';
import { requireRoleSegment } from '@/lib/dashboard-auth';
import { buildMetadata } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: 'Super admin dashboard',
  description: 'Full platform control dashboard.',
  path: '/dashboard/super-admin',
  noindex: true,
});

export const dynamic = 'force-dynamic';

export default async function SuperAdminDashboardPage() {
  const user = await requireRoleSegment('super-admin');
  return <RoleDashboardPage role={user.role} />;
}
