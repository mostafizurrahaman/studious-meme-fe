'use client';

import { type Route } from 'next';
import Link from 'next/link';
import { SlidersHorizontal } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
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
import type { Category, Product } from '@/lib/storefront-types';

type Props = {
  products: Product[];
  categories: Category[];
  meta: {
    total: number;
    limit: number;
    page: number;
    totalPages: number;
  };
};

function getActiveFilters(searchParams: URLSearchParams) {
  return {
    category: searchParams.get('c') ?? '',
    stock: searchParams.get('stock') ?? '',
    tag: searchParams.get('tag') ?? 'all',
    price: searchParams.get('price') ?? '',
    page: Math.max(Number(searchParams.get('page') ?? '1') || 1, 1),
  };
}

function parsePriceRange(value: string) {
  const match = value.match(/^(\d*)-(\d*)$/);
  if (!match) {
    return { min: '', max: '' };
  }

  return {
    min: match[1] ?? '',
    max: match[2] ?? '',
  };
}

function formatPrice(value: number) {
  return `৳ ${value.toLocaleString('en-BD')}`;
}

function roundRangeCeiling(value: number) {
  if (value <= 10000) return 10000;
  if (value <= 50000) return 50000;
  if (value <= 100000) return 100000;

  return Math.ceil(value / 50000) * 50000;
}

function PriceRangeSlider({
  initialValue,
  maxValue,
  onApply,
  onReset,
}: {
  initialValue: string;
  maxValue: number;
  onApply: (value: string) => void;
  onReset: () => void;
}) {
  const parsed = parsePriceRange(initialValue);
  const initialMin = Math.max(0, Number(parsed.min || '0') || 0);
  const initialMax = Math.min(
    maxValue,
    Number(parsed.max || String(maxValue)) || maxValue,
  );
  const [minPrice, setMinPrice] = useState(Math.min(initialMin, initialMax));
  const [maxPrice, setMaxPrice] = useState(Math.max(initialMin, initialMax));
  const range = Math.max(maxValue, 1);
  const minPercent = (minPrice / range) * 100;
  const maxPercent = (maxPrice / range) * 100;

  function commit(nextMin: number, nextMax: number) {
    if (nextMin <= 0 && nextMax >= maxValue) {
      onReset();
      return;
    }

    onApply(`${nextMin}-${nextMax}`);
  }

  return (
    <div className="mt-3 space-y-3">
      <div className="flex items-center justify-between gap-3 rounded-2xl bg-muted/60 px-3 py-2 text-xs font-semibold text-foreground/75">
        <span>{formatPrice(minPrice)}</span>
        <span>{formatPrice(maxPrice)}</span>
      </div>

      <div className="relative h-10">
        <div className="absolute top-1/2 left-0 h-2 w-full -translate-y-1/2 rounded-full bg-muted" />
        <div
          className="absolute top-1/2 h-2 -translate-y-1/2 rounded-full bg-primary"
          style={{
            left: `${minPercent}%`,
            width: `${Math.max(maxPercent - minPercent, 0)}%`,
          }}
        />
        <input
          type="range"
          min={0}
          max={maxValue}
          step={500}
          value={minPrice}
          onChange={(event) => {
            const nextMin = Math.min(Number(event.target.value), maxPrice);
            setMinPrice(nextMin);
          }}
          onMouseUp={() => commit(minPrice, maxPrice)}
          onTouchEnd={() => commit(minPrice, maxPrice)}
          className="pointer-events-none absolute inset-0 z-20 h-10 w-full appearance-none bg-transparent [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:size-5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-primary [&::-webkit-slider-thumb]:bg-background [&::-webkit-slider-thumb]:shadow-sm"
          aria-label="Minimum price"
        />
        <input
          type="range"
          min={0}
          max={maxValue}
          step={500}
          value={maxPrice}
          onChange={(event) => {
            const nextMax = Math.max(Number(event.target.value), minPrice);
            setMaxPrice(nextMax);
          }}
          onMouseUp={() => commit(minPrice, maxPrice)}
          onTouchEnd={() => commit(minPrice, maxPrice)}
          className="pointer-events-none absolute inset-0 z-30 h-10 w-full appearance-none bg-transparent [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:size-5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-primary [&::-webkit-slider-thumb]:bg-background [&::-webkit-slider-thumb]:shadow-sm"
          aria-label="Maximum price"
        />
      </div>

      <div className="flex gap-2">
        <Button
          type="button"
          size="sm"
          className="flex-1"
          onClick={() => commit(minPrice, maxPrice)}
        >
          Apply range
        </Button>
        <Button type="button" size="sm" variant="outline" onClick={onReset}>
          Reset
        </Button>
      </div>
    </div>
  );
}

export function ShopPageClient({ products, categories, meta }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const filters = getActiveFilters(searchParams);
  const totalPages = Math.max(meta.totalPages, 1);
  const page = Math.min(meta.page, totalPages);
  const maxProductPrice = products.reduce((highest, product) => {
    const numericPrice =
      Number(String(product.price).replace(/[^\d.]/g, '')) || 0;
    return Math.max(highest, numericPrice);
  }, 0);
  const parsedFilterRange = parsePriceRange(filters.price);
  const activeMaxPrice = Number(parsedFilterRange.max || '0') || 0;
  const sliderMax = roundRangeCeiling(
    Math.max(maxProductPrice, activeMaxPrice, 100000),
  );

  function updateFilter(key: string, value: string) {
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
      scroll: true,
    });
  }

  function clearFilters() {
    router.replace(pathname as Route, { scroll: false });
  }

  function applyCustomPriceRange(value: string) {
    updateFilter('price', value);
  }

  const activeCount = [
    filters.category,
    filters.stock,
    filters.price,
    filters.tag !== 'all' ? filters.tag : '',
  ].filter(Boolean).length;

  function renderFiltersContent() {
    return (
      <>
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-sm font-extrabold text-secondary">Filters</h2>
          {activeCount > 0 ? (
            <Button
              type="button"
              variant="ghost"
              onClick={clearFilters}
              className="h-auto px-2 py-1 text-xs font-semibold text-primary"
            >
              Clear
            </Button>
          ) : null}
        </div>
        <div className="mt-4 space-y-5 text-sm">
          <div>
            <div className="font-semibold text-foreground">Category</div>
            <div className="mt-2 grid gap-2">
              {categories.map((category) => (
                <button
                  key={category.slug}
                  type="button"
                  onClick={() =>
                    updateFilter(
                      'c',
                      filters.category === category.slug ? '' : category.slug,
                    )
                  }
                  className={`cursor-pointer text-left transition hover:text-primary ${filters.category === category.slug ? 'font-bold text-primary' : 'text-foreground/65'}`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>
          <div>
            <div className="font-semibold text-foreground">Stock status</div>
            <div className="mt-2 grid gap-2">
              {[
                ['in-stock', 'In stock'],
                ['featured', 'Featured'],
                ['sale', 'On sale'],
              ].map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() =>
                    updateFilter('stock', filters.stock === value ? '' : value)
                  }
                  className={`cursor-pointer text-left transition hover:text-primary ${filters.stock === value ? 'font-bold text-primary' : 'text-foreground/65'}`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <div className="font-semibold text-foreground">Price range</div>
            <div className="mt-2 grid gap-2">
              {[
                ['under-10000', 'Under ৳ 10k'],
                ['10000-50000', '৳ 10k-50k'],
                ['50000-plus', '৳ 50k+'],
              ].map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() =>
                    updateFilter('price', filters.price === value ? '' : value)
                  }
                  className={`cursor-pointer text-left transition hover:text-primary ${filters.price === value ? 'font-bold text-primary' : 'text-foreground/65'}`}
                >
                  {label}
                </button>
              ))}
            </div>
            <div key={filters.price} className="mt-3">
              <PriceRangeSlider
                initialValue={filters.price}
                maxValue={sliderMax}
                onApply={applyCustomPriceRange}
                onReset={() => updateFilter('price', '')}
              />
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="mt-4 lg:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button
              type="button"
              variant="outline"
              className="h-11 w-full rounded-full border-border px-4 text-sm font-semibold shadow-sm"
            >
              <SlidersHorizontal className="size-4" />
              Filter
              {activeCount > 0 ? ` (${activeCount})` : ''}
            </Button>
          </SheetTrigger>
          <SheetContent
            side="right"
            className="w-[88vw] max-w-sm overflow-y-auto"
          >
            <SheetHeader className="border-b border-border px-5 py-4">
              <SheetTitle>Filters</SheetTitle>
              <SheetDescription>
                Show or hide categories, stock and price filters.
              </SheetDescription>
            </SheetHeader>
            <div className="px-5 py-5">{renderFiltersContent()}</div>
          </SheetContent>
        </Sheet>
      </div>

      <section className="mt-6 grid gap-6 lg:grid-cols-[300px_minmax(0,1fr)]">
        <Card className="hidden p-5 shadow-sm lg:block">
          {renderFiltersContent()}
        </Card>

        <div className="space-y-4">
          <Card className="p-4 shadow-sm">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="text-sm text-foreground/65">
                Showing {products.length} of {meta.total} products across{' '}
                {categories.length} categories
              </div>
              <div className="flex flex-wrap gap-2 text-xs font-semibold">
                {[
                  ['all', 'All'],
                  ['sale', 'Sale'],
                  ['featured', 'Featured'],
                  ['latest', 'Latest'],
                  ['industrial', 'Industrial'],
                  ['home', 'Home'],
                ].map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() =>
                      updateFilter('tag', value === 'all' ? '' : value)
                    }
                    className={`cursor-pointer rounded-full px-3 py-2 transition ${filters.tag === value || (value === 'all' && filters.tag === 'all') ? 'bg-secondary text-secondary-foreground' : 'bg-muted text-foreground/75 hover:bg-muted/70'}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </Card>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {products.map((product, index) => (
              <ProductCard
                key={product.sku}
                product={product}
                priority={index < 4}
              />
            ))}
          </div>

          {products.length === 0 ? (
            <Card className="p-6 text-center text-sm text-foreground/60 shadow-sm">
              No products match the selected filters.
            </Card>
          ) : null}

          <Card className="flex flex-wrap items-center justify-between gap-3 p-4 text-sm shadow-sm">
            <span className="text-foreground/60">
              Page {page} of {totalPages}
            </span>
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
              <Link
                href="/quotation-request"
                className="rounded-full bg-muted px-4 py-2 text-xs font-semibold text-foreground/70 hover:text-primary"
              >
                Bulk quote
              </Link>
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
        </div>
      </section>
    </>
  );
}
