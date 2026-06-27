import type { Metadata } from 'next';

import { RoleDashboardPage } from '@/components/dashboard/RoleDashboardPage';
import { requireRoleSegment } from '@/lib/dashboard-auth';
import { buildMetadata } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: 'User dashboard',
  description: 'Personal order and payment dashboard.',
  path: '/dashboard/user',
  noindex: true,
});

export const dynamic = 'force-dynamic';

export default async function UserDashboardPage() {
  const user = await requireRoleSegment('user');
  return <RoleDashboardPage role={user.role} />;
}
