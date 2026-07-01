export type StorefrontProduct = {
  id?: string;
  title: string;
  slug: string;
  href: '/shop';
  images: string[];
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
  createdAt?: string;
};

export type Product = StorefrontProduct;

export function getProductPrimaryImage(product: Pick<Product, 'images'>) {
  return product.images[0] ?? '/icon.png';
}

export type StorefrontCategory = {
  name: string;
  slug: string;
  href: `/category/${string}`;
  image?: string;
  description: string;
  metaTitle?: string;
  metaDescription?: string;
  accent: string;
  subCategories?: Array<{
    name: string;
    slug: string;
    description?: string;
    image?: string;
    accent?: string;
  }>;
};

export type Category = StorefrontCategory;

export type StorefrontBrand = {
  name: string;
  slug: string;
  href: `/shop?b=${string}`;
  image?: string;
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
