import type { Metadata } from 'next';
import { parseMoney } from '@/lib/cart';
import {
  getProductPrimaryImage,
  type Brand,
  type Category,
  type Product,
} from '@/lib/storefront-types';
import { isInStockLabel } from '@/lib/stock';
import { BackendSubCategoryExtendedVersion } from '@/services/Category/mappers';

export const siteConfig = {
  name: 'Malamal.com.bd',
  url:
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') ??
    'https://malamal.com.bd',
  description:
    'Best Online Hardware Store in Bangladesh - Buy tools & hardware for sale online near Dhaka at low prices.',
  phone: '+880 9638212121',
  email: 'sales@malamal.com.bd',
  supportEmail: 'info@malamal.com.bd',
  address: 'Level 11 & 12, Medona Tower, 28, Mohakhali C/A, Dhaka-1212.',
  ogImage: process.env.NEXT_PUBLIC_SITE_OG_IMAGE?.trim() || '/logo.png',
  googleVerification:
    process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION?.trim() || '',
};

type AboutSection = {
  heading: string;
  content: string;
};

export const siteAboutSections: AboutSection[] = [
  {
    heading: "Online Shopping - Bangladesh's Best Online Hardware Store",
    content:
      "Malamal.com.bd stands out as the Best Online Hardware Store in Bangladesh, catering to both B2B and B2C customers with a vast range of industrial products. Whether you're managing a workshop or setting up a large-scale industrial unit, our platform makes it easy to buy tools and hardware online near Dhaka and across the country.",
  },
  {
    heading: 'Discover the Biggest Online Hardware Store in BD',
    content:
      'Recognized as the biggest online hardware store BD, Malamal.com.bd offers everything from Power Tools and Hand Tools to Safety Equipment, Construction Machinery, and more. Looking for online industrial hardware items price in Bangladesh? Our transparent pricing, updated regularly, ensures you get what you need at the lowest and most competitive prices.',
  },
  {
    heading: 'Why Malamal.com.bd is the Best Place to Buy Hardware Online',
    content:
      'When it comes to finding the best place to buy hardware online, Malamal.com.bd checks all the boxes - trusted brands, a wide product range, and excellent service. We proudly feature premium products from brands like BOSCH, DEWALT, MAKITA, DONGCHENG, and more. Our customers benefit from regular promotions and special offers. For businesses and individuals seeking a discount hardware store online, our platform provides unbeatable value.',
  },
  {
    heading: 'Cheap Online Hardware Store - Quality Meets Affordability',
    content:
      "Being a cheap online hardware store doesn't mean we compromise on quality. From affordable hand tools to high-end industrial machinery, we ensure every product meets quality standards. Whether you're buying for home use or large industrial needs, our prices and products make us the top choice.",
  },
  {
    heading: 'Best Online Tools Shop in Bangladesh',
    content:
      'We are widely known as the Best Online Tools Shop in Bangladesh, with thousands of products available for sale at any given time. From screwdrivers to welding machines, our online catalog is updated frequently, giving customers access to the latest tools.',
  },
  {
    heading: 'Fast Delivery, Trusted Service - Shop Near Dhaka',
    content:
      'Conveniently located near Dhaka, Malamal.com.bd offers fast delivery to all parts of the city and beyond. Customers in Tongi, Savar, Gazipur, Narayanganj, Comilla, and other regions benefit from reliable service and prompt shipping.',
  },
  {
    heading: 'Secure Online Purchase with Easy Payment Options',
    content:
      'Make your online purchase stress-free with our variety of payment methods - COD, debit/credit cards, bank transfer, Bkash, and more. Our customer support team is always ready to assist, making your experience smooth and hassle-free.',
  },
  {
    heading: 'Industrial Tools for Every Sector',
    content:
      'From light-duty tools for home use to heavy-duty industrial machines, Malamal.com.bd is the go-to destination for anyone in Bangladesh. Our tools and hardware meet the needs of industries like construction, electrical, plumbing, woodworking, and manufacturing.',
  },
  {
    heading: 'Experience the Future of Hardware Shopping',
    content:
      "Whether you're a DIY enthusiast or a procurement manager, Malamal.com.bd is designed to give you a seamless experience. Explore our site today - the Best online hardware store in Bangladesh with price, variety, and service - all in one place.",
  },
];

export const siteFullDescription = siteAboutSections
  .map(s => `${s.heading}\n${s.content}`)
  .join('\n\n');

export function absoluteUrl(path: string) {
  return new URL(path, siteConfig.url).toString();
}

export function serializeJsonLd(data: unknown) {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}

type MetadataInput = {
  title: string;
  description: string;
  path: string;
  image?: string;
  noindex?: boolean;
};

export function buildMetadata({
  title,
  description,
  path,
  image,
  noindex = false,
}: MetadataInput): Metadata {
  const resolvedImage = image ?? siteConfig.ogImage;
  const images = resolvedImage
    ? [{ url: absoluteUrl(resolvedImage) }]
    : undefined;

  return {
    title,
    description,
    alternates: {
      canonical: absoluteUrl(path),
    },
    robots: noindex
      ? { index: false, follow: false }
      : { index: true, follow: true },
    icons: {
      icon: '/icon.png',
      shortcut: '/icon.png',
      apple: '/logo.png',
    },
    openGraph: {
      title,
      description,
      url: absoluteUrl(path),
      siteName: siteConfig.name,
      type: 'website',
      images,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: images?.map(item => item.url),
    },
  };
}

export const siteMetadata: Metadata = {
  title: {
    default: siteConfig.name,
    // template: `%s | ${siteConfig.name}`,
    template: `%s`,
  },
  description: siteConfig.description,
  metadataBase: new URL(siteConfig.url),
  alternates: {
    canonical: siteConfig.url,
  },
  icons: {
    icon: '/icon.png',
    shortcut: '/icon.png',
    apple: '/logo.png',
  },
  openGraph: {
    title: siteConfig.name,
    description: siteConfig.description,
    url: siteConfig.url,
    siteName: siteConfig.name,
    type: 'website',
    images: [{ url: absoluteUrl(siteConfig.ogImage) }],
  },
  twitter: {
    card: 'summary_large_image',
    title: siteConfig.name,
    description: siteConfig.description,
    images: [absoluteUrl(siteConfig.ogImage)],
  },
  verification: {
    google: siteConfig.googleVerification,
  },
};

export const homeMetadata = buildMetadata({
  title: 'Best Online Hardware Store in Bangladesh',
  description: siteConfig.description,
  path: '/',
});

export const shopMetadata = buildMetadata({
  title: 'Shop Hardware Tools and Equipment in Bangladesh',
  description:
    'Browse hardware tools, industrial equipment, cleaning gear and workshop supplies across the Malamal catalog.',
  path: '/shop',
});

export const mainCategoriesMetadata = buildMetadata({
  title: 'All Categories - Hardware Store',
  description:
    'Browse all product categories including power tools, cleaning equipment, construction machinery and more.',
  path: '/main-categories',
});

export const shopByBrandsMetadata = buildMetadata({
  title: 'Shop By Brands - Trusted Hardware Brands',
  description:
    'Browse trusted hardware brands available on Malamal from the live storefront brand directory.',
  path: '/shop-by-brands',
});

export const promotionsMetadata = buildMetadata({
  title: 'Promotions & Offers - Hardware Deals',
  description:
    'View current promotional offers and campaign products on sale at Malamal.',
  path: '/promotions',
});

export const cartMetadata = buildMetadata({
  title: 'Shopping Cart - Review Your Order',
  description:
    'Review selected products in your shopping cart before checkout.',
  path: '/cart',
  noindex: true,
});

export const checkoutMetadata = buildMetadata({
  title: 'Checkout - Complete Your Order',
  description: 'Complete your order and submit delivery details.',
  path: '/checkout',
  noindex: true,
});

export const wishlistMetadata = buildMetadata({
  title: 'Wishlist - Saved Products',
  description: 'Review saved products and shortlist items for later purchase.',
  path: '/wishlist',
  noindex: true,
});

export const compareMetadata = buildMetadata({
  title: 'Compare Products - Side by Side',
  description: 'Compare product details side by side to make the best choice.',
  path: '/compare',
  noindex: true,
});

export const quotationRequestMetadata = buildMetadata({
  title: 'Request a Quotation - Bulk Orders',
  description:
    'Request bulk pricing and wholesale quotations for project and procurement needs.',
  path: '/quotation-request',
});

export const ourContactsMetadata = buildMetadata({
  title: 'Contact Us - Malamal Support',
  description:
    'Get in touch with Malamal sales and support team via hotline, email, WhatsApp or visit our office.',
  path: '/our-contacts',
});

export const privacyPolicyMetadata = buildMetadata({
  title: 'Privacy Policy - Data Protection',
  description:
    'Learn how Malamal collects, uses and protects your personal information.',
  path: '/privacy-policy',
  noindex: false,
});

export const termsAndConditionMetadata = buildMetadata({
  title: 'Terms and Conditions - Legal',
  description:
    'Read the terms and conditions for using Malamal storefront and services.',
  path: '/terms-and-conditions',
  noindex: false,
});

export const deliveryReturnMetadata = buildMetadata({
  title: 'Delivery & Return Policy',
  description:
    'Learn about our delivery coverage, return procedures and policies.',
  path: '/return-policy',
  noindex: false,
});

export const aboutUsMetadata = buildMetadata({
  title: 'About Us',
  description:
    'Learn about Malamal, your trusted online hardware store in Bangladesh.',
  path: '/about-us',
});

export const myAccountMetadata = buildMetadata({
  title: 'My Account - User Dashboard',
  description: 'Manage your account, orders, addresses and preferences.',
  path: '/my-account',
  noindex: true,
});

export function buildCategoryMetadata(category: {
  name?: string;
  metaTitle?: string;
  metaDescription?: string;
  title?: string;
  slug: string;
  description: string;
  image?: string;
}) {
  const title =
    category.metaTitle ?? category.name ?? category.title ?? 'Category';
  const metaDescription = category.metaDescription ?? category.description;

  return buildMetadata({
    title,
    description: metaDescription,
    path: `/category/${category.slug}`,
    image: category.image,
  });
}

export function buildSubCategoryMeta(
  subCategory: BackendSubCategoryExtendedVersion,
) {
  const title =
    subCategory.subCategoryMetaTitle ??
    subCategory.subCategoryName ??
    'SubCategory';
  const metaDescription =
    subCategory.subCategoryMetaDescription ??
    subCategory.subCategoryDescription;

  console.log({
    subCategory,
    title,
    metaDescription,
  });

  return buildMetadata({
    title,
    description: metaDescription,
    path: `/category/${subCategory.categorySlug}/${subCategory.subCategorySlug}`,
    image: subCategory.subCategoryImage,
  });
}

export function buildProductMetadata(product: {
  title: string;
  brand: string;
  sku: string;
  slug: string;
  price: string;
  images: string[];
  features?: string;
  description?: string;
}) {
  const image = absoluteUrl(getProductPrimaryImage(product));

  const descriptionParts = [product.description, product.features].filter(
    Boolean,
  );

  const fullDescription = descriptionParts.join(' ').slice(0, 160); // SEO friendly

  return {
    title: `${product.title} | ${product.brand} | ${siteConfig.name}`,

    description: fullDescription,

    openGraph: {
      title: product.title,
      description: fullDescription,
      url: `${siteConfig.url}/product/${product.slug}`,
      images: [{ url: image }],
      type: 'website',
    },

    twitter: {
      card: 'summary_large_image',
      title: product.title,
      description: fullDescription,
      images: [image],
    },

    alternates: {
      canonical: `${siteConfig.url}/product/${product.slug}`,
    },
  };
}

function catalogItem(name: string, url: string, image?: string) {
  return {
    '@type': 'ListItem',
    position: 0,
    item: {
      '@type': 'Thing',
      name,
      url: absoluteUrl(url),
      ...(image ? { image } : {}),
    },
  };
}

function buildCollectionSchema(
  title: string,
  description: string,
  path: string,
  items: Array<{ name: string; url: string; image?: string }>,
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: title,
    description,
    url: absoluteUrl(path),
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: items.map((item, index) => ({
        ...catalogItem(item.name, item.url, item.image),
        position: index + 1,
      })),
    },
  };
}

export function buildBreadcrumbSchema(
  items: Array<{ name: string; url: string }>,
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.url),
    })),
  };
}

export function buildFaqSchema(
  name: string,
  description: string,
  path: string,
  questions: Array<{ question: string; answer: string }>,
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    name,
    description,
    url: absoluteUrl(path),
    mainEntity: questions.map(item => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };
}

export function buildArticleSchema(
  title: string,
  description: string,
  path: string,
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description,
    url: absoluteUrl(path),
    author: {
      '@type': 'Organization',
      name: siteConfig.name,
    },
    publisher: {
      '@type': 'Organization',
      name: siteConfig.name,
      url: siteConfig.url,
    },
  };
}

function buildWebPageSchema(title: string, description: string, path: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: title,
    description,
    url: absoluteUrl(path),
  };
}

const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: siteConfig.name,
  url: siteConfig.url,
  email: siteConfig.email,
  telephone: siteConfig.phone,
  description: siteConfig.description,
  address: {
    '@type': 'PostalAddress',
    streetAddress: siteConfig.address,
    addressLocality: 'Dhaka',
    postalCode: '1212',
    addressCountry: 'BD',
  },
  contactPoint: [
    {
      '@type': 'ContactPoint',
      contactType: 'sales',
      telephone: siteConfig.phone,
      email: siteConfig.email,
      areaServed: 'BD',
      availableLanguage: ['en', 'bn'],
    },
    {
      '@type': 'ContactPoint',
      contactType: 'support',
      telephone: siteConfig.phone,
      email: siteConfig.supportEmail,
      areaServed: 'BD',
      availableLanguage: ['en', 'bn'],
    },
  ],
};

const aboutPageSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: siteAboutSections.map(section => ({
    '@type': 'Question',
    name: section.heading,
    acceptedAnswer: {
      '@type': 'Answer',
      text: section.content,
    },
  })),
};

const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: siteConfig.name,
  url: siteConfig.url,
};

export const siteSchemas = [organizationSchema, websiteSchema, aboutPageSchema];

export function buildHomeSchemas(input?: {
  categories?: Category[];
  products?: Product[];
  brands?: Brand[];
}) {
  const categories = input?.categories ?? [];
  const products = input?.products ?? [];
  const brandItems = input?.brands ?? [];

  const items = [
    ...categories.slice(0, 8).map(category => ({
      name: category.name,
      url: category.href,
      image: category.image ? absoluteUrl(category.image) : undefined,
    })),
    ...products.slice(0, 10).map(product => ({
      name: product.title,
      url: `/product/${product.slug}`,
      image: getProductPrimaryImage(product),
    })),
    ...brandItems.slice(0, 8).map(brand => ({
      name: brand.name,
      url: brand.href,
      image: brand.image,
    })),
  ];

  return [
    buildBreadcrumbSchema([{ name: 'Home', url: '/' }]),
    ...(items.length
      ? [
          buildCollectionSchema(
            'Malamal Home',
            'Browse top categories, trusted brands and featured store sections.',
            '/',
            items,
          ),
        ]
      : []),
  ];
}

export function buildShopSchemas(products: Product[], categories: Category[]) {
  return [
    buildBreadcrumbSchema([
      { name: 'Home', url: '/' },
      { name: 'Shop', url: '/shop' },
    ]),
    buildFaqSchema(
      'Shop FAQ',
      'Frequently asked questions about browsing products and placing orders.',
      '/shop',
      [
        {
          question: 'How do I find the right product?',
          answer:
            'Use the category rail, product cards and the shop grid to browse by department, brand and catalog item.',
        },
        {
          question: 'Can I request bulk pricing?',
          answer:
            'Yes. Use the quotation request page for project orders, wholesale quantities and brand-specific pricing.',
        },
        {
          question: 'Do products show stock and pricing?',
          answer:
            'Yes. Product cards show the current catalog price, stock status and brand information.',
        },
        {
          question: 'Can I check out from the shop page?',
          answer:
            'Yes. Add products to cart, review the summary and proceed to checkout when ready.',
        },
      ],
    ),
    buildCollectionSchema(
      'Shop Catalog',
      'Browse products from the hardware catalog.',
      '/shop',
      products.slice(0, 50).map(product => ({
        name: product.title,
        url: `/product/${product.slug}`,
        image: getProductPrimaryImage(product),
      })),
    ),
    buildCollectionSchema(
      'Shop Categories',
      'Browse the storefront category structure.',
      '/main-categories',
      categories.slice(0, 20).map(category => ({
        name: category.name,
        url: category.href,
        image: category.image ? absoluteUrl(category.image) : undefined,
      })),
    ),
  ];
}

export function buildCategorySchemas(
  category: {
    name?: string;
    title?: string;
    slug: string;
    description: string;
  },
  inputProducts?: Product[],
) {
  const title = category.name ?? category.title ?? 'Category';
  const products = inputProducts ?? [];

  return [
    buildBreadcrumbSchema([
      { name: 'Home', url: '/' },
      { name: 'Main Categories', url: '/main-categories' },
      { name: title, url: `/category/${category.slug}` },
    ]),
    buildFaqSchema(
      `${title} FAQ`,
      `Frequently asked questions about ${title.toLowerCase()}.`,
      `/category/${category.slug}`,
      [
        {
          question: `What products are in ${title}?`,
          answer: `This category groups products related to ${title.toLowerCase()} from the Malamal catalog.`,
        },
        {
          question: 'Can I request a bulk quotation?',
          answer:
            'Yes. Use the quotation request page for project buying, wholesale quantities and special pricing.',
        },
        {
          question: 'Are product prices and stock shown here?',
          answer:
            'Yes. Product cards show the current catalog price, stock status and brand information.',
        },
        {
          question: 'Can I open a product from this category page?',
          answer:
            'Yes. Select any product card to view details, add it to cart or place an order.',
        },
      ],
    ),
    buildCollectionSchema(
      title,
      category.description,
      `/category/${category.slug}`,
      products.map(product => ({
        name: product.title,
        url: `/product/${product.slug}`,
        image: getProductPrimaryImage(product),
      })),
    ),
  ];
}

export function buildSubCategorySchemas(
  subCategory: BackendSubCategoryExtendedVersion,
  inputProducts?: Product[],
) {
  const subTitle = subCategory.subCategoryName;
  const parentTitle = subCategory.categoryName || 'Category';
  const products = inputProducts ?? [];
  const subCategoryPath = `/category/${subCategory.categorySlug}/${subCategory.subCategorySlug}`;

  return [
    buildBreadcrumbSchema([
      { name: 'Home', url: '/' },
      { name: 'Main Categories', url: '/main-categories' },
      { name: parentTitle, url: `/category/${subCategory.categorySlug}` },
      { name: subTitle, url: subCategoryPath },
    ]),
    buildFaqSchema(
      `${subTitle} FAQ`,
      `Frequently asked questions about ${subTitle.toLowerCase()}.`,
      subCategoryPath,
      [
        {
          question: `What products are in ${subTitle}?`,
          answer: `This subcategory groups products related to ${subTitle.toLowerCase()} from the Malamal catalog.`,
        },
        {
          question: 'Can I request a bulk quotation?',
          answer:
            'Yes. Use the quotation request page for project buying, wholesale quantities and special pricing.',
        },
        {
          question: 'Are product prices and stock shown here?',
          answer:
            'Yes. Product cards show the current catalog price, stock status and brand information.',
        },
        {
          question: 'Can I open a product from this subcategory page?',
          answer:
            'Yes. Select any product card to view details, add it to cart or place an order.',
        },
      ],
    ),
    buildCollectionSchema(
      subTitle,
      subCategory.subCategoryDescription,
      subCategoryPath,
      products.map(product => ({
        name: product.title,
        url: `/product/${product.slug}`,
        image: getProductPrimaryImage(product),
      })),
    ),
  ];
}

export function buildMainCategoriesSchemas(categories: Category[]) {
  const items = categories;

  return [
    buildBreadcrumbSchema([
      { name: 'Home', url: '/' },
      { name: 'Main Categories', url: '/main-categories' },
    ]),
    buildCollectionSchema(
      'All Categories',
      'Explore the storefront category structure.',
      '/main-categories',
      items.map(category => ({
        name: category.name,
        url: category.href,
        image: category.image ? absoluteUrl(category.image) : undefined,
      })),
    ),
  ];
}

export function buildShopByBrandsSchemas(brandItems: Brand[]) {
  const items = brandItems;

  return [
    buildBreadcrumbSchema([
      { name: 'Home', url: '/' },
      { name: 'Shop by Brands', url: '/shop-by-brands' },
    ]),
    buildCollectionSchema(
      'Shop By Brands',
      'Browse the trusted brands used across the storefront.',
      '/shop-by-brands',
      items.map(brand => ({
        name: brand.name,
        url: brand.href,
        image: brand.image,
      })),
    ),
  ];
}

export function buildPromotionsSchemas(products: Product[]) {
  const items = products;

  return [
    buildBreadcrumbSchema([
      { name: 'Home', url: '/' },
      { name: 'Promotions', url: '/promotions' },
    ]),
    buildCollectionSchema(
      'Promotions',
      'View the current promotional offers and campaign products.',
      '/promotions',
      items.slice(0, 50).map(product => ({
        name: product.title,
        url: `/product/${product.slug}`,
        image: getProductPrimaryImage(product),
      })),
    ),
  ];
}

export const cartSchemas = [
  buildBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Cart', url: '/cart' },
  ]),
  buildWebPageSchema(
    'Shopping Cart',
    'Review selected products before checkout.',
    '/cart',
  ),
];

export const checkoutSchemas = [
  buildBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Cart', url: '/cart' },
    { name: 'Checkout', url: '/checkout' },
  ]),
  buildWebPageSchema(
    'Checkout',
    'Complete your order and submit delivery details.',
    '/checkout',
  ),
];

export const wishlistSchemas = [
  buildBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Wishlist', url: '/wishlist' },
  ]),
  buildWebPageSchema(
    'Wishlist',
    'Review saved products and shortlist items for later.',
    '/wishlist',
  ),
];

export const compareSchemas = [
  buildBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Compare', url: '/compare' },
  ]),
  buildWebPageSchema(
    'Compare Products',
    'Compare product details side by side.',
    '/compare',
  ),
];

export const ourContactsSchemas = [
  buildBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Our Contacts', url: '/our-contacts' },
  ]),
  {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    name: 'Contact Malamal.com.bd',
    description:
      'Hotline, email, WhatsApp and office details for sales and support.',
    url: absoluteUrl('/our-contacts'),
    mainEntity: organizationSchema,
  },
];

export const quotationRequestSchemas = [
  buildBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Quotation Request', url: '/quotation-request' },
  ]),
  buildFaqSchema(
    'Quotation Request FAQ',
    'Frequently asked questions about bulk quotation requests.',
    '/quotation-request',
    [
      {
        question: 'What details should I include in a quotation request?',
        answer:
          'Share product names or links, quantity, delivery area, budget range and any brand preference so the sales team can prepare an accurate quote.',
      },
      {
        question: 'How quickly will I receive a reply?',
        answer:
          'Requests are reviewed by the sales team and answered as soon as possible during support hours.',
      },
      {
        question: 'Can I request pricing for multiple brands?',
        answer:
          'Yes. Include the preferred brand and any acceptable alternatives to compare options in one quote.',
      },
      {
        question: 'Is quotation support available for bulk orders?',
        answer:
          'Yes. The request form is designed for wholesale, procurement and project buying workflows.',
      },
    ],
  ),
  {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: 'Bulk Quotation Request',
    description:
      'Request project and wholesale pricing for hardware and industrial products.',
    serviceType: 'Wholesale and bulk quotation',
    provider: organizationSchema,
    areaServed: 'BD',
    url: absoluteUrl('/quotation-request'),
  },
];

export function buildProductSchemas(product: {
  title: string;
  slug: string;
  brand: string;
  sku: string;
  images: string[];
  description?: string;
  price: string;
  oldPrice?: string;
  stock: string;
  rating: string;
  category: string;
  categorySlug?: string;
  youtubeVideoId?: string;
  youtubeVideoUrl?: string;
}) {
  const url = absoluteUrl(`/product/${product.slug}`);
  const image = getProductPrimaryImage(product);
  const currentPrice = parseMoney(product.price);
  const categoryUrl = product.categorySlug?.trim()
    ? absoluteUrl(`/category/${product.categorySlug}`)
    : absoluteUrl('/shop');
  const offer =
    Number.isFinite(currentPrice) && currentPrice > 0
      ? {
          '@type': 'Offer',
          url,
          priceCurrency: 'BDT',
          price: currentPrice,
          availability: isInStockLabel(product.stock)
            ? 'https://schema.org/InStock'
            : 'https://schema.org/OutOfStock',
          itemCondition: 'https://schema.org/NewCondition',
        }
      : undefined;

  const videoObject = product.youtubeVideoId?.trim()
    ? {
        '@context': 'https://schema.org',
        '@type': 'VideoObject',
        name: product.title,
        description: product.description
          ? product.description
          : `${product.title} available from ${product.brand} on ${siteConfig.name}.`,
        thumbnailUrl: [absoluteUrl(image)],
        embedUrl: `https://www.youtube.com/embed/${product.youtubeVideoId.trim()}`,
        contentUrl:
          product.youtubeVideoUrl?.trim() ||
          `https://www.youtube.com/watch?v=${product.youtubeVideoId.trim()}`,
      }
    : undefined;

  return [
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: absoluteUrl('/'),
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: product.category,
          item: categoryUrl,
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: product.title,
          item: url,
        },
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: product.title,
      image: [absoluteUrl(image)],
      description: product.description
        ? product.description
        : `${product.title} available from ${product.brand} on ${siteConfig.name}.`,
      sku: product.sku,
      brand: {
        '@type': 'Brand',
        name: product.brand,
      },
      offers: offer,
    },
    ...(videoObject ? [videoObject] : []),
  ];
}

export const privacyPolicySchemas = [
  buildBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Privacy Policy', url: '/privacy-policy' },
  ]),
  buildArticleSchema(
    'Privacy Policy - Data Protection',
    'Learn how Malamal collects, uses and protects your personal information.',
    '/privacy-policy',
  ),
];

export const termsAndConditionSchemas = [
  buildBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Terms and Conditions', url: '/terms-and-conditions' },
  ]),
  buildArticleSchema(
    'Terms and Conditions',
    'Read the terms and conditions for using Malamal storefront and services.',
    '/terms-and-conditions',
  ),
];

export const deliveryReturnSchemas = [
  buildBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Return Policy', url: '/return-policy' },
  ]),
  buildArticleSchema(
    'Delivery & Return Policy',
    'Learn about our delivery coverage, return procedures and policies.',
    '/return-policy',
  ),
];

export const aboutUsSchemas = [
  buildBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'About Us', url: '/about-us' },
  ]),
  buildArticleSchema(
    'About Malamal - Your Trusted Hardware Store',
    'Learn about Malamal, your trusted online hardware store in Bangladesh.',
    '/about-us',
  ),
];

export const myAccountSchemas = [
  buildBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'My Account', url: '/my-account' },
  ]),
  buildWebPageSchema(
    'My Account',
    'Manage your account, orders, addresses and preferences.',
    '/my-account',
  ),
];

export const ordersSchemas = [
  buildBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Dashboard', url: '/dashboard/user' },
    { name: 'Orders', url: '/dashboard/user/orders' },
  ]),
  buildWebPageSchema(
    'Orders',
    'View all your orders, order details, status and delivery information.',
    '/dashboard/user/orders',
  ),
];

export function buildOrderDetailSchemas(orderId: string) {
  return [
    buildBreadcrumbSchema([
      { name: 'Home', url: '/' },
      { name: 'Dashboard', url: '/dashboard/user' },
      { name: 'Orders', url: '/dashboard/user/orders' },
      { name: `Order ${orderId}`, url: `/dashboard/user/orders/${orderId}` },
    ]),
    buildWebPageSchema(
      `Order ${orderId}`,
      'View your order details, status and delivery information.',
      `/dashboard/user/orders/${orderId}`,
    ),
  ];
}
