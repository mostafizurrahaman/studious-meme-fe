'use client';

import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
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
import { TablePagination } from '@/components/ui/table-pagination';
import { formatDashboardDate } from '@/lib/formatDate';
import type { BackendPayment } from '@/services/Payment';

function getStatusVariant(status: BackendPayment['status']) {
  switch (status) {
    case 'SUCCEEDED':
      return 'default';
    case 'FAILED':
      return 'destructive';
    case 'CANCELED':
      return 'secondary';
    case 'PENDING':
      return 'outline';
    default:
      return 'secondary';
  }
}

export function DashboardPaymentsManager({
  payments,
  title,
  description,
  paginationMeta,
  listBaseHref,
}: {
  payments: BackendPayment[];
  title: string;
  description: string;
  paginationMeta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  listBaseHref: string;
}) {
  const router = useRouter();
  const pageHref = (page: number, limit = paginationMeta.limit) =>
    `${listBaseHref}?page=${page}&limit=${limit}`;

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-muted-foreground">
          Showing {payments.length} of {paginationMeta.total} payments
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tran ID</TableHead>
              <TableHead>Order ID</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  No payments found.
                </TableCell>
              </TableRow>
            ) : null}
            {payments.map((item) => {
              const orderId =
                typeof item.order === 'object'
                  ? item.order.orderId
                  : item.order;
              return (
                <TableRow key={item._id}>
                  <TableCell className="font-medium">
                    {item.transactionId}
                  </TableCell>
                  <TableCell>{orderId}</TableCell>
                  <TableCell>৳ {item.amount}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(item.status)}>
                      {item.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span
                      className="cursor-help"
                      title={formatDashboardDate(item.createdAt, {
                        time: true,
                      })}
                    >
                      {formatDashboardDate(item.createdAt)}
                    </span>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        {paginationMeta.total > 0 ? (
          <TablePagination
            page={paginationMeta.page}
            limit={paginationMeta.limit}
            total={paginationMeta.total}
            onPageChange={(page) => router.push(pageHref(page))}
            onLimitChange={(limit) => router.push(pageHref(1, limit))}
          />
        ) : null}
      </CardContent>
    </Card>
  );
}
