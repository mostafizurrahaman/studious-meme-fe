import type { Metadata } from 'next';
import { DashboardCartManager } from '@/components/dashboard/DashboardEngagementManager';
import { requireDashboardRoles } from '@/lib/dashboard-auth';
import { buildMetadata } from '@/lib/seo';
import { getAllCarts } from '@/services/Cart';

type Props = {
  searchParams: Promise<{ page?: string; limit?: string }>;
};

export const metadata: Metadata = buildMetadata({
  title: 'Cart Activity',
  description: 'Review backend-saved cart activity.',
  path: '/dashboard/super-admin/cart',
  noindex: true,
});

export const dynamic = 'force-dynamic';

const parsePositiveInteger = (value: string | undefined, fallback: number) => {
  const parsed = Number(value);

  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
};

export default async function SuperAdminCartPage({ searchParams }: Props) {
  await requireDashboardRoles(['SUPER_ADMIN']);
  const query = await searchParams;
  const page = parsePositiveInteger(query.page, 1);
  const limit = parsePositiveInteger(query.limit, 50);
  const result = await getAllCarts({ page, limit }).catch(() => null);
  const records = Array.isArray(result?.data) ? result.data : [];
  const paginationMeta = {
    page: result?.meta?.page ?? page,
    limit: result?.meta?.limit ?? limit,
    total: result?.meta?.total ?? records.length,
    totalPages:
      result?.meta?.totalPages ?? (Math.ceil(records.length / limit) || 1),
  };

  return (
    <DashboardCartManager records={records} paginationMeta={paginationMeta} />
  );
}
