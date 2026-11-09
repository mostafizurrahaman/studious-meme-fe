export type StorefrontProduct = {
  id?: string;
  title: string;
  slug: string;
  href: '/shop';
  images: string[];
  imageAlt?: string[];
  features?: string;
  description?: string;
  price: string;
  oldPrice?: string;
  badge?: string;
  sellingUnit?: string;
  youtubeVideoUrl?: string;
  youtubeVideoId?: string;
  brand: string;
  sku: string;
  stock: string;
  rating: string;
  category: string;
  categorySlug?: string;
  isFeatured?: boolean;
  isNoCOD?: boolean;
  weightKg?: number;
  metaTitle?: string;
  metaDescription?: string;
  createdAt?: string;
};

export type Product = StorefrontProduct;

export function getProductPrimaryImage(
  product: { images?: (string | undefined | null)[] } | null | undefined,
): string {
  if (product && Array.isArray(product.images)) {
    const validImage = product.images.find(
      (img): img is string => typeof img === 'string' && img.trim().length > 0,
    );
    if (validImage) {
      return validImage;
    }
  }
  return '/icon.png';
}

export type StorefrontCategory = {
  name: string;
  slug: string;
  href: `/category/${string}`;
  image?: string;
  imageAlt?: string;
  description: string;
  metaTitle?: string;
  metaDescription?: string;
  accent: string;
  subCategories?: Array<{
    name: string;
    slug: string;
    description?: string;
    image?: string;
    imageAlt?: string;
    accent?: string;
  }>;
};

export type Category = StorefrontCategory;

export type StorefrontBrand = {
  name: string;
  slug: string;
  href: `/shop?b=${string}`;
  image?: string;
  imageAlt?: string;
};

export type Brand = StorefrontBrand;

export type CategoryShowcaseEntry = {
  title: string;
  slug: string;
  href: `/category/${string}`;
  description: string;
  metaTitle: string;
  metaDescription: string;
  accent: string;
};

export type CategoryPageEntry = StorefrontCategory | CategoryShowcaseEntry;
