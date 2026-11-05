import type { Metadata } from 'next';
import { DashboardAdminsManager } from '@/components/dashboard/DashboardAdminsManager';
import { requireDashboardRoles } from '@/lib/dashboard-auth';
import { buildMetadata } from '@/lib/seo';
import { getAllAdmins } from '@/services/Admin';

export const metadata: Metadata = buildMetadata({
  title: 'Moderator management',
  description: 'Create, update, and manage moderator accounts.',
  path: '/dashboard/admin/moderators',
  noindex: true,
});

export const dynamic = 'force-dynamic';

export default async function AdminModeratorsPage() {
  const user = await requireDashboardRoles(['ADMIN', 'SUPER_ADMIN']);
  const adminsResult = await getAllAdmins().catch(() => null);
  const admins = Array.isArray(adminsResult?.data) ? adminsResult.data : [];

  return (
    <DashboardAdminsManager
      admins={admins}
      currentRole={user.role as 'ADMIN' | 'SUPER_ADMIN'}
    />
  );
}

