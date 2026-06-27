import type { Metadata } from 'next';
import { requireDashboardRoles } from '@/lib/dashboard-auth';
import { buildMetadata } from '@/lib/seo';
import { getAllPaymentsForAdmin } from '@/services/Payment';
import { DashboardPaymentsManager } from '@/components/dashboard/DashboardPaymentsManager';

export const metadata: Metadata = buildMetadata({
  title: 'Payments',
  description: 'Manage storefront payment history.',
  path: '/dashboard/admin/payments',
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

export default async function AdminPaymentsPage({ searchParams }: Props) {
  await requireDashboardRoles(['ADMIN', 'SUPER_ADMIN']);
  const query = await searchParams;
  const page = parsePositiveInteger(query.page, 1);
  const limit = parsePositiveInteger(query.limit, 50);
  const paymentsResult = await getAllPaymentsForAdmin({ page, limit }).catch(
    () => null,
  );
  const payments = Array.isArray(paymentsResult?.data)
    ? paymentsResult.data
    : [];
  const paginationMeta = {
    page: paymentsResult?.meta?.page ?? page,
    limit: paymentsResult?.meta?.limit ?? limit,
    total: paymentsResult?.meta?.total ?? payments.length,
    totalPages:
      paymentsResult?.meta?.totalPages ??
      (Math.ceil(payments.length / limit) || 1),
  };

  return (
    <DashboardPaymentsManager
      payments={payments}
      title="Payments"
      description="Browse through all the payments received via PortPOS."
      listBaseHref="/dashboard/admin/payments"
      paginationMeta={paginationMeta}
    />
  );
}
