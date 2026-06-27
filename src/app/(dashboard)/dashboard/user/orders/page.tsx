import { OrdersPageClient } from '@/components/OrdersPageClient';
import { SeoScripts } from '@/components/SeoScripts';
import { buildBreadcrumbSchema, buildMetadata } from '@/lib/seo';
import { getMyOrders } from '@/services/Order';

export const metadata = buildMetadata({
  title: 'Orders',
  description: 'View saved orders from this dashboard account.',
  path: '/dashboard/user/orders',
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

export default async function UserOrdersPage({ searchParams }: Props) {
  const query = await searchParams;
  const page = parsePositiveInteger(query.page, 1);
  const limit = parsePositiveInteger(query.limit, 50);
  const ordersResult = await getMyOrders({ page, limit }).catch(() => null);
  const orders = Array.isArray(ordersResult?.data) ? ordersResult.data : [];
  const paginationMeta = {
    page: ordersResult?.meta?.page ?? page,
    limit: ordersResult?.meta?.limit ?? limit,
    total: ordersResult?.meta?.total ?? orders.length,
    totalPages:
      ordersResult?.meta?.totalPages ?? (Math.ceil(orders.length / limit) || 1),
  };

  return (
    <>
      <SeoScripts
        data={[
          buildBreadcrumbSchema([
            { name: 'Home', url: '/' },
            { name: 'Dashboard', url: '/dashboard/user' },
            { name: 'Orders', url: '/dashboard/user/orders' },
          ]),
        ]}
      />
      <OrdersPageClient
        orders={orders}
        baseHref="/dashboard/user"
        paginationMeta={paginationMeta}
      />
    </>
  );
}
