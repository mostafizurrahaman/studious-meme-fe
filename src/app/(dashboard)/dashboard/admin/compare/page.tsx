import type { Metadata } from 'next';
import {
  DashboardComparisonManager,
  type DashboardComparisonRecord,
} from '@/components/dashboard/DashboardEngagementManager';
import { requireDashboardRoles } from '@/lib/dashboard-auth';
import { buildMetadata } from '@/lib/seo';
import { getAllComparisonHistory } from '@/services/ComparisonHistory';

export const metadata: Metadata = buildMetadata({
  title: 'Comparison History',
  description: 'Review backend-saved product comparison activity.',
  path: '/dashboard/admin/compare',
  noindex: true,
});

export const dynamic = 'force-dynamic';

type Props = {
  searchParams: Promise<{ page?: string; limit?: string }>;
};

const parsePositiveInteger = (value: string | undefined, fallback: number) => {
  const parsed = Number(value);

  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
};

export default async function AdminComparePage({ searchParams }: Props) {
  await requireDashboardRoles(['ADMIN', 'SUPER_ADMIN']);
  const query = await searchParams;
  const page = parsePositiveInteger(query.page, 1);
  const limit = parsePositiveInteger(query.limit, 50);
  const result = await getAllComparisonHistory({ page, limit }).catch(
    () => null,
  );
  const records = Array.isArray(result?.data)
    ? (result.data as DashboardComparisonRecord[])
    : [];
  const paginationMeta = {
    page: result?.meta?.page ?? page,
    limit: result?.meta?.limit ?? limit,
    total: result?.meta?.total ?? records.length,
    totalPages:
      result?.meta?.totalPages ?? (Math.ceil(records.length / limit) || 1),
  };

  return (
    <DashboardComparisonManager
      records={records}
      paginationMeta={paginationMeta}
    />
  );
}
