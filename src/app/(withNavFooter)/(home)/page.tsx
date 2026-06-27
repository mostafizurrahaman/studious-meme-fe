import { HomePage } from '@/components/HomePage';
import { SeoScripts } from '@/components/SeoScripts';
import { buildHomeSchemas, homeMetadata } from '@/lib/seo';
import { mapBackendBrandToStorefrontBrand } from '@/services/Brand';
import { mapBackendCategoryToStorefrontCategory } from '@/services/Category/mappers';
import { getHomeContent } from '@/services/HeroSection';
import { mapBackendProductToStorefrontProduct } from '@/services/Product';

export const metadata = homeMetadata;

export default async function Page() {
  const heroContent = await getHomeContent().catch(() => null);
  const content = heroContent?.data ?? null;

  const [schemaProducts, schemaBrands] = await Promise.all([
    content?.featuredProducts?.length || content?.latestProducts?.length
      ? Promise.all(
          [
            ...(content.featuredProducts ?? []),
            ...(content.latestProducts ?? []),
          ]
            .slice(0, 16)
            .map(mapBackendProductToStorefrontProduct),
        )
      : Promise.resolve(undefined),

    content?.brands?.length
      ? Promise.all(
          content.brands.slice(0, 12).map(mapBackendBrandToStorefrontBrand),
        )
      : Promise.resolve(undefined),
  ]);

  const schemaCategories = content?.categories?.length
    ? content.categories
        .slice(0, 12)
        .map(mapBackendCategoryToStorefrontCategory)
    : undefined;

  return (
    <>
      <SeoScripts
        data={buildHomeSchemas({
          categories: schemaCategories,
          products: schemaProducts,
          brands: schemaBrands,
        })}
      />
      <HomePage heroContent={content} />
    </>
  );
}
