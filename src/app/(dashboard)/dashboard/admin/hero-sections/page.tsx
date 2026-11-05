import type { Metadata } from 'next';
import { DashboardHeroManager } from '@/components/dashboard/DashboardHeroManager';
import { buildMetadata } from '@/lib/seo';
import { requireDashboardRoles } from '@/lib/dashboard-auth';
import { getAllHeroBanners, getAllHeroSections } from '@/services/HeroSection';

export const metadata: Metadata = buildMetadata({
  title: 'Hero Banners',
  description: 'Manage homepage hero banners and featured promotional content.',
  path: '/dashboard/admin/hero-sections',
  noindex: true,
});

export const dynamic = 'force-dynamic';

export default async function AdminHeroSectionsPage() {
  await requireDashboardRoles(['ADMIN', 'SUPER_ADMIN', 'MODERATOR']);
  const [bannersResult, heroesResult] = await Promise.all([
    getAllHeroBanners().catch(() => null),
    getAllHeroSections().catch(() => null),
  ]);
  const banners = bannersResult?.data ?? [];
  const heroes = heroesResult?.data ?? [];

  return <DashboardHeroManager initialBanners={banners} heroes={heroes} />;
}
