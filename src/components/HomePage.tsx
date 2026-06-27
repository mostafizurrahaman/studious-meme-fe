import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowUpRight,
  BadgePercent,
  GitCompare,
  Heart,
  ShoppingCart,
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  getCategoryAccentClassName,
  getCategoryAccentStyle,
} from '@/lib/category-accent';
import { ProductCard } from '@/components/ProductCard';
import { SectionHeading } from '@/components/SectionHeading';
import { HomeHeroCarousel } from '@/components/HomeHeroCarousel';
import { HomeAboutSection } from '@/components/HomeAboutSection';
import {
  mapBackendBrandToStorefrontBrand,
  type BackendBrand,
} from '@/services/Brand';
import {
  mapBackendCategoryToStorefrontCategory,
  type BackendCategory,
} from '@/services/Category/mappers';
import {
  mapBackendProductToStorefrontProduct,
  type BackendProduct,
} from '@/services/Product';

const directoryTileLinkClass =
  'group block rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background';

const directoryTileCardClass =
  'relative h-full overflow-hidden rounded-2xl border border-border/70 bg-card/95 shadow-sm transition-all duration-300 ease-out motion-safe:hover:-translate-y-1 motion-safe:hover:border-primary/35 motion-safe:hover:shadow-[0_18px_40px_rgba(15,23,42,0.12)] active:translate-y-0 active:scale-[0.99]';

const directoryTileSheenClass =
  'pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.96),transparent_58%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100';

const directoryTileTopBarClass =
  'pointer-events-none absolute inset-x-0 top-0 h-1 opacity-80 transition-opacity duration-300 group-hover:opacity-100';

// const directoryTileOrbClass =
//   'pointer-events-none absolute -right-10 -top-10 size-28 rounded-full opacity-15 blur-2xl transition-opacity duration-300 group-hover:opacity-25';

const brandTileCardClass =
  'relative h-full overflow-hidden rounded-2xl border border-border/70 bg-card/95 shadow-sm transition-all duration-300 ease-out motion-safe:hover:-translate-y-1 motion-safe:hover:rotate-1 motion-safe:hover:shadow-[0_18px_40px_rgba(15,23,42,0.12)] active:translate-y-0 active:scale-[0.99]';

const brandTileSheenClass =
  'pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.96),transparent_58%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100';

const brandTileSweepClass =
  'pointer-events-none absolute inset-y-0 -left-1/2 w-1/2 bg-gradient-to-r from-transparent via-white/55 to-transparent opacity-0 transition-all duration-700 ease-out group-hover:translate-x-[240%] group-hover:opacity-100';

const brandTileGlowClass =
  'pointer-events-none absolute -bottom-10 left-1/2 size-24 -translate-x-1/2 rounded-full bg-primary/10 blur-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100';

type HeroSlide = {
  title: string;
  description: string;
  image: string;
  href: string;
};

type HomePageProps = {
  heroContent?: {
    heroSection?: {
      slides?: Array<{
        title: string;
        description: string;
        image: string;
        clickUrl: string;
      }>;
      features?: Array<{
        title: string;
        description: string;
        image: string;
        clickUrl: string;
      }>;
    } | null;
    brands?: BackendBrand[];
    categories?: BackendCategory[];
    featuredProducts?: BackendProduct[];
    latestProducts?: BackendProduct[];
  } | null;
};

// function SectionMarquee() {
//   const message = `Welcome to ${siteConfig.name}. Thank you for staying with Malamal | Malamal এর পক্ষ থেকে সবাইকে জানাই স্বাগত ও শুভকামনা ।`;

//   return (
//     <Card className="overflow-hidden border-primary/20 py-3 shadow-sm">
//       <div className="animate-[marquee_28s_linear_infinite] whitespace-nowrap text-sm font-semibold text-primary">
//         <span className="inline-block px-6">{message}</span>
//         <span className="inline-block px-6">{message}</span>
//         <span className="inline-block px-6">{message}</span>
//       </div>
//     </Card>
//   );
// }

export async function HomePage({ heroContent }: HomePageProps) {
  const heroSlides: HeroSlide[] = heroContent?.heroSection?.slides?.length
    ? heroContent.heroSection.slides.map((slide) => ({
        title: slide.title,
        description: slide.description,
        image: slide.image,
        href: slide.clickUrl || '/shop',
      }))
    : [];

  const heroFeatures: HeroSlide[] = heroContent?.heroSection?.features?.length
    ? heroContent.heroSection.features.map((card) => ({
        title: card.title,
        description: card.description,
        image: card.image,
        href: card.clickUrl || '/shop',
      }))
    : [];

  const featuredCatalog = heroContent?.featuredProducts?.length
    ? await Promise.all(
        heroContent.featuredProducts.map(mapBackendProductToStorefrontProduct),
      )
    : [];

  const latestCatalog = heroContent?.latestProducts?.length
    ? await Promise.all(
        heroContent.latestProducts.map(mapBackendProductToStorefrontProduct),
      )
    : [];

  const categoryCards = heroContent?.categories?.length
    ? heroContent.categories
        .slice(0, 8)
        .map(mapBackendCategoryToStorefrontCategory)
    : [];

  const brandItems = heroContent?.brands?.length
    ? await Promise.all(
        heroContent.brands.slice(0, 16).map(mapBackendBrandToStorefrontBrand),
      )
    : [];

  return (
    <main className="flex-1 bg-background pb-16">
      <div className="py-6">
        <div className="mb-4 flex justify-center lg:hidden">
          <Link
            href="/main-categories"
            className="inline-flex h-11 items-center justify-center rounded-full bg-primary px-6 text-sm font-bold text-white! shadow-sm"
          >
            All Categories
          </Link>
        </div>

        <section>
          <HomeHeroCarousel slides={heroSlides} features={heroFeatures} />
        </section>

        {/* <div className="mt-4">
          <SectionMarquee />
        </div> */}

        {/* <section className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            { label: 'FASTEST DELIVERY POSSIBLE', icon: Zap },
            { label: 'SECURE PAYMENT SYSTEM', icon: ShieldCheck },
            { label: 'CASH ON DELIVERY AT YOUR DOORS', icon: DoorClosed },
            { label: 'AUTHENTICITY 100% GUARANTEED', icon: BadgeCheck },
          ].map(({ label, icon: Icon }) => (
            <div
              key={label}
              className="group relative flex items-center gap-4 rounded-2xl border border-border bg-card p-4 shadow-sm transition-colors hover:bg-accent"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Icon className="h-5 w-5" />
              </div>
              <div className="text-[11px] font-extrabold tracking-[0.18em] text-secondary">{label}</div>
            </div>
          ))}
        </section> */}

        <Card className="mt-8 shadow-sm">
          <CardHeader className="px-5 pb-0 pt-5 sm:px-6">
            <SectionHeading title="Featured products" actionHref="/shop" />
          </CardHeader>
          <CardContent className="px-5 pb-5 pt-6 sm:px-6">
            <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-5">
              {featuredCatalog.length > 0 ? (
                featuredCatalog.map((product) => (
                  <ProductCard key={product.sku} product={product} />
                ))
              ) : (
                <div className="col-span-full text-center text-foreground/60 py-12">
                  No featured products available
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="mt-8 shadow-sm">
          <CardHeader className="px-5 pb-0 pt-5 sm:px-6">
            <SectionHeading title="Latest Products" actionHref="/shop" />
          </CardHeader>
          <CardContent className="px-5 pb-5 pt-6 sm:px-6">
            <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-5">
              {latestCatalog.length > 0 ? (
                latestCatalog.map((product) => (
                  <ProductCard key={product.sku} product={product} />
                ))
              ) : (
                <div className="col-span-full text-center text-foreground/60 py-12">
                  No latest products available
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {categoryCards.length > 0 && (
          <Card className="mt-8 shadow-sm">
            <CardHeader className="px-5 pb-0 pt-5 sm:px-6">
              <SectionHeading
                title="Shop By Category"
                actionHref="/main-categories"
              />
            </CardHeader>
            <CardContent className="px-5 pb-5 pt-6 sm:px-6">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {categoryCards.map((card) => (
                  <Link
                    key={card.slug}
                    href={card.href}
                    className={directoryTileLinkClass}
                  >
                    <Card className={`${directoryTileCardClass} p-4`}>
                      <span className={directoryTileSheenClass} />
                      <span
                        className={directoryTileTopBarClass}
                        style={getCategoryAccentStyle(card.accent)}
                      />
                      <span
                        className={`pointer-events-none absolute -right-10 -top-10 size-28 rounded-full opacity-15 blur-2xl transition-opacity duration-300 group-hover:opacity-25 ${getCategoryAccentClassName(card.accent)}`}
                        style={getCategoryAccentStyle(card.accent)}
                      />
                      <div className="relative flex items-start gap-3">
                        <div className="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-border/70 bg-transparent shadow-[inset_0_1px_0_rgba(255,255,255,0.45)] transition-all duration-300 group-hover:scale-105 group-hover:border-primary/30 group-hover:shadow-[0_10px_30px_rgba(15,23,42,0.12)]">
                          {card.image ? (
                            <Image
                              src={card.image}
                              alt={card.name}
                              width={80}
                              height={80}
                              loading="lazy"
                              sizes="80px"
                              className="h-full w-full rounded-2xl bg-transparent object-contain p-2 mix-blend-multiply transition duration-300 group-hover:scale-110"
                            />
                          ) : (
                            <span className="px-2 text-center text-xs font-black text-secondary transition-colors duration-300 group-hover:text-primary">
                              {card.name}
                            </span>
                          )}
                        </div>

                        <div className="min-w-0 flex-1 text-left">
                          <div className="inline-flex rounded-full border border-border/70 bg-background/90 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.28em] text-foreground/55 transition-colors duration-300 group-hover:text-primary">
                            Category
                          </div>
                          <div className="mt-3 text-lg font-black leading-tight text-secondary transition-colors duration-300 group-hover:text-primary">
                            {card.name}
                          </div>
                          <p className="mt-2 text-sm leading-6 text-foreground/65">
                            {card.description.slice(0, 40) +
                              (card.description.length > 40 ? '...' : '')}
                          </p>
                        </div>

                        <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-full border border-border/70 bg-background/90 text-foreground/50 transition-all duration-300 group-hover:border-primary/25 group-hover:bg-primary group-hover:text-white group-hover:shadow-sm">
                          <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                        </span>
                      </div>

                      <div className="relative mt-4 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2 text-xs font-semibold text-foreground/55 transition-colors duration-300 group-hover:text-primary">
                          <span className="h-1.5 w-1.5 rounded-full bg-primary/60 transition-transform duration-300 group-hover:scale-125" />
                          <span>Explore category</span>
                        </div>
                        <span className="rounded-full border border-border/70 bg-background/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.24em] text-foreground/45 transition-colors duration-300 group-hover:text-primary">
                          {card.subCategories?.length ?? 0} sub
                        </span>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {brandItems.length > 0 && (
          <Card className="mt-8 shadow-sm">
            <CardHeader className="px-5 pb-0 pt-5 sm:px-6">
              <SectionHeading
                title="Shop By Brands"
                actionHref="/shop-by-brands"
              />
            </CardHeader>
            <CardContent className="px-5 pb-5 pt-6 sm:px-6">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
                {brandItems.map((brand) => (
                  <Link
                    key={brand.name}
                    href={brand.href}
                    className={directoryTileLinkClass}
                  >
                    <Card className={`${brandTileCardClass} p-4 text-center`}>
                      <span className={brandTileSheenClass} />
                      <span className={brandTileSweepClass} />
                      <span className={brandTileGlowClass} />
                      <div className="relative mx-auto flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl border border-border/70 bg-transparent shadow-[inset_0_1px_0_rgba(255,255,255,0.45)] transition-all duration-300 group-hover:scale-110 group-hover:-rotate-2 group-hover:border-primary/30 group-hover:shadow-[0_10px_30px_rgba(15,23,42,0.12)]">
                        {brand.image ? (
                          <Image
                            src={brand.image}
                            alt={brand.name}
                            width={64}
                            height={64}
                            loading="lazy"
                            sizes="64px"
                            className="h-full w-full rounded-2xl bg-transparent object-contain p-2 mix-blend-multiply transition duration-300 group-hover:scale-[1.14]"
                          />
                        ) : (
                          <span className="px-2 text-center text-xs font-black text-secondary transition-colors duration-300 group-hover:text-primary">
                            {brand.name}
                          </span>
                        )}
                      </div>
                      <div className="relative mt-3 text-sm font-black text-secondary transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:text-primary">
                        {brand.name}
                      </div>
                      <div className="relative mt-2 inline-flex rounded-full border border-border/70 bg-background/90 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.24em] text-foreground/45 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:border-primary/25 group-hover:text-primary">
                        View brand
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="mt-8 grid gap-8 border-0 bg-secondary p-6 text-secondary-foreground shadow-sm lg:grid-cols-[1fr_1.2fr] lg:p-8">
          <div className="flex flex-col justify-center">
            <p className="text-xs font-medium uppercase tracking-[0.3em] text-secondary-foreground/65">
              Built for the storefront workflow
            </p>
            <h2 className="mt-4 text-3xl font-medium leading-tight sm:text-4xl">
              Catalog, cart and checkout flows are all covered here.
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-secondary-foreground/78 sm:text-base">
              The structure mirrors the storefront and keeps product, cart and
              checkout sections aligned for the full shopping experience.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              {
                title: 'Best Deals',
                text: 'Find value-for-money products faster',
                icon: BadgePercent,
              },
              {
                title: 'Compare Products',
                text: 'Compare specs, prices and choices side by side',
                icon: GitCompare,
              },
              {
                title: 'Save Wishlist',
                text: 'Keep favorite products for later purchase',
                icon: Heart,
              },
              {
                title: 'Easy Shopping',
                text: 'Add to cart and checkout with confidence',
                icon: ShoppingCart,
              },
            ].map(({ title, text, icon: Icon }) => (
              <div
                key={title}
                className="group flex items-start gap-4 rounded-2xl bg-white/5 p-5 transition-all hover:bg-white/15"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/10 text-white transition-transform group-hover:scale-110">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-bold text-white">{title}</div>
                  <div className="mt-1 text-sm text-secondary-foreground/70">
                    {text}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <HomeAboutSection />
      </div>
    </main>
  );
}
