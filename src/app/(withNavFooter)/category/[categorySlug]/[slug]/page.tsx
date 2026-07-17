import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { CategoryPageClient } from '@/components/CategoryPageClient';
import { SeoScripts } from '@/components/SeoScripts';
import { Card } from '@/components/ui/card';
import { buildCategoryMetadata, buildCategorySchemas } from '@/lib/seo';
import { getActiveCategoryBySlug } from '@/services/Category';
import { mapBackendCategoryToCategoryPageEntry } from '@/services/Category/mappers';
import {
  getProductsByCategorySlug,
  getProductsBySubCategorySlug,
  mapBackendProductToStorefrontProduct,
} from '@/services/Product';

type Props = {
  params: Promise<{ categorySlug: string; slug: string }>;
  searchParams: Promise<{
    b?: string;
    s?: string;
    p?: string;
    subCategorySlug?: string;
    page?: string;
    limit?: string;
  }>;
};

// Force dynamic rendering to support searchParams, pagination, and sorting dynamically
export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: Props) {
  const { categorySlug, slug: subCategorySlug } = await params;

  // Correctly fetch the main category using categorySlug, not subCategorySlug
  const backendCategory = await getActiveCategoryBySlug(categorySlug).catch(
    () => null,
  );
  const category = backendCategory?.data
    ? mapBackendCategoryToCategoryPageEntry(backendCategory.data)
    : null;

  if (!category) {
    return {
      title: 'Category not found',
      robots: { index: false, follow: false },
    };
  }

  // // Find the selected subcategory to build accurate subcategory metadata
  // const selectedSubCategory =
  //   category.subCategories?.find(item => item.slug === subCategorySlug) ?? null;

  // if (selectedSubCategory) {
  //   const subCategoryEntry = {
  //     name: selectedSubCategory.name,
  //     slug: selectedSubCategory.slug,
  //     href: `/category/${categorySlug}/${selectedSubCategory.slug}`,
  //     image: selectedSubCategory.image,
  //     description:
  //       selectedSubCategory.description ??
  //       `${selectedSubCategory.name} products.`,
  //     accent: selectedSubCategory.accent ?? category.accent,
  //   };
  //   return buildCategoryMetadata(subCategoryEntry);
  // }

  return buildCategoryMetadata(category);
}

const DEFAULT_CATEGORY_LIMIT = 24;

export default async function CategoryPage({ params, searchParams }: Props) {
  const { categorySlug, slug: subCategorySlug } = await params;
  const query = await searchParams;
  const page = Math.max(Number(query.page ?? '1') || 1, 1);
  const limit = Math.max(
    Number(query.limit ?? String(DEFAULT_CATEGORY_LIMIT)) ||
      DEFAULT_CATEGORY_LIMIT,
    1,
  );
  const backendCategory = await getActiveCategoryBySlug(categorySlug).catch(
    () => null,
  );

  const category = backendCategory?.data
    ? mapBackendCategoryToCategoryPageEntry(backendCategory.data)
    : null;

  if (!category) {
    notFound();
  }

  const title = 'name' in category ? category.name : category.title;

  const selectedSubCategory =
    'subCategories' in category
      ? (category.subCategories?.find(item => item.slug === subCategorySlug) ??
        null)
      : null;
  const productsResult = await (
    subCategorySlug
      ? getProductsBySubCategorySlug(subCategorySlug, {
          page,
          limit,
          b: query.b,
          s: query.s,
          p: query.p,
        })
      : getProductsByCategorySlug(categorySlug, {
          page,
          limit,
          b: query.b,
          s: query.s,
          p: query.p,
        })
  ).catch(() => null);

  const products = productsResult?.data?.length
    ? await Promise.all(
        productsResult.data.map(mapBackendProductToStorefrontProduct),
      )
    : [];
  const meta = {
    total: productsResult?.meta?.total ?? products.length,
    limit: productsResult?.meta?.limit ?? limit,
    page: productsResult?.meta?.page ?? page,
    totalPages: productsResult?.meta?.totalPages ?? 1,
  };

  return (
    <>
      <SeoScripts data={buildCategorySchemas(category, products)} />
      <main className="flex-1 bg-background pb-16">
        <div className="px-4 py-6 lg:px-6">
          <nav
            aria-label="Breadcrumb"
            className="mb-4 overflow-hidden text-sm text-foreground/55"
          >
            <ol className="flex items-center gap-2 overflow-hidden whitespace-nowrap">
              <li className="shrink-0">
                <Link href="/" className="cursor-pointer hover:text-primary">
                  Home
                </Link>
              </li>
              <li className="shrink-0">/</li>
              <li className="shrink-0">
                <Link
                  href="/main-categories"
                  className="cursor-pointer hover:text-primary"
                >
                  Main Categories
                </Link>
              </li>
              <li className="shrink-0">/</li>
              <li className="min-w-0 truncate font-semibold text-foreground/75">
                {title}
              </li>
            </ol>
          </nav>
          <Suspense
            fallback={
              <Card className="p-6 shadow-sm">Loading category...</Card>
            }
          >
            <CategoryPageClient
              category={category}
              products={products}
              meta={meta}
              selectedSubCategory={selectedSubCategory}
            />
          </Suspense>
          <Card className="mt-6 flex items-center justify-between p-4 text-sm shadow-sm">
            <span className="text-foreground/60">Need a broader view?</span>
            <Link
              href="/main-categories"
              className="cursor-pointer font-semibold text-primary"
            >
              Back to categories
            </Link>
          </Card>
        </div>
      </main>
    </>
  );
}
