'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useCallback, useEffect, useState, useTransition } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useForm, useWatch } from 'react-hook-form';
import { z } from 'zod';
import { toast } from 'sonner';
import {
  Ban,
  CheckCircle2,
  Eye,
  EyeOff,
  Link2,
  Loader2,
  PencilLine,
  Plus,
  Star,
  Trash2,
} from 'lucide-react';
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
import { Input } from '@/components/ui/input';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { formatDashboardDate } from '@/lib/formatDate';
import { makeZodResolver } from '@/lib/form-validation';
import {
  createManualProductReview,
  deleteProductReview,
  updateProductReview,
  updateProductReviewStatus,
  type ProductReviewRecord,
  type ReviewStatus,
  type ReviewSource,
} from '@/services/ProductReview';

const MAX_REVIEW_IMAGES = 5;

const reviewFormSchema = z.object({
  product: z
    .string({ error: 'Product is required!' })
    .trim()
    .min(1, { message: 'Product is required!' }),
  displayName: z
    .string({ error: 'Display name is required!' })
    .trim()
    .min(1, { message: 'Display name is required!' })
    .max(100, { message: 'Display name cannot exceed 100 characters!' }),
  displayImage: z.string().trim().optional(),
  rating: z.coerce
    .number({ error: 'Rating is required!' })
    .min(1, { message: 'Rating must be at least 1!' })
    .max(5, { message: 'Rating cannot exceed 5!' }),
  comment: z
    .string({ error: 'Comment is required!' })
    .trim()
    .min(1, { message: 'Comment is required!' })
    .max(2000, { message: 'Comment cannot exceed 2000 characters!' }),
  status: z.enum(['pending', 'approved', 'rejected', 'hidden']).optional(),
  images: z.array(z.string().trim().min(1)).max(MAX_REVIEW_IMAGES).optional(),
});

type ReviewFormValues = z.infer<typeof reviewFormSchema>;

type Props = {
  reviews: ProductReviewRecord[];
  paginationMeta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  summary: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    hidden: number;
    customer: number;
    manual: number;
    averageRating: number;
  };
  searchTerm?: string;
  status?: string;
  source?: string;
  product?: string;
  user?: string;
  rating?: string;
  sort?: string;
  createdFrom?: string;
  createdTo?: string;
};

const statusOptions: Array<{ label: string; value: ReviewStatus | 'all' }> = [
  { label: 'All statuses', value: 'all' },
  { label: 'Pending', value: 'pending' },
  { label: 'Approved', value: 'approved' },
  { label: 'Rejected', value: 'rejected' },
  { label: 'Hidden', value: 'hidden' },
];

const sourceOptions: Array<{ label: string; value: ReviewSource | 'all' }> = [
  { label: 'All sources', value: 'all' },
  { label: 'Customer', value: 'customer' },
  { label: 'Manual', value: 'manual' },
];

const sortOptions = [
  { label: 'Newest first', value: 'createdAt-desc' },
  { label: 'Oldest first', value: 'createdAt-asc' },
  { label: 'Rating high', value: 'rating-desc' },
  { label: 'Rating low', value: 'rating-asc' },
  { label: 'Status A→Z', value: 'status-asc' },
  { label: 'Status Z→A', value: 'status-desc' },
] as const;

function ProductRefName(value: ProductReviewRecord['product']) {
  if (!value || typeof value === 'string') return '-';
  return value.title?.trim() || value.slug?.trim() || '-';
}

function ProductRefSlug(value: ProductReviewRecord['product']) {
  if (!value || typeof value === 'string') return '';
  return value.slug?.trim() || '';
}

function UserRefName(
  value:
    | ProductReviewRecord['user']
    | ProductReviewRecord['createdBy']
    | ProductReviewRecord['approvedBy']
    | ProductReviewRecord['rejectedBy']
    | ProductReviewRecord['hiddenBy'],
) {
  if (!value || typeof value === 'string') return '-';
  return value.name?.trim() || value.email?.trim() || '-';
}

function statusBadge(status: ReviewStatus) {
  switch (status) {
    case 'approved':
      return (
        <Badge className="rounded-full bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/10">
          Approved
        </Badge>
      );
    case 'pending':
      return (
        <Badge variant="secondary" className="rounded-full">
          Pending
        </Badge>
      );
    case 'rejected':
      return (
        <Badge variant="destructive" className="rounded-full text-white!">
          Rejected
        </Badge>
      );
    case 'hidden':
      return (
        <Badge variant="outline" className="rounded-full">
          Hidden
        </Badge>
      );
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
}

function sourceBadge(source: ReviewSource) {
  return source === 'customer' ? (
    <Badge variant="secondary" className="rounded-full">
      Customer
    </Badge>
  ) : (
    <Badge variant="outline" className="rounded-full">
      Manual
    </Badge>
  );
}

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }, (_, index) => (
        <Star
          key={index}
          className={
            index < Math.round(rating)
              ? 'size-4 fill-primary text-primary'
              : 'size-4 text-muted-foreground/35'
          }
        />
      ))}
    </div>
  );
}

function SummaryCards({ summary }: Props) {
  const cards = [
    {
      label: 'Total reviews',
      value: summary.total,
      description: 'All reviews',
    },
    {
      label: 'Pending',
      value: summary.pending,
      description: 'Awaiting moderation',
    },
    {
      label: 'Approved',
      value: summary.approved,
      description: 'Public reviews',
    },
    {
      label: 'Manual',
      value: summary.manual,
      description: 'Admin-created reviews',
    },
    {
      label: 'Average rating',
      value: summary.averageRating.toFixed(1),
      description: 'Across reviews',
    },
  ];

  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
      {cards.map((card) => (
        <Card key={card.label} className="shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription>{card.label}</CardDescription>
            <CardTitle className="text-2xl">{card.value}</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 text-sm text-muted-foreground">
            {card.description}
          </CardContent>
        </Card>
      ))}
    </section>
  );
}

function ReviewDialogContent({
  review,
  mode,
  onClose,
  onSaved,
}: {
  review: ProductReviewRecord | null;
  mode: 'view' | 'edit';
  onClose: () => void;
  onSaved: (review?: ProductReviewRecord) => void;
}) {
  const [isPending, startTransition] = useTransition();
  const form = useForm<ReviewFormValues>({
    resolver: makeZodResolver(reviewFormSchema),
    defaultValues: {
      product: '',
      displayName: '',
      displayImage: '',
      rating: 5,
      comment: '',
      status: 'approved',
      images: [],
    },
    mode: 'onTouched',
  });
  const [reviewImageFiles, setReviewImageFiles] = useState<File[]>([]);
  const [displayImageFile, setDisplayImageFile] = useState<File | null>(null);

  useEffect(() => {
    if (!review) return;

    const productValue =
      typeof review.product === 'string'
        ? review.product
        : (review.product?._id ?? '');
    form.reset({
      product: productValue,
      displayName: review.displayName,
      displayImage: review.displayImage,
      rating: review.rating,
      comment: review.comment,
      status: review.status,
      images: review.images ?? [],
    });
  }, [form, review]);

  const reviewStatus =
    useWatch({ control: form.control, name: 'status' }) ?? 'approved';

  function handleReviewImageFiles(files?: FileList | File[]) {
    setReviewImageFiles(Array.from(files ?? []).slice(0, MAX_REVIEW_IMAGES));
  }

  function submit(values: ReviewFormValues) {
    if (!review?._id) return;

    const displayImage =
      displayImageFile ??
      values.displayImage?.trim() ??
      review.displayImage?.trim() ??
      '';

    startTransition(async () => {
      const result = await updateProductReview(review._id!, {
        displayName: values.displayName,
        displayImage,
        rating: values.rating,
        comment: values.comment,
        status: values.status,
        images:
          reviewImageFiles.length > 0
            ? reviewImageFiles
            : (review.images ?? []),
      });

      if (!result.success) {
        toast.error(result.message ?? 'Failed to update review.');
        return;
      }

      toast.success(result.message ?? 'Review updated successfully.');
      onSaved(result.data);
    });
  }

  if (!review) return null;

  const isEdit = mode === 'edit';

  return (
    <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
      <DialogHeader>
        <DialogTitle>{isEdit ? 'Edit review' : 'Review details'}</DialogTitle>
        <DialogDescription>
          {isEdit
            ? 'Update reviewer details, content, or status.'
            : 'Review the product review record and moderation history.'}
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4">
        <div className="grid gap-3 md:grid-cols-2">
          <div className="rounded-2xl border bg-muted/20 p-3 text-sm">
            <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
              Product
            </div>
            <div className="mt-2 font-medium">
              {ProductRefName(review.product)}
            </div>
            {ProductRefSlug(review.product) ? (
              <Link
                href={`/product/${ProductRefSlug(review.product)}`}
                target="_blank"
                className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
              >
                Visit product <Link2 className="size-3.5" />
              </Link>
            ) : null}
          </div>
          <div className="rounded-2xl border bg-muted/20 p-3 text-sm">
            <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
              Internal
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {sourceBadge(review.source)}
              {statusBadge(review.status)}
              {review.isVerifiedPurchase ? (
                <Badge className="rounded-full bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/10">
                  Verified purchase
                </Badge>
              ) : null}
            </div>
            <div className="mt-3 grid gap-2 text-xs text-muted-foreground">
              <div>User: {UserRefName(review.user)}</div>
              <div>Created by: {UserRefName(review.createdBy)}</div>
              <div>Approved by: {UserRefName(review.approvedBy)}</div>
            </div>
          </div>
        </div>

        {isEdit ? (
          <form className="space-y-4" onSubmit={form.handleSubmit(submit)}>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <div className="text-xs font-medium text-muted-foreground">
                  Display name
                </div>
                <Input
                  placeholder="Reviewer name"
                  {...form.register('displayName')}
                />
                {form.formState.errors.displayName?.message ? (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.displayName.message}
                  </p>
                ) : null}
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-3 text-xs font-medium text-muted-foreground">
                  <span>Display image</span>
                  <span>
                    {displayImageFile
                      ? displayImageFile.name
                      : review.displayImage
                        ? 'Current image kept'
                        : 'Optional'}
                  </span>
                </div>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(event) => {
                    setDisplayImageFile(event.target.files?.[0] ?? null);
                    form.clearErrors('displayImage');
                  }}
                />
                {review.displayImage ? (
                  <div className="flex items-center gap-3 rounded-2xl border bg-muted/20 p-3 text-xs text-muted-foreground">
                    <div className="relative size-10 overflow-hidden rounded-full bg-muted">
                      <Image
                        src={review.displayImage}
                        alt={review.displayName}
                        fill
                        sizes="40px"
                        className="object-cover"
                      />
                    </div>
                    <span>
                      {displayImageFile
                        ? 'New upload selected'
                        : 'Current image will stay unless you upload a new one.'}
                    </span>
                  </div>
                ) : null}
                {form.formState.errors.displayImage?.message ? (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.displayImage.message}
                  </p>
                ) : null}
              </div>
              <div className="space-y-2">
                <div className="text-xs font-medium text-muted-foreground">
                  Rating
                </div>
                <Input
                  type="number"
                  min={1}
                  max={5}
                  step="1"
                  {...form.register('rating')}
                />
                {form.formState.errors.rating?.message ? (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.rating.message}
                  </p>
                ) : null}
              </div>
              <div className="space-y-2">
                <div className="text-xs font-medium text-muted-foreground">
                  Status
                </div>
                <Select
                  value={reviewStatus}
                  onValueChange={(value) =>
                    form.setValue('status', value as ReviewStatus)
                  }
                >
                  <SelectTrigger className="h-11 rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="hidden">Hidden</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-xs font-medium text-muted-foreground">
                Comment
              </div>
              <Textarea
                className="min-h-28 rounded-2xl"
                {...form.register('comment')}
              />
              {form.formState.errors.comment?.message ? (
                <p className="text-xs text-destructive">
                  {form.formState.errors.comment.message}
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between gap-3 text-xs font-medium text-muted-foreground">
                <span>Images</span>
                <span>
                  {reviewImageFiles.length > 0
                    ? `${reviewImageFiles.length} file${reviewImageFiles.length === 1 ? '' : 's'} selected`
                    : `Optional upload up to ${MAX_REVIEW_IMAGES}`}
                </span>
              </div>
              <Input
                type="file"
                accept="image/*"
                multiple
                onChange={(event) =>
                  handleReviewImageFiles(event.target.files ?? undefined)
                }
              />
              {reviewImageFiles.length > 0 ? (
                <div className="space-y-1 rounded-2xl border bg-muted/20 p-3 text-xs text-muted-foreground">
                  {reviewImageFiles.map((file) => (
                    <div key={file.name}>{file.name}</div>
                  ))}
                </div>
              ) : null}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? <Loader2 className="size-4 animate-spin" /> : null}
                Save review
              </Button>
            </DialogFooter>
          </form>
        ) : (
          <>
            <div className="grid gap-3 md:grid-cols-[auto_minmax(0,1fr)]">
              <div className="relative size-16 overflow-hidden rounded-full bg-muted">
                <Image
                  src={review.displayImage}
                  alt={review.displayName}
                  fill
                  sizes="64px"
                  className="object-cover"
                />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-base font-semibold">
                    {review.displayName}
                  </h3>
                  {statusBadge(review.status)}
                  {sourceBadge(review.source)}
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <Stars rating={review.rating} />
                  <span className="text-sm text-muted-foreground">
                    {review.rating.toFixed(1)} / 5
                  </span>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border bg-muted/20 p-3 text-sm leading-6">
              {review.comment}
            </div>

            {Array.isArray(review.images) && review.images.length > 0 ? (
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {review.images.map((image, index) => (
                  <div
                    key={`${image}-${index}`}
                    className="relative aspect-square overflow-hidden rounded-xl bg-muted"
                  >
                    <Image
                      src={image}
                      alt={`${review.displayName} review image ${index + 1}`}
                      fill
                      sizes="160px"
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            ) : null}

            <div className="grid gap-2 text-xs text-muted-foreground md:grid-cols-2">
              <div>Created: {formatDashboardDate(review.createdAt)}</div>
              <div>Updated: {formatDashboardDate(review.updatedAt)}</div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Close
              </Button>
            </DialogFooter>
          </>
        )}
      </div>
    </DialogContent>
  );
}

export function DashboardProductReviewsManager({
  reviews,
  paginationMeta,
  summary,
  searchTerm = '',
  status = '',
  source = '',
  product = '',
  user = '',
  rating = '',
  sort = 'createdAt-desc',
  createdFrom = '',
  createdTo = '',
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState(searchTerm);
  const [statusFilter, setStatusFilter] = useState(status);
  const [sourceFilter, setSourceFilter] = useState(source);
  const [productFilter, setProductFilter] = useState(product);
  const [userFilter, setUserFilter] = useState(user);
  const [ratingFilter, setRatingFilter] = useState(rating);
  const [sortFilter, setSortFilter] = useState(sort);
  const [createdFromFilter, setCreatedFromFilter] = useState(createdFrom);
  const [createdToFilter, setCreatedToFilter] = useState(createdTo);
  const [selectedReview, setSelectedReview] =
    useState<ProductReviewRecord | null>(null);
  const [dialogMode, setDialogMode] = useState<'view' | 'edit'>('view');
  const [pendingDeleteReview, setPendingDeleteReview] =
    useState<ProductReviewRecord | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createDisplayImageFile, setCreateDisplayImageFile] =
    useState<File | null>(null);
  const [createReviewImageFiles, setCreateReviewImageFiles] = useState<File[]>(
    [],
  );
  const [reviewRows, setReviewRows] = useState(reviews);
  const [pendingStatusChange, setPendingStatusChange] = useState<{
    review: ProductReviewRecord;
    status: ReviewStatus;
  } | null>(null);
  const createForm = useForm<ReviewFormValues>({
    resolver: makeZodResolver(reviewFormSchema),
    defaultValues: {
      product: '',
      displayName: '',
      displayImage: '',
      rating: 5,
      comment: '',
      status: 'approved',
      images: [],
    },
    mode: 'onTouched',
  });

  const createStatus =
    useWatch({ control: createForm.control, name: 'status' }) ?? 'approved';

  const visibleCount = reviewRows.length;

  const updateQuery = useCallback(
    (updates: {
      page?: number;
      limit?: number;
      searchTerm?: string;
      status?: string;
      source?: string;
      product?: string;
      user?: string;
      rating?: string;
      createdFrom?: string;
      createdTo?: string;
      sort?: string;
    }) => {
      const params = new URLSearchParams(searchParams.toString());

      params.set('page', String(updates.page ?? paginationMeta.page));
      params.set('limit', String(updates.limit ?? paginationMeta.limit));

      const nextSearch = updates.searchTerm ?? search;
      if (nextSearch.trim()) params.set('searchTerm', nextSearch.trim());
      else params.delete('searchTerm');

      const nextStatus = updates.status ?? statusFilter;
      if (nextStatus.trim()) params.set('status', nextStatus.trim());
      else params.delete('status');

      const nextSource = updates.source ?? sourceFilter;
      if (nextSource.trim()) params.set('source', nextSource.trim());
      else params.delete('source');

      const nextProduct = updates.product ?? productFilter;
      if (nextProduct.trim()) params.set('product', nextProduct.trim());
      else params.delete('product');

      const nextUser = updates.user ?? userFilter;
      if (nextUser.trim()) params.set('user', nextUser.trim());
      else params.delete('user');

      const nextRating = updates.rating ?? ratingFilter;
      if (nextRating.trim()) params.set('rating', nextRating.trim());
      else params.delete('rating');

      const nextCreatedFrom = updates.createdFrom ?? createdFromFilter;
      if (nextCreatedFrom.trim())
        params.set('createdFrom', nextCreatedFrom.trim());
      else params.delete('createdFrom');

      const nextCreatedTo = updates.createdTo ?? createdToFilter;
      if (nextCreatedTo.trim()) params.set('createdTo', nextCreatedTo.trim());
      else params.delete('createdTo');

      const nextSort = updates.sort ?? sortFilter;
      if (nextSort.trim()) params.set('sort', nextSort.trim());
      else params.delete('sort');

      router.push(`${pathname}?${params.toString()}`);
    },
    [
      createdFromFilter,
      createdToFilter,
      pathname,
      paginationMeta.limit,
      paginationMeta.page,
      productFilter,
      ratingFilter,
      router,
      search,
      searchParams,
      sortFilter,
      sourceFilter,
      statusFilter,
      userFilter,
    ],
  );

  function refresh(message: string, type: 'success' | 'error') {
    if (type === 'success') toast.success(message);
    else toast.error(message);

    router.refresh();
  }

  function openReview(review: ProductReviewRecord, mode: 'view' | 'edit') {
    setSelectedReview(review);
    setDialogMode(mode);
  }

  function closeReviewDialog() {
    if (isPending) return;
    setSelectedReview(null);
  }

  function handleReviewSaved() {
    setSelectedReview(null);
    router.refresh();
  }

  function handleReviewSavedData(updatedReview?: ProductReviewRecord) {
    if (updatedReview?._id) {
      setReviewRows((current) =>
        current.map((row) =>
          row._id === updatedReview._id ? updatedReview : row,
        ),
      );
    }

    handleReviewSaved();
  }

  function handleDeleteReview() {
    const reviewId = pendingDeleteReview?._id;
    if (!reviewId) return;

    startTransition(async () => {
      const result = await deleteProductReview(reviewId);
      if (!result.success) {
        return refresh(result.message ?? 'Failed to delete review.', 'error');
      }

      setReviewRows((current) => current.filter((row) => row._id !== reviewId));
      setPendingDeleteReview(null);
      refresh(result.message ?? 'Review deleted successfully.', 'success');
    });
  }

  function handleStatusChange(reviewId: string, nextStatus: ReviewStatus) {
    startTransition(async () => {
      const result = await updateProductReviewStatus(reviewId, {
        status: nextStatus,
      });
      if (!result.success) {
        return refresh(
          result.message ?? 'Failed to update review status.',
          'error',
        );
      }

      setReviewRows((current) =>
        current.map((row) =>
          row._id === reviewId ? { ...row, status: nextStatus } : row,
        ),
      );
      refresh(
        result.message ?? 'Review status updated successfully.',
        'success',
      );
    });
  }

  function confirmStatusChange() {
    const reviewId = pendingStatusChange?.review._id;
    const nextStatus = pendingStatusChange?.status;
    if (!reviewId || !nextStatus) return;

    setPendingStatusChange(null);
    handleStatusChange(reviewId, nextStatus);
  }

  function openCreateDialog() {
    setIsCreateOpen(true);
    setCreateDisplayImageFile(null);
    createForm.reset({
      product: '',
      displayName: '',
      displayImage: '',
      rating: 5,
      comment: '',
      status: 'approved',
      images: [],
    });
    setCreateReviewImageFiles([]);
  }

  function submitManual(values: ReviewFormValues) {
    const displayImage =
      createDisplayImageFile ?? values.displayImage?.trim() ?? '';

    startTransition(async () => {
      const result = await createManualProductReview({
        product: values.product,
        displayName: values.displayName,
        displayImage,
        rating: values.rating,
        comment: values.comment,
        status: values.status,
        images: createReviewImageFiles,
      });

      if (!result.success) {
        return refresh(result.message ?? 'Failed to create review.', 'error');
      }

      const createdReview = result.data;
      if (createdReview) {
        setReviewRows((current) => [createdReview, ...current]);
      }
      setIsCreateOpen(false);
      refresh(
        result.message ?? 'Manual review created successfully.',
        'success',
      );
    });
  }

  function handleCreateReviewImageFiles(files?: FileList | File[]) {
    setCreateReviewImageFiles(
      Array.from(files ?? []).slice(0, MAX_REVIEW_IMAGES),
    );
  }

  return (
    <div className="space-y-6">
      <Card className="shadow-sm">
        <CardHeader className="gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle>Product Reviews</CardTitle>
            <CardDescription>
              Showing {visibleCount} of {paginationMeta.total} reviews.
            </CardDescription>
          </div>
          <Button onClick={openCreateDialog} className="self-start">
            <Plus className="mr-2 size-4" />
            Manual review
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <SummaryCards
            reviews={reviews}
            paginationMeta={paginationMeta}
            summary={summary}
            searchTerm={searchTerm}
            status={status}
            source={source}
            product={product}
            user={user}
            rating={rating}
            sort={sort}
          />

          <div className="grid gap-2 xl:grid-cols-4">
            <TableFilter
              value={search}
              onChange={(value) => {
                setSearch(value);
                updateQuery({ page: 1, searchTerm: value });
              }}
              placeholder="Search comment or name..."
              className="w-full min-w-56"
            />
            <DashboardInput
              value={productFilter}
              onChange={(e) => {
                setProductFilter(e.target.value);
                updateQuery({ page: 1, product: e.target.value });
              }}
              placeholder="Filter by product"
            />
            <DashboardInput
              value={userFilter}
              onChange={(e) => {
                setUserFilter(e.target.value);
                updateQuery({ page: 1, user: e.target.value });
              }}
              placeholder="Filter by user"
            />
            <Select
              value={statusFilter || 'all'}
              onValueChange={(value) => {
                setStatusFilter(value);
                updateQuery({ page: 1, status: value === 'all' ? '' : value });
              }}
            >
              <SelectTrigger className="h-11 rounded-xl border-border/70 bg-background/90 px-4 text-sm shadow-sm">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={sourceFilter || 'all'}
              onValueChange={(value) => {
                setSourceFilter(value);
                updateQuery({ page: 1, source: value === 'all' ? '' : value });
              }}
            >
              <SelectTrigger className="h-11 rounded-xl border-border/70 bg-background/90 px-4 text-sm shadow-sm">
                <SelectValue placeholder="Source" />
              </SelectTrigger>
              <SelectContent>
                {sourceOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={ratingFilter || 'all'}
              onValueChange={(value) => {
                setRatingFilter(value);
                updateQuery({ page: 1, rating: value === 'all' ? '' : value });
              }}
            >
              <SelectTrigger className="h-11 rounded-xl border-border/70 bg-background/90 px-4 text-sm shadow-sm">
                <SelectValue placeholder="Rating" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All ratings</SelectItem>
                {[5, 4, 3, 2, 1].map((value) => (
                  <SelectItem key={value} value={String(value)}>
                    {value} stars
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <DashboardInput
              value={createdFromFilter}
              onChange={(e) => {
                setCreatedFromFilter(e.target.value);
                updateQuery({ page: 1, createdFrom: e.target.value });
              }}
              type="date"
              placeholder="From date"
            />
            <DashboardInput
              value={createdToFilter}
              onChange={(e) => {
                setCreatedToFilter(e.target.value);
                updateQuery({ page: 1, createdTo: e.target.value });
              }}
              type="date"
              placeholder="To date"
            />
            <Select
              value={sortFilter}
              onValueChange={(value) => {
                setSortFilter(value);
                updateQuery({ page: 1, sort: value });
              }}
            >
              <SelectTrigger className="h-11 rounded-xl border-border/70 bg-background/90 px-4 text-sm shadow-sm">
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Table className="table-fixed">
            <TableHeader>
              <TableRow>
                <TableHead className="w-[22%]">Product</TableHead>
                <TableHead className="w-[18%]">Reviewer</TableHead>
                <TableHead className="w-[10%]">Rating</TableHead>
                <TableHead className="w-[10%]">Source</TableHead>
                <TableHead className="w-[10%]">Status</TableHead>
                <TableHead className="w-[12%]">Created At</TableHead>
                <TableHead className="w-[18%] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
            {reviewRows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-28 text-center">
                    No product reviews found.
                  </TableCell>
                </TableRow>
              ) : null}

              {reviewRows.map((review) => {
                const productSlug = ProductRefSlug(review.product);

                return (
                  <TableRow
                    key={
                      review._id ?? `${review.displayName}-${review.createdAt}`
                    }
                  >
                    <TableCell className="align-top">
                      <div className="space-y-1">
                        <div className="font-medium">
                          {ProductRefName(review.product)}
                        </div>
                        {productSlug ? (
                          <div className="text-xs text-muted-foreground">
                            {productSlug}
                          </div>
                        ) : null}
                      </div>
                    </TableCell>
                    <TableCell className="align-top">
                      <div className="space-y-1">
                        <div className="font-medium">{review.displayName}</div>
                        <div className="text-xs text-muted-foreground">
                          {UserRefName(review.user)}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="align-top">
                      <div className="flex flex-col gap-1">
                        <Stars rating={review.rating} />
                        <span className="text-xs text-muted-foreground">
                          {review.rating.toFixed(1)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="align-top">
                      {sourceBadge(review.source)}
                    </TableCell>
                    <TableCell className="align-top">
                      {statusBadge(review.status)}
                    </TableCell>
                    <TableCell className="align-top whitespace-nowrap text-sm">
                      <span
                        className="cursor-help"
                        title={
                          review.createdAt
                            ? formatDashboardDate(review.createdAt, {
                                time: true,
                              })
                            : undefined
                        }
                      >
                        {formatDashboardDate(review.createdAt)}
                      </span>
                    </TableCell>
                    <TableCell className="align-top">
                      <div className="flex flex-wrap justify-end gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => openReview(review, 'view')}
                        >
                          <Eye className="size-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => openReview(review, 'edit')}
                        >
                          <PencilLine className="size-4" />
                        </Button>
                        {productSlug ? (
                          <Button
                            asChild
                            type="button"
                            variant="outline"
                            size="icon"
                            title="Visit product details"
                          >
                            <Link
                              href={`/product/${productSlug}`}
                              target="_blank"
                            >
                              <Link2 className="size-4" />
                            </Link>
                          </Button>
                        ) : null}
                        {review.status !== 'approved' ? (
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            title="Approve"
                            onClick={() =>
                              review._id
                                ? setPendingStatusChange({
                                    review,
                                    status: 'approved',
                                  })
                                : undefined
                            }
                          >
                            <CheckCircle2 className="size-4" />
                          </Button>
                        ) : null}
                        {review.status !== 'hidden' ? (
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            title="Hide"
                            onClick={() =>
                              review._id
                                ? setPendingStatusChange({
                                    review,
                                    status: 'hidden',
                                  })
                                : undefined
                            }
                          >
                            <EyeOff className="size-4" />
                          </Button>
                        ) : null}
                        {review.status !== 'rejected' ? (
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            title="Reject"
                            onClick={() =>
                              review._id
                                ? setPendingStatusChange({
                                    review,
                                    status: 'rejected',
                                  })
                                : undefined
                            }
                          >
                            <Ban className="size-4" />
                          </Button>
                        ) : null}
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          onClick={() => setPendingDeleteReview(review)}
                          disabled={!review._id}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          <TablePagination
            page={paginationMeta.page}
            limit={paginationMeta.limit}
            total={paginationMeta.total}
            onPageChange={(pageValue) => updateQuery({ page: pageValue })}
            onLimitChange={(limitValue) =>
              updateQuery({ page: 1, limit: limitValue })
            }
          />
        </CardContent>
      </Card>

      <Dialog
        open={Boolean(selectedReview)}
        onOpenChange={(open) => (!open ? closeReviewDialog() : undefined)}
      >
        <ReviewDialogContent
          key={`${selectedReview?._id ?? 'none'}-${dialogMode}`}
          review={selectedReview}
          mode={dialogMode}
          onClose={closeReviewDialog}
          onSaved={handleReviewSavedData}
        />
      </Dialog>

      <Dialog
        open={isCreateOpen}
        onOpenChange={(open) => setIsCreateOpen(open)}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Create manual review</DialogTitle>
            <DialogDescription>
              Create a review directly from the dashboard.
            </DialogDescription>
          </DialogHeader>

          <form
            className="space-y-4"
            onSubmit={createForm.handleSubmit(submitManual)}
          >
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <div className="text-xs font-medium text-muted-foreground">
                  Product ID or slug
                </div>
                <DashboardInput
                  placeholder="Product ID or slug"
                  {...createForm.register('product')}
                />
                {createForm.formState.errors.product?.message ? (
                  <p className="text-xs text-destructive">
                    {createForm.formState.errors.product.message}
                  </p>
                ) : null}
              </div>
              <div className="space-y-2">
                <div className="text-xs font-medium text-muted-foreground">
                  Display name
                </div>
                <DashboardInput
                  placeholder="Display name"
                  {...createForm.register('displayName')}
                />
                {createForm.formState.errors.displayName?.message ? (
                  <p className="text-xs text-destructive">
                    {createForm.formState.errors.displayName.message}
                  </p>
                ) : null}
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-3 text-xs font-medium text-muted-foreground">
                  <span>Display image</span>
                  <span>
                    {createDisplayImageFile
                      ? createDisplayImageFile.name
                      : 'Default image will be used'}
                  </span>
                </div>
                <DashboardInput
                  type="file"
                  accept="image/*"
                  onChange={(event) => {
                    setCreateDisplayImageFile(event.target.files?.[0] ?? null);
                    createForm.clearErrors('displayImage');
                  }}
                />
                {createForm.formState.errors.displayImage?.message ? (
                  <p className="text-xs text-destructive">
                    {createForm.formState.errors.displayImage.message}
                  </p>
                ) : null}
              </div>
              <div className="space-y-2">
                <div className="text-xs font-medium text-muted-foreground">
                  Rating
                </div>
                <DashboardInput
                  type="number"
                  min={1}
                  max={5}
                  step="1"
                  {...createForm.register('rating')}
                />
                {createForm.formState.errors.rating?.message ? (
                  <p className="text-xs text-destructive">
                    {createForm.formState.errors.rating.message}
                  </p>
                ) : null}
              </div>
              <div className="space-y-2 md:col-span-2">
                <div className="text-xs font-medium text-muted-foreground">
                  Comment
                </div>
                <Textarea
                  className="min-h-28 rounded-2xl"
                  {...createForm.register('comment')}
                />
                {createForm.formState.errors.comment?.message ? (
                  <p className="text-xs text-destructive">
                    {createForm.formState.errors.comment.message}
                  </p>
                ) : null}
              </div>
              <div className="space-y-2 md:col-span-2">
                <div className="flex items-center justify-between gap-3 text-xs font-medium text-muted-foreground">
                  <span>Images</span>
                  <span>
                    {createReviewImageFiles.length > 0
                      ? `${createReviewImageFiles.length} file${createReviewImageFiles.length === 1 ? '' : 's'} selected`
                      : `Optional upload up to ${MAX_REVIEW_IMAGES}`}
                  </span>
                </div>
                <DashboardInput
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(event) =>
                    handleCreateReviewImageFiles(
                      event.target.files ?? undefined,
                    )
                  }
                />
                {createReviewImageFiles.length > 0 ? (
                  <div className="space-y-1 rounded-2xl border bg-muted/20 p-3 text-xs text-muted-foreground">
                    {createReviewImageFiles.map((file) => (
                      <div key={file.name}>{file.name}</div>
                    ))}
                  </div>
                ) : null}
              </div>
              <div className="space-y-2 md:col-span-2">
                <div className="text-xs font-medium text-muted-foreground">
                  Status
                </div>
                <Select
                  value={createStatus}
                  onValueChange={(value) =>
                    createForm.setValue('status', value as ReviewStatus)
                  }
                >
                  <SelectTrigger className="h-11 rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="hidden">Hidden</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreateOpen(false)}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? <Loader2 className="size-4 animate-spin" /> : null}
                Create review
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <DeleteConfirmationDialog
        open={Boolean(pendingDeleteReview)}
        onOpenChange={(open) => !open && setPendingDeleteReview(null)}
        onConfirm={handleDeleteReview}
        title="Delete review"
        description="This will permanently delete the review."
      />

      <DeleteConfirmationDialog
        open={Boolean(pendingStatusChange)}
        onOpenChange={(open) => !open && setPendingStatusChange(null)}
        onConfirm={confirmStatusChange}
        title={
          pendingStatusChange?.status === 'approved'
            ? 'Approve review'
            : pendingStatusChange?.status === 'hidden'
              ? 'Hide review'
              : 'Reject review'
        }
        description={`Are you sure you want to ${pendingStatusChange?.status ?? 'change'} this review?`}
        confirmLabel={
          pendingStatusChange?.status === 'approved'
            ? 'Approve'
            : pendingStatusChange?.status === 'hidden'
              ? 'Hide'
              : 'Reject'
        }
      />
    </div>
  );
}
