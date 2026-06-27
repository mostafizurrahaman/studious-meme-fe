import type { Metadata } from 'next';
import { DashboardCategoriesManager } from '@/components/dashboard/DashboardCategoriesManager';
import { requireDashboardRoles } from '@/lib/dashboard-auth';
import { buildMetadata } from '@/lib/seo';
import { getAllCategories } from '@/services/Category';

export const metadata: Metadata = buildMetadata({
  title: 'Categories',
  description: 'Manage storefront category structure and counts.',
  path: '/dashboard/super-admin/categories',
  noindex: true,
});

export const dynamic = 'force-dynamic';

export default async function SuperAdminCategoriesPage() {
  await requireDashboardRoles(['SUPER_ADMIN']);
  const categoriesResult = await getAllCategories().catch(() => null);
  const categories = Array.isArray(categoriesResult?.data)
    ? (categoriesResult.data as Array<{
        name: string;
        slug?: string;
        totalNews?: number;
        isActive?: boolean;
      }>)
    : [];

  return <DashboardCategoriesManager categories={categories} />;
}
