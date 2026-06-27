import { ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import { SeoScripts } from '@/components/SeoScripts';
import { Card } from '@/components/ui/card';
import {
  getCategoryAccentClassName,
  getCategoryAccentStyle,
} from '@/lib/category-accent';
import { buildMainCategoriesSchemas, mainCategoriesMetadata } from '@/lib/seo';
import { getActiveCategories } from '@/services/Category';
import {
  mapBackendCategoryToStorefrontCategory,
  type BackendCategory,
} from '@/services/Category/mappers';

export const metadata = mainCategoriesMetadata;
export default async function MainCategoriesPage() {
  const categoriesResult = await getActiveCategories().catch(() => null);
  const backendCategories = Array.isArray(categoriesResult?.data)
    ? categoriesResult.data.map((item) =>
        mapBackendCategoryToStorefrontCategory(item as BackendCategory),
      )
    : [];

  // const spotlightCards = backendCategories.slice(0, 6).map(category => ({
  //   title: category.name,
  //   description: category.description,
  //   href: category.href,
  //   accent: category.accent,
  // }));

  const categoryStats = [
    { label: 'Active categories', value: backendCategories.length },
    {
      label: 'Sub categories',
      value: backendCategories.reduce(
        (total, category) => total + (category.subCategories?.length ?? 0),
        0,
      ),
    },
    { label: 'Browse focus', value: 'Curated' },
  ];

  return (
    <>
      <SeoScripts data={buildMainCategoriesSchemas(backendCategories)} />
      <main className="flex-1 bg-background pb-16">
        <div className="px-4 py-6 lg:px-6">
          <Card className="relative overflow-hidden border-border/60 p-6 shadow-sm sm:p-8">
            <span className="pointer-events-none absolute -right-20 -top-24 size-56 rounded-full bg-primary/10 blur-3xl" />
            <span className="pointer-events-none absolute -bottom-24 left-1/3 size-56 rounded-full bg-secondary/10 blur-3xl" />
            <div className="relative">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">
                Main categories
              </p>
              <h1 className="mt-4 text-3xl font-black text-secondary sm:text-4xl">
                All Categories
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-foreground/65 sm:text-base">
                The category hub brings together the full storefront structure
                with cards, spotlights and quick links.
              </p>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                {categoryStats.map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-2xl border border-border/70 bg-background/85 px-4 py-4 shadow-sm backdrop-blur-sm"
                  >
                    <div className="text-xs font-semibold uppercase tracking-[0.24em] text-foreground/45">
                      {stat.label}
                    </div>
                    <div className="mt-2 text-2xl font-black text-secondary">
                      {stat.value}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {backendCategories.map((category) => (
              <Link
                key={category.name}
                href={category.href}
                className="group block rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                <Card className="relative h-full overflow-hidden rounded-2xl border border-border/70 bg-card/95 p-5 shadow-sm transition-all duration-300 ease-out motion-safe:hover:-translate-y-1 motion-safe:hover:border-primary/35 motion-safe:hover:shadow-[0_18px_40px_rgba(15,23,42,0.12)] active:translate-y-0 active:scale-[0.99]">
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
                  <div className="relative flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="inline-flex rounded-full border border-border/70 bg-background/90 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.28em] text-foreground/55 transition-colors duration-300 group-hover:text-primary">
                        Category
                      </div>
                      <div className="mt-4 text-lg font-extrabold leading-tight text-secondary transition-colors duration-300 group-hover:text-primary">
                        {category.name}
                      </div>
                    </div>
                    <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-full border border-border/70 bg-background/90 text-foreground/50 transition-all duration-300 group-hover:border-primary/25 group-hover:bg-primary group-hover:text-white group-hover:shadow-sm">
                      <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                    </span>
                  </div>
                  {/* <p className="relative mt-3 text-sm leading-7 text-foreground/65">
                    {category.description || 'Browse category products'}
                  </p> */}
                  {/* <p className="mt-2 text-sm leading-6 text-foreground/65">
                    {category.description.slice(0, 40) +
                      (category.description.length > 40 ? '...' : '')}
                  </p> */}
                  <div className="relative mt-5 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-xs font-semibold text-foreground/55 transition-colors duration-300 group-hover:text-primary">
                      <span className="h-1.5 w-1.5 rounded-full bg-primary/60 transition-transform duration-300 group-hover:scale-125" />
                      <span>Explore category</span>
                    </div>
                    <span className="rounded-full border border-border/70 bg-background/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.24em] text-foreground/45 transition-colors duration-300 group-hover:text-primary">
                      {category.subCategories?.length ?? 0} sub
                    </span>
                  </div>
                </Card>
              </Link>
            ))}
          </section>

          {/* <section className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {spotlightCards.map(card => (
              <Link
                key={card.title}
                href={card.href}
                className={`group relative overflow-hidden rounded-3xl p-6 text-white shadow-sm transition-all duration-300 ease-out motion-safe:hover:-translate-y-1 motion-safe:hover:shadow-[0_18px_40px_rgba(15,23,42,0.18)] active:translate-y-0 active:scale-[0.99] ${getCategoryAccentClassName(card.accent)}`}
                style={getCategoryAccentStyle(card.accent)}
              >
                <span className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.18),transparent_55%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                <div className="text-xs font-semibold uppercase tracking-[0.3em] text-white/65">
                  Spotlight
                </div>
                <h2 className="mt-4 text-2xl font-black text-white">{card.title}</h2>
                <p className="mt-3 text-sm leading-7 text-white/90">{card.description}</p>
                <span className="mt-6 inline-flex w-fit rounded-full bg-white/18 px-4 py-2 text-sm font-semibold text-white backdrop-blur-sm transition group-hover:bg-white/24">
                  Explore category
                </span>
              </Link>
            ))}
          </section> */}
        </div>
      </main>
    </>
  );
}
