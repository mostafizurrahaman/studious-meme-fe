'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useState, useTransition } from 'react';
import { toast } from 'sonner';
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
import Image from 'next/image';
import { formatDashboardDate } from '@/lib/formatDate';
import { deleteUserById, updateUserStatus } from '@/services/Admin';
import { TableFilter } from '@/components/ui/table-filter';
import { TablePagination } from '@/components/ui/table-pagination';
import { DeleteConfirmationDialog } from '@/components/dashboard/DeleteConfirmationDialog';

type DashboardUserRecord = {
  _id?: string;
  name?: string;
  email?: string;
  phone?: string;
  image?: string;
  dob?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export function DashboardUsersManager({
  users,
  title,
  description,
  paginationMeta,
  searchTerm,
}: {
  users: DashboardUserRecord[];
  title: string;
  description: string;
  paginationMeta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  searchTerm: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [pendingDeleteUser, setPendingDeleteUser] = useState<Pick<
    DashboardUserRecord,
    '_id' | 'name' | 'email'
  > | null>(null);
  const [pendingStatusUser, setPendingStatusUser] = useState<
    | (Pick<DashboardUserRecord, '_id' | 'name' | 'email'> & {
        nextIsActive: boolean;
      })
    | null
  >(null);
  const updateQuery = useCallback(
    (updates: { page?: number; limit?: number; searchTerm?: string }) => {
      const params = new URLSearchParams(searchParams.toString());
      const nextPage = updates.page ?? paginationMeta.page;
      const nextLimit = updates.limit ?? paginationMeta.limit;
      const nextSearch = updates.searchTerm ?? params.get('searchTerm') ?? '';

      params.set('page', String(nextPage));
      params.set('limit', String(nextLimit));

      if (nextSearch.trim()) {
        params.set('searchTerm', nextSearch.trim());
      } else {
        params.delete('searchTerm');
      }

      router.push(`${pathname}?${params.toString()}`);
    },
    [paginationMeta.limit, paginationMeta.page, pathname, router, searchParams],
  );

  function refresh(message: string, type: 'success' | 'error') {
    if (type === 'success') {
      toast.success(message);
    } else {
      toast.error(message);
    }

    router.refresh();
  }

  function closeDeleteDialog() {
    if (isPending) return;
    setPendingDeleteUser(null);
  }

  function confirmDeleteUser() {
    const userId = pendingDeleteUser?._id;
    if (!userId) return;

    startTransition(async () => {
      const result = await deleteUserById(userId);

      if (!result?.success) {
        return refresh(result?.message ?? 'Failed to delete user.', 'error');
      }

      setPendingDeleteUser(null);
      refresh(result.message ?? 'User deleted successfully.', 'success');
    });
  }

  function closeStatusDialog() {
    if (isPending) return;
    setPendingStatusUser(null);
  }

  function confirmStatusChange() {
    const userId = pendingStatusUser?._id;
    if (!userId) return;

    startTransition(async () => {
      const result = await updateUserStatus(
        userId,
        pendingStatusUser.nextIsActive,
      );

      if (!result?.success) {
        return refresh(
          result?.message ?? 'Failed to update user status.',
          'error',
        );
      }

      setPendingStatusUser(null);
      refresh(result.message ?? 'User status updated successfully.', 'success');
    });
  }

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <TableFilter
            key={searchTerm}
            value={searchTerm}
            onChange={(value) => updateQuery({ page: 1, searchTerm: value })}
            placeholder="Search users..."
          />
          <div className="text-sm text-muted-foreground">
            Showing {users.length} of {paginationMeta.total} users
          </div>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Image</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>DOB</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead>Updated At</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="h-24 text-center">
                  No users found.
                </TableCell>
              </TableRow>
            ) : null}
            {users.map((user) => (
              <TableRow key={user._id ?? `${user.email}-${user.name}`}>
                <TableCell>
                  <div className="flex size-12 items-center justify-center overflow-hidden rounded-xl border bg-muted">
                    {user.image ? (
                      <Image
                        height={500}
                        width={500}
                        src={user.image}
                        alt={user.name ?? 'User'}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="text-xs text-muted-foreground">-</span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="font-medium">
                  {user.name ?? '-'}
                </TableCell>
                <TableCell>{user.email ?? '-'}</TableCell>
                <TableCell>{user.phone ?? '-'}</TableCell>
                <TableCell>
                  {formatDashboardDate(user.dob, { time: false })}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={user.isActive === false ? 'secondary' : 'default'}
                  >
                    {user.isActive === false ? 'Inactive' : 'Active'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <span
                    className="cursor-help"
                    title={formatDashboardDate(user.createdAt, { time: true })}
                  >
                    {formatDashboardDate(user.createdAt)}
                  </span>
                </TableCell>
                <TableCell>
                  <span
                    className="cursor-help"
                    title={formatDashboardDate(user.updatedAt, { time: true })}
                  >
                    {formatDashboardDate(user.updatedAt)}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={isPending}
                      onClick={() =>
                        setPendingStatusUser({
                          _id: user._id,
                          name: user.name,
                          email: user.email,
                          nextIsActive: user.isActive === false,
                        })
                      }
                    >
                      {user.isActive === false ? 'Unblock' : 'Block'}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={isPending}
                      onClick={() =>
                        setPendingDeleteUser({
                          _id: user._id,
                          name: user.name,
                          email: user.email,
                        })
                      }
                    >
                      Delete
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {paginationMeta.total > 0 ? (
          <TablePagination
            page={paginationMeta.page}
            limit={paginationMeta.limit}
            total={paginationMeta.total}
            onPageChange={(page) => updateQuery({ page })}
            onLimitChange={(limit) => updateQuery({ page: 1, limit })}
          />
        ) : null}
        <DeleteConfirmationDialog
          open={Boolean(pendingDeleteUser)}
          onOpenChange={(open) => {
            if (!open) closeDeleteDialog();
          }}
          onConfirm={confirmDeleteUser}
          isPending={isPending}
          title="Delete user account?"
          description={`This will permanently delete ${
            pendingDeleteUser?.name || pendingDeleteUser?.email || 'this user'
          } from the dashboard.`}
          confirmLabel="Delete user"
        />
        <DeleteConfirmationDialog
          open={Boolean(pendingStatusUser)}
          onOpenChange={(open) => {
            if (!open) closeStatusDialog();
          }}
          onConfirm={confirmStatusChange}
          isPending={isPending}
          title={
            pendingStatusUser?.nextIsActive
              ? 'Unblock user account?'
              : 'Block user account?'
          }
          description={
            pendingStatusUser?.nextIsActive
              ? `This will restore dashboard access for ${pendingStatusUser?.name || pendingStatusUser?.email || 'this user'}.`
              : `This will block ${pendingStatusUser?.name || pendingStatusUser?.email || 'this user'} from accessing their account.`
          }
          confirmLabel={
            pendingStatusUser?.nextIsActive ? 'Unblock user' : 'Block user'
          }
        />
      </CardContent>
    </Card>
  );
}
