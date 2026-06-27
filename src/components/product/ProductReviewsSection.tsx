'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useMemo, useState, useTransition } from 'react';
import { Loader2, Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDashboardDate } from '@/lib/formatDate';
import {
  getProductReviewsByProduct,
  type PublicProductReviewRecord,
} from '@/services/ProductReview';
import { toast } from 'sonner';

type Props = {
  productId: string;
  initialReviews: PublicProductReviewRecord[];
  paginationMeta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  summary: {
    total: number;
    averageRating: number;
    productRating?: number;
  };
};

function renderStars(rating: number) {
  return Array.from({ length: 5 }, (_, index) => {
    const filled = index < Math.round(rating);
    return (
      <Star
        key={index}
        className={
          filled
            ? 'size-4 fill-primary text-primary'
            : 'size-4 text-muted-foreground/35'
        }
      />
    );
  });
}

function ReviewCard({ review }: { review: PublicProductReviewRecord }) {
  return (
    <article className="rounded-2xl border bg-background p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="relative size-12 shrink-0 overflow-hidden rounded-full bg-muted">
          <Image
            src={review.displayImage}
            alt={review.displayName}
            fill
            sizes="48px"
            className="object-cover"
          />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-semibold text-foreground">
              {review.displayName}
            </h3>
            <Badge
              variant="secondary"
              className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-semibold text-primary hover:bg-secondary/10"
            >
              {review.rating.toFixed(1)} ★
            </Badge>
          </div>
          <div className="mt-1 flex items-center gap-1">
            {renderStars(review.rating)}
          </div>
          <p className="mt-3 text-sm leading-6 text-foreground/75">
            {review.comment}
          </p>
          {Array.isArray(review.images) && review.images.length > 0 ? (
            <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
              {review.images.map((image, index) => (
                <div
                  key={`${image}-${index}`}
                  className="relative aspect-square overflow-hidden rounded-xl bg-muted"
                >
                  <Image
                    src={image}
                    alt={`${review.displayName} review image ${index + 1}`}
                    fill
                    sizes="160px"
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          ) : null}
          {review.createdAt ? (
            <div className="mt-3 text-xs text-muted-foreground">
              {formatDashboardDate(review.createdAt)}
            </div>
          ) : null}
        </div>
      </div>
    </article>
  );
}

function RatingSummary({ value }: { value: number }) {
  return <div className="flex items-center gap-1">{renderStars(value)}</div>;
}

export function ProductReviewsSection({
  productId,
  initialReviews,
  paginationMeta,
  summary,
}: Props) {
  const [reviews, setReviews] = useState(initialReviews);
  const [meta, setMeta] = useState(paginationMeta);
  const [isLoadingMore, startLoadingMore] = useTransition();

  const hasMore = meta.page < meta.totalPages;

  const averageRating = useMemo(
    () => summary.averageRating || 0,
    [summary.averageRating],
  );

  function loadMoreReviews() {
    if (!hasMore || isLoadingMore) return;

    startLoadingMore(async () => {
      const nextPage = meta.page + 1;
      const result = await getProductReviewsByProduct(productId, {
        page: nextPage,
        limit: meta.limit || 5,
      });

      if (!result.success) {
        toast.error(result.message ?? 'Unable to load more reviews.');
        return;
      }

      setReviews((current) => [...current, ...(result.data ?? [])]);
      if (result.meta) {
        setMeta({
          page: result.meta.page ?? nextPage,
          limit: result.meta.limit ?? meta.limit,
          total: result.meta.total ?? meta.total,
          totalPages: result.meta.totalPages ?? meta.totalPages,
        });
      }
    });
  }

  return (
    <section id="product-reviews" className="scroll-mt-24 rounded-md bg-card p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-medium text-secondary">
            Customer Reviews
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Read approved reviews from verified customers and manual moderation.
          </p>
        </div>
        <div className="rounded-2xl border bg-background px-4 py-3 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-lg font-black text-primary">
              {averageRating.toFixed(1)}
            </div>
            <div className="min-w-0">
              <RatingSummary value={averageRating} />
              <div className="mt-1 inline-flex items-center rounded-full bg-muted/70 px-2.5 py-1 text-[11px] font-semibold text-muted-foreground">
                {summary.total} review{summary.total === 1 ? '' : 's'}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-5 space-y-4">
        {reviews.length === 0 ? (
          <div className="rounded-2xl border border-dashed bg-muted/20 p-6 text-sm text-muted-foreground">
            There are no reviews yet.
          </div>
        ) : (
          reviews.map((review) => (
            <ReviewCard
              key={review._id ?? `${review.displayName}-${review.createdAt}`}
              review={review}
            />
          ))
        )}

        {hasMore ? (
          <div className="flex justify-center pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={loadMoreReviews}
              disabled={isLoadingMore}
            >
              {isLoadingMore ? (
                <Loader2 className="size-4 animate-spin" />
              ) : null}
              Load more reviews
            </Button>
          </div>
        ) : null}

        <div className="rounded-2xl border bg-muted/20 p-4 text-sm text-muted-foreground">
          Want to leave a review? Open your delivered order in{' '}
          <Link
            href="/dashboard/user/orders"
            className="font-semibold text-primary hover:underline"
          >
            Dashboard → Orders
          </Link>{' '}
          and submit it there.
        </div>
      </div>
    </section>
  );
}
