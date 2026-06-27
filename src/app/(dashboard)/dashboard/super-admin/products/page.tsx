import type { Metadata } from 'next';
import { DashboardProductsManager } from '@/components/dashboard/DashboardProductsManager';
import { requireDashboardRoles } from '@/lib/dashboard-auth';
import { buildMetadata } from '@/lib/seo';
import { getAllProducts } from '@/services/Product';
import { getAllBrandsAcrossPages } from '@/services/Brand';
import { getAllCategories } from '@/services/Category';
import type { BackendCategory } from '@/services/Category/mappers';

type Props = {
  searchParams: Promise<{ page?: string; limit?: string; searchTerm?: string }>;
};

export const metadata: Metadata = buildMetadata({
  title: 'Products',
  description: 'Manage product catalog entries and inventory status.',
  path: '/dashboard/super-admin/products',
  noindex: true,
});

export const dynamic = 'force-dynamic';

const parsePositiveInteger = (value: string | undefined, fallback: number) => {
  const parsed = Number(value);

  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
};

export default async function SuperAdminProductsPage({ searchParams }: Props) {
  await requireDashboardRoles(['SUPER_ADMIN']);
  const query = await searchParams;
  const page = parsePositiveInteger(query.page, 1);
  const limit = parsePositiveInteger(query.limit, 50);
  const searchTerm = query.searchTerm?.trim() ?? '';

  const [productsResult, brandsResult, categoriesResult] = await Promise.all([
    getAllProducts({ page, limit, searchTerm, includeInactive: true }).catch(
      () => null,
    ),
    getAllBrandsAcrossPages({ limit: 100 }).catch(() => null),
    getAllCategories().catch(() => null),
  ]);

  const products = productsResult?.data ?? [];
  const paginationMeta = {
    page: productsResult?.meta?.page ?? page,
    limit: productsResult?.meta?.limit ?? limit,
    total: productsResult?.meta?.total ?? products.length,
    totalPages:
      productsResult?.meta?.totalPages ??
      (Math.ceil(products.length / limit) || 1),
  };
  const brandOptions = Array.isArray(brandsResult?.data)
    ? brandsResult.data.flatMap((brand) =>
        brand._id
          ? [{ value: brand._id, label: brand.name?.trim() || brand.slug || 'Unnamed brand' }]
          : [],
      )
    : [];
  const categories = Array.isArray(categoriesResult?.data)
    ? (categoriesResult.data as BackendCategory[])
    : [];

  return (
    <DashboardProductsManager
      key={searchTerm}
      products={products}
      paginationMeta={paginationMeta}
      searchTerm={searchTerm}
      brandOptions={brandOptions}
      categories={categories}
    />
  );
}
