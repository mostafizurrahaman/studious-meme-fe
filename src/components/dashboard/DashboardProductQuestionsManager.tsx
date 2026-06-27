'use client';

import { useCallback, useEffect, useState, useTransition } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import {
  CheckCircle2,
  Eye,
  Link2,
  Loader2,
  PencilLine,
  Trash2,
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
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
  answerProductQuestion,
  deleteProductQuestion,
  updateProductQuestionStatus,
  type ProductQuestionRecord,
  type ProductQuestionStatus,
} from '@/services/ProductQuestion';

const answerSchema = z.object({
  answer: z
    .string({ error: 'Answer is required!' })
    .trim()
    .min(1, { message: 'Answer is required!' })
    .max(2000, { message: 'Answer cannot exceed 2000 characters!' }),
});

type AnswerFormValues = z.infer<typeof answerSchema>;

type Props = {
  questions: ProductQuestionRecord[];
  paginationMeta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  searchTerm?: string;
  status?: string;
  product?: string;
  sort?: string;
};

const statusOptions: Array<{
  label: string;
  value: ProductQuestionStatus | 'all';
}> = [
  { label: 'All statuses', value: 'all' },
  { label: 'Pending', value: 'pending' },
  { label: 'Answered', value: 'answered' },
  { label: 'Hidden', value: 'hidden' },
];

const sortOptions = [
  { label: 'Newest first', value: 'createdAt-desc' },
  { label: 'Oldest first', value: 'createdAt-asc' },
  { label: 'Answered newest', value: 'answeredAt-desc' },
  { label: 'Answered oldest', value: 'answeredAt-asc' },
  { label: 'Status A→Z', value: 'status-asc' },
  { label: 'Status Z→A', value: 'status-desc' },
] as const;

function resolveLabel(value: ProductQuestionRecord['user']) {
  if (!value || typeof value === 'string') return '-';
  return value.name?.trim() || value.email?.trim() || '-';
}

function resolveEmail(value: ProductQuestionRecord['user']) {
  if (!value || typeof value === 'string') return '-';
  return value.email?.trim() || '-';
}

function resolveProduct(question: ProductQuestionRecord) {
  const value = question.product;
  if (!value || typeof value === 'string') return null;
  return value;
}

function compactText(value?: string, maxLength = 90) {
  if (!value?.trim()) return '-';
  const normalized = value.replace(/\s+/g, ' ').trim();
  return normalized.length > maxLength
    ? `${normalized.slice(0, maxLength)}…`
    : normalized;
}

function DetailBlock({ label, value }: { label: string; value?: string }) {
  return (
    <div className="rounded-xl border bg-muted/20 p-3">
      <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </div>
      <div className="mt-2 whitespace-pre-wrap text-sm leading-6 text-foreground">
        {value?.trim() || '-'}
      </div>
    </div>
  );
}

export function DashboardProductQuestionsManager({
  questions,
  paginationMeta,
  searchTerm = '',
  status = '',
  product = '',
  sort = 'createdAt-desc',
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [questionRows, setQuestionRows] = useState(questions);
  const [search, setSearch] = useState(searchTerm);
  const [statusFilter, setStatusFilter] = useState(status);
  const [productFilter, setProductFilter] = useState(product);
  const [sortFilter, setSortFilter] = useState(sort);
  const [selectedQuestion, setSelectedQuestion] =
    useState<ProductQuestionRecord | null>(null);
  const [questionMode, setQuestionMode] = useState<'view' | 'answer'>('view');
  const [pendingDeleteQuestion, setPendingDeleteQuestion] =
    useState<ProductQuestionRecord | null>(null);

  const answerForm = useForm<AnswerFormValues>({
    resolver: makeZodResolver(answerSchema),
    defaultValues: { answer: '' },
    mode: 'onTouched',
  });

  useEffect(() => {
    if (selectedQuestion) {
      answerForm.reset({ answer: selectedQuestion.answer ?? '' });
    }
  }, [answerForm, selectedQuestion]);

  const updateQuery = useCallback(
    (updates: {
      page?: number;
      limit?: number;
      searchTerm?: string;
      status?: string;
      product?: string;
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

      const nextProduct = updates.product ?? productFilter;
      if (nextProduct.trim()) params.set('product', nextProduct.trim());
      else params.delete('product');

      const nextSort = updates.sort ?? sortFilter;
      if (nextSort.trim()) params.set('sort', nextSort.trim());
      else params.delete('sort');

      router.push(`${pathname}?${params.toString()}`);
    },
    [
      paginationMeta.limit,
      paginationMeta.page,
      pathname,
      productFilter,
      router,
      search,
      searchParams,
      sortFilter,
      statusFilter,
    ],
  );

  function refresh(message: string, type: 'success' | 'error') {
    if (type === 'success') toast.success(message);
    else toast.error(message);

    router.refresh();
  }

  function handleSearchChange(value: string) {
    setSearch(value);
    updateQuery({ page: 1, searchTerm: value });
  }

  function handleStatusChange(value: string) {
    setStatusFilter(value);
    updateQuery({ page: 1, status: value === 'all' ? '' : value });
  }

  function handleProductChange(value: string) {
    setProductFilter(value);
    updateQuery({ page: 1, product: value });
  }

  function handleSortChange(value: string) {
    setSortFilter(value);
    updateQuery({ page: 1, sort: value });
  }

  function openQuestion(
    question: ProductQuestionRecord,
    mode: 'view' | 'answer',
  ) {
    setSelectedQuestion(question);
    setQuestionMode(mode);
  }

  function closeQuestionDialog() {
    if (isPending) return;
    setSelectedQuestion(null);
  }

  function confirmAnswer(values: AnswerFormValues) {
    const questionId = selectedQuestion?._id;
    if (!questionId) return;

    startTransition(async () => {
      const result = await answerProductQuestion(questionId, {
        answer: values.answer,
      });

      if (!result?.success) {
        return refresh(
          result?.message ?? 'Failed to answer question.',
          'error',
        );
      }

      const answeredQuestion = result.data;
      if (answeredQuestion) {
        setQuestionRows((current) =>
          current.map((row) =>
            row._id === questionId ? answeredQuestion : row,
          ),
        );
      }

      setSelectedQuestion(null);
      refresh(result.message ?? 'Question answered successfully.', 'success');
    });
  }

  function confirmStatusChange(
    questionId: string,
    nextStatus: ProductQuestionStatus,
  ) {
    startTransition(async () => {
      const result = await updateProductQuestionStatus(questionId, {
        status: nextStatus,
      });

      if (!result?.success) {
        return refresh(
          result?.message ?? 'Failed to update question status.',
          'error',
        );
      }

      setQuestionRows((current) =>
        current.map((row) =>
          row._id === questionId ? { ...row, status: nextStatus } : row,
        ),
      );

      refresh(
        result.message ?? 'Question status updated successfully.',
        'success',
      );
    });
  }

  function confirmDeleteQuestion() {
    const questionId = pendingDeleteQuestion?._id;
    if (!questionId) return;

    startTransition(async () => {
      const result = await deleteProductQuestion(questionId);

      if (!result?.success) {
        return refresh(
          result?.message ?? 'Failed to delete question.',
          'error',
        );
      }

      setQuestionRows((current) =>
        current.filter((row) => row._id !== questionId),
      );
      setPendingDeleteQuestion(null);
      refresh(result.message ?? 'Question deleted successfully.', 'success');
    });
  }

  const visibleCount = questionRows.length;

  return (
    <Card className="shadow-sm">
      <CardHeader className="gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <CardTitle>Product Questions</CardTitle>
          <CardDescription>
            Showing {visibleCount} of {paginationMeta.total} questions.
          </CardDescription>
        </div>
        <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
          <TableFilter
            key={searchTerm}
            value={search}
            onChange={handleSearchChange}
            placeholder="Search questions..."
            className="w-full min-w-56"
          />
          <DashboardInput
            value={productFilter}
            onChange={(event) => handleProductChange(event.target.value)}
            placeholder="Filter by product slug or ID"
          />
          <Select
            value={statusFilter || 'all'}
            onValueChange={handleStatusChange}
          >
            <SelectTrigger className="h-11 w-full rounded-xl border-border/70 bg-background/90 px-4 text-sm shadow-sm">
              <SelectValue placeholder="Filter status" />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={sortFilter} onValueChange={handleSortChange}>
            <SelectTrigger className="h-11 w-full rounded-xl border-border/70 bg-background/90 px-4 text-sm shadow-sm">
              <SelectValue placeholder="Sort by" />
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
      </CardHeader>

      <CardContent className="space-y-4">
        <Table className="table-fixed">
          <TableHeader>
            <TableRow>
              <TableHead className="w-[22%]">Question</TableHead>
              <TableHead className="w-[16%]">Product</TableHead>
              <TableHead className="w-[16%]">User</TableHead>
              <TableHead className="w-[10%]">Status</TableHead>
              <TableHead className="w-[16%]">Answer preview</TableHead>
              <TableHead className="w-[10%]">Created At</TableHead>
              <TableHead className="w-[10%]">Answered At</TableHead>
              <TableHead className="w-[10%] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {questionRows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-28 text-center">
                  No product questions found.
                </TableCell>
              </TableRow>
            ) : null}

            {questionRows.map((question) => {
              const productRef = resolveProduct(question);
              const productSlug = productRef?.slug?.trim();

              return (
                <TableRow key={question._id ?? question.question}>
                  <TableCell className="align-top">
                    <div className="space-y-1">
                      <div className="line-clamp-3 font-medium">
                        {question.question}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {resolveLabel(question.user)}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="align-top">
                    <div className="space-y-1">
                      <div className="font-medium">
                        {productRef?.title?.trim() || '-'}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {productSlug || '-'}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="align-top">
                    <div className="space-y-1">
                      <div className="font-medium">
                        {resolveLabel(question.user)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {resolveEmail(question.user)}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="align-top">
                    <Select
                      value={question.status}
                      onValueChange={(value) =>
                        confirmStatusChange(
                          question._id ?? '',
                          value as ProductQuestionStatus,
                        )
                      }
                      disabled={!question._id || isPending}
                    >
                      <SelectTrigger className="h-9 w-full rounded-full border-border/70 bg-background/90 px-3 text-xs shadow-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="answered">Answered</SelectItem>
                        <SelectItem value="hidden">Hidden</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="align-top">
                    <div className="line-clamp-3 text-sm leading-6 text-muted-foreground">
                      {compactText(question.answer, 70)}
                    </div>
                  </TableCell>
                  <TableCell className="align-top whitespace-nowrap text-sm">
                    <span
                      className="cursor-help"
                      title={
                        question.createdAt
                          ? formatDashboardDate(question.createdAt, {
                              time: true,
                            })
                          : undefined
                      }
                    >
                      {formatDashboardDate(question.createdAt)}
                    </span>
                  </TableCell>
                  <TableCell className="align-top whitespace-nowrap text-sm">
                    <span
                      className="cursor-help"
                      title={
                        question.answeredAt
                          ? formatDashboardDate(question.answeredAt, {
                              time: true,
                            })
                          : undefined
                      }
                    >
                      {formatDashboardDate(question.answeredAt)}
                    </span>
                  </TableCell>
                  <TableCell className="align-top">
                    <div className="flex flex-wrap justify-end gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => openQuestion(question, 'view')}
                      >
                        <Eye className="size-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => openQuestion(question, 'answer')}
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
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        onClick={() => setPendingDeleteQuestion(question)}
                        disabled={!question._id}
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
          onPageChange={(page) => updateQuery({ page })}
          onLimitChange={(limit) => updateQuery({ page: 1, limit })}
        />
      </CardContent>

      <Dialog
        open={Boolean(selectedQuestion)}
        onOpenChange={(open) => (!open ? closeQuestionDialog() : undefined)}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle>
              {questionMode === 'answer'
                ? 'Answer question'
                : 'Question details'}
            </DialogTitle>
            <DialogDescription>
              View the question, related product, asker info, and current
              answer.
            </DialogDescription>
          </DialogHeader>

          {selectedQuestion ? (
            <div className="grid gap-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <DetailBlock
                  label="Question"
                  value={selectedQuestion.question}
                />
                <DetailBlock
                  label="Current answer"
                  value={selectedQuestion.answer}
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <DetailBlock
                  label="Asked by"
                  value={`${resolveLabel(selectedQuestion.user)} • ${resolveEmail(selectedQuestion.user)}`}
                />
                <DetailBlock
                  label="Product"
                  value={resolveProduct(selectedQuestion)?.title || '-'}
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <DetailBlock label="Status" value={selectedQuestion.status} />
                <DetailBlock
                  label="Created at"
                  value={formatDashboardDate(selectedQuestion.createdAt, {
                    time: true,
                  })}
                />
                <DetailBlock
                  label="Answered at"
                  value={formatDashboardDate(selectedQuestion.answeredAt, {
                    time: true,
                  })}
                />
              </div>

              <form
                className="space-y-3"
                onSubmit={answerForm.handleSubmit(confirmAnswer)}
              >
                <div className="space-y-1.5">
                  <Textarea
                    className="min-h-36 rounded-2xl"
                    placeholder="Write the answer here..."
                    {...answerForm.register('answer')}
                  />
                  {answerForm.formState.errors.answer?.message ? (
                    <p className="text-xs text-destructive">
                      {answerForm.formState.errors.answer.message}
                    </p>
                  ) : null}
                </div>

                <DialogFooter className="gap-2 sm:justify-between">
                  <div className="text-xs text-muted-foreground">
                    {questionMode === 'answer'
                      ? 'Submitting will mark the question as answered.'
                      : 'You can still edit and save the answer.'}
                  </div>
                  <Button type="submit" disabled={isPending}>
                    {isPending ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <CheckCircle2 className="size-4" />
                    )}
                    Save answer
                  </Button>
                </DialogFooter>
              </form>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      <DeleteConfirmationDialog
        open={Boolean(pendingDeleteQuestion)}
        onOpenChange={(open) =>
          !open && !isPending ? setPendingDeleteQuestion(null) : undefined
        }
        onConfirm={confirmDeleteQuestion}
        isPending={isPending}
        title="Delete product question"
        description={`Delete this question${pendingDeleteQuestion?.question ? `: ${compactText(pendingDeleteQuestion.question, 70)}` : ''}? This action cannot be undone.`}
        confirmLabel="Delete question"
      />
    </Card>
  );
}
