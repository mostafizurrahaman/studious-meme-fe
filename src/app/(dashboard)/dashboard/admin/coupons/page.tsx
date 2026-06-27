// TODO: add coupons back

// import type { Metadata } from 'next';
// import { DashboardCouponsManager } from '@/components/dashboard/DashboardCouponsManager';
// import { requireDashboardRoles } from '@/lib/dashboard-auth';
// import { buildMetadata } from '@/lib/seo';
// import { getAllCoupons } from '@/services/Coupon/admin';

// export const metadata: Metadata = buildMetadata({
//   title: 'Coupons',
//   description: 'Create, update, and disable coupon offers.',
//   path: '/dashboard/admin/coupons',
//   noindex: true,
// });

// export const dynamic = 'force-dynamic';

// type Props = {
//   searchParams: Promise<{ page?: string; limit?: string; searchTerm?: string }>;
// };

// const parsePositiveInteger = (value: string | undefined, fallback: number) => {
//   const parsed = Number(value);

//   return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
// };

// export default async function AdminCouponsPage({ searchParams }: Props) {
//   await requireDashboardRoles(['ADMIN', 'SUPER_ADMIN']);
//   const query = await searchParams;
//   const page = parsePositiveInteger(query.page, 1);
//   const limit = parsePositiveInteger(query.limit, 50);
//   const searchTerm = query.searchTerm?.trim() ?? '';
//   const couponsResult = await getAllCoupons({ page, limit, searchTerm }).catch(
//     () => null,
//   );
//   const coupons = Array.isArray(couponsResult?.data) ? couponsResult.data : [];
//   const paginationMeta = {
//     page: couponsResult?.meta?.page ?? page,
//     limit: couponsResult?.meta?.limit ?? limit,
//     total: couponsResult?.meta?.total ?? coupons.length,
//     totalPages:
//       couponsResult?.meta?.totalPages ??
//       (Math.ceil(coupons.length / limit) || 1),
//   };

//   return (
//     <DashboardCouponsManager
//       key={`${page}-${limit}-${searchTerm}`}
//       coupons={coupons}
//       paginationMeta={paginationMeta}
//       searchTerm={searchTerm}
//       title="Coupons"
//       description="Create and manage coupon codes, expiry dates, and activation state."
//     />
//   );
// }

export default async function AdminCouponsPage() {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Coupons</h1>
      <p className="text-gray-600">This feature is coming soon. Stay tuned!</p>
    </div>
  );
}
