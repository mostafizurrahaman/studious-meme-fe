import { absoluteUrl } from '@/lib/seo';
import { getAllActiveProducts } from '@/services/Product';
import { getActiveCategories } from '@/services/Category';
import {
  mapBackendCategoryToStorefrontCategory,
  type BackendCategory,
} from '@/services/Category/mappers';
import type { MetadataRoute } from 'next';

const SITEMAP_PRODUCT_FETCH_LIMIT = 10000;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const toLastModified = (value?: string) => (value ? new Date(value) : now);

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: absoluteUrl('/'),
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: absoluteUrl('/shop'),
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: absoluteUrl('/main-categories'),
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: absoluteUrl('/shop-by-brands'),
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.6,
    },
    {
      url: absoluteUrl('/promotions'),
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.6,
    },
    {
      url: absoluteUrl('/our-contacts'),
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.4,
    },
    {
      url: absoluteUrl('/quotation-request'),
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.4,
    },
    {
      url: absoluteUrl('/about-us'),
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.4,
    },
    {
      url: absoluteUrl('/terms-and-conditions'),
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.2,
    },
    {
      url: absoluteUrl('/privacy-policy'),
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.2,
    },
    {
      url: absoluteUrl('/return-policy'),
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.2,
    },
  ];

  const [categoriesResult, productsResult] = await Promise.all([
    getActiveCategories().catch(() => null),
    getAllActiveProducts({
      fields: 'slug,updatedAt,createdAt',
      limit: SITEMAP_PRODUCT_FETCH_LIMIT,
    }).catch(() => null),
  ]);

  const categoryRoutes: MetadataRoute.Sitemap = Array.isArray(
    categoriesResult?.data,
  )
    ? categoriesResult.data.map((item) => {
        const category = mapBackendCategoryToStorefrontCategory(
          item as BackendCategory,
        );
        return {
          url: absoluteUrl(`/category/${category.slug}`),
          lastModified: toLastModified(item.updatedAt ?? item.createdAt),
          changeFrequency: 'weekly' as const,
          priority: 0.7,
        };
      })
    : [];

  const productRoutes = Array.isArray(productsResult?.data)
    ? productsResult.data.map((item) => {
        return {
          url: absoluteUrl(`/product/${item.slug}`),
          lastModified: toLastModified(item.updatedAt ?? item.createdAt),
          changeFrequency: 'weekly' as const,
          priority: 0.8,
        };
      })
    : [];

  return [...staticRoutes, ...categoryRoutes, ...productRoutes];
}
