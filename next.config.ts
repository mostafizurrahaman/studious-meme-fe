import type { NextConfig } from 'next';

const isProduction = process.env.NODE_ENV === 'production';

const scriptSrc = [
  "'self'",
  "'unsafe-inline'",
  !isProduction ? "'unsafe-eval'" : '',
  'https://www.googletagmanager.com',
  'https://www.google-analytics.com',
  'https://static.cloudflareinsights.com',
]
  .filter(Boolean)
  .join(' ');

const csp = `
  default-src 'self';

  script-src ${scriptSrc};

  style-src 'self' 'unsafe-inline';

  img-src
    'self'
    data:
    blob:
    https://malamal.com.bd
    https://img.youtube.com
    https://res.cloudinary.com;

  font-src 'self' data:;

  connect-src
    'self'
    https://api.malamal.com.bd
    https://malamal.com.bd
    https://www.google-analytics.com
    https://www.googletagmanager.com
    https://cloudflareinsights.com
    https://static.cloudflareinsights.com;

  frame-src
    'self'
    https://www.youtube.com
    https://www.youtube-nocookie.com;

  object-src 'none';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'none';

  ${isProduction ? 'upgrade-insecure-requests;' : ''}
`
  .replace(/\s{2,}/g, ' ')
  .trim();

const nextConfig: NextConfig = {
  /* config options here */
  distDir: process.env.NEXT_DIST_DIR || '.next',

  // Performance & SEO Optimizations
  reactStrictMode: true,
  devIndicators: false,
  poweredByHeader: false,

  /**
   * Next.js 16+
   * React Compiler এখন stable direction এ যাচ্ছে,
   * কিন্তু অনেক library compatibility issue থাকতে পারে।
   * Safe হলে enable করুন।
   */
  reactCompiler: true,

  // Next.js 16: Enable Cache Components and use-cache based caching behavior
  /**
   * Next.js 16 caching
   * cacheComponents এখন useful,
   * কিন্তু app-wide blindly enable না করাই better
   * যদি use cache strategy properly follow না করেন।
   */
  // cacheComponents: true,

  images: {
    // Next.js 16 allows multiple qualities for better optimization
    // formats: ['image/avif', 'image/webp'],
    qualities: [50, 75, 90],
    minimumCacheTTL: 60 * 60 * 24 * 7, // 7 days
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com', pathname: '/**' },
      { protocol: 'https', hostname: 'img.youtube.com', pathname: '/**' },
      { protocol: 'https', hostname: 'malamal.com.bd', pathname: '/**' },
    ],
  },

  experimental: {
    serverActions: {
      bodySizeLimit: '5mb', // Set this to 2mb, 5mb, etc.
    },

    // Optimize static generation performance
    // staticGenerationRetryCount: 1,
    // staticGenerationMaxConcurrency: 8,
  },

  // typescript: {
  //     ignoreBuildErrors: true,
  // },

  compiler: {
    removeConsole: isProduction
      ? {
          exclude: ['error', 'warn'],
        }
      : false,
  },

  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'Content-Security-Policy', value: csp },
          // Prevent clickjacking
          { key: 'X-Frame-Options', value: 'DENY' },

          // Prevent MIME-type sniffing
          { key: 'X-Content-Type-Options', value: 'nosniff' },

          // Referrer policy
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },

          { key: 'X-DNS-Prefetch-Control', value: 'on' },

          // XSS protection (legacy browsers)
          { key: 'X-XSS-Protection', value: '1; mode=block' },

          // Permissions policy (disable unused features)
          {
            key: 'Permissions-Policy',
            value:
              'camera=(), microphone=(), geolocation=(self), interest-cohort=()',
          },

          // HSTS (production only)
          ...(isProduction
            ? [
                {
                  key: 'Strict-Transport-Security',
                  value: 'max-age=63072000; includeSubDomains; preload',
                },
              ]
            : []),
        ],
      },
    ];
  },
};

export default nextConfig;
