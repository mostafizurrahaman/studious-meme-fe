import type { Metadata } from 'next';
import { requireDashboardRoles } from '@/lib/dashboard-auth';
import type { OrderStatus } from '@/lib/order-status';
import { buildMetadata } from '@/lib/seo';
import { getAllOrdersForAdmin, updateOrderStatus } from '@/services/Order';
import { DashboardOrdersManager } from '@/components/dashboard/DashboardOrdersManager';

export const metadata: Metadata = buildMetadata({
  title: 'Orders',
  description: 'Manage customer orders and order status.',
  path: '/dashboard/super-admin/orders',
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

export default async function SuperAdminOrdersPage({ searchParams }: Props) {
  await requireDashboardRoles(['SUPER_ADMIN']);
  const query = await searchParams;
  const page = parsePositiveInteger(query.page, 1);
  const limit = parsePositiveInteger(query.limit, 50);
  const result = await getAllOrdersForAdmin({ page, limit }).catch(() => null);
  const orders = Array.isArray(result?.data) ? result.data : [];
  const paginationMeta = {
    page: result?.meta?.page ?? page,
    limit: result?.meta?.limit ?? limit,
    total: result?.meta?.total ?? orders.length,
    totalPages:
      result?.meta?.totalPages ?? (Math.ceil(orders.length / limit) || 1),
  };

  async function updateStatus(formData: FormData) {
    'use server';

    const orderId = String(formData.get('orderId') ?? '');
    const status = String(formData.get('status') ?? '') as OrderStatus;

    await updateOrderStatus(orderId, status);
  }

  return (
    <DashboardOrdersManager
      orders={orders}
      title="Orders"
      description={`${orders.length} orders loaded from backend.`}
      detailBaseHref="/dashboard/super-admin/orders"
      listBaseHref="/dashboard/super-admin/orders"
      updateStatus={updateStatus}
      paginationMeta={paginationMeta}
    />
  );
}
