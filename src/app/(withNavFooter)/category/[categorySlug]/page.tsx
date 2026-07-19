import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowUpRight, ArrowLeft } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { SeoScripts } from '@/components/SeoScripts';
import { SubCategorySearch } from '@/components/SubCategorySearch';
import { buildCategoryMetadata, buildCategorySchemas } from '@/lib/seo';
import {
  getCategoryAccentClassName,
  getCategoryAccentStyle,
} from '@/lib/category-accent';
import {
  getActiveCategoryBySlug,
  getSubCategoriesByCategoryId,
} from '@/services/Category';
import { mapBackendCategoryToCategoryPageEntry } from '@/services/Category/mappers';

type Props = {
  params: Promise<{ categorySlug: string }>;
  searchParams: Promise<{ searchTerm?: string; page?: string; limit?: string }>;
};

// Force dynamic rendering to support dynamic search terms, limits, and pages
export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { categorySlug } = await params;
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

  

  return buildCategoryMetadata(category);
}

export default async function MainCategoryPage({
  params,
  searchParams,
}: Props) {
  const { categorySlug } = await params;
  const query = await searchParams;

  const searchTerm = query.searchTerm?.trim() ?? '';
  const page = Math.max(Number(query.page ?? '1') || 1, 1);
  const limit = Math.max(Number(query.limit ?? 12) || 12, 1);

  // 1. Fetch main category details for the header, SEO and brand styling
  const backendCategory = await getActiveCategoryBySlug(categorySlug).catch(
    () => null,
  );
  const category = backendCategory?.data
    ? mapBackendCategoryToCategoryPageEntry(backendCategory.data)
    : null;

  if (!category) {
    notFound();
  }

  // 2. Fetch the corresponding subcategories using the specialized paginated API
  const subCategoriesResult = await getSubCategoriesByCategoryId({
    categorySlug,
    searchTerm,
    page,
    limit,
    includeInActive: false,
  }).catch(() => null);

  const subCategories = subCategoriesResult?.data ?? [];
  const title = 'name' in category ? category.name : category.title;
  const totalPages = subCategoriesResult?.meta?.totalPages ?? 1;

  const stats = [
    {
      label: 'Sub categories',
      value: subCategoriesResult?.meta?.total ?? subCategories.length,
    },
    { label: 'Fulfillment', value: 'Warehouse & Courier' },
    { label: 'Warranty', value: 'Official support' },
  ];

  return (
    <>
      <SeoScripts data={buildCategorySchemas(category, [])} />
      <main className="flex-1 bg-background pb-16">
        <div className="px-4 py-6 lg:px-6">
          {/* Breadcrumbs */}
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

          {/* Hero Banner */}
          <Card className="relative overflow-hidden border-border/60 p-6 shadow-sm sm:p-8">
            {/* Accent top-bar using the category color */}
            <span
              className="pointer-events-none absolute inset-x-0 top-0 h-1"
              style={getCategoryAccentStyle(category.accent)}
            />
            <span className="pointer-events-none absolute -right-20 -top-24 size-56 rounded-full bg-primary/10 blur-3xl" />
            <span className="pointer-events-none absolute -bottom-24 left-1/3 size-56 rounded-full bg-secondary/10 blur-3xl" />
            <div className="relative">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">
                Main category
              </p>
              <h1 className="mt-4 text-3xl font-black text-secondary sm:text-4xl">
                {title}
              </h1>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                {stats.map(stat => (
                  <div
                    key={stat.label}
                    className="rounded-2xl border border-border/70 bg-background/85 px-4 py-4 shadow-sm backdrop-blur-sm"
                  >
                    <div className="text-xs font-semibold uppercase tracking-[0.24em] text-foreground/45">
                      {stat.label}
                    </div>
                    <div className="mt-2 text-xl font-black text-secondary">
                      {stat.value}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Search and Header Section */}
          <section className="mt-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-secondary">
                  Select a Subcategory
                </h2>
                <p className="text-xs text-muted-foreground mt-1">
                  Click on any subcategory below to explore products.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <SubCategorySearch
                  initialSearchTerm={searchTerm}
                  placeholder="Search subcategories..."
                  className="w-full sm:w-64"
                />
                <Link
                  href="/main-categories"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline shrink-0"
                >
                  <ArrowLeft className="size-3.5" /> All Main Categories
                </Link>
              </div>
            </div>

            {subCategories.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {subCategories.map(sub => (
                  <Link
                    key={sub.subCategorySlug}
                    href={`/category/${categorySlug}/${sub.subCategorySlug}`}
                    className="group block rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  >
                    <Card className="relative h-full overflow-hidden rounded-2xl border border-border/70 bg-card/95 p-5 shadow-sm transition-all duration-300 ease-out motion-safe:hover:-translate-y-1 motion-safe:hover:border-primary/35 motion-safe:hover:shadow-[0_18px_40px_rgba(15,23,42,0.12)] active:translate-y-0 active:scale-[0.99] flex flex-col justify-between">
                      <span className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.96),transparent_58%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                      <span
                        className="pointer-events-none absolute inset-x-0 top-0 h-1 opacity-80 transition-opacity duration-300 group-hover:opacity-100"
                        style={getCategoryAccentStyle(category.accent)}
                      />
                      <span
                        className={`pointer-events-none absolute -right-10 -top-10 size-28 rounded-full opacity-15 blur-2xl transition-opacity duration-300 group-hover:opacity-25 ${getCategoryAccentClassName(
                          category.accent,
                        )}`}
                        style={getCategoryAccentStyle(category.accent)}
                      />

                      <div className="relative flex flex-col flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="inline-flex rounded-full border border-border/70 bg-background/90 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.28em] text-foreground/55 transition-colors duration-300 group-hover:text-primary">
                              {sub.totalProducts} Products
                            </div>
                            <div className="mt-4 text-base font-extrabold leading-tight text-secondary transition-colors duration-300 group-hover:text-primary">
                              {sub.subCategoryName}
                            </div>
                          </div>
                          <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-full border border-border/70 bg-background/90 text-foreground/50 transition-all duration-300 group-hover:border-primary/25 group-hover:bg-primary group-hover:text-white group-hover:shadow-sm">
                            <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                          </span>
                        </div>

                        {sub.subCategoryDescription && (
                          <p className="relative mt-3 text-sm leading-6 text-foreground/65 line-clamp-2">
                            {sub.subCategoryDescription}
                          </p>
                        )}
                      </div>

                      <div className="relative mt-5 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2 text-xs font-semibold text-foreground/55 transition-colors duration-300 group-hover:text-primary">
                          <span className="h-1.5 w-1.5 rounded-full bg-primary/60 transition-transform duration-300 group-hover:scale-125" />
                          <span>Explore products</span>
                        </div>

                        {sub.subCategoryImage ? (
                          <div className="relative flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border/70 bg-background/95 transition-all duration-300 group-hover:scale-105 group-hover:border-primary/30">
                            <Image
                              src={sub.subCategoryImage}
                              alt={sub.subCategoryName}
                              width={36}
                              height={36}
                              className="h-6 w-6 object-contain p-0.5"
                            />
                          </div>
                        ) : (
                          <span className="rounded-full border border-border/70 bg-background/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.24em] text-foreground/45 transition-colors duration-300 group-hover:text-primary">
                            Sub Category
                          </span>
                        )}
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            ) : (
              <Card className="p-6 text-center text-sm text-foreground/65 shadow-sm border-dashed">
                No active subcategories found matching your criteria.
              </Card>
            )}

            {/* Pagination Controls */}
            {totalPages > 0 && (
              <Card className="mt-6 flex flex-wrap items-center justify-between gap-3 p-4 text-sm shadow-sm">
                <div className="space-y-1">
                  <p className="text-foreground/60">
                    Showing {subCategories.length} of{' '}
                    {subCategoriesResult?.meta?.total ?? subCategories.length}{' '}
                    subcategories
                  </p>
                  <p className="text-xs text-foreground/45">
                    Page {page} of {totalPages}
                  </p>
                </div>
                <div className="flex gap-2">
                  {page > 1 ? (
                    <Link
                      href={`/category/${categorySlug}?page=${page - 1}${searchTerm ? `&searchTerm=${encodeURIComponent(searchTerm)}` : ''}`}
                      className="inline-flex h-9 items-center justify-center rounded-full border border-border px-4 py-2 text-xs font-semibold text-foreground/70 hover:bg-muted transition"
                    >
                      Prev
                    </Link>
                  ) : (
                    <span className="inline-flex h-9 items-center justify-center rounded-full border border-border/40 px-4 py-2 text-xs font-semibold text-foreground/35 cursor-not-allowed">
                      Prev
                    </span>
                  )}
                  {page < totalPages ? (
                    <Link
                      href={`/category/${categorySlug}?page=${page + 1}${searchTerm ? `&searchTerm=${encodeURIComponent(searchTerm)}` : ''}`}
                      className="inline-flex h-9 items-center justify-center rounded-full border border-border px-4 py-2 text-xs font-semibold text-foreground/70 hover:bg-muted transition"
                    >
                      Next
                    </Link>
                  ) : (
                    <span className="inline-flex h-9 items-center justify-center rounded-full border border-border/40 px-4 py-2 text-xs font-semibold text-foreground/35 cursor-not-allowed">
                      Next
                    </span>
                  )}
                </div>
              </Card>
            )}
            <div className="mt-5">
              <span className="font-semibold text-lg">Description </span>
              <h2
                className="text-base my-2"
                dangerouslySetInnerHTML={{
                  __html: category.description ?? 'N/A',
                }}
              ></h2>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
