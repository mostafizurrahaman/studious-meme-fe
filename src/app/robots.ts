import { absoluteUrl } from '@/lib/seo';
import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/dashboard',
          '/my-account',
          '/checkout',
          '/cart',
          '/wishlist',
          '/admin',
          '/super-admin',
          '/payment',
          '/_next',
          '/api',
        ],
      },
    ],
    sitemap: absoluteUrl('/sitemap.xml'),
  };
}
