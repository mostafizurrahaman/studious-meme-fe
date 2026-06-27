import Link from 'next/link';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { AuthRole } from '@/types';
import { getAllAdmins, getAllUsers } from '@/services/Admin';
import { getAllBrands } from '@/services/Brand';
import { getAllCategories } from '@/services/Category';
import { getAllOrdersForAdmin, getMyOrders } from '@/services/Order';
import { getAllPaymentsForAdmin, getMyPayments } from '@/services/Payment';
import { getAllProducts } from '@/services/Product';
// import { getAllCoupons } from '@/services/Coupon/admin';

import { getDashboardPathByRole } from '@/lib/auth/roles';
import { getDashboardRoleConfig } from '@/lib/dashboard-navigation';

type Metric = {
  label: string;
  value: string;
  description: string;
};

function countItems(
  result:
    | {
        data?: unknown;
        meta?: { total?: number };
        summary?: { total?: number };
      }
    | null
    | undefined,
): number {
  if (!result) return 0;

  if (typeof result.meta?.total === 'number') return result.meta.total;
  if (typeof result.summary?.total === 'number') return result.summary.total;

  const payload = result.data;

  if (Array.isArray(payload)) return payload.length;

  if (payload && typeof payload === 'object') {
    const nested = payload as { data?: unknown; meta?: { total?: unknown } };

    if (typeof nested.meta?.total === 'number') return nested.meta.total;
    if (Array.isArray(nested.data)) return nested.data.length;
  }
  return 0;
}

function safeNumber(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : 0;
}

function formatMoney(value: number): string {
  return `৳ ${value.toLocaleString('en-BD')}`;
}

function renderFeatureList(items: string[]) {
  return (
    <div className="grid gap-3 md:grid-cols-3">
      {items.map((item) => (
        <div
          key={item}
          className="rounded-2xl border bg-background p-4 text-sm text-foreground/75 shadow-sm"
        >
          {item}
        </div>
      ))}
    </div>
  );
}

function MetricCards({ metrics }: { metrics: Metric[] }) {
  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {metrics.map((metric) => (
        <Card key={metric.label} className="shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription>{metric.label}</CardDescription>
            <CardTitle className="text-2xl">{metric.value}</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 text-sm text-muted-foreground">
            {metric.description}
          </CardContent>
        </Card>
      ))}
    </section>
  );
}

export async function RoleDashboardPage({ role }: { role: AuthRole }) {
  const config = getDashboardRoleConfig(role);
  const dashboardPath = getDashboardPathByRole(role) ?? '/dashboard';

  if (role === 'USER') {
    const [ordersResult, paymentsResult] = await Promise.all([
      getMyOrders().catch(() => null),
      getMyPayments().catch(() => null),
    ]);
    const orders = Array.isArray(ordersResult?.data) ? ordersResult.data : [];
    const payments = Array.isArray(paymentsResult?.data)
      ? paymentsResult.data
      : [];

    const metrics: Metric[] = [
      {
        label: 'Orders',
        value: String(orders.length),
        description: 'Your backend order history',
      },
      {
        label: 'Pending payments',
        value: String(
          orders.filter((order) => order.paymentStatus !== 'PAID').length,
        ),
        description: 'Orders awaiting payment completion',
      },
      {
        label: 'Delivered',
        value: String(
          orders.filter((order) => order.status === 'DELIVERED').length,
        ),
        description: 'Completed deliveries',
      },
      {
        label: 'Payment records',
        value: String(payments.length),
        description: 'Your payment history',
      },
    ];

    return (
      <div className="space-y-6">
        <Card className="shadow-sm">
          <CardHeader>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary">
              {config.eyebrow}
            </p>
            <CardTitle className="text-3xl">{config.title}</CardTitle>
            <CardDescription>{config.description}</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            <Button asChild className="justify-start text-white!">
              <Link href={`${dashboardPath}/profile`}>Update profile</Link>
            </Button>
            <Button asChild variant="outline" className="justify-start">
              <Link href={dashboardPath}>Refresh dashboard</Link>
            </Button>
            <Button asChild variant="outline" className="justify-start">
              <Link href="/shop">Continue shopping</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Quick links</CardTitle>
            <CardDescription>
              Jump into your role-prefixed dashboard sections.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {config.navigationItems
              .filter(
                (item) =>
                  item.label !== 'Dashboard' && item.label !== 'Profile',
              )
              .map((item) => (
                <Button
                  asChild
                  key={item.href}
                  variant="outline"
                  className="justify-start"
                >
                  <Link href={item.href}>{item.label}</Link>
                </Button>
              ))}
          </CardContent>
        </Card>

        <MetricCards metrics={metrics} />

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>What you can do</CardTitle>
            <CardDescription>
              Everything here is pulled from your live account session.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {renderFeatureList(config.responsibilities)}
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Recent orders</CardTitle>
            <CardDescription>
              Direct backend order data for your account.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.slice(0, 5).map((order) => (
                  <TableRow key={order.orderId}>
                    <TableCell className="font-medium">
                      {order.orderId}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{order.status}</Badge>
                    </TableCell>
                    <TableCell>{order.paymentStatus}</TableCell>
                    <TableCell>
                      {formatMoney(safeNumber(order.total))}
                    </TableCell>
                  </TableRow>
                ))}
                {orders.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="py-8 text-center text-sm text-muted-foreground"
                    >
                      No orders found for this account.
                    </TableCell>
                  </TableRow>
                ) : null}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    );
  }

  const [
    categoriesResult,
    brandsResult,
    productsResult,
    usersResult,
    ordersResult,
    paymentsResult,
    // couponsResult,
    adminsResult,
  ] = await Promise.all([
    getAllCategories().catch(() => null),
    getAllBrands().catch(() => null),
    getAllProducts({ includeInactive: true }).catch(() => null),
    getAllUsers().catch(() => null),
    getAllOrdersForAdmin().catch(() => null),
    getAllPaymentsForAdmin().catch(() => null),
    // getAllCoupons({ limit: 1 }).catch(() => null),
    role === 'SUPER_ADMIN'
      ? getAllAdmins().catch(() => null)
      : Promise.resolve(null),
  ]);

  const metrics: Metric[] = [
    {
      label: 'Categories',
      value: String(countItems(categoriesResult)),
      description: 'Catalog taxonomy pulled from the backend',
    },
    {
      label: 'Brands',
      value: String(countItems(brandsResult)),
      description: 'Brand records managed in backend',
    },
    {
      label: 'Products',
      value: String(countItems(productsResult)),
      description: 'Live product catalogue',
    },
    {
      label: 'Users',
      value: String(countItems(usersResult)),
      description: 'Registered customer accounts',
    },
    {
      label: 'Orders',
      value: String(countItems(ordersResult)),
      description: 'Operational order pipeline',
    },
    {
      label: 'Payments',
      value: String(countItems(paymentsResult)),
      description: 'Payment records and statuses',
    },
    // TODO: add coupons back
    // {
    //   label: 'Coupons',
    //   value: String(countItems(couponsResult)),
    //   description: 'Discount codes configured in backend',
    // },
    ...(role === 'SUPER_ADMIN'
      ? [
          {
            label: 'Admins',
            value: String(countItems(adminsResult)),
            description: 'Privileged admin accounts',
          },
        ]
      : []),
  ];

  return (
    <div className="space-y-6">
      <Card className="shadow-sm">
        <CardHeader>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary">
            {config.eyebrow}
          </p>
          <CardTitle className="text-3xl">{config.title}</CardTitle>
          <CardDescription>{config.description}</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          <Button asChild className="justify-start text-white!">
            <Link href={`${dashboardPath}/profile`}>Update profile</Link>
          </Button>
          {role === 'SUPER_ADMIN' ? (
            <Button asChild variant="outline" className="justify-start">
              <Link href="/dashboard/super-admin/admins">Manage admins</Link>
            </Button>
          ) : null}
          <Button asChild variant="outline" className="justify-start">
            <Link href={dashboardPath}>Refresh dashboard</Link>
          </Button>
        </CardContent>
      </Card>

      <MetricCards metrics={metrics} />

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Operational scope</CardTitle>
          <CardDescription>
            Role-specific responsibilities backed by live backend data.
          </CardDescription>
        </CardHeader>
        <CardContent>{renderFeatureList(config.responsibilities)}</CardContent>
      </Card>
    </div>
  );
}
