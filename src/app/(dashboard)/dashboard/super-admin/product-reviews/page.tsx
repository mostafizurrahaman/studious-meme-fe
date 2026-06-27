import type { Metadata } from 'next';
import { DashboardProductReviewsManager } from '@/components/dashboard/DashboardProductReviewsManager';
import { requireDashboardRoles } from '@/lib/dashboard-auth';
import { buildMetadata } from '@/lib/seo';
import {
  getAdminProductReviews,
  type ProductReviewListParams,
} from '@/services/ProductReview';

type Props = {
  searchParams: Promise<{
    page?: string;
    limit?: string;
    searchTerm?: string;
    status?: string;
    source?: string;
    product?: string;
    user?: string;
    rating?: string;
    sort?: string;
    createdFrom?: string;
    createdTo?: string;
  }>;
};

export const metadata: Metadata = buildMetadata({
  title: 'Product Reviews',
  description:
    'Manage product reviews, moderation, and manual review creation.',
  path: '/dashboard/super-admin/product-reviews',
  noindex: true,
});

export const dynamic = 'force-dynamic';

const parsePositiveInteger = (value: string | undefined, fallback: number) => {
  const parsed = Number(value);

  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
};

export default async function SuperAdminProductReviewsPage({
  searchParams,
}: Props) {
  await requireDashboardRoles(['SUPER_ADMIN']);
  const query = await searchParams;
  const page = parsePositiveInteger(query.page, 1);
  const limit = parsePositiveInteger(query.limit, 20);
  const searchTerm = query.searchTerm?.trim() ?? '';
  const status = query.status?.trim() ?? '';
  const source = query.source?.trim() ?? '';
  const product = query.product?.trim() ?? '';
  const user = query.user?.trim() ?? '';
  const rating = query.rating?.trim() ?? '';
  const sort = query.sort?.trim() ?? 'createdAt-desc';
  const createdFrom = query.createdFrom?.trim() ?? '';
  const createdTo = query.createdTo?.trim() ?? '';

  const reviewsResult = await getAdminProductReviews({
    page,
    limit,
    searchTerm,
    status: status
      ? (status as 'pending' | 'approved' | 'rejected' | 'hidden')
      : undefined,
    source: source ? (source as 'customer' | 'manual') : undefined,
    product,
    user,
    rating: rating ? Number(rating) : undefined,
    createdFrom: createdFrom || undefined,
    createdTo: createdTo || undefined,
    sort: sort as ProductReviewListParams['sort'],
  }).catch(() => null);

  const reviews = reviewsResult?.data ?? [];
  const paginationMeta = {
    page: reviewsResult?.meta?.page ?? page,
    limit: reviewsResult?.meta?.limit ?? limit,
    total: reviewsResult?.meta?.total ?? reviews.length,
    totalPages:
      reviewsResult?.meta?.totalPages ??
      (Math.ceil(reviews.length / limit) || 1),
  };

  const summary = {
    total: reviewsResult?.summary?.total ?? reviews.length,
    pending: reviewsResult?.summary?.pending ?? 0,
    approved: reviewsResult?.summary?.approved ?? 0,
    rejected: reviewsResult?.summary?.rejected ?? 0,
    hidden: reviewsResult?.summary?.hidden ?? 0,
    customer: reviewsResult?.summary?.customer ?? 0,
    manual: reviewsResult?.summary?.manual ?? 0,
    averageRating: reviewsResult?.summary?.averageRating ?? 0,
  };

  return (
    <DashboardProductReviewsManager
      key={`${searchTerm}-${status}-${source}-${product}-${user}-${rating}-${sort}`}
      reviews={reviews}
      paginationMeta={paginationMeta}
      summary={summary}
      searchTerm={searchTerm}
      status={status}
      source={source}
      product={product}
      user={user}
      rating={rating}
      createdFrom={createdFrom}
      createdTo={createdTo}
      sort={sort}
    />
  );
}
