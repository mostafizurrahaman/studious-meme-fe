import { NextResponse } from 'next/server';
import { absoluteUrl } from '@/lib/seo';
import { getActiveCategories, getAllSubCategoriesForSiteMap } from '@/services/Category';
import { mapBackendCategoryToStorefrontCategory, type BackendCategory, type BackendSubCategoryExtendedVersion } from '@/services/Category/mappers';

export async function GET() {
  const now = new Date();
  const toLastModified = (value?: string) => (value ? new Date(value) : now).toISOString();

  const staticUrls = [
    { url: '/', freq: 'daily', prio: '1.0' },
    { url: '/shop', freq: 'daily', prio: '0.9' },
    { url: '/main-categories', freq: 'weekly', prio: '0.7' },
    { url: '/shop-by-brands', freq: 'weekly', prio: '0.6' },
    { url: '/promotions', freq: 'weekly', prio: '0.6' },
    { url: '/our-contacts', freq: 'yearly', prio: '0.4' },
    { url: '/quotation-request', freq: 'yearly', prio: '0.4' },
    { url: '/about-us', freq: 'yearly', prio: '0.4' },
    { url: '/terms-and-conditions', freq: 'yearly', prio: '0.2' },
    { url: '/privacy-policy', freq: 'yearly', prio: '0.2' },
    { url: '/return-policy', freq: 'yearly', prio: '0.2' },
  ];

  const [categoriesResult, subCategoriesResult] = await Promise.all([
    getActiveCategories().catch(() => null),
    getAllSubCategoriesForSiteMap().catch(() => null),
  ]);

  const categories = Array.isArray(categoriesResult?.data) ? categoriesResult.data : [];
  const subCategories = Array.isArray(subCategoriesResult?.data) ? subCategoriesResult.data : [];

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

  // Static
  staticUrls.forEach((u) => {
    xml += `
    <url>
      <loc>${absoluteUrl(u.url)}</loc>
      <lastmod>${now.toISOString()}</lastmod>
      <changefreq>${u.freq}</changefreq>
      <priority>${u.prio}</priority>
    </url>`;
  });

  // Categories
  categories.forEach((item) => {
    const category = mapBackendCategoryToStorefrontCategory(item as BackendCategory);
    xml += `
    <url>
      <loc>${absoluteUrl(`/category/${category.slug}`)}</loc>
      <lastmod>${toLastModified(item.updatedAt ?? item.createdAt)}</lastmod>
      <changefreq>weekly</changefreq>
      <priority>0.7</priority>
    </url>`;
  });

  // SubCategories
  subCategories.forEach((sub: BackendSubCategoryExtendedVersion) => {
    xml += `
    <url>
      <loc>${absoluteUrl(`/category/${sub.categorySlug}/${sub.subCategorySlug}`)}</loc>
      <lastmod>${toLastModified(sub.updatedAt ?? sub?.createdAt)}</lastmod>
      <changefreq>weekly</changefreq>
      <priority>0.8</priority>
    </url>`;
  });

  xml += `\n</urlset>`;

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml',
    },
  });
}
