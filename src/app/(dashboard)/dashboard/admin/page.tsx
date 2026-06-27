import type { Metadata } from 'next';

import { RoleDashboardPage } from '@/components/dashboard/RoleDashboardPage';
import { requireRoleSegment } from '@/lib/dashboard-auth';
import { buildMetadata } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: 'Admin dashboard',
  description: 'Catalog and order operations dashboard.',
  path: '/dashboard/admin',
  noindex: true,
});

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  const user = await requireRoleSegment('admin');
  return <RoleDashboardPage role={user.role} />;
}
