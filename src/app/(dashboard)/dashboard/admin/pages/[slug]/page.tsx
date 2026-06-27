import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { DashboardPagesManager } from '@/components/dashboard/DashboardPagesManager';
import { requireDashboardRoles } from '@/lib/dashboard-auth';
import { isDashboardPageSlug, pageLabels } from '@/lib/page-content';
import { buildMetadata } from '@/lib/seo';
import { getPageByType } from '@/services/Page';

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const title = isDashboardPageSlug(slug) ? pageLabels[slug] : 'Pages';

  return buildMetadata({
    title,
    description: 'Manage storefront page content.',
    path: `/dashboard/admin/pages/${slug}`,
    noindex: true,
  });
}

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPageEditor({ params }: Props) {
  await requireDashboardRoles(['ADMIN', 'SUPER_ADMIN']);
  const { slug } = await params;

  if (!isDashboardPageSlug(slug)) {
    notFound();
  }

  const pageResult = await getPageByType(slug).catch(() => null);

  return (
    <DashboardPagesManager
      key={slug}
      slug={slug}
      page={pageResult?.data ?? null}
    />
  );
}
