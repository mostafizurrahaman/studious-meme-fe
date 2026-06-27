import type { Metadata } from 'next';
import { DashboardBrandsManager } from '@/components/dashboard/DashboardBrandsManager';
import { requireDashboardRoles } from '@/lib/dashboard-auth';
import { buildMetadata } from '@/lib/seo';
import { getAllBrands } from '@/services/Brand';

export const metadata: Metadata = buildMetadata({
  title: 'Brands',
  description: 'Manage brand directory entries and active status.',
  path: '/dashboard/super-admin/brands',
  noindex: true,
});

export const dynamic = 'force-dynamic';

type Props = {
  searchParams: Promise<{ page?: string; limit?: string; searchTerm?: string }>;
};

const parsePositiveInteger = (value: string | undefined, fallback: number) => {
  const parsed = Number(value);

  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
};

export default async function SuperAdminBrandsPage({ searchParams }: Props) {
  await requireDashboardRoles(['SUPER_ADMIN']);
  const query = await searchParams;
  const page = parsePositiveInteger(query.page, 1);
  const limit = parsePositiveInteger(query.limit, 50);
  const searchTerm = query.searchTerm?.trim() ?? '';
  const brandsResult = await getAllBrands({ page, limit, searchTerm }).catch(
    () => null,
  );
  const brands = Array.isArray(brandsResult?.data) ? brandsResult.data : [];
  const paginationMeta = {
    page: brandsResult?.meta?.page ?? page,
    limit: brandsResult?.meta?.limit ?? limit,
    total: brandsResult?.meta?.total ?? brands.length,
    totalPages:
      brandsResult?.meta?.totalPages ?? (Math.ceil(brands.length / limit) || 1),
  };

  return (
    <DashboardBrandsManager
      brands={brands}
      paginationMeta={paginationMeta}
      searchTerm={searchTerm}
    />
  );
}
