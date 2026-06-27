import type { Metadata } from 'next';
import {
  DashboardWishlistManager,
  type DashboardWishlistRecord,
} from '@/components/dashboard/DashboardEngagementManager';
import { requireDashboardRoles } from '@/lib/dashboard-auth';
import { buildMetadata } from '@/lib/seo';
import { getAllWishlist } from '@/services/WishlistHistory';

export const metadata: Metadata = buildMetadata({
  title: 'Wishlist Activity',
  description: 'Review backend-saved wishlist activity.',
  path: '/dashboard/admin/wishlist',
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

export default async function AdminWishlistPage({ searchParams }: Props) {
  await requireDashboardRoles(['ADMIN', 'SUPER_ADMIN']);
  const query = await searchParams;
  const page = parsePositiveInteger(query.page, 1);
  const limit = parsePositiveInteger(query.limit, 50);
  const result = await getAllWishlist({ page, limit }).catch(() => null);
  const records = Array.isArray(result?.data)
    ? (result.data as DashboardWishlistRecord[])
    : [];
  const paginationMeta = {
    page: result?.meta?.page ?? page,
    limit: result?.meta?.limit ?? limit,
    total: result?.meta?.total ?? records.length,
    totalPages:
      result?.meta?.totalPages ?? (Math.ceil(records.length / limit) || 1),
  };

  return (
    <DashboardWishlistManager
      records={records}
      paginationMeta={paginationMeta}
    />
  );
}
