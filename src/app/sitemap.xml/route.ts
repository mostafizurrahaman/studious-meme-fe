import { NextResponse } from 'next/server';
import { absoluteUrl } from '@/lib/seo';

export async function GET() {
  const sitemaps = [
    absoluteUrl('/sitemap-categories.xml'),
    absoluteUrl('/sitemap-products.xml'),
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${sitemaps
    .map(
      (url) => `
    <sitemap>
      <loc>${url}</loc>
      <lastmod>${new Date().toISOString()}</lastmod>
    </sitemap>
  `,
    )
    .join('')}
</sitemapindex>`;

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml',
    },
  });
}
