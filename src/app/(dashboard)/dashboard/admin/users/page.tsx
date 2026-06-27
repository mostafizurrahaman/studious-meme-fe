import type { Metadata } from 'next';
import { DashboardUsersManager } from '@/components/dashboard/DashboardUsersManager';
import { requireDashboardRoles } from '@/lib/dashboard-auth';
import { buildMetadata } from '@/lib/seo';
import { getAllUsers } from '@/services/Admin';

type Props = {
  searchParams: Promise<{ page?: string; limit?: string; searchTerm?: string }>;
};

export const metadata: Metadata = buildMetadata({
  title: 'Users',
  description: 'Manage customer user accounts.',
  path: '/dashboard/admin/users',
  noindex: true,
});

export const dynamic = 'force-dynamic';

const parsePositiveInteger = (value: string | undefined, fallback: number) => {
  const parsed = Number(value);

  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
};

export default async function AdminUsersPage({ searchParams }: Props) {
  await requireDashboardRoles(['ADMIN', 'SUPER_ADMIN']);
  const query = await searchParams;
  const page = parsePositiveInteger(query.page, 1);
  const limit = parsePositiveInteger(query.limit, 50);
  const searchTerm = query.searchTerm?.trim() ?? '';
  const usersResult = await getAllUsers({ page, limit, searchTerm }).catch(
    () => null,
  );
  const users = Array.isArray(usersResult?.data)
    ? (usersResult.data as Array<unknown>)
    : [];
  const paginationMeta = {
    page: usersResult?.meta?.page ?? page,
    limit: usersResult?.meta?.limit ?? limit,
    total: usersResult?.meta?.total ?? users.length,
    totalPages:
      usersResult?.meta?.totalPages ?? (Math.ceil(users.length / limit) || 1),
  };

  return (
    <DashboardUsersManager
      key={`${page}-${limit}-${searchTerm}`}
      users={
        users as Array<{
          _id?: string;
          name?: string;
          email?: string;
          phone?: string;
          image?: string;
          dob?: string;
          isActive?: boolean;
          createdAt?: string;
        }>
      }
      title="Users"
      description="Browse customer accounts managed through the backend."
      paginationMeta={paginationMeta}
      searchTerm={searchTerm}
    />
  );
}
