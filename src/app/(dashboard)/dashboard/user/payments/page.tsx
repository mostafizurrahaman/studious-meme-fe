import type { Metadata } from 'next';
import { requireRoleSegment } from '@/lib/dashboard-auth';
import { buildMetadata } from '@/lib/seo';
import { getMyPayments, type BackendPayment } from '@/services/Payment';
import { UserPaymentsPageClient } from '@/components/UserPaymentsPageClient';

export const metadata: Metadata = buildMetadata({
  title: 'Payments',
  description: 'Review your payment history.',
  path: '/dashboard/user/payments',
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

export default async function UserPaymentsPage({ searchParams }: Props) {
  await requireRoleSegment('user');
  const query = await searchParams;
  const page = parsePositiveInteger(query.page, 1);
  const limit = parsePositiveInteger(query.limit, 50);
  const paymentsResult = await getMyPayments({ page, limit }).catch(() => null);
  const payments = Array.isArray(paymentsResult?.data)
    ? (paymentsResult.data as BackendPayment[])
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
    <UserPaymentsPageClient
      payments={payments}
      paginationMeta={paginationMeta}
    />
  );
}
