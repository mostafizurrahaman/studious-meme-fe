import type {
  CategoryPageEntry,
  StorefrontCategory,
} from '@/lib/storefront-types';

export type BackendSubCategory = {
  name: string;
  slug: string;
  image?: string;
  description?: string;
  accent?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type BackendCategory = {
  _id?: string;
  name: string;
  slug: string;
  image?: string;
  description?: string;
  metaTitle?: string;
  metaDescription?: string;
  accent?: string;
  isActive?: boolean;
  subCategories?: BackendSubCategory[];
  createdAt?: string;
  updatedAt?: string;
};

const accentPalette = [
  'from-[#0e2f56] to-[#163f77]',
  'from-[#4d6b92] to-[#90a4c8]',
  'from-[#5f2d1f] to-[#c56c47]',
  'from-[#233647] to-[#5a7288]',
  'from-primary to-secondary',
  'from-[#3d5a48] to-[#80a27c]',
] as const;

function getAccent(slug?: string, accent?: string): string {
  if (accent?.trim()) {
    return accent;
  }

  const safeSlug = slug?.trim() || 'category';
  const sum = Array.from(safeSlug).reduce(
    (total, char) => total + char.charCodeAt(0),
    0,
  );
  return accentPalette[sum % accentPalette.length];
}

export function mapBackendCategoryToStorefrontCategory(
  category: BackendCategory,
): StorefrontCategory {
  const name = category.name?.trim() || 'Category';
  const slug = category.slug?.trim() || 'category';

  return {
    name,
    slug,
    href: `/category/${slug}`,
    image: category.image,
    description:
      category.description ?? `${name} catalog and related hardware listings.`,
    accent: getAccent(slug, category.accent),
    subCategories: category.subCategories
      ?.filter(subCategory => subCategory.isActive !== false)
      .map(subCategory => ({
        name: subCategory.name,
        slug: subCategory.slug,
        description: subCategory.description,
        image: subCategory.image,
        accent: subCategory.accent,
      })),
  };
}

export function mapBackendCategoryToCategoryPageEntry(
  category: BackendCategory,
): CategoryPageEntry {
  return mapBackendCategoryToStorefrontCategory(category);
}
