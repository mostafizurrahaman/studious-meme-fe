'use client';

import { type Route } from 'next';
import { SlidersHorizontal } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { ProductCard } from '@/components/ProductCard';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  getCategoryAccentClassName,
  getCategoryAccentClassNameForDesktop,
  getCategoryAccentStyle,
} from '@/lib/category-accent';
import type { CategoryPageEntry, Product } from '@/lib/storefront-types';
import { cn } from '@/lib/utils';

type Props = {
  category: CategoryPageEntry;
  products: Product[];
  selectedSubCategory?: {
    name: string;
    slug: string;
    description?: string;
  } | null;
  meta: {
    total: number;
    limit: number;
    page: number;
    totalPages: number;
  };
};

export function CategoryPageClient({
  category,
  products,
  meta,
  selectedSubCategory,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const title = 'name' in category ? category.name : category.title;
  const subCategories =
    'subCategories' in category ? (category.subCategories ?? []) : [];
  const activeStock = searchParams.get('s') ?? '';
  const activePrice = searchParams.get('p') ?? '';
  const activeSubCategory = searchParams.get('subCategorySlug') ?? '';
  const totalPages = Math.max(meta.totalPages, 1);
  const page = Math.min(meta.page, totalPages);
  const activeCount = [activeStock, activePrice, activeSubCategory].filter(
    Boolean,
  ).length;

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());

    if (value) params.set(key, value);
    else params.delete(key);

    params.delete('page');
    router.replace(
      (params.toString()
        ? `${pathname}?${params.toString()}`
        : pathname) as Route,
      {
        scroll: false,
      },
    );
  }

  function updatePage(nextPage: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', String(nextPage));
    router.replace(`${pathname}?${params.toString()}` as Route, {
      scroll: false,
    });
  }

  return (
    <>
      <section
        className={cn(
          'rounded-2xl p-3 shadow-sm',
          // Mobile styles
          'border border-border bg-background text-foreground',
          // Desktop styles
          'sm:rounded-3xl sm:border-0 sm:p-6 sm:text-white',
          getCategoryAccentClassNameForDesktop(category.accent),
        )}
        style={getCategoryAccentStyle(category.accent)}
      >
        <h1 className="text-2xl font-black tracking-tight sm:text-4xl">
          {title}
        </h1>
      </section>

      {/* <section className="rounded-2xl border border-border bg-background p-3 text-foreground shadow-sm sm:hidden">
        <h1 className="text-2xl font-black tracking-tight text-foreground">
          {title}
        </h1>
      </section>

      <section
        className={`hidden rounded-3xl p-6 text-white shadow-sm sm:block ${getCategoryAccentClassName(category.accent)}`}
        style={getCategoryAccentStyle(category.accent)}
      >
        <h1 className="text-4xl font-black">{title}</h1>
      </section> */}

      <Card className="mt-6 p-4 shadow-sm">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-foreground/60">
            {selectedSubCategory
              ? selectedSubCategory.name
              : 'Browse available items'}
          </p>
          <div className="flex items-center gap-2">
            {activeCount > 0 ? (
              <Button
                type="button"
                onClick={() =>
                  router.replace(pathname as Route, { scroll: false })
                }
                className="h-auto cursor-pointer rounded-full bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground transition hover:bg-primary/90"
              >
                Clear all
              </Button>
            ) : null}
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  className="h-auto rounded-full border-border px-3 py-2 text-xs font-semibold"
                >
                  <SlidersHorizontal className="size-4" />
                  Filter
                  {activeCount > 0 ? ` (${activeCount})` : ''}
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[88vw] max-w-sm">
                <SheetHeader className="border-b border-border px-5 py-4">
                  <SheetTitle>Filters</SheetTitle>
                  <SheetDescription>
                    Narrow down products by sub category, stock and price.
                  </SheetDescription>
                </SheetHeader>
                <div className="flex-1 space-y-6 overflow-y-auto px-5 py-5">
                  {subCategories.length > 0 ? (
                    <section>
                      <div className="mb-3 flex items-center justify-between gap-3 whitespace-nowrap">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-foreground/45">
                          Sub categories
                        </p>
                        <span className="shrink-0 text-xs font-semibold text-primary">
                          {subCategories.length} items
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          type="button"
                          onClick={() => updateParam('subCategorySlug', '')}
                          className={`h-auto rounded-full px-3 py-2 text-xs font-semibold transition ${
                            activeSubCategory
                              ? 'bg-muted text-foreground/75 hover:bg-muted/70'
                              : 'bg-secondary text-secondary-foreground hover:bg-secondary/90'
                          }`}
                        >
                          All sub categories
                        </Button>
                        {subCategories.map(subCategory => {
                          const selected =
                            activeSubCategory === subCategory.slug;

                          return (
                            <Button
                              key={subCategory.slug}
                              type="button"
                              onClick={() =>
                                updateParam('subCategorySlug', subCategory.slug)
                              }
                              className={`h-auto rounded-full px-3 py-2 text-xs font-semibold transition ${
                                selected
                                  ? 'bg-secondary text-secondary-foreground hover:bg-secondary/90'
                                  : 'bg-muted text-foreground/75 hover:bg-muted/70'
                              }`}
                            >
                              {subCategory.name}
                            </Button>
                          );
                        })}
                      </div>
                    </section>
                  ) : null}
                  <section>
                    <p className="mb-3 text-xs font-semibold uppercase tracking-[0.24em] text-foreground/45">
                      Availability
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {[
                        ['s', 'in-stock', 'In stock', activeStock],
                        ['p', 'under-10000', 'Under ৳ 10k', activePrice],
                        ['p', '10000-50000', '৳ 10k-50k', activePrice],
                        ['p', '50000-plus', '৳ 50k+', activePrice],
                      ].map(([key, value, label, active]) => (
                        <Button
                          key={`${key}-${value}`}
                          type="button"
                          onClick={() =>
                            updateParam(key, active === value ? '' : value)
                          }
                          className={`h-auto rounded-full px-3 py-2 text-xs font-semibold transition ${
                            active === value
                              ? 'bg-secondary text-secondary-foreground hover:bg-secondary/90'
                              : 'bg-muted text-foreground/75 hover:bg-muted/70'
                          }`}
                        >
                          {label}
                        </Button>
                      ))}
                    </div>
                  </section>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 text-xs font-semibold">
          {selectedSubCategory ? (
            <span className="rounded-full bg-secondary px-3 py-2 text-xs font-semibold text-secondary-foreground">
              {selectedSubCategory.name}
            </span>
          ) : null}
          {activeStock ? (
            <span className="rounded-full bg-muted px-3 py-2 text-xs font-semibold text-foreground/75">
              In stock
            </span>
          ) : null}
          {activePrice ? (
            <span className="rounded-full bg-muted px-3 py-2 text-xs font-semibold text-foreground/75">
              {activePrice === 'under-10000'
                ? 'Under ৳ 10k'
                : activePrice === '10000-50000'
                  ? '৳ 10k-50k'
                  : '৳ 50k+'}
            </span>
          ) : null}
        </div>
      </Card>

      {/* <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {products.map((product, index) => (
          <ProductCard
            key={product.sku}
            product={product}
            priority={index < 4}
          />
        ))}
      </section> */}
      <section className="mt-6 grid gap-4 xs:grid sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-4">
        {products.map((product, index) => (
          <ProductCard
            key={product.sku}
            product={product}
            priority={index < 4}
          />
        ))}
      </section>

      {products.length === 0 ? (
        <Card className="mt-6 p-6 text-sm text-foreground/65 shadow-sm">
          No products match the current filter.
        </Card>
      ) : null}

      <Card className="mt-6 flex flex-wrap items-center justify-between gap-3 p-4 text-sm shadow-sm">
        <div className="space-y-1">
          <p className="text-foreground/60">
            Showing {products.length} of {meta.total} products
          </p>
          <p className="text-xs text-foreground/45">
            Page {page} of {totalPages}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            disabled={page <= 1}
            onClick={() => updatePage(page - 1)}
            className="h-9 rounded-full border-border px-4 text-xs font-semibold"
          >
            Prev
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={page >= totalPages}
            onClick={() => updatePage(page + 1)}
            className="h-9 rounded-full border-border px-4 text-xs font-semibold"
          >
            Next
          </Button>
        </div>
      </Card>

      <div className="mt-5">
        <h2 className="font-semibold text-lg">Description </h2>
        <h2 className="text-base my-2">{category.description}</h2>
      </div>
    </>
  );
}
