import type { Metadata } from 'next';
import { DashboardProductQuestionsManager } from '@/components/dashboard/DashboardProductQuestionsManager';
import { requireDashboardRoles } from '@/lib/dashboard-auth';
import { buildMetadata } from '@/lib/seo';
import {
  getAllProductQuestions,
  type ProductQuestionListSort,
} from '@/services/ProductQuestion';

type Props = {
  searchParams: Promise<{
    page?: string;
    limit?: string;
    searchTerm?: string;
    status?: string;
    product?: string;
    sort?: string;
  }>;
};

export const metadata: Metadata = buildMetadata({
  title: 'Product Questions',
  description: 'Manage product questions, answers, and moderation status.',
  path: '/dashboard/admin/product-questions',
  noindex: true,
});

export const dynamic = 'force-dynamic';

const parsePositiveInteger = (value: string | undefined, fallback: number) => {
  const parsed = Number(value);

  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
};

export default async function AdminProductQuestionsPage({
  searchParams,
}: Props) {
  await requireDashboardRoles(['ADMIN', 'SUPER_ADMIN']);
  const query = await searchParams;
  const page = parsePositiveInteger(query.page, 1);
  const limit = parsePositiveInteger(query.limit, 20);
  const searchTerm = query.searchTerm?.trim() ?? '';
  const status = query.status?.trim() ?? '';
  const product = query.product?.trim() ?? '';
  const sort = query.sort?.trim() ?? 'createdAt-desc';

  const questionsResult = await getAllProductQuestions({
    page,
    limit,
    searchTerm,
    status: status ? (status as 'pending' | 'answered' | 'hidden') : undefined,
    product,
    sort: sort as ProductQuestionListSort,
  }).catch(() => null);

  const questions = questionsResult?.data ?? [];
  const paginationMeta = {
    page: questionsResult?.meta?.page ?? page,
    limit: questionsResult?.meta?.limit ?? limit,
    total: questionsResult?.meta?.total ?? questions.length,
    totalPages:
      questionsResult?.meta?.totalPages ??
      (Math.ceil(questions.length / limit) || 1),
  };

  return (
    <DashboardProductQuestionsManager
      key={`${searchTerm}-${status}-${product}-${sort}`}
      questions={questions}
      paginationMeta={paginationMeta}
      searchTerm={searchTerm}
      status={status}
      product={product}
      sort={sort}
    />
  );
}
