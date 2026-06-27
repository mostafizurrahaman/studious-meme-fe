import { Card, CardHeader } from '@/components/ui/card';
import { SeoScripts } from '@/components/SeoScripts';
import { ShopPageClient } from '@/components/ShopPageClient';
import { buildShopSchemas, shopMetadata } from '@/lib/seo';
import { getActiveCategories } from '@/services/Category';
import {
  mapBackendCategoryToStorefrontCategory,
  type BackendCategory,
} from '@/services/Category/mappers';
import {
  getAllActiveProducts,
  mapBackendProductToStorefrontProduct,
} from '@/services/Product';

export const metadata = shopMetadata;

type Props = {
  searchParams: Promise<{
    c?: string;
    stock?: string;
    tag?: string;
    price?: string;
    brand?: string;
    b?: string;
    page?: string;
    limit?: string;
    sort?: string;
    searchTerm?: string;
  }>;
};

const DEFAULT_SHOP_LIMIT = 24;

export default async function ShopPage({ searchParams }: Props) {
  const query = await searchParams;
  const page = Math.max(Number(query.page ?? '1') || 1, 1);
  const limit = Math.max(
    Number(query.limit ?? String(DEFAULT_SHOP_LIMIT)) || DEFAULT_SHOP_LIMIT,
    1,
  );
  const searchTerm = query.searchTerm?.trim() ?? '';
  const [productsResult, categoriesResult] = await Promise.all([
    getAllActiveProducts({
      page,
      limit,
      c: query.c,
      stock: query.stock,
      tag: query.tag,
      price: query.price,
      brand: query.brand,
      b: query.b,
      sort: query.sort,
      searchTerm,
    }).catch(() => null),
    getActiveCategories().catch(() => null),
  ]);

  const products = productsResult?.data?.length
    ? await Promise.all(
        productsResult.data.map(mapBackendProductToStorefrontProduct),
      )
    : [];
  const backendCategories = Array.isArray(categoriesResult?.data)
    ? categoriesResult.data.map((item) =>
        mapBackendCategoryToStorefrontCategory(item as BackendCategory),
      )
    : [];
  const meta = {
    total: productsResult?.meta?.total ?? products.length,
    limit: productsResult?.meta?.limit ?? limit,
    page: productsResult?.meta?.page ?? page,
    totalPages: productsResult?.meta?.totalPages ?? 1,
  };
  const stats = [
    [String(meta.total), 'Products'],
    [String(backendCategories.length), 'Categories'],
    [String(meta.page), 'Current page'],
    [String(meta.totalPages), 'Total pages'],
  ];

  return (
    <>
      <SeoScripts data={buildShopSchemas(products, backendCategories)} />
      <main className="flex-1 bg-background pb-16">
        <div className="px-4 py-6 lg:px-6">
          <Card className="border-0 bg-secondary text-secondary-foreground shadow-sm">
            <CardHeader className="p-6 sm:p-8">
              <p className="hidden sm:block mb-4 text-xs font-semibold uppercase tracking-[0.3em] text-secondary-foreground/65">
                Product catalog
              </p>
              <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <h1 className="text-3xl font-black sm:text-4xl">Shop</h1>
                  <p className="mt-3 hidden sm:block max-w-2xl text-sm leading-7 text-white/78 sm:text-base">
                    Browse the storefront catalog with filters, categories and
                    product cards across the full hardware range.
                  </p>
                </div>
                <div className="hidden grid-cols-2 gap-3 text-center sm:grid sm:grid-cols-4">
                  {stats.map(([value, label]) => (
                    <div
                      key={label}
                      className="rounded-2xl bg-white/10 px-4 py-3"
                    >
                      <div className="text-lg font-extrabold">{value}</div>
                      <div className="text-[11px] uppercase tracking-[0.24em] text-secondary-foreground/65">
                        {label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardHeader>
          </Card>

          <ShopPageClient
            products={products}
            categories={backendCategories}
            meta={meta}
          />
        </div>
      </main>
    </>
  );
}
