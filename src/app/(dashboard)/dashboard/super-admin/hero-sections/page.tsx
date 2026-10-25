import type { Metadata } from 'next';
import { DashboardHeroManager } from '@/components/dashboard/DashboardHeroManager';
import { buildMetadata } from '@/lib/seo';
import { requireDashboardRoles } from '@/lib/dashboard-auth';
import { getAllHeroBanners } from '@/services/HeroSection';

export const metadata: Metadata = buildMetadata({
  title: 'Hero Banners',
  description: 'Manage homepage hero banners and featured promotional content.',
  path: '/dashboard/super-admin/hero-sections',
  noindex: true,
});

export const dynamic = 'force-dynamic';

export default async function SuperAdminHeroSectionsPage() {
  await requireDashboardRoles(['SUPER_ADMIN']);
  const result = await getAllHeroBanners().catch(() => null);
  const banners = result?.data ?? [];

  return <DashboardHeroManager initialBanners={banners} />;
}
