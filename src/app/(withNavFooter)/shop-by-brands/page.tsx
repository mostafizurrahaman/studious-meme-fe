import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { SeoScripts } from '@/components/SeoScripts';
import { buildShopByBrandsSchemas, shopByBrandsMetadata } from '@/lib/seo';
import {
  getActiveBrands,
  mapBackendBrandToStorefrontBrand,
} from '@/services/Brand';

export const metadata = shopByBrandsMetadata;

export default async function ShopByBrandsPage() {
  const brandsResult = await getActiveBrands().catch(() => null);
  const brandItems = brandsResult?.data?.length
    ? await Promise.all(brandsResult.data.map(mapBackendBrandToStorefrontBrand))
    : [];

  return (
    <>
      <SeoScripts data={buildShopByBrandsSchemas(brandItems)} />
      <main className="flex-1 bg-background pb-16">
        <div className="px-4 py-6 lg:px-6">
          <Card className="border-0 bg-secondary p-6 text-secondary-foreground shadow-sm sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-secondary-foreground/65">
              Brand directory
            </p>
            <h1 className="mt-4 text-3xl font-black sm:text-4xl">
              Shop By Brands
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-secondary-foreground/78 sm:text-base">
              Brand browsing page with the names and collections used across the
              store.
            </p>
          </Card>

          <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {brandItems.map((brand) => (
              <Link
                key={brand.name}
                href={brand.href}
                className="group block rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                <Card className="relative h-full overflow-hidden rounded-2xl border border-border/70 bg-card/95 p-6 text-center shadow-sm transition-all duration-300 ease-out motion-safe:hover:-translate-y-1 motion-safe:hover:border-primary/35 motion-safe:hover:shadow-[0_18px_40px_rgba(15,23,42,0.12)] active:translate-y-0 active:scale-[0.99]">
                  <span className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.95),transparent_58%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  <span className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-linear-to-r from-transparent via-primary/50 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  <div className="relative mx-auto flex h-24 w-24 items-center justify-center overflow-hidden rounded-2xl border border-border/70 bg-transparent shadow-[inset_0_1px_0_rgba(255,255,255,0.45)] transition-all duration-300 group-hover:scale-105 group-hover:border-primary/30 group-hover:shadow-[0_10px_30px_rgba(15,23,42,0.12)]">
                    {brand.image ? (
                      <Image
                        src={brand.image}
                        alt={brand.name}
                        width={96}
                        height={96}
                        loading="lazy"
                        sizes="96px"
                        className="h-full w-full rounded-2xl bg-transparent object-contain p-2 mix-blend-multiply transition duration-300 group-hover:scale-110"
                      />
                    ) : (
                      <span className="px-3 text-sm font-black text-secondary transition-colors duration-300 group-hover:text-primary">
                        {brand.name}
                      </span>
                    )}
                  </div>
                  <div className="relative mt-4 text-xl font-black text-secondary transition-colors duration-300 group-hover:text-primary">
                    {brand.name}
                  </div>
                  <div className="relative mt-3 inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-background/90 px-3 py-1 text-xs font-semibold text-foreground/60 transition-all duration-300 group-hover:border-primary/25 group-hover:bg-primary/5 group-hover:text-primary">
                    <span>View brand products</span>
                    <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </div>
                </Card>
              </Link>
            ))}
          </section>
        </div>
      </main>
    </>
  );
}
