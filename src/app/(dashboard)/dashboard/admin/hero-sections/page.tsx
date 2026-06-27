import type { Metadata } from 'next';
import { DashboardHeroManager } from '@/components/dashboard/DashboardHeroManager';
import { buildMetadata } from '@/lib/seo';
import { requireDashboardRoles } from '@/lib/dashboard-auth';
import { getAllHeroSections } from '@/services/HeroSection';

export const metadata: Metadata = buildMetadata({
  title: 'Hero Sections',
  description: 'Manage homepage hero banners and featured promotional content.',
  path: '/dashboard/admin/hero-sections',
  noindex: true,
});

export const dynamic = 'force-dynamic';

export default async function AdminHeroSectionsPage() {
  await requireDashboardRoles(['ADMIN', 'SUPER_ADMIN']);
  const result = await getAllHeroSections().catch(() => null);
  const heroes = result?.data ?? [];

  return <DashboardHeroManager heroes={heroes} />;
}
