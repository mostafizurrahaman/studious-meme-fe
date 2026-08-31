import { NextResponse } from 'next/server';
import { absoluteUrl } from '@/lib/seo';
import { getAllActiveProducts } from '@/services/Product';
import { getProductPrimaryImage } from '@/lib/storefront-types';

const SITEMAP_PRODUCT_FETCH_LIMIT = 10000;

export async function GET() {
  const productsResult = await getAllActiveProducts({
    fields: 'slug,title,updatedAt,createdAt,images',
    limit: SITEMAP_PRODUCT_FETCH_LIMIT,
  }).catch(() => null);

  const products = Array.isArray(productsResult?.data)
    ? productsResult.data
    : [];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  ${products
    .map((item) => {
      const lastMod = new Date(item.updatedAt ?? item.createdAt ?? Date.now()).toISOString();
      const imageUrl = absoluteUrl(getProductPrimaryImage(item));
      const title = item.title ? item.title.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;') : '';
      
      return `
    <url>
      <loc>${absoluteUrl(`/product/${item.slug}`)}</loc>
      <lastmod>${lastMod}</lastmod>
      <changefreq>weekly</changefreq>
      <priority>0.9</priority>
      <image:image>
        <image:loc>${imageUrl}</image:loc>
        <image:title>${title}</image:title>
      </image:image>
    </url>
  `;
    })
    .join('')}
</urlset>`;

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml',
    },
  });
}
