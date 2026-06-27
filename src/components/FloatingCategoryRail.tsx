'use client';

import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ChevronRight, Menu } from 'lucide-react';
import { Card } from '@/components/ui/card';
import type { Category } from '@/lib/storefront-types';

type Props = {
  categories: Category[];
};

export function FloatingCategoryRail({ categories }: Props) {
  const [open, setOpen] = useState(false);
  const [viewportHeight, setViewportHeight] = useState(0);
  const [activeCategorySlug, setActiveCategorySlug] = useState(
    categories[0]?.slug ?? '',
  );

  const activeCategory = useMemo(
    () =>
      categories.find((category) => category.slug === activeCategorySlug) ??
      categories[0] ??
      null,
    [activeCategorySlug, categories],
  );

  const activeCategoryIndex = Math.max(
    categories.findIndex((category) => category.slug === activeCategory?.slug),
    0,
  );

  useEffect(() => {
    const syncViewportHeight = () => setViewportHeight(window.innerHeight);

    syncViewportHeight();
    window.addEventListener('resize', syncViewportHeight);

    return () => window.removeEventListener('resize', syncViewportHeight);
  }, []);

  const flyoutTop = 6 + 38 + activeCategoryIndex * 38;
  const estimatedPanelHeight = Math.min(
    500,
    94 + (activeCategory?.subCategories?.length ?? 0) * 38,
  );
  const panelMaxHeight = Math.min(
    estimatedPanelHeight,
    Math.max(viewportHeight - 40, 320),
  );
  const panelTop = viewportHeight
    ? Math.max(0, Math.min(flyoutTop, viewportHeight - 20 - estimatedPanelHeight))
    : flyoutTop;
  const connectorTop = Math.max(0, flyoutTop - panelTop);

  return (
    <div
      className="fixed left-2 top-(--storefront-header-height,clamp(120px,12vw,160px)) z-30 hidden lg:block"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <Card
        className={`overflow-hidden rounded-xl border border-border/70 bg-background shadow-xl ring-1 ring-primary/10 backdrop-blur transition-[width] duration-200 ${
          // open ? 'w-md' : 'w-11'
          open ? 'w-94' : 'w-11'
        }`}
      >
        <div className="grid gap-0.5 p-1.5">
          <div
            className={`flex h-9 items-center gap-2 rounded-full transition ${
              open ? 'pointer-events-none opacity-0' : 'opacity-100'
            }`}
          >
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm">
              <Menu className="size-3.5" />
            </span>
          </div>

          {categories.map((category) => (
            <Link
              key={category.name}
              href={category.href}
              onMouseEnter={() => setActiveCategorySlug(category.slug)}
              onFocus={() => setActiveCategorySlug(category.slug)}
              className={`group/category flex h-9 items-center gap-3 rounded-lg border border-transparent px-1.5 transition ${
                activeCategorySlug === category.slug
                  ? 'border-primary/15 bg-primary/10 text-primary shadow-[inset_3px_0_0_var(--primary)]'
                  : 'text-foreground/80 hover:border-primary/10 hover:bg-primary/5 hover:text-primary'
              }`}
            >
              <span
                className={`flex h-6 w-6 shrink-0 items-center justify-center overflow-hidden rounded-full border bg-background transition ${
                  activeCategorySlug === category.slug
                    ? 'border-primary/35 ring-4 ring-primary/10'
                    : 'border-border group-hover/category:border-primary/30'
                }`}
              >
                {category.image ? (
                  <Image
                    src={category.image}
                    alt={category.name}
                    width={24}
                    height={24}
                    className="h-4 w-4 object-contain opacity-90"
                  />
                ) : (
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                )}
              </span>
              <span
                className={`min-w-0 flex-1 text-[13px] font-medium whitespace-nowrap transition ${
                  open ? 'opacity-100' : 'w-0 overflow-hidden opacity-0'
                }`}
              >
                {category.name}
              </span>
              {open && category.subCategories?.length ? (
                <span className="ml-auto flex size-6 items-center justify-center rounded-full text-foreground/35 transition group-hover/category:bg-background/80 group-hover/category:text-primary">
                  <ChevronRight className="size-3.5" />
                </span>
              ) : null}
            </Link>
          ))}

          <Link
            href="/main-categories"
            className={`mt-1 flex h-9 items-center rounded-lg border border-primary/15 bg-primary/5 px-3 text-[13px] font-bold text-primary hover:bg-primary/10 whitespace-nowrap transition ${
              open ? 'opacity-100' : 'pointer-events-none opacity-0'
            }`}
          >
            See all Categories
          </Link>
        </div>
      </Card>
      {open && activeCategory?.subCategories?.length ? (
        <div
          className="absolute left-full z-10 pl-3"
          style={{
            top: `${panelTop}px`,
          }}
        >
          <span
            className="pointer-events-none absolute left-0 h-9 w-3 rounded-r-full border-y border-primary/25 bg-primary/25 shadow-[0_0_18px_rgba(255,80,32,0.16)]"
            style={{ top: `${connectorTop}px` }}
          />
          <span
            className="pointer-events-none absolute left-2 h-4 w-4 rotate-45 rounded-sm border-l border-t border-primary/20 bg-background"
            style={{ top: `${connectorTop + 10}px` }}
          />
          <Card
            className="relative flex w-80 flex-col overflow-hidden rounded-xl rounded-l-lg border border-primary/20 border-l-primary/35 bg-background p-3 shadow-xl ring-1 ring-primary/10"
            style={{ maxHeight: `${panelMaxHeight}px` }}
          >
            <div className="mb-2 shrink-0 rounded-lg bg-primary/10 px-3 py-2">
              <div className="text-[13px] font-extrabold text-primary">
                {activeCategory.name}
              </div>
              <div className="mt-0.5 text-[10px] font-medium text-foreground/55">
                {activeCategory.subCategories.length} subcategories
              </div>
            </div>
            <div className="grid min-h-0 flex-1 gap-1 overflow-y-auto pr-1">
              {activeCategory.subCategories.map((subCategory) => (
                <Link
                  key={subCategory.slug}
                  href={`/category/${activeCategory.slug}?subCategorySlug=${subCategory.slug}`}
                  className="rounded-lg px-4 py-2 text-[13px] font-semibold leading-snug text-foreground/80 transition hover:bg-primary/15 hover:text-primary"
                >
                  {subCategory.name}
                </Link>
              ))}
            </div>
          </Card>
        </div>
      ) : null}
      <div
        className={`pointer-events-none fixed inset-0 z-[-1] bg-secondary/35 transition ${
          open ? 'opacity-100' : 'opacity-0'
        }`}
      />
    </div>
  );
}
