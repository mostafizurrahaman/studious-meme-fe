'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  formatMoney,
  formatPriceLabelWithUnit,
  type CartItem,
} from '@/lib/cart';
import { formatDashboardDate } from '@/lib/formatDate';
import { useCartStore } from '@/lib/cart-store';
import { siteConfig } from '@/lib/seo';
import type { BackendOrder } from '@/services/Order';

export function OrderDetailClient({
  order,
  backHref = '/dashboard/user/orders',
}: {
  order: BackendOrder | null;
  backHref?: string;
}) {
  const addItems = useCartStore((state) => state.addItems);

  const timeline = useMemo(
    () => [
      { key: 'Placed', label: 'Placed' },
      { key: 'Processing', label: 'Processing' },
      { key: 'Delivered', label: 'Delivered' },
    ],
    [],
  );

  if (!order) {
    return (
      <main className="flex-1 bg-background pb-16">
        <div className="mx-auto w-full max-w-310 px-4 py-6 lg:px-0">
          <Card className="p-6 shadow-sm">
            Order not found.{' '}
            <Link className="font-semibold text-primary" href={backHref}>
              Back to orders
            </Link>
          </Card>
        </div>
      </main>
    );
  }

  const activeIndex =
    order.status === 'DELIVERED' ? 2 : order.status === 'PROCESSING' ? 1 : 0;
  const cartItems: CartItem[] = order.items.map((item) => ({
    sku: item.sku,
    title: item.title,
    href: '/shop',
    image: item.image,
    brand: item.brand,
    unitPrice: item.unitPrice,
    unitPriceLabel: formatPriceLabelWithUnit(item.unitPrice, item.sellingUnit),
    sellingUnit: item.sellingUnit,
    quantity: item.quantity,
    weightKg: item.weightKg as number,
    isNoCOD: Boolean(item.isNoCOD),
  }));

  const download = (filename: string, content: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportJson = () =>
    download(
      `${order.orderId}.json`,
      JSON.stringify(order, null, 2),
      'application/json',
    );
  const exportCsv = () => {
    const rows = [
      ['Order ID', 'Item', 'SKU', 'Qty', 'Unit Price', 'Line Total'],
      ...order.items.map((item) => [
        order.orderId,
        item.title,
        item.sku,
        String(item.quantity),
        formatMoney(item.unitPrice),
        formatMoney(item.unitPrice * item.quantity),
      ]),
    ];

    const csv = rows
      .map((row) =>
        row
          .map((value) => `"${String(value).replaceAll('"', '""')}"`)
          .join(','),
      )
      .join('\n');
    download(`${order.orderId}.csv`, csv, 'text/csv');
  };

  return (
    <main className="flex-1 bg-background pb-16">
      <div className="mx-auto w-full max-w-310 px-4 py-6 lg:px-0">
        <Card className="p-6 shadow-sm sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">
            Order detail
          </p>
          <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-black text-secondary sm:text-4xl">
                {order.orderId}
              </h1>
              <div className="mt-3 flex flex-wrap gap-3 text-sm text-foreground/65">
                <span
                  title={formatDashboardDate(order.createdAt, { time: true })}
                >
                  {formatDashboardDate(order.createdAt)}
                </span>
                <span>{order.status}</span>
                <span>{order.paymentMethod}</span>
                <span>{order.paymentStatus}</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 print:hidden">
              <Button
                type="button"
                onClick={() => window.print()}
                className="h-10 rounded-full bg-secondary px-4 text-sm font-semibold text-secondary-foreground hover:bg-secondary/90"
              >
                Save PDF
              </Button>
              <Button
                type="button"
                onClick={exportJson}
                variant="outline"
                className="h-10 rounded-full border-border px-4 text-sm font-semibold text-foreground/75"
              >
                Export JSON
              </Button>
              <Button
                type="button"
                onClick={exportCsv}
                variant="outline"
                className="h-10 rounded-full border-border px-4 text-sm font-semibold text-foreground/75"
              >
                Export CSV
              </Button>
            </div>
          </div>
        </Card>

        <section className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <Card className="space-y-4 p-6 shadow-sm">
            <Card className="border border-border bg-muted p-5 print:border-black/15 print:bg-white">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="text-sm font-bold text-secondary">
                    Invoice
                  </div>
                  <div className="mt-1 text-sm text-foreground/55">
                    {siteConfig.name} order receipt
                  </div>
                </div>
                <div className="text-right text-sm text-foreground/65">
                  <div>Customer: {order.customer.name || 'Guest'}</div>
                  <div>Phone: {order.customer.phone || '-'}</div>
                  <div>Email: {order.customer.email || '-'}</div>
                </div>
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4 print:hidden">
                {timeline.map((step, index) => {
                  const isActive = index <= activeIndex;
                  const isCancelled = order.status === 'CANCELLED';

                  return (
                    <div
                      key={step.key}
                      className={`rounded-2xl border px-4 py-3 text-sm ${isActive ? 'border-primary/30 bg-background' : 'border-border bg-background/70'}`}
                    >
                      <div
                        className={`text-xs uppercase tracking-[0.22em] ${isActive ? 'text-primary' : 'text-foreground/40'}`}
                      >
                        {step.label}
                      </div>
                      <div className="mt-2 font-semibold text-foreground/75">
                        {isCancelled && step.key !== 'Placed'
                          ? 'Skipped'
                          : isActive
                            ? 'Completed'
                            : 'Pending'}
                      </div>
                    </div>
                  );
                })}
                {order.status === 'CANCELLED' ? (
                  <div className="rounded-2xl border border-primary/20 bg-primary/10 px-4 py-3 text-sm text-primary sm:col-span-2 xl:col-span-4">
                    This order was cancelled.
                  </div>
                ) : null}
              </div>
            </Card>

            {order.items.map((item) => (
              <div
                key={item.sku}
                className="flex gap-4 rounded-2xl border border-border p-4"
              >
                <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-muted">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    sizes="80px"
                    className="object-contain p-2"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-foreground">
                    {item.title}
                  </div>
                  <div className="mt-1 text-sm text-foreground/55">
                    SKU {item.sku} · Qty {item.quantity}
                  </div>
                  <div className="mt-2 text-sm font-bold text-primary">
                    {formatMoney(item.unitPrice)}
                  </div>
                </div>
                <div className="text-sm font-semibold text-foreground/70">
                  {formatMoney(item.unitPrice * item.quantity)}
                </div>
              </div>
            ))}
          </Card>

          <Card className="border-0 bg-secondary p-6 text-secondary-foreground shadow-sm">
            <h2 className="text-2xl font-black">Summary</h2>
            <div className="mt-4 space-y-3 text-sm text-secondary-foreground/80">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatMoney(order.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Discount</span>
                <span>- {formatMoney(order.discount)}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery</span>
                <span>{formatMoney(order.delivery)}</span>
              </div>
              <div className="flex justify-between font-bold text-secondary-foreground">
                <span>Total</span>
                <span>{formatMoney(order.total)}</span>
              </div>
            </div>
            <div className="mt-6 rounded-2xl bg-white/10 p-4 text-sm text-secondary-foreground/80">
              {order.customer.address || 'No address saved.'}
            </div>
            <div className="mt-6 grid gap-3">
              <Button
                type="button"
                onClick={() => addItems(cartItems)}
                className="h-11 rounded-full bg-white px-6 text-sm font-bold text-secondary hover:bg-white/90"
              >
                Reorder
              </Button>
              <Button
                asChild
                variant="outline"
                className="h-11 rounded-full border-white/20 px-6 text-sm font-bold text-white hover:bg-white/10"
              >
                <Link href={backHref}>Back to orders</Link>
              </Button>
            </div>
          </Card>
        </section>
      </div>
    </main>
  );
}
