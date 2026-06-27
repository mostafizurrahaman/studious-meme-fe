'use client';

import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
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

export function UserPaymentsPageClient({
  payments,
  paginationMeta,
}: {
  payments: BackendPayment[];
  paginationMeta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}) {
  const router = useRouter();

  return (
    <Card className="shadow-sm">
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
              typeof item.order === 'object' ? item.order.orderId : item.order;
            return (
              <TableRow key={item._id}>
                <TableCell className="font-medium">
                  {item.transactionId}
                </TableCell>
                <TableCell>{orderId}</TableCell>
                <TableCell>৳ {item.amount}</TableCell>
                <TableCell>{item.status}</TableCell>
                <TableCell>
                  <span
                    title={formatDashboardDate(item.createdAt, { time: true })}
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
        <div className="border-t p-4">
          <TablePagination
            page={paginationMeta.page}
            limit={paginationMeta.limit}
            total={paginationMeta.total}
            onPageChange={(page) =>
              router.push(
                `/dashboard/user/payments?page=${page}&limit=${paginationMeta.limit}`,
              )
            }
            onLimitChange={(limit) =>
              router.push(`/dashboard/user/payments?page=1&limit=${limit}`)
            }
          />
        </div>
      ) : null}
    </Card>
  );
}
