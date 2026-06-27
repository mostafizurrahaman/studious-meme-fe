import type { Metadata } from 'next';
import { DashboardAdminsManager } from '@/components/dashboard/DashboardAdminsManager';
import { requireDashboardRoles } from '@/lib/dashboard-auth';
import { buildMetadata } from '@/lib/seo';
import { getAllAdmins } from '@/services/Admin';

export const metadata: Metadata = buildMetadata({
  title: 'Admin management',
  description: 'Create, update, and manage admin accounts.',
  path: '/dashboard/super-admin/admins',
  noindex: true,
});

export const dynamic = 'force-dynamic';

export default async function SuperAdminAdminsPage() {
  await requireDashboardRoles(['SUPER_ADMIN']);
  const adminsResult = await getAllAdmins().catch(() => null);
  const admins = Array.isArray(adminsResult?.data) ? adminsResult.data : [];

  return <DashboardAdminsManager admins={admins} />;
}
