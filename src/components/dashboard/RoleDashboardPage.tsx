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
import { getDashboardOverview } from '@/services/Dashboard';
// import { getAllCoupons } from '@/services/Coupon/admin';

import { getDashboardPathByRole } from '@/lib/auth/roles';
import { getDashboardRoleConfig } from '@/lib/dashboard-navigation';

type Metric = {
  label: string;
  value: string;
  description: string;
};



function safeNumber(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : 0;
}

function formatMoney(value: number): string {
  return `৳ ${value.toLocaleString('en-BD')}`;
}

function renderFeatureList(items: string[]) {
  return (
    <div className="grid gap-3 md:grid-cols-3">
      {items.map(item => (
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
      {metrics.map(metric => (
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
    const overviewResult = await getDashboardOverview().catch(() => null);
    const overview = overviewResult?.data;
    const orders = Array.isArray(overview?.recentOrders) ? overview.recentOrders : [];

    const metrics: Metric[] = [
      {
        label: 'Orders',
        value: String(overview?.orders ?? 0),
        description: 'Your backend order history',
      },
      {
        label: 'Pending payments',
        value: String(overview?.pendingPayments ?? 0),
        description: 'Orders awaiting payment completion',
      },
      {
        label: 'Delivered',
        value: String(overview?.delivered ?? 0),
        description: 'Completed deliveries',
      },
      {
        label: 'Payment records',
        value: String(overview?.payments ?? 0),
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
                item => item.label !== 'Dashboard' && item.label !== 'Profile',
              )
              .map(item => (
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
                {orders.slice(0, 5).map(order => (
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
  const overviewResult = await getDashboardOverview().catch(() => null);
  const overview = overviewResult?.data;

  const metrics: Metric[] = [
    {
      label: 'Categories',
      value: String(overview?.categories ?? 0),
      description: 'Catalog taxonomy pulled from the backend',
    },
    {
      label: 'Brands',
      value: String(overview?.brands ?? 0),
      description: 'Brand records managed in backend',
    },
    {
      label: 'Products',
      value: String(overview?.products ?? 0),
      description: 'Live product catalogue',
    },
    {
      label: 'Users',
      value: String(overview?.users ?? 0),
      description: 'Registered customer accounts',
    },
    {
      label: 'Orders',
      value: String(overview?.orders ?? 0),
      description: 'Operational order pipeline',
    },
    {
      label: 'Payments',
      value: String(overview?.payments ?? 0),
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
            value: String(overview?.admins ?? 0),
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
