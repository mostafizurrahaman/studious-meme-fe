import type { Metadata } from 'next';

import { RoleProfilePage } from '@/components/dashboard/RoleProfilePage';
import { requireRoleSegment } from '@/lib/dashboard-auth';
import { buildMetadata } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: 'User profile',
  description: 'Update your profile.',
  path: '/dashboard/user/profile',
  noindex: true,
});

export const dynamic = 'force-dynamic';

export default async function UserProfilePage() {
  const user = await requireRoleSegment('user');
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
