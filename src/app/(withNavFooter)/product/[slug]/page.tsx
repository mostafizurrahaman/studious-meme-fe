import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ProductCard } from '@/components/ProductCard';
import { ProductDetailClient } from '@/components/product/ProductDetailClient';
import { ProductReviewsSection } from '@/components/product/ProductReviewsSection';
import { ProductQuestionsSection } from '@/components/product/ProductQuestionsSection';
import { SeoScripts } from '@/components/SeoScripts';
import { buildProductMetadata, buildProductSchemas } from '@/lib/seo';
import {
  getActiveProductBySlug,
  getAllActiveProducts,
  mapBackendProductToStorefrontProduct,
} from '@/services/Product';
import { getAnsweredProductQuestionsByProduct } from '@/services/ProductQuestion';
import { getProductReviewsByProduct } from '@/services/ProductReview';

const STATIC_PRODUCT_FETCH_LIMIT = 10000;

type Props = {
  params: Promise<{ slug: string }>;
};

export const dynamicParams = true;

export async function generateStaticParams() {
  const productsResult = await getAllActiveProducts({
    fields: 'slug',
    limit: STATIC_PRODUCT_FETCH_LIMIT,
  }).catch(() => null);

  return Array.isArray(productsResult?.data)
    ? productsResult.data
        .map((product) => product.slug)
        .filter((slug): slug is string => Boolean(slug))
        .map((slug) => ({ slug }))
    : [];
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;

  const productResult = await getActiveProductBySlug(slug).catch(() => null);
  const backendProduct = productResult?.data;

  const product = backendProduct
    ? await mapBackendProductToStorefrontProduct(backendProduct)
    : null;

  if (!product) {
    return {
      title: 'Product not found',
      robots: { index: false, follow: false },
    };
  }

  return buildProductMetadata(product);
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;

  const productResult = await getActiveProductBySlug(slug).catch(() => null);
  const backendProduct = productResult?.data;

  const product = backendProduct
    ? await mapBackendProductToStorefrontProduct(backendProduct)
    : null;

  if (!backendProduct || !product) notFound();

  const productsResult = await getAllActiveProducts({
    limit: 5,
    category: product.category,
    excludeSlug: product.slug,
  }).catch(() => null);
  const related = productsResult?.data?.length
    ? await Promise.all(
        productsResult.data.map(mapBackendProductToStorefrontProduct),
      )
    : [];

  const productId = backendProduct._id ?? product.id;

  if (!productId) {
    notFound();
  }

  const reviewsResult = await getProductReviewsByProduct(productId, {
    page: 1,
    limit: 5,
  }).catch(() => null);
  const approvedReviews = reviewsResult?.data ?? [];
  const reviewPaginationMeta = {
    page: reviewsResult?.meta?.page ?? 1,
    limit: reviewsResult?.meta?.limit ?? 5,
    total: reviewsResult?.meta?.total ?? approvedReviews.length,
    totalPages:
      reviewsResult?.meta?.totalPages ??
      (Math.ceil(approvedReviews.length / 5) || 1),
  };
  const reviewSummary = {
    total: reviewsResult?.summary?.total ?? approvedReviews.length,
    averageRating: reviewsResult?.summary?.averageRating ?? 0,
    productRating:
      reviewsResult?.summary?.productRating ?? Number(product.rating),
  };

  const productQuestionsResult = productId
    ? await getAnsweredProductQuestionsByProduct(productId, {
        page: 1,
        limit: 5,
      }).catch(() => null)
    : null;
  const answeredQuestions = productQuestionsResult?.data ?? [];
  const answeredQuestionsMeta = {
    page: productQuestionsResult?.meta?.page ?? 1,
    limit: productQuestionsResult?.meta?.limit ?? 5,
    total: productQuestionsResult?.meta?.total ?? answeredQuestions.length,
    totalPages:
      productQuestionsResult?.meta?.totalPages ??
      (Math.ceil(answeredQuestions.length / 5) || 1),
  };
  const categoryHref = product.categorySlug?.trim()
    ? `/category/${product.categorySlug.trim()}`
    : `/shop?c=${encodeURIComponent(product.category)}`;

  return (
    <>
      <SeoScripts data={buildProductSchemas(product)} />
      <main className="flex-1 bg-muted/40 pb-16">
        <div className="mx-auto w-full max-w-310 px-3 py-3 sm:px-4 sm:py-5 lg:px-0">
          <nav className="overflow-hidden text-ellipsis whitespace-nowrap text-xs font-medium text-foreground/55">
            <Link href="/" className="hover:text-primary">
              Home
            </Link>{' '}
            /{' '}
            <Link href={categoryHref} className="hover:text-primary">
              {product.category}
            </Link>{' '}
            / {product.title}
          </nav>

          <div className="mt-3 rounded-md bg-background p-3 shadow-sm sm:p-4">
            <ProductDetailClient product={product} reviewSummary={reviewSummary} />
          </div>

          <div className="mt-8">
            <ProductReviewsSection
              productId={productId}
              initialReviews={approvedReviews}
              paginationMeta={reviewPaginationMeta}
              summary={reviewSummary}
            />
          </div>

          <div className="mt-8">
            <ProductQuestionsSection
              productId={productId}
              initialQuestions={answeredQuestions}
              paginationMeta={answeredQuestionsMeta}
            />
          </div>

          <section className="mt-8">
            <h2 className="text-2xl font-bold text-secondary">
              Related Products
            </h2>
            <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5 xl:gap-4">
              {related.map((item) => (
                <ProductCard key={item.sku} product={item} />
              ))}
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
