'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { TablePagination } from '@/components/ui/table-pagination';
import {
  formatMoney,
  formatPriceLabelWithUnit,
  type CartItem,
} from '@/lib/cart';
import { formatDashboardDate } from '@/lib/formatDate';
import { useCartStore } from '@/lib/cart-store';
import type { BackendOrder } from '@/services/Order';
import { OrderReviewDialog } from '@/components/OrderReviewDialog';
import { useRouter } from 'next/navigation';

export function OrdersPageClient({
  orders,
  baseHref = '/dashboard/user',
  paginationMeta,
}: {
  orders: BackendOrder[];
  baseHref?: string;
  paginationMeta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}) {
  const [reviewOrder, setReviewOrder] = useState<BackendOrder | null>(null);
  const addItems = useCartStore((state) => state.addItems);
  const router = useRouter();

  const toCartItems = (order: BackendOrder): CartItem[] =>
    order.items.map((item) => ({
      sku: item.sku,
      title: item.title,
      href: '/shop',
      image: item.image,
      brand: item.brand,
      unitPrice: item.unitPrice,
      unitPriceLabel: formatPriceLabelWithUnit(
        item.unitPrice,
        item.sellingUnit,
      ),
      sellingUnit: item.sellingUnit,
      quantity: item.quantity,
      weightKg: item.weightKg as number,
      isNoCOD: Boolean(item.isNoCOD),
    }));

  return (
    <main className="flex-1 bg-background pb-16">
      <div className="mx-auto w-full max-w-310 px-4 py-6 lg:px-0">
        <Card className="p-6 shadow-sm sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">
            Account
          </p>
          <h1 className="mt-4 text-3xl font-black text-secondary sm:text-4xl">
            Orders
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-foreground/65 sm:text-base">
            Every backend order for your account appears here automatically.
          </p>
        </Card>

        <section className="mt-6 grid gap-4">
          {orders.length > 0 ? (
            orders.map((order) => (
              <Card key={order.orderId} className="p-5 shadow-sm sm:p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <Link
                      href={`${baseHref}/orders/${order.orderId}`}
                      className="text-sm font-bold text-secondary hover:text-primary"
                    >
                      {order.orderId}
                    </Link>
                    <div className="mt-1 text-xs uppercase tracking-[0.22em] text-foreground/45">
                      <span
                        title={formatDashboardDate(order.createdAt, {
                          time: true,
                        })}
                      >
                        {formatDashboardDate(order.createdAt)}
                      </span>
                    </div>
                  </div>
                  <div className="rounded-full bg-muted px-4 py-2 text-sm font-semibold text-foreground/70">
                    {order.status}
                  </div>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  <div className="rounded-2xl bg-muted px-4 py-3 text-sm">
                    <div className="text-foreground/55">Subtotal</div>
                    <div className="mt-1 font-bold text-foreground">
                      {formatMoney(order.subtotal)}
                    </div>
                  </div>
                  <div className="rounded-2xl bg-muted px-4 py-3 text-sm">
                    <div className="text-foreground/55">Discount</div>
                    <div className="mt-1 font-bold text-foreground">
                      - {formatMoney(order.discount)}
                    </div>
                  </div>
                  <div className="rounded-2xl bg-muted px-4 py-3 text-sm">
                    <div className="text-foreground/55">Delivery</div>
                    <div className="mt-1 font-bold text-foreground">
                      {formatMoney(order.delivery)}
                    </div>
                  </div>
                  <div className="rounded-2xl bg-secondary px-4 py-3 text-sm text-secondary-foreground">
                    <div className="text-secondary-foreground/65">Total</div>
                    <div className="mt-1 font-bold">
                      {formatMoney(order.total)}
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-3 text-sm text-foreground/65">
                  <span>Payment: {order.paymentMethod}</span>
                  <span>Payment status: {order.paymentStatus}</span>
                  {order.couponCode ? (
                    <span>Coupon: {order.couponCode}</span>
                  ) : null}
                  <span>Items: {order.items.length}</span>
                </div>

                <div className="mt-5 flex flex-wrap gap-3">
                  <Button
                    asChild
                    className="h-10 rounded-full bg-secondary px-4 text-sm font-semibold text-secondary-foreground hover:bg-secondary/90"
                  >
                    <Link href={`${baseHref}/orders/${order.orderId}`}>
                      View details
                    </Link>
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => addItems(toCartItems(order))}
                    className="h-10 rounded-full border-border px-4 text-sm font-semibold text-foreground/75"
                  >
                    Reorder
                  </Button>
                  {order.status === 'DELIVERED' ? (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setReviewOrder(order)}
                      className="h-10 rounded-full border-primary/30 px-4 text-sm font-semibold text-primary"
                    >
                      Write review
                    </Button>
                  ) : null}
                </div>
              </Card>
            ))
          ) : (
            <Card className="p-6 text-sm text-foreground/65 shadow-sm">
              No saved orders yet.{' '}
              <Link className="font-semibold text-primary" href="/shop">
                Start shopping
              </Link>
            </Card>
          )}
        </section>
      </div>
      {paginationMeta && paginationMeta.total > 0 ? (
        <div className="mt-6">
          <TablePagination
            page={paginationMeta.page}
            limit={paginationMeta.limit}
            total={paginationMeta.total}
            onPageChange={(page) =>
              router.push(
                `${baseHref}/orders?page=${page}&limit=${paginationMeta.limit}`,
              )
            }
            onLimitChange={(limit) =>
              router.push(`${baseHref}/orders?page=1&limit=${limit}`)
            }
          />
        </div>
      ) : null}
      {reviewOrder ? (
        <OrderReviewDialog
          order={reviewOrder}
          open={Boolean(reviewOrder)}
          onOpenChange={(open) => !open && setReviewOrder(null)}
        />
      ) : null}
    </main>
  );
}
