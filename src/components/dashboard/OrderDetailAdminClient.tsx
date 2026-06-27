'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatMoney } from '@/lib/cart';
import { formatDashboardDate } from '@/lib/formatDate';
import type { OrderStatus } from '@/lib/order-status';
import type { BackendOrder } from '@/services/Order';

const ORDER_TIMELINE: Array<{
  key: Exclude<OrderStatus, 'CANCELLED'>;
  label: string;
}> = [
  { key: 'PLACED', label: 'Placed' },
  { key: 'PENDING_PAYMENT', label: 'Pending payment' },
  { key: 'CONFIRMED', label: 'Confirmed' },
  { key: 'PROCESSING', label: 'Processing' },
  { key: 'SHIPPED', label: 'Shipped' },
  { key: 'DELIVERED', label: 'Delivered' },
];

export function OrderDetailAdminClient({
  order,
  backHref = '/dashboard/admin/orders',
}: {
  order: BackendOrder | null;
  backHref?: string;
}) {
  if (!order) {
    return <div className="p-4 text-muted-foreground">Order not found</div>;
  }

  const activeIndex =
    order.status === 'CANCELLED'
      ? -1
      : ORDER_TIMELINE.findIndex((step) => step.key === order.status);

  return (
    <div className="space-y-6">
      {/* Order Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">{order.orderId}</h2>
          <div className="mt-2 flex flex-wrap gap-3 text-sm text-muted-foreground">
            <span
              className="cursor-help"
              title={formatDashboardDate(order.createdAt, { time: true })}
            >
              {formatDashboardDate(order.createdAt)}
            </span>
            <span
              className="cursor-help"
              title={formatDashboardDate(order.updatedAt, { time: true })}
            >
              {formatDashboardDate(order.updatedAt)}
            </span>
            <span className="font-medium">{order.status}</span>
            <span>{order.paymentMethod}</span>
            <span>{order.paymentStatus}</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline">
            <Link href={backHref}>Back to Orders</Link>
          </Button>
        </div>
      </div>

      {/* Timeline */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {ORDER_TIMELINE.map((step, index) => {
          const isActive = index <= activeIndex;
          return (
            <div
              key={step.key}
              className={`rounded-xl border p-4 ${isActive ? 'border-primary/30 bg-background' : 'border-border bg-background/50'}`}
            >
              <div
                className={`text-sm font-semibold ${isActive ? 'text-primary' : 'text-muted-foreground'}`}
              >
                {step.label}
              </div>
              <div className="mt-1 text-xs text-muted-foreground">
                {isActive ? 'Completed' : 'Pending'}
              </div>
            </div>
          );
        })}
      </div>

      {/* Customer Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Customer</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2 text-sm">
          <div>
            <span className="font-medium">Name:</span>{' '}
            {order.customer.name || '-'}
          </div>
          <div>
            <span className="font-medium">Phone:</span>{' '}
            {order.customer.phone || '-'}
          </div>
          <div>
            <span className="font-medium">Email:</span>{' '}
            {order.customer.email || '-'}
          </div>
          <div>
            <span className="font-medium">Address:</span>{' '}
            {order.customer.address || '-'}
          </div>
          <div>
            <span className="font-medium">City:</span>{' '}
            {order.customer.city || '-'}
          </div>
        </CardContent>
      </Card>

      {/* Items */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            Items ({order.items.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {order.items.map((item) => (
            <div key={item.sku} className="flex gap-4 rounded-lg border p-3">
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-muted">
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  sizes="64px"
                  className="object-contain p-1"
                />
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-medium">{item.title}</div>
                <div className="text-sm text-muted-foreground">
                  SKU {item.sku} · Qty {item.quantity}
                </div>
              </div>
              <div className="text-right">
                <div className="font-medium">
                  {formatMoney(item.unitPrice * item.quantity)}
                </div>
                <div className="text-sm text-muted-foreground">
                  {formatMoney(item.unitPrice)} each
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
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
          <div className="flex justify-between border-t pt-2 font-bold">
            <span>Total</span>
            <span>{formatMoney(order.total)}</span>
          </div>
          {order.couponCode && (
            <div className="text-muted-foreground">
              Coupon: {order.couponCode}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
