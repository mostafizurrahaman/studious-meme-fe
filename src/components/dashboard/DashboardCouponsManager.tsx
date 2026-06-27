'use client';

import { type ReactNode, useEffect, useState, useTransition } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Controller, useForm } from 'react-hook-form';
import type { SubmitHandler, UseFormReturn } from 'react-hook-form';
import { z } from 'zod';
import { Loader2, Pencil, Plus, Sparkles, Trash2 } from 'lucide-react';
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
import { DashboardInput } from '@/components/dashboard/DashboardInput';
import { DeleteConfirmationDialog } from '@/components/dashboard/DeleteConfirmationDialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { TableFilter } from '@/components/ui/table-filter';
import { TablePagination } from '@/components/ui/table-pagination';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { formatDashboardDate } from '@/lib/formatDate';
import { type Coupon, type CouponDiscountType } from '@/lib/coupons';
import {
  createCoupon,
  deleteCoupon,
  updateCoupon,
  updateCouponStatus,
} from '@/services/Coupon/admin';
import { makeZodResolver } from '@/lib/form-validation';

const couponDiscountOptions: Array<{
  value: CouponDiscountType;
  label: string;
  description: string;
}> = [
  {
    value: 'PERCENTAGE',
    label: 'Percentage',
    description: 'Reduce the cart total by a percentage',
  },
  {
    value: 'DISCOUNT_AMOUNT',
    label: 'Fixed amount',
    description: 'Subtract a fixed ৳ amount',
  },
  {
    value: 'FREE_SHIPPING',
    label: 'Free shipping',
    description: 'Remove delivery charges for eligible orders',
  },
];

const couponFormSchema = z
  .object({
    code: z
      .string({ error: 'Coupon code is required!' })
      .trim()
      .min(2, { message: 'Coupon code must be at least 2 characters long!' })
      .max(50, { message: 'Coupon code must be at most 50 characters long!' }),
    label: z
      .string({ error: 'Coupon label is required!' })
      .trim()
      .min(2, { message: 'Coupon label must be at least 2 characters long!' })
      .max(100, {
        message: 'Coupon label must be at most 100 characters long!',
      }),
    description: z.string().trim().max(500, {
      message: 'Description must be at most 500 characters long!',
    }),
    discountType: z.enum(['PERCENTAGE', 'DISCOUNT_AMOUNT', 'FREE_SHIPPING'], {
      error: 'Discount type is required!',
    }),
    discountValue: z
      .number({ error: 'Discount value is required!' })
      .min(0, { message: 'Discount value must be at least 0!' }),
    minSubtotal: z
      .number({ error: 'Minimum subtotal is required!' })
      .min(0, { message: 'Minimum subtotal must be at least 0!' }),
    expiresAt: z
      .string({ error: 'Expiry date is required!' })
      .trim()
      .min(1, { message: 'Expiry date is required!' }),
    isActive: z.boolean(),
  })
  .superRefine((value, ctx) => {
    if (value.discountType === 'PERCENTAGE' && value.discountValue > 100) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Percentage discount cannot be more than 100!',
        path: ['discountValue'],
      });
    }
  });

type CouponFormValues = z.infer<typeof couponFormSchema>;

type CouponListMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

type DashboardCouponsManagerProps = {
  coupons: Coupon[];
  paginationMeta: CouponListMeta;
  searchTerm: string;
  title: string;
  description: string;
};

function ErrorText({ message }: { message?: string }) {
  if (!message) return null;

  return <p className="text-xs text-destructive">{message}</p>;
}

function formatCouponValue(coupon: Coupon) {
  if (coupon.discountType === 'FREE_SHIPPING') {
    return 'Free shipping';
  }

  if (coupon.discountType === 'PERCENTAGE') {
    return `${coupon.discountValue}%`;
  }

  return `৳${coupon.discountValue.toLocaleString('en-US')}`;
}

function formatDiscountTypeLabel(discountType: CouponDiscountType) {
  return (
    couponDiscountOptions.find((option) => option.value === discountType)
      ?.label ?? discountType
  );
}

function formatDiscountTypeDescription(discountType: CouponDiscountType) {
  return (
    couponDiscountOptions.find((option) => option.value === discountType)
      ?.description ?? discountType
  );
}

function toDateTimeLocalValue(value?: string | Date | null) {
  if (!value) return '';

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60_000);

  return local.toISOString().slice(0, 16);
}

function getDefaultCouponValues(): CouponFormValues {
  const nextYear = new Date();
  nextYear.setFullYear(nextYear.getFullYear() + 1);

  return {
    code: '',
    label: '',
    description: '',
    discountType: 'PERCENTAGE',
    discountValue: 10,
    minSubtotal: 0,
    expiresAt: toDateTimeLocalValue(nextYear),
    isActive: true,
  };
}

function buildCouponPayload(values: CouponFormValues) {
  return {
    code: values.code.trim().toUpperCase(),
    label: values.label.trim(),
    description: values.description.trim() || undefined,
    discountType: values.discountType,
    discountValue:
      values.discountType === 'FREE_SHIPPING' ? 0 : values.discountValue,
    minSubtotal: values.minSubtotal,
    expiresAt: new Date(values.expiresAt).toISOString(),
    isActive: values.isActive,
  };
}

function CouponFormCard({
  form,
  title,
  description,
  submitLabel,
  pendingLabel,
  submitIcon,
  isPending,
  onSubmit,
  onCancel,
}: {
  form: UseFormReturn<CouponFormValues>;
  title: string;
  description: string;
  submitLabel: string;
  pendingLabel: string;
  submitIcon: ReactNode;
  isPending: boolean;
  onSubmit: SubmitHandler<CouponFormValues>;
  onCancel?: () => void;
}) {
  const discountType = form.watch('discountType');
  const isFreeShipping = discountType === 'FREE_SHIPPING';

  return (
    <Card className="shadow-sm border-border/60">
      <CardHeader className="space-y-2">
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
          <div className="grid gap-4 xl:grid-cols-2">
            <div className="grid gap-1.5">
              <label className="text-sm font-medium text-foreground">
                Coupon code
              </label>
              <DashboardInput
                placeholder="WELCOME10"
                {...form.register('code')}
              />
              <ErrorText message={form.formState.errors.code?.message} />
            </div>
            <div className="grid gap-1.5">
              <label className="text-sm font-medium text-foreground">
                Label
              </label>
              <DashboardInput
                placeholder="10% off for new users"
                {...form.register('label')}
              />
              <ErrorText message={form.formState.errors.label?.message} />
            </div>
            <div className="grid gap-1.5 xl:col-span-2">
              <label className="text-sm font-medium text-foreground">
                Description
              </label>
              <Textarea
                placeholder="Short note about the offer"
                className="min-h-24 rounded-xl border-border/70 bg-background/90 px-4 py-3 text-sm shadow-sm focus-visible:border-primary/60 focus-visible:ring-primary/20"
                {...form.register('description')}
              />
              <ErrorText message={form.formState.errors.description?.message} />
            </div>
            <div className="grid gap-1.5">
              <label className="text-sm font-medium text-foreground">
                Discount type
              </label>
              <Controller
                control={form.control}
                name="discountType"
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={(value) => {
                      field.onChange(value as CouponDiscountType);

                      if (value === 'FREE_SHIPPING') {
                        form.setValue('discountValue', 0, {
                          shouldDirty: true,
                          shouldTouch: true,
                          shouldValidate: true,
                        });
                      }
                    }}
                  >
                    <SelectTrigger className="h-11 w-full rounded-xl border-border/70 bg-background/90 px-4 text-sm shadow-sm">
                      <SelectValue placeholder="Choose discount type" />
                    </SelectTrigger>
                    <SelectContent>
                      {couponDiscountOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              <ErrorText
                message={form.formState.errors.discountType?.message}
              />
            </div>
            <div className="grid gap-1.5">
              <label className="text-sm font-medium text-foreground">
                Discount value
              </label>
              <DashboardInput
                type="number"
                min={0}
                max={discountType === 'PERCENTAGE' ? 100 : undefined}
                step="1"
                disabled={isFreeShipping}
                placeholder={
                  isFreeShipping
                    ? '0'
                    : discountType === 'PERCENTAGE'
                      ? '10'
                      : '500'
                }
                {...form.register('discountValue', {
                  setValueAs: (value) =>
                    value === '' ? undefined : Number(value),
                })}
              />
              <p className="text-xs text-muted-foreground">
                {formatDiscountTypeDescription(discountType)}
              </p>
              <ErrorText
                message={form.formState.errors.discountValue?.message}
              />
            </div>
            <div className="grid gap-1.5">
              <label className="text-sm font-medium text-foreground">
                Minimum subtotal
              </label>
              <DashboardInput
                type="number"
                min={0}
                step="1"
                placeholder="0"
                {...form.register('minSubtotal', {
                  setValueAs: (value) =>
                    value === '' ? undefined : Number(value),
                })}
              />
              <p className="text-xs text-muted-foreground">
                Orders below this amount cannot use the coupon.
              </p>
              <ErrorText message={form.formState.errors.minSubtotal?.message} />
            </div>
            <div className="grid gap-1.5">
              <label className="text-sm font-medium text-foreground">
                Expiry date
              </label>
              <DashboardInput
                type="datetime-local"
                {...form.register('expiresAt')}
              />
              <ErrorText message={form.formState.errors.expiresAt?.message} />
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 rounded-xl border border-border/70 bg-background/90 px-4 py-3 text-sm shadow-sm">
                <input
                  type="checkbox"
                  className="size-4 rounded border-border text-primary focus:ring-primary/20"
                  {...form.register('isActive')}
                />
                <span>Active</span>
              </label>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            {onCancel ? (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isPending}
              >
                Cancel
              </Button>
            ) : null}
            <Button type="submit" className="gap-2" disabled={isPending}>
              {isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                submitIcon
              )}
              {isPending ? pendingLabel : submitLabel}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

export function DashboardCouponsManager({
  coupons,
  paginationMeta,
  searchTerm,
  title,
  description,
}: DashboardCouponsManagerProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [couponRows, setCouponRows] = useState(coupons);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [pendingDeleteCoupon, setPendingDeleteCoupon] = useState<Pick<
    Coupon,
    'id' | 'code' | 'label'
  > | null>(null);

  const createForm = useForm<CouponFormValues>({
    resolver: makeZodResolver(couponFormSchema),
    defaultValues: getDefaultCouponValues(),
    mode: 'onTouched',
  });

  const editForm = useForm<CouponFormValues>({
    resolver: makeZodResolver(couponFormSchema),
    defaultValues: getDefaultCouponValues(),
    mode: 'onTouched',
  });

  useEffect(() => {
    if (!editingCoupon) {
      editForm.reset(getDefaultCouponValues());
      return;
    }

    editForm.reset({
      code: editingCoupon.code,
      label: editingCoupon.label,
      description: editingCoupon.description ?? '',
      discountType: editingCoupon.discountType,
      discountValue: editingCoupon.discountValue,
      minSubtotal: editingCoupon.minSubtotal ?? 0,
      expiresAt: toDateTimeLocalValue(editingCoupon.expiresAt),
      isActive: editingCoupon.isActive,
    });
  }, [editForm, editingCoupon]);

  function refresh(message: string, type: 'success' | 'error') {
    if (type === 'success') {
      toast.success(message);
    } else {
      toast.error(message);
    }

    router.refresh();
  }

  function updateQuery(updates: {
    page?: number;
    limit?: number;
    searchTerm?: string;
  }) {
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
  }

  function beginEditing(coupon: Coupon) {
    setEditingCoupon(coupon);
  }

  function cancelEditing() {
    if (isPending) return;

    setEditingCoupon(null);
  }

  function closeDeleteDialog() {
    if (isPending) return;

    setPendingDeleteCoupon(null);
  }

  function handleSearchChange(value: string) {
    updateQuery({ page: 1, searchTerm: value });
  }

  function handleCreateCoupon(values: CouponFormValues) {
    startTransition(async () => {
      const result = await createCoupon(buildCouponPayload(values));

      if (!result?.success) {
        return refresh(result?.message ?? 'Failed to create coupon.', 'error');
      }

      const createdCoupon = result.data;
      if (createdCoupon) {
        setCouponRows((current) => [createdCoupon, ...current]);
      }
      createForm.reset(getDefaultCouponValues());
      refresh(result.message ?? 'Coupon created successfully.', 'success');
    });
  }

  function handleUpdateCoupon(values: CouponFormValues) {
    if (!editingCoupon) return;

    startTransition(async () => {
      const result = await updateCoupon(
        editingCoupon.id,
        buildCouponPayload(values),
      );

      if (!result?.success) {
        return refresh(result?.message ?? 'Failed to update coupon.', 'error');
      }

      const updatedCoupon = result.data;
      if (updatedCoupon) {
        setCouponRows((current) =>
          current.map((coupon) =>
            coupon.id === editingCoupon.id ? updatedCoupon : coupon,
          ),
        );
      }
      setEditingCoupon(null);
      refresh(result.message ?? 'Coupon updated successfully.', 'success');
    });
  }

  function handleToggleCouponStatus(coupon: Coupon) {
    startTransition(async () => {
      const result = await updateCouponStatus(coupon.id, !coupon.isActive);

      if (!result?.success) {
        return refresh(
          result?.message ?? 'Failed to update coupon status.',
          'error',
        );
      }

      setCouponRows((current) =>
        current.map((row) =>
          row.id === coupon.id ? { ...row, isActive: !coupon.isActive } : row,
        ),
      );
      refresh(
        result.message ??
          `Coupon ${coupon.isActive ? 'disabled' : 'enabled'} successfully.`,
        'success',
      );
    });
  }

  function confirmDeleteCoupon() {
    const couponId = pendingDeleteCoupon?.id;

    if (!couponId) return;

    startTransition(async () => {
      const result = await deleteCoupon(couponId);

      if (!result?.success) {
        return refresh(result?.message ?? 'Failed to delete coupon.', 'error');
      }

      if (editingCoupon?.id === couponId) {
        setEditingCoupon(null);
      }

      setCouponRows((current) => current.filter((row) => row.id !== couponId));
      setPendingDeleteCoupon(null);
      refresh(result.message ?? 'Coupon deleted successfully.', 'success');
    });
  }

  const activeCoupons = couponRows.filter((coupon) => coupon.isActive).length;
  const inactiveCoupons = couponRows.length - activeCoupons;

  return (
    <div className="space-y-6">
      <Card className="border-border/60 bg-linear-to-r from-background via-background to-muted/30 shadow-sm">
        <CardHeader className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-primary">
              <Sparkles className="size-5" />
              <span className="text-xs font-semibold uppercase tracking-[0.22em]">
                Promotions
              </span>
            </div>
            <CardTitle className="text-2xl">{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          <div className="flex flex-wrap gap-2 text-sm">
            <Badge variant="secondary">Total: {couponRows.length}</Badge>
            <Badge variant="secondary">Active: {activeCoupons}</Badge>
            <Badge variant="secondary">Disabled: {inactiveCoupons}</Badge>
          </div>
        </CardHeader>
      </Card>

      <CouponFormCard
        form={createForm}
        title="Create coupon"
        description="Create a new discount code for customers. Admin and super-admin can manage visibility and expiry."
        submitLabel="Create coupon"
        pendingLabel="Creating coupon..."
        submitIcon={<Plus className="size-4" />}
        isPending={isPending}
        onSubmit={handleCreateCoupon}
      />

      {editingCoupon ? (
        <CouponFormCard
          form={editForm}
          title={`Edit coupon ${editingCoupon.code}`}
          description="Update the coupon value, expiry, or activation status."
          submitLabel="Update coupon"
          pendingLabel="Updating coupon..."
          submitIcon={<Pencil className="size-4" />}
          isPending={isPending}
          onSubmit={handleUpdateCoupon}
          onCancel={cancelEditing}
        />
      ) : null}

      <Card className="shadow-sm border-border/60">
        <CardHeader className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="space-y-1">
              <CardTitle>Coupons</CardTitle>
              <CardDescription>
                Showing {couponRows.length} of {paginationMeta.total} coupons
              </CardDescription>
            </div>
            <TableFilter
              key={searchTerm}
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder="Search coupons..."
              className="w-full md:w-96"
            />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Coupon</TableHead>
                <TableHead>Discount</TableHead>
                <TableHead>Minimum subtotal</TableHead>
                <TableHead>Expiry</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {couponRows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    No coupons found.
                  </TableCell>
                </TableRow>
              ) : null}
              {couponRows.map((coupon) => (
                <TableRow key={coupon.id}>
                  <TableCell className="font-mono text-xs font-semibold">
                    {coupon.code}
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-medium text-foreground">
                        {coupon.label}
                      </div>
                      <p className="max-w-[24rem] text-xs text-muted-foreground">
                        {coupon.description || 'No description provided.'}
                      </p>
                      <Badge variant="outline" className="w-fit">
                        {formatDiscountTypeLabel(coupon.discountType)}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell className="whitespace-nowrap font-medium">
                    {formatCouponValue(coupon)}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    {coupon.minSubtotal
                      ? `৳${coupon.minSubtotal.toLocaleString('en-US')}`
                      : 'No minimum'}
                  </TableCell>
                  <TableCell>
                    <span
                      title={formatDashboardDate(coupon.expiresAt, {
                        time: true,
                      })}
                    >
                      {formatDashboardDate(coupon.expiresAt)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant={coupon.isActive ? 'default' : 'secondary'}>
                      {coupon.isActive ? 'Active' : 'Disabled'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => beginEditing(coupon)}
                        disabled={isPending}
                      >
                        <Pencil className="size-4" />
                        Edit
                      </Button>
                      <Button
                        type="button"
                        variant={coupon.isActive ? 'destructive' : 'secondary'}
                        size="sm"
                        onClick={() => handleToggleCouponStatus(coupon)}
                        disabled={isPending}
                      >
                        {coupon.isActive ? 'Disable' : 'Enable'}
                      </Button>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() =>
                          setPendingDeleteCoupon({
                            id: coupon.id,
                            code: coupon.code,
                            label: coupon.label,
                          })
                        }
                        disabled={isPending}
                      >
                        <Trash2 className="size-4" />
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
        </CardContent>
      </Card>

      <DeleteConfirmationDialog
        open={Boolean(pendingDeleteCoupon)}
        onOpenChange={(open) => {
          if (!open) closeDeleteDialog();
        }}
        onConfirm={confirmDeleteCoupon}
        isPending={isPending}
        title="Delete coupon?"
        description={`This will permanently delete ${pendingDeleteCoupon?.code || pendingDeleteCoupon?.label || 'this coupon'} from the system.`}
        confirmLabel="Delete coupon"
      />
    </div>
  );
}
