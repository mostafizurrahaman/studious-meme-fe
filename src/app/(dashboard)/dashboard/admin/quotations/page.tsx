import type { Metadata } from 'next';
import { DashboardQuotationRequestsManager } from '@/components/dashboard/DashboardQuotationRequestsManager';
import { requireDashboardRoles } from '@/lib/dashboard-auth';
import { buildMetadata } from '@/lib/seo';
import { getAllContacts } from '@/services/Contact';

type Props = {
  searchParams: Promise<{ page?: string; limit?: string; searchTerm?: string }>;
};

export const metadata: Metadata = buildMetadata({
  title: 'Quotation Requests',
  description: 'Review customer quotation requests and contact submissions.',
  path: '/dashboard/admin/quotations',
  noindex: true,
});

export const dynamic = 'force-dynamic';

export default async function AdminQuotationsPage({ searchParams }: Props) {
  await requireDashboardRoles(['ADMIN', 'SUPER_ADMIN']);
  const query = await searchParams;
  const page = query.page ?? '1';
  const limit = query.limit ?? '50';
  const searchTerm = query.searchTerm?.trim() ?? '';
  const result = await getAllContacts(page, limit, searchTerm).catch(
    () => null,
  );
  const contacts = result?.data ?? [];
  const meta = {
    page: result?.meta?.page ?? (Number(page) || 1),
    limit: result?.meta?.limit ?? (Number(limit) || 50),
    total: result?.meta?.total ?? contacts.length,
    totalPages:
      result?.meta?.totalPages ??
      (Math.ceil(contacts.length / (Number(limit) || 50)) || 1),
  };

  return (
    <DashboardQuotationRequestsManager
      contacts={contacts}
      meta={meta}
      searchTerm={searchTerm}
    />
  );
}
