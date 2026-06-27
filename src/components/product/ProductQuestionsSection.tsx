'use client';

import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Loader2, MessageSquarePlus } from 'lucide-react';
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
import { Textarea } from '@/components/ui/textarea';
import { formatDashboardDate } from '@/lib/formatDate';
import { makeZodResolver } from '@/lib/form-validation';
import {
  createProductQuestion,
  getAnsweredProductQuestionsByProduct,
  type ProductQuestionRecord,
} from '@/services/ProductQuestion';

const questionSchema = z.object({
  question: z
    .string({ error: 'Question is required!' })
    .trim()
    .min(1, { message: 'Question is required!' })
    .max(1000, { message: 'Question cannot exceed 1000 characters!' }),
});

type QuestionFormValues = z.infer<typeof questionSchema>;

type Props = {
  productId: string;
  initialQuestions: ProductQuestionRecord[];
  paginationMeta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

const PAGE_SIZE = 5;

function resolveName(value: ProductQuestionRecord['user']) {
  if (!value || typeof value === 'string') return 'Anonymous';
  return value.name?.trim() || 'Anonymous';
}

function resolveDate(question: ProductQuestionRecord) {
  return question.answeredAt ?? question.createdAt ?? null;
}

function QuestionCard({ question }: { question: ProductQuestionRecord }) {
  return (
    <article className="rounded-2xl border bg-background/90 p-4 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="text-sm font-semibold text-secondary">
            {question.question}
          </div>
          <div className="text-xs text-muted-foreground">
            Asked by {resolveName(question.user)}
          </div>
        </div>
        <Badge variant="secondary">Answered</Badge>
      </div>

      <div className="mt-4 rounded-xl bg-muted/30 p-4 text-sm leading-7 text-foreground/80">
        {question.answer?.trim() || 'Answer pending.'}
      </div>

      <div className="mt-3 text-xs text-muted-foreground">
        Answered {formatDashboardDate(resolveDate(question))}
      </div>
    </article>
  );
}

export function ProductQuestionsSection({
  productId,
  initialQuestions,
  paginationMeta,
}: Props) {
  const [questions, setQuestions] = useState(initialQuestions);
  const [meta, setMeta] = useState(paginationMeta);
  const [isLoadingMore, startLoadingMore] = useTransition();
  const [isSubmitting, startSubmitting] = useTransition();

  const questionForm = useForm<QuestionFormValues>({
    resolver: makeZodResolver(questionSchema),
    defaultValues: { question: '' },
    mode: 'onTouched',
  });

  const hasMore = meta.page < meta.totalPages;

  function handleSubmit(values: QuestionFormValues) {
    startSubmitting(async () => {
      const result = await createProductQuestion({
        product: productId,
        question: values.question,
      });

      if (!result.success) {
        toast.error(result.message ?? 'Unable to submit question.');
        return;
      }

      toast.success(
        'Your question has been submitted and is waiting for an answer.',
      );
      questionForm.reset({ question: '' });
    });
  }

  function loadMoreQuestions() {
    if (!hasMore || isLoadingMore) return;

    startLoadingMore(async () => {
      const nextPage = meta.page + 1;
      const result = await getAnsweredProductQuestionsByProduct(productId, {
        page: nextPage,
        limit: meta.limit || PAGE_SIZE,
      });

      if (!result.success) {
        toast.error(result.message ?? 'Unable to load more questions.');
        return;
      }

      setQuestions((current) => [...current, ...(result.data ?? [])]);
      if (result.meta) {
        setMeta({
          page: result.meta.page ?? nextPage,
          limit: result.meta.limit ?? meta.limit,
          total: result.meta.total ?? meta.total,
          totalPages: result.meta.totalPages ?? meta.totalPages,
        });
      }
    });
  }

  return (
    <section className="rounded-2xl bg-card p-4 shadow-sm sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-medium text-secondary">
            Questions & Answers
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Browse answered questions or ask something before ordering.
          </p>
        </div>
        <Badge variant="outline" className="rounded-full px-3 py-1">
          {meta.total} answered
        </Badge>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <div className="space-y-4">
          {questions.length === 0 ? (
            <div className="rounded-2xl border border-dashed bg-muted/20 p-6 text-sm text-muted-foreground">
              No answered questions yet.
            </div>
          ) : (
            questions.map((question) => (
              <QuestionCard
                key={question._id ?? question.question}
                question={question}
              />
            ))
          )}

          {hasMore ? (
            <div className="flex justify-center pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={loadMoreQuestions}
                disabled={isLoadingMore}
              >
                {isLoadingMore ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : null}
                Load more questions
              </Button>
            </div>
          ) : null}
        </div>

        <Card className="h-fit shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <MessageSquarePlus className="size-5 text-primary" />
              Ask a question
            </CardTitle>
            <CardDescription>
              Logged-in users can submit a question for the product team.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              className="space-y-3"
              onSubmit={questionForm.handleSubmit(handleSubmit)}
            >
              <div className="space-y-1.5">
                <Textarea
                  placeholder="Type your question here..."
                  className="min-h-32 rounded-2xl"
                  {...questionForm.register('question')}
                />
                {questionForm.formState.errors.question?.message ? (
                  <p className="text-xs text-destructive">
                    {questionForm.formState.errors.question.message}
                  </p>
                ) : null}
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : null}
                Submit question
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
