import { OrderDetailClient } from '@/components/OrderDetailClient';
import { SeoScripts } from '@/components/SeoScripts';
import { buildBreadcrumbSchema, buildMetadata } from '@/lib/seo';
import { getMyOrderById } from '@/services/Order';

export const metadata = buildMetadata({
  title: 'Order Detail',
  description: 'View the details of a saved order.',
  path: '/dashboard/user/orders',
  noindex: true,
});
export const dynamic = 'force-dynamic';

type Props = {
  params: Promise<{ orderId: string }>;
  searchParams: Promise<{ payment?: string }>;
};

export default async function UserOrderDetailPage({
  params,
  searchParams,
}: Props) {
  const { orderId } = await params;
  const query = await searchParams;
  const orderResult = await getMyOrderById(orderId).catch(() => null);
  const order = orderResult?.data ?? null;

  return (
    <>
      <SeoScripts
        data={[
          buildBreadcrumbSchema([
            { name: 'Home', url: '/' },
            { name: 'Dashboard', url: '/dashboard/user' },
            { name: 'Orders', url: '/dashboard/user/orders' },
            { name: orderId, url: `/dashboard/user/orders/${orderId}` },
          ]),
        ]}
      />
      {query.payment === 'success' ? (
        <main className="bg-background px-4 pt-6">
          <div className="mx-auto max-w-310 rounded-2xl border border-emerald-500/30 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700 shadow-sm">
            Payment confirmed for this order.
          </div>
        </main>
      ) : null}
      <OrderDetailClient order={order} backHref="/dashboard/user/orders" />
    </>
  );
}
