import type { Metadata } from 'next';

import { RoleProfilePage } from '@/components/dashboard/RoleProfilePage';
import { requireRoleSegment } from '@/lib/dashboard-auth';
import { buildMetadata } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: 'Super admin profile',
  description: 'Update your super admin profile.',
  path: '/dashboard/super-admin/profile',
  noindex: true,
});

export const dynamic = 'force-dynamic';

export default async function SuperAdminProfilePage() {
  const user = await requireRoleSegment('super-admin');
  return (
    <RoleProfilePage
      role={user.role}
      user={{
        name: user.name,
        email: user.email,
        phone: user.phone,
        dob: user.dob,
        image: user.image,
      }}
    />
  );
}
