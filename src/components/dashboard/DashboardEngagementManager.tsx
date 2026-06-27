'use client';

import { useCallback, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { TablePagination } from '@/components/ui/table-pagination';
import { formatDashboardDate } from '@/lib/formatDate';
import {
  buildDashboardActivityCards,
  type DashboardActivityCard,
  type DashboardActivityRecord,
} from '@/lib/dashboard-activity';

export type DashboardWishlistRecord = DashboardActivityRecord;
export type DashboardComparisonRecord = DashboardActivityRecord;
export type DashboardCartRecord = DashboardActivityRecord;

type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

type ActivityManagerProps = {
  records: DashboardActivityRecord[];
  paginationMeta: PaginationMeta;
  title: string;
  description: string;
  emptyTitle: string;
  emptyDescription: string;
  actionLabel: string;
};

function ActivityCardView({
  card,
  actionLabel,
}: {
  card: DashboardActivityCard;
  actionLabel: string;
}) {
  return (
    <Card
      className={`overflow-hidden border shadow-sm transition hover:shadow-md ${card.toneClass}`}
    >
      <CardContent className="p-4 sm:p-5">
        <div className="flex flex-col gap-4 lg:flex-row">
          <div className="relative h-28 w-full overflow-hidden rounded-2xl border bg-muted sm:h-32 lg:h-36 lg:w-36 lg:shrink-0">
            {card.image ? (
              <Image
                src={card.image}
                alt={card.title}
                fill
                sizes="(max-width: 1024px) 100vw, 144px"
                className="object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                No image
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1 space-y-3">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="truncate text-lg font-black text-secondary">
                  {card.title}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {card.brand} · SKU {card.sku}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  User: {card.userName} ({card.userEmail})
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Badge variant={card.isActive ? 'default' : 'secondary'}>
                  {card.lastAction === 'clear'
                    ? 'Cleared'
                    : card.clearedAt
                      ? 'Cleared'
                      : card.isActive
                        ? 'Active'
                        : 'Removed'}
                </Badge>
                <Badge variant="outline">{actionLabel}</Badge>
                <Badge variant="outline">{card.eventCount} events</Badge>
                {typeof card.quantity === 'number' ? (
                  <Badge variant="outline">Qty {card.quantity}</Badge>
                ) : null}
              </div>
            </div>

            <div className="grid gap-3 rounded-2xl border border-border/70 bg-muted/25 p-4 text-sm sm:grid-cols-2 xl:grid-cols-4">
              <div>
                <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                  Added on
                </div>
                <div className="mt-1 font-semibold text-foreground">
                  {card.addedAt
                    ? formatDashboardDate(card.addedAt, { time: true })
                    : '—'}
                </div>
              </div>
              <div>
                <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                  {card.clearedAt ? 'Cleared on' : 'Removed on'}
                </div>
                <div className="mt-1 font-semibold text-foreground">
                  {card.clearedAt
                    ? formatDashboardDate(card.clearedAt, { time: true })
                    : card.removedAt
                      ? formatDashboardDate(card.removedAt, { time: true })
                      : '—'}
                </div>
              </div>
              <div>
                <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                  Last activity
                </div>
                <div className="mt-1 font-semibold text-foreground">
                  {card.updatedAt
                    ? formatDashboardDate(card.updatedAt, { time: true })
                    : '—'}
                </div>
              </div>
              <div>
                <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                  Category
                </div>
                <div className="mt-1 font-semibold text-foreground">
                  {card.category ?? '—'}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-muted-foreground">
              {card.slug ? (
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="rounded-full"
                >
                  <Link href={`/product/${card.slug}`}>View product</Link>
                </Button>
              ) : null}
              <span className="rounded-full bg-muted px-3 py-1">
                {card.isActive ? 'Still active in list' : 'No longer active'}
              </span>
              <span className="rounded-full bg-muted px-3 py-1">
                {card.lastAction ?? 'add'}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ActivityManager({
  records,
  paginationMeta,
  title,
  description,
  emptyTitle,
  emptyDescription,
  actionLabel,
}: ActivityManagerProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const cards = useMemo(() => buildDashboardActivityCards(records), [records]);

  const updateQuery = useCallback(
    (updates: { page?: number; limit?: number }) => {
      const params = new URLSearchParams(searchParams.toString());

      params.set('page', String(updates.page ?? paginationMeta.page));
      params.set('limit', String(updates.limit ?? paginationMeta.limit));

      router.push(`${pathname}?${params.toString()}`);
    },
    [paginationMeta.limit, paginationMeta.page, pathname, router, searchParams],
  );

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="text-sm text-muted-foreground">
            Showing {cards.length} grouped cards from {paginationMeta.total}{' '}
            activity records
          </div>
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            {actionLabel}
          </div>
        </div>

        {cards.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-8 text-center">
            <div className="text-lg font-black text-primary">{emptyTitle}</div>
            <p className="mt-2 text-sm text-foreground/55">
              {emptyDescription}
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {cards.map((card) => (
              <ActivityCardView
                key={card.id}
                card={card}
                actionLabel={actionLabel}
              />
            ))}
          </div>
        )}

        {paginationMeta.total > 0 ? (
          <div className="border-t pt-4">
            <TablePagination
              page={paginationMeta.page}
              limit={paginationMeta.limit}
              total={paginationMeta.total}
              onPageChange={(page) => updateQuery({ page })}
              onLimitChange={(limit) => updateQuery({ page: 1, limit })}
            />
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

export function DashboardWishlistManager({
  records,
  paginationMeta,
}: {
  records: DashboardWishlistRecord[];
  paginationMeta: PaginationMeta;
}) {
  return (
    <ActivityManager
      records={records}
      paginationMeta={paginationMeta}
      title="Wishlist activity"
      description="Saved and removed wishlist items grouped into easy-to-read cards."
      emptyTitle="No wishlist activity found"
      emptyDescription="Wishlist actions will appear here with added and removed dates."
      actionLabel="Wishlist"
    />
  );
}

export function DashboardComparisonManager({
  records,
  paginationMeta,
}: {
  records: DashboardComparisonRecord[];
  paginationMeta: PaginationMeta;
}) {
  return (
    <ActivityManager
      records={records}
      paginationMeta={paginationMeta}
      title="Comparison activity"
      description="Comparison actions grouped into cards with added and removed dates."
      emptyTitle="No comparison activity found"
      emptyDescription="Comparison actions will appear here with the latest timeline details."
      actionLabel="Compare"
    />
  );
}

export function DashboardCartManager({
  records,
  paginationMeta,
}: {
  records: DashboardCartRecord[];
  paginationMeta: PaginationMeta;
}) {
  return (
    <ActivityManager
      records={records}
      paginationMeta={paginationMeta}
      title="Cart activity"
      description="Cart additions, removals, updates, and clears grouped for quick review."
      emptyTitle="No cart activity found"
      emptyDescription="Cart actions will appear here with added and removed dates."
      actionLabel="Cart"
    />
  );
}
