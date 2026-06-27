'use client';

import {
  Fragment,
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import {
  Copy,
  ImagePlus,
  Pencil,
  Plus,
  Trash2,
  UploadCloud,
  X,
} from 'lucide-react';
import { type UseFormReturn, useForm, useWatch } from 'react-hook-form';
import { z } from 'zod';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { DashboardInput } from '@/components/dashboard/DashboardInput';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { TableFilter } from '@/components/ui/table-filter';
import { TablePagination } from '@/components/ui/table-pagination';
import {
  createProduct,
  deleteProduct,
  type BackendProduct,
  updateProduct,
} from '@/services/Product';
import { formatDashboardDate } from '@/lib/formatDate';
import { slugify } from '@/lib/slug';
import type { BackendCategory } from '@/services/Category/mappers';
import Image from 'next/image';
import { makeZodResolver } from '@/lib/form-validation';
import { DeleteConfirmationDialog } from '@/components/dashboard/DeleteConfirmationDialog';
import { DashboardRichTextEditor } from '@/components/dashboard/DashboardRichTextEditor';
import { formatStockLabel } from '@/lib/stock';
import { formatPriceLabelWithUnit } from '@/lib/cart';
import {
  DEFAULT_SELLING_UNIT,
  SELLING_UNIT_OPTIONS,
  isSellingUnit,
} from '@/lib/selling-unit';

type Option = { value: string; label: string };
const MAX_PRODUCT_IMAGES = 5;
const imagePreviewRotations = ['-18deg', '-8deg', '4deg', '14deg', '24deg'];
const stockFieldSchema = z
  .string()
  .trim()
  .refine((value) => value === '' || /^\d+$/.test(value), {
    message: 'Stock must be a valid non-negative whole number!',
  });

function richTextHasContent(value?: string) {
  return Boolean(
    value
      ?.replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .trim(),
  );
}

function isSupportedYouTubeUrl(value: string) {
  const YOUTUBE_VIDEO_ID_PATTERN = /^[a-zA-Z0-9_-]{11}$/;

  try {
    const url = new URL(value);
    const hostname = url.hostname.replace(/^www\./i, '').toLowerCase();
    const pathname = url.pathname.replace(/\/+$/, '');

    if (hostname === 'youtu.be') {
      return YOUTUBE_VIDEO_ID_PATTERN.test(
        pathname.split('/').filter(Boolean)[0] ?? '',
      );
    }

    if (hostname === 'youtube.com' || hostname === 'm.youtube.com') {
      if (pathname === '/watch') {
        return YOUTUBE_VIDEO_ID_PATTERN.test(url.searchParams.get('v') ?? '');
      }

      if (pathname.startsWith('/embed/')) {
        return YOUTUBE_VIDEO_ID_PATTERN.test(
          pathname.split('/').filter(Boolean)[1] ?? '',
        );
      }

      if (pathname.startsWith('/shorts/')) {
        return YOUTUBE_VIDEO_ID_PATTERN.test(
          pathname.split('/').filter(Boolean)[1] ?? '',
        );
      }
    }

    return false;
  } catch {
    return false;
  }
}

type DashboardProductsManagerProps = {
  products: BackendProduct[];
  paginationMeta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  searchTerm?: string;
  brandOptions: Option[];
  categories: BackendCategory[];
};

const productEditSchema = z.object({
  title: z
    .string({ error: 'Title is required!' })
    .trim()
    .min(1, { message: 'Title is required!' }),

  slug: z
    .string({ error: 'Slug is required!' })
    .trim()
    .min(1, { message: 'Slug is required!' }),

  sku: z
    .string({ error: 'SKU is required!' })
    .trim()
    .min(1, { message: 'SKU is required!' }),

  features: z.string().refine(richTextHasContent, {
    message: 'Features are required!',
  }),
  description: z.string().refine(richTextHasContent, {
    message: 'Description is required!',
  }),

  price: z
    .string({ error: 'Price is required!' })
    .trim()
    .min(1, { message: 'Price is required!' }),

  oldPrice: z.string().trim().optional(),

  badge: z.string().trim().optional(),

  youtubeVideoUrl: z
    .string()
    .trim()
    .refine((value) => value === '' || isSupportedYouTubeUrl(value), {
      message: 'Please enter a valid YouTube URL!',
    })
    .optional(),

  brand: z
    .string({ error: 'Brand is required!' })
    .trim()
    .min(1, { message: 'Brand is required!' }),

  category: z
    .string({ error: 'Category is required!' })
    .trim()
    .min(1, { message: 'Category is required!' }),

  subCategorySlug: z.string().trim().optional(),

  stock: stockFieldSchema,

  rating: z
    .string({ error: 'Rating is required!' })
    .trim()
    .min(1, { message: 'Rating is required!' }),

  weightKg: z
    .string({ error: 'Weight is required!' })
    .trim()
    .min(1, { message: 'Weight is required!' })
    .refine((value) => Number(value) > 0, {
      message: 'Weight must be greater than 0!',
    }),

  sellingUnit: z.enum(SELLING_UNIT_OPTIONS, {
    error: 'Selling unit is required!',
  }),

  isFeatured: z.boolean().default(false),
  isNoCOD: z.boolean().default(false),
  isActive: z.boolean().default(true),
});

const productCreateSchema = z.object({
  title: z
    .string({ error: 'Title is required!' })
    .trim()
    .min(1, { message: 'Title is required!' }),

  slug: z
    .string({ error: 'Slug is required!' })
    .trim()
    .min(1, { message: 'Slug is required!' }),

  sku: z
    .string({ error: 'SKU is required!' })
    .trim()
    .min(1, { message: 'SKU is required!' }),

  features: z.string().refine(richTextHasContent, {
    message: 'Features are required!',
  }),
  description: z.string().refine(richTextHasContent, {
    message: 'Description is required!',
  }),

  price: z
    .string({ error: 'Price is required!' })
    .trim()
    .min(1, { message: 'Price is required!' }),

  oldPrice: z.string().trim().optional(),

  badge: z.string().trim().optional(),

  youtubeVideoUrl: z
    .string()
    .trim()
    .refine((value) => value === '' || isSupportedYouTubeUrl(value), {
      message: 'Please enter a valid YouTube URL!',
    })
    .optional(),

  brand: z
    .string({ error: 'Brand is required!' })
    .trim()
    .min(1, { message: 'Brand is required!' }),

  category: z
    .string({ error: 'Category is required!' })
    .trim()
    .min(1, { message: 'Category is required!' }),

  subCategorySlug: z.string().trim().optional(),

  stock: stockFieldSchema,

  rating: z
    .string({ error: 'Rating is required!' })
    .trim()
    .min(1, { message: 'Rating is required!' }),

  weightKg: z
    .string({ error: 'Weight is required!' })
    .trim()
    .min(1, { message: 'Weight is required!' })
    .refine((value) => Number(value) > 0, {
      message: 'Weight must be greater than 0!',
    }),

  sellingUnit: z.enum(SELLING_UNIT_OPTIONS, {
    error: 'Selling unit is required!',
  }),

  isFeatured: z.boolean().default(false),
  isNoCOD: z.boolean().default(false),
  isActive: z.boolean().default(true),
});

type ProductEditValues = z.infer<typeof productEditSchema>;
type ProductCreateValues = z.infer<typeof productCreateSchema>;
type ProductFormValues = ProductCreateValues;

function ErrorText({ message }: { message?: string }) {
  if (!message) return null;

  return <p className="text-xs text-destructive">{message}</p>;
}

function FieldLabel({ children }: { children: ReactNode }) {
  return (
    <label className="text-xs font-medium text-muted-foreground">
      {children}
    </label>
  );
}

function FormSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-border/60 bg-background/80 p-4 shadow-sm">
      <div className="mb-4 border-b border-border/60 pb-3">
        <h3 className="text-lg font-bold tracking-tight text-foreground">
          {title}
        </h3>
      </div>
      {children}
    </section>
  );
}

function ProductFormSections({
  form,
  titleOnChange,
  slugOnChange,
  categoryOnChange,
  categoryValue,
  subCategoryOptions,
  categories,
  brandOptions,
  featuresValue,
  descriptionValue,
  footerAction,
}: {
  form: UseFormReturn<ProductFormValues>;
  titleOnChange: (value: string) => void;
  slugOnChange: (value: string) => void;
  categoryOnChange: (value: string) => void;
  categoryValue: string;
  subCategoryOptions: Array<{ slug: string; name: string }>;
  categories: BackendCategory[];
  brandOptions: Option[];
  featuresValue: string;
  descriptionValue: string;
  footerAction?: ReactNode;
}) {
  const nativeSelectClassName =
    'h-10 rounded-md border border-input bg-background px-3 text-sm';

  return (
    <div className="space-y-5">
      <FormSection title="Basic Info">
        <div className="grid gap-1.5 md:grid-cols-2">
          <div className="grid gap-1.5 md:col-span-2">
            <FieldLabel>Title</FieldLabel>
            <DashboardInput
              placeholder="Title"
              {...form.register('title', {
                onChange: (e) => titleOnChange(e.target.value),
              })}
            />
            <div className="min-h-4" aria-hidden="true" />
            <ErrorText message={form.formState.errors.title?.message} />
          </div>

          <div className="grid gap-1.5 md:col-span-2">
            <FieldLabel>Slug</FieldLabel>
            <DashboardInput
              placeholder="Slug"
              {...form.register('slug', {
                onChange: (e) => slugOnChange(e.target.value),
              })}
            />
            <div className="min-h-4" aria-hidden="true" />
            <ErrorText message={form.formState.errors.slug?.message} />
          </div>

          <div className="grid gap-1.5">
            <FieldLabel>SKU</FieldLabel>
            <DashboardInput placeholder="SKU" {...form.register('sku')} />
            <div className="min-h-4" aria-hidden="true" />
            <ErrorText message={form.formState.errors.sku?.message} />
          </div>

          <div className="grid gap-1.5">
            <FieldLabel>Brand</FieldLabel>
            <select
              className={nativeSelectClassName}
              {...form.register('brand')}
            >
              <option value="">Brand</option>
              {brandOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <div className="min-h-4" aria-hidden="true" />
            <ErrorText message={form.formState.errors.brand?.message} />
          </div>

          <div className="grid gap-1.5">
            <FieldLabel>Category</FieldLabel>
            <select
              className={nativeSelectClassName}
              {...form.register('category', {
                onChange: (e) => categoryOnChange(e.target.value),
              })}
            >
              <option value="">Category</option>
              {categories.flatMap((category) =>
                category._id
                  ? [
                      <option key={category._id} value={category._id}>
                        {category.name?.trim() || category.slug || 'Unnamed category'}
                      </option>,
                    ]
                  : [],
              )}
            </select>
            <div className="min-h-4" aria-hidden="true" />
            <ErrorText message={form.formState.errors.category?.message} />
          </div>

          <div className="grid gap-1.5">
            <FieldLabel>Sub-category</FieldLabel>
            <select
              className={nativeSelectClassName}
              {...form.register('subCategorySlug')}
              disabled={!categoryValue}
            >
              <option value="">Sub-category</option>
              {subCategoryOptions.map((subCategory) => (
                <option key={subCategory.slug} value={subCategory.slug}>
                  {subCategory.name}
                </option>
              ))}
            </select>
            <div className="min-h-4" aria-hidden="true" />
            <ErrorText
              message={form.formState.errors.subCategorySlug?.message}
            />
          </div>
        </div>
      </FormSection>

      <FormSection title="Pricing & Inventory">
        <div className="grid gap-2 md:grid-cols-2">
          <div className="grid gap-1.5">
            <FieldLabel>Price</FieldLabel>
            <DashboardInput
              placeholder="Price"
              type="number"
              min={0}
              step="0.01"
              {...form.register('price')}
            />
            <div className="min-h-4" aria-hidden="true" />
            <ErrorText message={form.formState.errors.price?.message} />
          </div>

          <div className="grid gap-1.5">
            <FieldLabel>Old price</FieldLabel>
            <DashboardInput
              placeholder="Old price"
              type="number"
              min={0}
              step="0.01"
              {...form.register('oldPrice')}
            />
            <div className="min-h-4" aria-hidden="true" />
            <ErrorText message={form.formState.errors.oldPrice?.message} />
          </div>

          <div className="grid gap-1.5">
            <FieldLabel>Selling unit</FieldLabel>
            <select
              className={nativeSelectClassName}
              {...form.register('sellingUnit')}
            >
              {SELLING_UNIT_OPTIONS.map((unit) => (
                <option key={unit} value={unit}>
                  {unit}
                </option>
              ))}
            </select>
            <p className="text-xs text-muted-foreground">
              Select how this product is sold.
            </p>
            <ErrorText message={form.formState.errors.sellingUnit?.message} />
          </div>

          <div className="grid gap-1.5">
            <FieldLabel>Weight (kg)</FieldLabel>
            <DashboardInput
              placeholder="Weight (kg)"
              type="number"
              min={0.01}
              step="0.01"
              {...form.register('weightKg')}
            />
            <p className="text-xs text-muted-foreground">
              Required for shipping calculation.
            </p>
            <div className="min-h-4" aria-hidden="true" />
            <ErrorText message={form.formState.errors.weightKg?.message} />
          </div>

          <div className="grid gap-1.5">
            <FieldLabel>Stock count</FieldLabel>
            <DashboardInput
              placeholder="Stock count"
              type="number"
              min={0}
              step={1}
              {...form.register('stock')}
            />
            <p className="text-xs text-muted-foreground">
              Leave blank to keep it always in stock.
            </p>
            <ErrorText message={form.formState.errors.stock?.message} />
          </div>

          <div className="grid gap-1.5">
            <FieldLabel>Rating</FieldLabel>
            <DashboardInput
              placeholder="Rating"
              type="number"
              min={0}
              step="0.1"
              {...form.register('rating')}
            />
            <div className="min-h-4" aria-hidden="true" />
            <ErrorText message={form.formState.errors.rating?.message} />
          </div>

          <div className="grid gap-1.5">
            <FieldLabel>Badge</FieldLabel>
            <DashboardInput
              placeholder="Badge, e.g. Sale, New, Hot, -25%"
              {...form.register('badge')}
            />
            <div className="min-h-4" aria-hidden="true" />
            <ErrorText message={form.formState.errors.badge?.message} />
          </div>
        </div>
      </FormSection>

      <FormSection title="Media">
        <div className="grid gap-2">
          <div className="grid gap-1.5">
            <FieldLabel>YouTube video URL</FieldLabel>
            <DashboardInput
              placeholder="YouTube video URL"
              {...form.register('youtubeVideoUrl')}
            />
            <p className="text-xs text-muted-foreground">
              Paste a YouTube video link
            </p>
            <ErrorText
              message={form.formState.errors.youtubeVideoUrl?.message}
            />
          </div>
        </div>
      </FormSection>

      <FormSection title="Options">
        <div className="flex flex-wrap gap-3">
          <label className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <input type="checkbox" {...form.register('isFeatured')} />
            Featured
          </label>
          <label className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <input type="checkbox" {...form.register('isNoCOD')} />
            No COD
          </label>
          <label className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <input type="checkbox" {...form.register('isActive')} />
            Active
          </label>
        </div>
      </FormSection>

      <FormSection title="Content">
        <div className="grid gap-3">
          <DashboardRichTextEditor
            label="Features"
            value={featuresValue ?? ''}
            minHeightClassName="min-h-40"
            onChange={(value) =>
              form.setValue('features', value, {
                shouldDirty: true,
                shouldValidate: true,
              })
            }
          />
          <ErrorText message={form.formState.errors.features?.message} />

          <DashboardRichTextEditor
            label="Description"
            value={descriptionValue ?? ''}
            onChange={(value) =>
              form.setValue('description', value, {
                shouldDirty: true,
                shouldValidate: true,
              })
            }
          />
          <ErrorText message={form.formState.errors.description?.message} />
        </div>
      </FormSection>

      {footerAction ?? null}
    </div>
  );
}

function resolveProductRefLabel(value: BackendProduct['brand']) {
  if (!value) {
    return 'Unknown';
  }

  if (typeof value === 'string') {
    return value;
  }

  return value.name ?? value.slug ?? 'Unknown';
}

export function DashboardProductsManager({
  products,
  paginationMeta,
  searchTerm = '',
  brandOptions,
  categories,
}: DashboardProductsManagerProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [productImageFiles, setProductImageFiles] = useState<File[]>([]);
  const [productImagePreviews, setProductImagePreviews] = useState<string[]>(
    [],
  );
  const [editingProductImageFiles, setEditingProductImageFiles] = useState<
    File[]
  >([]);
  const [editingProductImagePreviews, setEditingProductImagePreviews] =
    useState<string[]>([]);
  const [hoveredProductImagePreview, setHoveredProductImagePreview] =
    useState('');
  const [
    hoveredEditingProductImagePreview,
    setHoveredEditingProductImagePreview,
  ] = useState('');
  const [slugAutoSync, setSlugAutoSync] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [isEditingSaving, setIsEditingSaving] = useState(false);
  const [pendingDeleteProduct, setPendingDeleteProduct] = useState<Pick<
    BackendProduct,
    'slug' | 'title'
  > | null>(null);
  const productImageInputRef = useRef<HTMLInputElement>(null);
  const editingProductImageInputRef = useRef<HTMLInputElement>(null);
  // Filter state
  const [search, setSearch] = useState(searchTerm);

  const productCreateForm = useForm<ProductCreateValues>({
    resolver: makeZodResolver(productCreateSchema),
    defaultValues: {
      title: '',
      slug: '',
      sku: '',
      features: '',
      description: '',
      price: '',
      oldPrice: '',
      badge: '',
      youtubeVideoUrl: '',
      brand: '',
      category: '',
      subCategorySlug: '',
      stock: '',
      rating: '5',
      weightKg: '',
      sellingUnit: DEFAULT_SELLING_UNIT,
      isFeatured: false,
      isNoCOD: false,
      isActive: true,
    },
    mode: 'onTouched',
  });

  const createTitle = useWatch({
    control: productCreateForm.control,
    name: 'title',
    defaultValue: '',
  });

  const createCategory = useWatch({
    control: productCreateForm.control,
    name: 'category',
    defaultValue: '',
  });
  const createFeatures = useWatch({
    control: productCreateForm.control,
    name: 'features',
    defaultValue: '',
  });
  const createDescription = useWatch({
    control: productCreateForm.control,
    name: 'description',
    defaultValue: '',
  });

  const selectedCategory = useMemo(
    () =>
      categories.find((category) => category._id === createCategory) ?? null,
    [categories, createCategory],
  );

  const subCategoryOptions = selectedCategory?.subCategories ?? [];

  const productEditForm = useForm<ProductEditValues>({
    resolver: makeZodResolver(productEditSchema),
    defaultValues: {
      title: '',
      slug: '',
      sku: '',
      features: '',
      description: '',
      price: '0',
      oldPrice: '',
      badge: '',
      youtubeVideoUrl: '',
      brand: '',
      category: '',
      subCategorySlug: '',
      stock: '',
      rating: '5',
      weightKg: '',
      sellingUnit: DEFAULT_SELLING_UNIT,
      isFeatured: false,
      isNoCOD: false,
      isActive: true,
    },
    mode: 'onTouched',
  });

  const editingCategory = useWatch({
    control: productEditForm.control,
    name: 'category',
    defaultValue: '',
  });
  const editingFeatures = useWatch({
    control: productEditForm.control,
    name: 'features',
    defaultValue: '',
  });
  const editingDescription = useWatch({
    control: productEditForm.control,
    name: 'description',
    defaultValue: '',
  });

  const editingSelectedCategory = useMemo(
    () =>
      categories.find((category) => category._id === editingCategory) ?? null,
    [categories, editingCategory],
  );

  const editingSubCategoryOptions =
    editingSelectedCategory?.subCategories ?? [];

  useEffect(() => {
    if (!editingSlug) return;
    productEditForm.setValue('slug', productEditForm.getValues('slug'), {
      shouldDirty: false,
      shouldTouch: false,
      shouldValidate: false,
    });
  }, [editingSlug, productEditForm]);

  useEffect(() => {
    if (slugAutoSync) {
      productCreateForm.setValue('slug', slugify(createTitle), {
        shouldDirty: true,
        shouldTouch: false,
        shouldValidate: false,
      });
    }
  }, [createTitle, productCreateForm, slugAutoSync]);

  useEffect(() => {
    return () => {
      [...productImagePreviews, ...editingProductImagePreviews].forEach(
        (preview) => {
          if (preview.startsWith('blob:')) {
            URL.revokeObjectURL(preview);
          }
        },
      );
    };
  }, [editingProductImagePreviews, productImagePreviews]);

  const updateProductQuery = useCallback(
    (updates: { page?: number; limit?: number; searchTerm?: string }) => {
      const nextParams = new URLSearchParams(searchParams.toString());
      const nextPage = updates.page ?? paginationMeta.page;
      const nextLimit = updates.limit ?? paginationMeta.limit;
      const nextSearchTerm = updates.searchTerm ?? search;

      nextParams.set('page', String(nextPage));
      nextParams.set('limit', String(nextLimit));

      if (nextSearchTerm.trim()) {
        nextParams.set('searchTerm', nextSearchTerm.trim());
      } else {
        nextParams.delete('searchTerm');
      }

      router.push(`${pathname}?${nextParams.toString()}`);
    },
    [
      paginationMeta.limit,
      paginationMeta.page,
      pathname,
      router,
      search,
      searchParams,
    ],
  );

  const handleSearchChange = (value: string) => {
    setSearch(value);
    updateProductQuery({ page: 1, searchTerm: value });
  };

  function refresh(message: string, type: 'success' | 'error') {
    if (type === 'success') {
      toast.success(message);
    } else {
      toast.error(message);
    }
    router.refresh();
  }

  async function handleCopyProductId(productId?: string) {
    const value = productId?.trim();
    if (!value) {
      toast.error('Product ID is not available.');
      return;
    }

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(value);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = value;
        textArea.setAttribute('readonly', '');
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }

      toast.success('Product ID copied.');
    } catch {
      toast.error('Could not copy product ID.');
    }
  }

  function closeDeleteDialog() {
    if (isPending) return;
    setPendingDeleteProduct(null);
  }

  function confirmDeleteProduct() {
    const slug = pendingDeleteProduct?.slug;
    if (!slug) return;

    startTransition(async () => {
      const result = await deleteProduct(slug);
      if (!result?.success)
        return refresh(result?.message ?? 'Failed to delete product.', 'error');
      setPendingDeleteProduct(null);
      refresh(result.message ?? 'Product deleted successfully.', 'success');
    });
  }

  function handleTitleChange(value: string) {
    productCreateForm.setValue('title', value, { shouldValidate: true });
    if (slugAutoSync) {
      productCreateForm.setValue('slug', slugify(value), {
        shouldValidate: true,
      });
    }
  }

  function handleSlugChange(value: string) {
    setSlugAutoSync(false);
    productCreateForm.setValue('slug', slugify(value), {
      shouldValidate: true,
    });
  }

  function handleEditingTitleChange(value: string) {
    productEditForm.setValue('title', value, { shouldValidate: true });
  }

  function handleEditingCategoryChange(value: string) {
    productEditForm.setValue('category', value, { shouldValidate: true });
    productEditForm.setValue('subCategorySlug', '', { shouldValidate: true });
  }

  function appendProductImages(files?: FileList | File[]) {
    const nextFiles = Array.from(files ?? []);
    if (nextFiles.length === 0) return;
    if (productImagePreviews.length + nextFiles.length > MAX_PRODUCT_IMAGES) {
      toast.error(`You can upload up to ${MAX_PRODUCT_IMAGES} product images.`);
      return;
    }

    setProductImageFiles((current) => [...current, ...nextFiles]);
    setProductImagePreviews((current) => [
      ...current,
      ...nextFiles.map((file) => URL.createObjectURL(file)),
    ]);
  }

  function appendEditingProductImages(files?: FileList | File[]) {
    const nextFiles = Array.from(files ?? []);
    if (nextFiles.length === 0) return;
    if (
      editingProductImagePreviews.length + nextFiles.length >
      MAX_PRODUCT_IMAGES
    ) {
      toast.error(`You can upload up to ${MAX_PRODUCT_IMAGES} product images.`);
      return;
    }

    setEditingProductImageFiles((current) => [...current, ...nextFiles]);
    setEditingProductImagePreviews((current) => [
      ...current,
      ...nextFiles.map((file) => URL.createObjectURL(file)),
    ]);
  }

  function removeProductImage(index: number) {
    const preview = productImagePreviews[index];
    if (preview?.startsWith('blob:')) URL.revokeObjectURL(preview);
    setProductImageFiles((current) =>
      current.filter((_, fileIndex) => fileIndex !== index),
    );
    setProductImagePreviews((current) => {
      const next = current.filter((_, previewIndex) => previewIndex !== index);
      setHoveredProductImagePreview((hovered) =>
        hovered === preview ? (next[0] ?? '') : hovered,
      );
      return next;
    });
  }

  function removeEditingProductImage(index: number) {
    const preview = editingProductImagePreviews[index];
    if (preview?.startsWith('blob:')) URL.revokeObjectURL(preview);
    const blobFileIndex =
      editingProductImagePreviews
        .slice(0, index + 1)
        .filter((item) => item.startsWith('blob:')).length - 1;

    if (preview?.startsWith('blob:')) {
      setEditingProductImageFiles((current) =>
        current.filter((_, fileIndex) => fileIndex !== blobFileIndex),
      );
    }

    setEditingProductImagePreviews((current) => {
      const next = current.filter((_, previewIndex) => previewIndex !== index);
      setHoveredEditingProductImagePreview((hovered) =>
        hovered === preview ? (next[0] ?? '') : hovered,
      );
      return next;
    });
  }

  function getEditingImagePayload() {
    let blobIndex = 0;

    return editingProductImagePreviews.map((preview) => {
      if (!preview.startsWith('blob:')) return preview;
      const file = editingProductImageFiles[blobIndex];
      blobIndex += 1;
      return file;
    });
  }

  function handleEditingProductImageDrop(
    event: React.DragEvent<HTMLDivElement>,
  ) {
    event.preventDefault();
    appendEditingProductImages(event.dataTransfer.files);
  }

  function startEditingProduct(product: BackendProduct) {
    setEditingSlug(product.slug);
    const brandId =
      typeof product.brand === 'string'
        ? product.brand
        : (product.brand?._id ?? '');
    const categoryId =
      typeof product.category === 'string'
        ? product.category
        : (product.category?._id ?? '');
    productEditForm.reset({
      title: product.title,
      slug: product.slug,
      sku: product.sku,
      features: product.features ?? '',
      description: product.description ?? '',
      price: String(product.price),
      oldPrice: product.oldPrice === undefined ? '' : String(product.oldPrice),
      badge: product.badge ?? '',
      youtubeVideoUrl: product.youtubeVideoUrl ?? '',
      brand: brandId,
      category: categoryId,
      subCategorySlug: product.subCategorySlug ?? '',
      stock: product.stock == null ? '' : String(product.stock),
      rating: String(product.rating),
      weightKg: product.weightKg == null ? '' : String(product.weightKg),
      sellingUnit: isSellingUnit(product.sellingUnit)
        ? product.sellingUnit
        : DEFAULT_SELLING_UNIT,
      isFeatured: product.isFeatured,
      isNoCOD: product.isNoCOD,
      isActive: product.isActive,
    });
    setEditingProductImageFiles([]);
    setEditingProductImagePreviews(product.images ?? []);
  }

  function stopEditingProduct() {
    setEditingSlug(null);
    productEditForm.reset({
      title: '',
      slug: '',
      sku: '',
      features: '',
      description: '',
      price: '',
      oldPrice: '',
      badge: '',
      youtubeVideoUrl: '',
      brand: '',
      category: '',
      subCategorySlug: '',
      stock: '',
      rating: '5',
      weightKg: '',
      sellingUnit: DEFAULT_SELLING_UNIT,
      isFeatured: false,
      isNoCOD: false,
      isActive: true,
    });
    setEditingProductImageFiles([]);
    setEditingProductImagePreviews([]);
  }

  function handleCategoryChange(value: string) {
    productCreateForm.setValue('category', value, { shouldValidate: true });
    productCreateForm.setValue('subCategorySlug', '', { shouldValidate: true });
  }

  return (
    <div className="space-y-6">
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Create product</CardTitle>
          <CardDescription>
            Add a new catalog item using backend CRUD.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
          <ProductFormSections
            form={productCreateForm}
            titleOnChange={handleTitleChange}
            slugOnChange={handleSlugChange}
            categoryOnChange={handleCategoryChange}
            categoryValue={createCategory}
            subCategoryOptions={subCategoryOptions}
            categories={categories}
            brandOptions={brandOptions}
            featuresValue={createFeatures ?? ''}
            descriptionValue={createDescription ?? ''}
            footerAction={
              <div className="pt-2">
                <Button
                  type="button"
                  disabled={isPending || isCreating}
                  className="gap-2"
                  onClick={productCreateForm.handleSubmit(async (values) => {
                    if (productImageFiles.length === 0) {
                      toast.error('At least one product image is required.');
                      return;
                    }

                    setIsCreating(true);
                    const result = await createProduct({
                      title: values.title.trim(),
                      slug: values.slug.trim(),
                      sku: values.sku.trim(),
                      images: productImageFiles,
                      features: values.features ?? '',
                      description: values.description ?? '',
                      price: Number(values.price),
                      oldPrice: values.oldPrice?.trim()
                        ? Number(values.oldPrice)
                        : undefined,
                      badge: values.badge?.trim() || undefined,
                      youtubeVideoUrl: values.youtubeVideoUrl?.trim() ?? '',
                      brand: values.brand.trim(),
                      category: values.category.trim(),
                      subCategorySlug:
                        values.subCategorySlug?.trim() || undefined,
                      stock: values.stock.trim() ? Number(values.stock) : null,
                      rating: Number(values.rating),
                      weightKg: Number(values.weightKg),
                      sellingUnit: values.sellingUnit,
                      isFeatured: values.isFeatured,
                      isNoCOD: values.isNoCOD,
                      isActive: values.isActive,
                    });
                    setIsCreating(false);

                    if (!result?.success)
                      return refresh(
                        result?.message ?? 'Failed to create product.',
                        'error',
                      );

                    productCreateForm.reset({
                      title: '',
                      slug: '',
                      sku: '',
                      features: '',
                      description: '',
                      price: '',
                      oldPrice: '',
                      badge: '',
                      brand: '',
                      category: '',
                      subCategorySlug: '',
                      stock: '',
                      rating: '5',
                      weightKg: '',
                      sellingUnit: DEFAULT_SELLING_UNIT,
                      isFeatured: false,
                      isNoCOD: false,
                      isActive: true,
                    });
                    productImagePreviews.forEach((preview) => {
                      if (preview.startsWith('blob:'))
                        URL.revokeObjectURL(preview);
                    });
                    setProductImageFiles([]);
                    setProductImagePreviews([]);
                    setSlugAutoSync(true);
                    refresh(
                      result.message ?? 'Product created successfully.',
                      'success',
                    );
                  })}
                >
                  <Plus className="size-4" />
                  {isCreating ? 'Creating product...' : 'Create product'}
                </Button>
              </div>
            }
          />
          <div className="justify-self-stretch xl:sticky xl:top-6">
            <div
              role="button"
              tabIndex={0}
              onClick={() => productImageInputRef.current?.click()}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  productImageInputRef.current?.click();
                }
              }}
              className="rounded-2xl border-2 border-dashed border-border/70 bg-background/80 p-3 transition hover:border-primary/40"
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => {
                event.preventDefault();
                appendProductImages(event.dataTransfer.files);
              }}
            >
              <div className="flex flex-col gap-3">
                <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <UploadCloud className="size-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-medium text-muted-foreground">
                    Product images
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Click or drop to upload up to 5 images.
                  </p>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    {productImagePreviews.length > 0 ? (
                      <div className="col-span-2">
                        <div className="relative h-34">
                          {productImagePreviews.map((preview, index) => {
                            const total = productImagePreviews.length;
                            const reversedIndex = total - index - 1;
                            const isHovered =
                              hoveredProductImagePreview === preview;

                            return (
                              <button
                                key={preview}
                                type="button"
                                onMouseEnter={() =>
                                  setHoveredProductImagePreview(preview)
                                }
                                onFocus={() =>
                                  setHoveredProductImagePreview(preview)
                                }
                                className="absolute left-1/2 top-3 size-24 overflow-hidden rounded-lg border bg-muted shadow-sm transition duration-200 focus:outline-none focus:ring-2 focus:ring-primary"
                                style={{
                                  transform: `translateX(calc(-50% + ${
                                    (reversedIndex - (total - 1) / 2) * 34
                                  }px)) scale(${isHovered ? 1.15 : 1}) rotate(${
                                    imagePreviewRotations[
                                      index % imagePreviewRotations.length
                                    ]
                                  })`,
                                  zIndex: isHovered ? 999 : total - index,
                                }}
                              >
                                <Image
                                  height={240}
                                  width={240}
                                  src={preview}
                                  alt={`Product preview ${index + 1}`}
                                  className="h-full w-full object-cover"
                                />

                                <span
                                  role="button"
                                  tabIndex={0}
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    removeProductImage(index);
                                  }}
                                  onKeyDown={(event) => {
                                    if (
                                      event.key === 'Enter' ||
                                      event.key === ' '
                                    ) {
                                      event.preventDefault();
                                      event.stopPropagation();
                                      removeProductImage(index);
                                    }
                                  }}
                                  className="absolute right-1 top-1 z-1000 flex size-6 items-center justify-center rounded-full bg-background/95 text-destructive shadow"
                                >
                                  <X className="size-3.5" />
                                </span>
                              </button>
                            );
                          })}
                        </div>
                        <div className="relative mt-2 aspect-square overflow-hidden rounded-xl border bg-muted z-10">
                          <Image
                            height={420}
                            width={420}
                            src={
                              hoveredProductImagePreview ||
                              productImagePreviews[0]
                            }
                            alt="Selected product preview"
                            className="h-full w-full object-contain p-2"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="col-span-2 flex aspect-square items-center justify-center gap-2 rounded-xl border bg-muted text-sm text-muted-foreground">
                        <ImagePlus className="size-4" />
                        Previews will appear here
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <input
              ref={productImageInputRef}
              type="file"
              accept="image/*"
              multiple
              className="sr-only"
              onChange={(event) => {
                appendProductImages(event.target.files || []);
                event.currentTarget.value = '';
              }}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>Products</CardTitle>
            <CardDescription>
              Showing {products.length} of {paginationMeta.total} items
            </CardDescription>
          </div>
          <TableFilter
            key={searchTerm}
            value={search}
            onChange={handleSearchChange}
            placeholder="Search products..."
          />
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product Details</TableHead>
                <TableHead>Brand</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Badge</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Featured</TableHead>
                <TableHead>No COD</TableHead>
                <TableHead>Weight</TableHead>
                <TableHead>Price</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => {
                const isEditing = editingSlug === product.slug;
                return (
                  <Fragment key={product.sku}>
                    <TableRow>
                      <TableCell className="min-w-0 whitespace-normal font-medium">
                        <div className="grid min-w-0 gap-1.5 rounded-md px-1 py-0.5">
                          <span className="truncate text-sm font-medium text-foreground">
                            {product.title}
                          </span>
                          <span className="truncate text-xs font-normal text-muted-foreground">
                            Slug: {product.slug}
                          </span>
                          <div className="grid gap-0.5 text-xs text-muted-foreground">
                            <div className="flex min-w-0 items-center gap-2">
                              <span className="shrink-0">Product ID:</span>
                              <code className="min-w-0 max-w-48 truncate rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[11px] font-medium text-foreground/90">
                                {product._id ?? '-'}
                              </code>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 shrink-0 text-muted-foreground hover:text-foreground"
                                onClick={() => handleCopyProductId(product._id)}
                                disabled={!product._id}
                                title="Copy product ID"
                                aria-label={`Copy product ID for ${product.title}`}
                              >
                                <Copy className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                            <div className="flex items-start gap-2">
                              <span className="shrink-0">Category:</span>
                              <span className="min-w-0 truncate text-foreground/80">
                                {resolveProductRefLabel(product.category)}
                              </span>
                            </div>
                            <div className="flex items-start gap-2">
                              <span className="shrink-0">Sub category:</span>
                              <span className="min-w-0 truncate text-foreground/80">
                                {product.subCategorySlug?.trim() || '-'}
                              </span>
                            </div>
                            <div className="flex items-start gap-2">
                              <span className="shrink-0">Selling unit:</span>
                              <span className="min-w-0 truncate text-foreground/80">
                                {isSellingUnit(product.sellingUnit)
                                  ? product.sellingUnit
                                  : DEFAULT_SELLING_UNIT}
                              </span>
                            </div>
                            <div className="flex items-start gap-2">
                              <span className="shrink-0">Created at:</span>
                              <span
                                className="cursor-help min-w-0 truncate text-foreground/80"
                                title={formatDashboardDate(product.createdAt, {
                                  time: true,
                                })}
                              >
                                {formatDashboardDate(product.createdAt)}
                              </span>
                            </div>
                            <div className="flex items-start gap-2">
                              <span className="shrink-0">Updated at:</span>
                              <span
                                className="cursor-help min-w-0 truncate text-foreground/80"
                                title={formatDashboardDate(product.updatedAt, {
                                  time: true,
                                })}
                              >
                                {formatDashboardDate(product.updatedAt)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="min-w-0">
                        {resolveProductRefLabel(product.brand)}
                      </TableCell>
                      <TableCell>{product.sku}</TableCell>
                      <TableCell className="min-w-0">
                        {product.badge ? (
                          <Badge
                            variant="outline"
                            className="max-w-28 truncate"
                          >
                            {product.badge}
                          </Badge>
                        ) : (
                          <Badge variant="secondary">None</Badge>
                        )}
                      </TableCell>
                      <TableCell className="min-w-0">
                        <Badge
                          variant={product.isActive ? 'default' : 'secondary'}
                        >
                          {product.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell className="min-w-0">
                        <Badge variant="secondary">
                          {formatStockLabel(product.stock)}
                        </Badge>
                      </TableCell>
                      <TableCell className="min-w-0">
                        <Badge
                          variant={product.isFeatured ? 'default' : 'secondary'}
                        >
                          {product.isFeatured ? 'Featured' : 'No'}
                        </Badge>
                      </TableCell>
                      <TableCell className="min-w-0">
                        <Badge
                          variant={
                            product.isNoCOD ? 'destructive' : 'secondary'
                          }
                        >
                          {product.isNoCOD ? 'Blocked' : 'Allowed'}
                        </Badge>
                      </TableCell>
                      <TableCell className="min-w-0">
                        {typeof product.weightKg === 'number'
                          ? `${product.weightKg.toFixed(2)} kg`
                          : '-'}
                      </TableCell>
                      <TableCell className="min-w-0">
                        {formatPriceLabelWithUnit(
                          product.price,
                          product.sellingUnit,
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {isEditing ? (
                            <>
                              <Button
                                size="sm"
                                disabled={isPending || isEditingSaving}
                                onClick={productEditForm.handleSubmit(
                                  async (values) => {
                                    setIsEditingSaving(true);
                                    const result = await updateProduct(
                                      product.slug,
                                      {
                                        title: values.title.trim(),
                                        slug: values.slug.trim(),
                                        sku: values.sku.trim(),
                                        features: values.features ?? '',
                                        description: values.description ?? '',
                                        price: Number(values.price),
                                        oldPrice: values.oldPrice?.trim()
                                          ? Number(values.oldPrice)
                                          : undefined,
                                        badge:
                                          values.badge?.trim() || undefined,
                                        youtubeVideoUrl:
                                          values.youtubeVideoUrl?.trim() ?? '',
                                        brand: values.brand.trim(),
                                        category: values.category.trim(),
                                        subCategorySlug:
                                          values.subCategorySlug?.trim() ?? '',
                                        stock: values.stock.trim()
                                          ? Number(values.stock)
                                          : null,
                                        rating: Number(values.rating),
                                        weightKg: Number(values.weightKg),
                                        sellingUnit: values.sellingUnit,
                                        isFeatured: values.isFeatured,
                                        isNoCOD: values.isNoCOD,
                                        isActive: values.isActive,
                                        images: getEditingImagePayload(),
                                      },
                                    );
                                    setIsEditingSaving(false);

                                    if (!result?.success) {
                                      return refresh(
                                        result?.message ??
                                          'Failed to update product.',
                                        'error',
                                      );
                                    }

                                    stopEditingProduct();
                                    refresh(
                                      result.message ??
                                        'Product updated successfully.',
                                      'success',
                                    );
                                  },
                                )}
                              >
                                {isEditingSaving ? 'Saving...' : 'Save'}
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={stopEditingProduct}
                              >
                                Cancel
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  startEditingProduct(product);
                                }}
                              >
                                <Pencil className="size-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={isPending}
                                onClick={() =>
                                  setPendingDeleteProduct({
                                    slug: product.slug,
                                    title: product.title,
                                  })
                                }
                              >
                                <Trash2 className="size-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                    {isEditing ? (
                      <TableRow key={`${product.sku}-edit`}>
                        <TableCell colSpan={11} className="bg-muted/20">
                          <div className="grid gap-6 rounded-xl border bg-background p-4 xl:grid-cols-[minmax(0,1fr)_340px]">
                            <ProductFormSections
                              form={productEditForm}
                              titleOnChange={handleEditingTitleChange}
                              slugOnChange={(value) => {
                                productEditForm.setValue(
                                  'slug',
                                  slugify(value),
                                  {
                                    shouldValidate: true,
                                  },
                                );
                              }}
                              categoryOnChange={handleEditingCategoryChange}
                              categoryValue={editingCategory}
                              subCategoryOptions={editingSubCategoryOptions}
                              categories={categories}
                              brandOptions={brandOptions}
                              featuresValue={editingFeatures ?? ''}
                              descriptionValue={editingDescription ?? ''}
                            />
                            <div className="justify-self-stretch xl:sticky xl:top-6">
                              <div
                                role="button"
                                tabIndex={0}
                                onClick={() => {
                                  editingProductImageInputRef.current?.click();
                                }}
                                onKeyDown={(event) => {
                                  if (
                                    event.key === 'Enter' ||
                                    event.key === ' '
                                  ) {
                                    event.preventDefault();
                                    editingProductImageInputRef.current?.click();
                                  }
                                }}
                                onDragOver={(event) => event.preventDefault()}
                                onDrop={handleEditingProductImageDrop}
                                className="rounded-2xl border-2 border-dashed border-border/70 bg-background/80 p-3 transition hover:border-primary/40"
                              >
                                <div className="flex flex-col gap-3">
                                  <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                    <UploadCloud className="size-5" />
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <div className="text-xs font-medium text-muted-foreground">
                                      Product images
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                      Click or drop to add more images.
                                    </p>
                                    <div className="mt-2 grid grid-cols-2 gap-2">
                                      {editingProductImagePreviews.length >
                                      0 ? (
                                        <div className="col-span-2">
                                          <div className="relative h-34">
                                            {editingProductImagePreviews.map(
                                              (preview, index) => {
                                                const total =
                                                  editingProductImagePreviews.length;
                                                const reversedIndex =
                                                  total - index - 1;
                                                const isHovered =
                                                  hoveredEditingProductImagePreview ===
                                                  preview;

                                                return (
                                                  <button
                                                    key={preview}
                                                    type="button"
                                                    onMouseEnter={() =>
                                                      setHoveredEditingProductImagePreview(
                                                        preview,
                                                      )
                                                    }
                                                    onFocus={() =>
                                                      setHoveredEditingProductImagePreview(
                                                        preview,
                                                      )
                                                    }
                                                    className="absolute left-1/2 top-3 size-24 overflow-hidden rounded-lg border bg-muted shadow-sm transition duration-200 focus:outline-none focus:ring-2 focus:ring-primary"
                                                    style={{
                                                      transform: `translateX(calc(-50% + ${
                                                        (reversedIndex -
                                                          (total - 1) / 2) *
                                                        34
                                                      }px)) scale(${isHovered ? 1.15 : 1}) rotate(${
                                                        imagePreviewRotations[
                                                          index %
                                                            imagePreviewRotations.length
                                                        ]
                                                      })`,
                                                      zIndex: isHovered
                                                        ? 999
                                                        : total - index,
                                                    }}
                                                  >
                                                    <Image
                                                      height={240}
                                                      width={240}
                                                      src={preview}
                                                      alt={`Editing product preview ${index + 1}`}
                                                      className="h-full w-full object-cover"
                                                    />

                                                    <span
                                                      role="button"
                                                      tabIndex={0}
                                                      onClick={(event) => {
                                                        event.stopPropagation();
                                                        removeEditingProductImage(
                                                          index,
                                                        );
                                                      }}
                                                      onKeyDown={(event) => {
                                                        if (
                                                          event.key ===
                                                            'Enter' ||
                                                          event.key === ' '
                                                        ) {
                                                          event.preventDefault();
                                                          event.stopPropagation();
                                                          removeEditingProductImage(
                                                            index,
                                                          );
                                                        }
                                                      }}
                                                      className="absolute right-1 top-1 z-1000 flex size-6 items-center justify-center rounded-full bg-background/95 text-destructive shadow"
                                                    >
                                                      <X className="size-3.5" />
                                                    </span>
                                                  </button>
                                                );
                                              },
                                            )}
                                          </div>
                                          <div className="relative mt-2 aspect-square overflow-hidden rounded-xl border bg-muted z-10">
                                            <Image
                                              height={420}
                                              width={420}
                                              src={
                                                hoveredEditingProductImagePreview ||
                                                editingProductImagePreviews[0]
                                              }
                                              alt="Selected editing product preview"
                                              className="h-full w-full object-contain p-2"
                                            />
                                          </div>
                                        </div>
                                      ) : (
                                        <div className="col-span-2 flex aspect-square items-center justify-center gap-2 rounded-xl border bg-muted text-sm text-muted-foreground">
                                          <ImagePlus className="size-4" />
                                          Previews will appear here
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <input
                                ref={editingProductImageInputRef}
                                type="file"
                                accept="image/*"
                                multiple
                                className="sr-only"
                                onChange={(event) => {
                                  appendEditingProductImages(
                                    event.target.files || [],
                                  );
                                  event.currentTarget.value = '';
                                }}
                              />
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : null}
                  </Fragment>
                );
              })}
            </TableBody>
          </Table>
          {paginationMeta.total > 0 && (
            <div className="mt-4 border-t pt-4">
              <TablePagination
                page={paginationMeta.page}
                limit={paginationMeta.limit}
                total={paginationMeta.total}
                onPageChange={(nextPage) =>
                  updateProductQuery({ page: nextPage })
                }
                onLimitChange={(l) => {
                  updateProductQuery({ page: 1, limit: l });
                }}
              />
            </div>
          )}
        </CardContent>
      </Card>

      <DeleteConfirmationDialog
        open={Boolean(pendingDeleteProduct)}
        title="Delete product?"
        description={`This will permanently delete ${pendingDeleteProduct?.title || 'this product'} from the catalog.`}
        confirmLabel="Delete product"
        isPending={isPending}
        onOpenChange={(open) => {
          if (!open) closeDeleteDialog();
        }}
        onConfirm={confirmDeleteProduct}
      />
    </div>
  );
}

// "use client";

// import { Fragment, useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
// import { usePathname, useRouter, useSearchParams } from "next/navigation";
// import { toast } from "sonner";
// import { ImagePlus, Pencil, Plus, Trash2, UploadCloud } from "lucide-react";
// import { useForm, useWatch } from "react-hook-form";
// import { z } from "zod";
// import { Badge } from "@/components/ui/badge";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// import { DashboardInput } from "@/components/dashboard/DashboardInput";
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
// import { TableFilter } from "@/components/ui/table-filter";
// import { TablePagination } from "@/components/ui/table-pagination";
// import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
// import { createProduct, deleteProduct, type BackendProduct, updateProduct } from "@/services/Product";
// import { formatDashboardDate } from "@/lib/formatDate";
// import { slugify } from "@/lib/slug";
// import type { BackendCategory } from "@/services/Category/mappers";
// import Image from "next/image";
// import { makeZodResolver } from "@/lib/form-validation";

// type Option = { value: string; label: string };

// type DashboardProductsManagerProps = {
//   products: BackendProduct[];
//   paginationMeta: { page: number; limit: number; total: number; totalPages: number };
//   searchTerm?: string;
//   brandOptions: Option[];
//   categories: BackendCategory[];
// };

// const productEditSchema = z.object({
//   title: z.string({ error: "Title is required!" }).trim().min(1, { message: "Title is required!" }),

//   slug: z.string({ error: "Slug is required!" }).trim().min(1, { message: "Slug is required!" }),

//   sku: z.string({ error: "SKU is required!" }).trim().min(1, { message: "SKU is required!" }),

//   price: z.string({ error: "Price is required!" }).trim().min(1, { message: "Price is required!" }),

//   oldPrice: z.string().trim().optional(),

//   badge: z.string().trim().optional(),

//   brand: z.string({ error: "Brand is required!" }).trim().min(1, { message: "Brand is required!" }),

//   category: z.string({ error: "Category is required!" }).trim().min(1, { message: "Category is required!" }),

//   subCategorySlug: z.string().trim().optional(),

//   stock: z.string({ error: "Stock is required!" }).trim().min(1, { message: "Stock is required!" }),

//   rating: z.string({ error: "Rating is required!" }).trim().min(1, { message: "Rating is required!" }),

//   weightKg: z
//     .string({ error: "Weight is required!" })
//     .trim()
//     .min(1, { message: "Weight is required!" })
//     .refine(value => Number(value) > 0, { message: "Weight must be greater than 0!" }),

//   isFeatured: z.boolean().default(false),
//   isNoCOD: z.boolean().default(false),
//   isActive: z.boolean().default(true),
// });

// const productCreateSchema = z.object({
//   title: z.string({ error: "Title is required!" }).trim().min(1, { message: "Title is required!" }),

//   slug: z.string({ error: "Slug is required!" }).trim().min(1, { message: "Slug is required!" }),

//   sku: z.string({ error: "SKU is required!" }).trim().min(1, { message: "SKU is required!" }),

//   price: z.string({ error: "Price is required!" }).trim().min(1, { message: "Price is required!" }),

//   oldPrice: z.string().trim().optional(),

//   badge: z.string().trim().optional(),

//   brand: z.string({ error: "Brand is required!" }).trim().min(1, { message: "Brand is required!" }),

//   category: z.string({ error: "Category is required!" }).trim().min(1, { message: "Category is required!" }),

//   subCategorySlug: z.string().trim().optional(),

//   stock: z.string({ error: "Stock is required!" }).trim().min(1, { message: "Stock is required!" }),

//   rating: z.string({ error: "Rating is required!" }).trim().min(1, { message: "Rating is required!" }),

//   weightKg: z
//     .string({ error: "Weight is required!" })
//     .trim()
//     .min(1, { message: "Weight is required!" })
//     .refine(value => Number(value) > 0, { message: "Weight must be greater than 0!" }),

//   isFeatured: z.boolean().default(false),
//   isNoCOD: z.boolean().default(false),
//   isActive: z.boolean().default(true),
// });

// type ProductEditValues = z.infer<typeof productEditSchema>;
// type ProductCreateValues = z.infer<typeof productCreateSchema>;

// function ErrorText({ message }: { message?: string }) {
//   if (!message) return null;

//   return <p className="text-xs text-destructive">{message}</p>;
// }

// function resolveProductRefLabel(value: BackendProduct["brand"]) {
//   if (typeof value === "string") {
//     return value;
//   }

//   return value.name ?? value.slug ?? "Unknown";
// }

// export function DashboardProductsManager({
//   products,
//   paginationMeta,
//   searchTerm = "",
//   brandOptions,
//   categories,
// }: DashboardProductsManagerProps) {
//   const router = useRouter();
//   const pathname = usePathname();
//   const searchParams = useSearchParams();
//   const [isPending, startTransition] = useTransition();
//   const [productImageFile, setProductImageFile] = useState<File | null>(null);
//   const [productImagePreview, setProductImagePreview] = useState("");
//   const [editingProductImageFile, setEditingProductImageFile] = useState<File | null>(null);
//   const [editingProductImagePreview, setEditingProductImagePreview] = useState("");
//   const [slugAutoSync, setSlugAutoSync] = useState(true);
//   const [isCreating, setIsCreating] = useState(false);
//   const [editingSlug, setEditingSlug] = useState<string | null>(null);
//   const [isEditingSaving, setIsEditingSaving] = useState(false);
//   const productImageInputRef = useRef<HTMLInputElement>(null);
//   const editingProductImageInputRef = useRef<HTMLInputElement>(null);
//   // Filter state
//   const [search, setSearch] = useState(searchTerm);

//   const productCreateForm = useForm<ProductCreateValues>({
//     resolver: makeZodResolver(productCreateSchema),
//     defaultValues: {
//       title: "",
//       slug: "",
//       sku: "",
//       price: "",
//       oldPrice: "",
//       badge: "",
//       brand: "",
//       category: "",
//       subCategorySlug: "",
//       stock: "",
//       rating: "5",
//       weightKg: "1",
//       isFeatured: false,
//       isNoCOD: false,
//       isActive: true,
//     },
//     mode: "onTouched",
//   });

//   const createTitle = useWatch({
//     control: productCreateForm.control,
//     name: "title",
//     defaultValue: "",
//   });

//   const createCategory = useWatch({
//     control: productCreateForm.control,
//     name: "category",
//     defaultValue: "",
//   });

//   const selectedCategory = useMemo(
//     () => categories.find(category => category._id === createCategory) ?? null,
//     [categories, createCategory],
//   );

//   const subCategoryOptions = selectedCategory?.subCategories ?? [];

//   const productEditForm = useForm<ProductEditValues>({
//     resolver: makeZodResolver(productEditSchema),
//     defaultValues: {
//       title: "",
//       slug: "",
//       sku: "",
//       price: "0",
//       oldPrice: "",
//       badge: "",
//       brand: "",
//       category: "",
//       subCategorySlug: "",
//       stock: "0",
//       rating: "5",
//       weightKg: "1",
//       isFeatured: false,
//       isNoCOD: false,
//       isActive: true,
//     },
//     mode: "onTouched",
//   });

//   const editingCategory = useWatch({
//     control: productEditForm.control,
//     name: "category",
//     defaultValue: "",
//   });

//   const editingSelectedCategory = useMemo(
//     () => categories.find(category => category._id === editingCategory) ?? null,
//     [categories, editingCategory],
//   );

//   const editingSubCategoryOptions = editingSelectedCategory?.subCategories ?? [];

//   useEffect(() => {
//     if (!editingSlug) return;
//     productEditForm.setValue("slug", productEditForm.getValues("slug"), {
//       shouldDirty: false,
//       shouldTouch: false,
//       shouldValidate: false,
//     });
//   }, [editingSlug, productEditForm]);

//   useEffect(() => {
//     if (slugAutoSync) {
//       productCreateForm.setValue("slug", slugify(createTitle), {
//         shouldDirty: true,
//         shouldTouch: false,
//         shouldValidate: false,
//       });
//     }
//   }, [createTitle, productCreateForm, slugAutoSync]);

//   useEffect(() => {
//     return () => {
//       if (productImagePreview.startsWith("blob:")) {
//         URL.revokeObjectURL(productImagePreview);
//       }
//       if (editingProductImagePreview.startsWith("blob:")) {
//         URL.revokeObjectURL(editingProductImagePreview);
//       }
//     };
//   }, [editingProductImagePreview, productImagePreview]);

//   const updateProductQuery = useCallback(
//     (updates: { page?: number; limit?: number; searchTerm?: string }) => {
//       const nextParams = new URLSearchParams(searchParams.toString());
//       const nextPage = updates.page ?? paginationMeta.page;
//       const nextLimit = updates.limit ?? paginationMeta.limit;
//       const nextSearchTerm = updates.searchTerm ?? search;

//       nextParams.set("page", String(nextPage));
//       nextParams.set("limit", String(nextLimit));

//       if (nextSearchTerm.trim()) {
//         nextParams.set("searchTerm", nextSearchTerm.trim());
//       } else {
//         nextParams.delete("searchTerm");
//       }

//       router.push(`${pathname}?${nextParams.toString()}`);
//     },
//     [paginationMeta.limit, paginationMeta.page, pathname, router, search, searchParams],
//   );

//   const handleSearchChange = (value: string) => {
//     setSearch(value);
//     updateProductQuery({ page: 1, searchTerm: value });
//   };

//   function refresh(message: string, type: "success" | "error") {
//     if (type === "success") {
//       toast.success(message);
//     } else {
//       toast.error(message);
//     }
//     router.refresh();
//   }

//   function handleTitleChange(value: string) {
//     productCreateForm.setValue("title", value, { shouldValidate: true });
//     if (slugAutoSync) {
//       productCreateForm.setValue("slug", slugify(value), { shouldValidate: true });
//     }
//   }

//   function handleSlugChange(value: string) {
//     setSlugAutoSync(false);
//     productCreateForm.setValue("slug", slugify(value), { shouldValidate: true });
//   }

//   function handleEditingTitleChange(value: string) {
//     productEditForm.setValue("title", value, { shouldValidate: true });
//   }

//   function handleEditingCategoryChange(value: string) {
//     productEditForm.setValue("category", value, { shouldValidate: true });
//     productEditForm.setValue("subCategorySlug", "", { shouldValidate: true });
//   }

//   function handleEditingProductImageSelect(file?: File) {
//     if (!file) return;

//     if (editingProductImagePreview.startsWith("blob:")) {
//       URL.revokeObjectURL(editingProductImagePreview);
//     }

//     setEditingProductImageFile(file);
//     setEditingProductImagePreview(URL.createObjectURL(file));
//   }

//   function handleEditingProductImageDrop(event: React.DragEvent<HTMLDivElement>) {
//     event.preventDefault();
//     handleEditingProductImageSelect(event.dataTransfer.files?.[0]);
//   }

//   function startEditingProduct(product: BackendProduct) {
//     setEditingSlug(product.slug);
//     const brandId = typeof product.brand === "string" ? product.brand : (product.brand._id ?? "");
//     const categoryId = typeof product.category === "string" ? product.category : (product.category._id ?? "");
//     productEditForm.reset({
//       title: product.title,
//       slug: product.slug,
//       sku: product.sku,
//       price: String(product.price),
//       oldPrice: product.oldPrice === undefined ? "" : String(product.oldPrice),
//       badge: product.badge ?? "",
//       brand: brandId,
//       category: categoryId,
//       subCategorySlug: product.subCategorySlug ?? "",
//       stock: String(product.stock),
//       rating: String(product.rating),
//       weightKg: String(product.weightKg ?? 1),
//       isFeatured: product.isFeatured,
//       isNoCOD: product.isNoCOD,
//       isActive: product.isActive,
//     });
//     setEditingProductImageFile(null);
//     setEditingProductImagePreview(product.image ?? "");
//   }

//   function stopEditingProduct() {
//     setEditingSlug(null);
//     productEditForm.reset({
//       title: "",
//       slug: "",
//       sku: "",
//       price: "",
//       oldPrice: "",
//       badge: "",
//       brand: "",
//       category: "",
//       subCategorySlug: "",
//       stock: "",
//       rating: "5",
//       weightKg: "1",
//       isFeatured: false,
//       isNoCOD: false,
//       isActive: true,
//     });
//     setEditingProductImageFile(null);
//     setEditingProductImagePreview("");
//   }

//   function handleCategoryChange(value: string) {
//     productCreateForm.setValue("category", value, { shouldValidate: true });
//     productCreateForm.setValue("subCategorySlug", "", { shouldValidate: true });
//   }

//   return (
//     <div className="space-y-6">
//       <Card className="shadow-sm">
//         <CardHeader>
//           <CardTitle>Create product</CardTitle>
//           <CardDescription>Add a new catalog item using backend CRUD.</CardDescription>
//         </CardHeader>
//         <CardContent className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
//           <div className="grid gap-3 md:grid-cols-2">
//             <div className="grid gap-1.5 md:col-span-2">
//               <DashboardInput
//                 placeholder="Title"
//                 {...productCreateForm.register("title", { onChange: e => handleTitleChange(e.target.value) })}
//               />
//               <ErrorText message={productCreateForm.formState.errors.title?.message} />
//             </div>
//             <div className="grid gap-1.5">
//               <DashboardInput
//                 placeholder="Slug"
//                 {...productCreateForm.register("slug", { onChange: e => handleSlugChange(e.target.value) })}
//               />
//               <ErrorText message={productCreateForm.formState.errors.slug?.message} />
//             </div>
//             <div className="grid gap-1.5">
//               <DashboardInput placeholder="SKU" {...productCreateForm.register("sku")} />
//               <ErrorText message={productCreateForm.formState.errors.sku?.message} />
//             </div>
//             <div className="grid gap-1.5">
//               <DashboardInput
//                 placeholder="Price"
//                 type="number"
//                 min={0}
//                 step="0.01"
//                 {...productCreateForm.register("price")}
//               />
//               <ErrorText message={productCreateForm.formState.errors.price?.message} />
//             </div>
//             <DashboardInput
//               placeholder="Old price"
//               type="number"
//               min={0}
//               step="0.01"
//               {...productCreateForm.register("oldPrice")}
//             />
//             <DashboardInput
//               placeholder="Badge. ex: Sale, New, Hot"
//               {...productCreateForm.register("badge")}
//             />
//             <div className="grid gap-1.5">
//               <select
//                 className="h-10 rounded-md border border-input bg-background px-3 text-sm"
//                 {...productCreateForm.register("category", {
//                   onChange: e => handleCategoryChange(e.target.value),
//                 })}
//               >
//                 <option value="">Category</option>
//                 {categories.flatMap(category =>
//                   category._id
//                     ? [
//                         <option key={category._id} value={category._id}>
//                           {category.name}
//                         </option>,
//                       ]
//                     : [],
//                 )}
//               </select>
//               <ErrorText message={productCreateForm.formState.errors.category?.message} />
//             </div>
//             <div className="grid gap-1.5">
//               <select
//                 className="h-10 rounded-md border border-input bg-background px-3 text-sm"
//                 {...productCreateForm.register("subCategorySlug")}
//                 disabled={!createCategory}
//               >
//                 <option value="">Sub-category</option>
//                 {subCategoryOptions.map(subCategory => (
//                   <option key={subCategory.slug} value={subCategory.slug}>
//                     {subCategory.name}
//                   </option>
//                 ))}
//               </select>
//             </div>
//             <div className="grid gap-1.5">
//               <select
//                 className="h-10 rounded-md border border-input bg-background px-3 text-sm"
//                 {...productCreateForm.register("brand")}
//               >
//                 <option value="">Brand</option>
//                 {brandOptions.map(option => (
//                   <option key={option.value} value={option.value}>
//                     {option.label}
//                   </option>
//                 ))}
//               </select>
//               <ErrorText message={productCreateForm.formState.errors.brand?.message} />
//             </div>
//             <div className="grid gap-1.5">
//               <DashboardInput
//                 placeholder="Stock quantity"
//                 type="number"
//                 min={0}
//                 step={1}
//                 {...productCreateForm.register("stock")}
//               />
//               <ErrorText message={productCreateForm.formState.errors.stock?.message} />
//             </div>
//             <div className="grid gap-1.5">
//               <DashboardInput
//                 placeholder="Rating"
//                 type="number"
//                 min={0}
//                 step="0.1"
//                 {...productCreateForm.register("rating")}
//               />
//               <ErrorText message={productCreateForm.formState.errors.rating?.message} />
//             </div>
//             <div className="grid gap-1.5">
//               <DashboardInput
//                 placeholder="Weight (kg)"
//                 type="number"
//                 min={0.01}
//                 step="0.01"
//                 {...productCreateForm.register("weightKg")}
//               />
//               <ErrorText message={productCreateForm.formState.errors.weightKg?.message} />
//             </div>
//             <label className="flex items-center gap-2 self-start text-sm">
//               <input type="checkbox" {...productCreateForm.register("isFeatured")} />
//               Featured
//             </label>
//             <label className="flex items-center gap-2 self-start text-sm">
//               <input type="checkbox" {...productCreateForm.register("isNoCOD")} />
//               No COD
//             </label>
//             <label className="flex items-center gap-2 self-start text-sm">
//               <input type="checkbox" {...productCreateForm.register("isActive")} />
//               Active
//             </label>
//             <div className="md:col-span-2">
//               <Button
//                 type="button"
//                 disabled={isPending || isCreating}
//                 className="gap-2"
//                 onClick={productCreateForm.handleSubmit(async values => {
//                   if (!productImageFile) {
//                     toast.error("Product image is required.");
//                     return;
//                   }

//                   setIsCreating(true);
//                   const result = await createProduct({
//                     title: values.title.trim(),
//                     slug: values.slug.trim(),
//                     sku: values.sku.trim(),
//                     image: productImageFile,
//                     price: Number(values.price),
//                     oldPrice: values.oldPrice?.trim() ? Number(values.oldPrice) : undefined,
//                     badge: values.badge?.trim() || undefined,
//                     brand: values.brand.trim(),
//                     category: values.category.trim(),
//                     subCategorySlug: values.subCategorySlug?.trim() || undefined,
//                     stock: Number(values.stock),
//                     rating: Number(values.rating),
//                     weightKg: Number(values.weightKg),
//                     isFeatured: values.isFeatured,
//                     isNoCOD: values.isNoCOD,
//                     isActive: values.isActive,
//                   });
//                   setIsCreating(false);

//                   if (!result?.success)
//                     return refresh(result?.message ?? "Failed to create product.", "error");

//                   productCreateForm.reset({
//                     title: "",
//                     slug: "",
//                     sku: "",
//                     price: "",
//                     oldPrice: "",
//                     badge: "",
//                     brand: "",
//                     category: "",
//                     subCategorySlug: "",
//                     stock: "",
//                     rating: "5",
//                     weightKg: "1",
//                     isFeatured: false,
//                     isNoCOD: false,
//                     isActive: true,
//                   });
//                   setProductImageFile(null);
//                   setProductImagePreview("");
//                   setSlugAutoSync(true);
//                   refresh(result.message ?? "Product created successfully.", "success");
//                 })}
//               >
//                 <Plus className="size-4" />
//                 {isCreating ? "Creating product..." : "Create product"}
//               </Button>
//             </div>
//           </div>
//           <div className="justify-self-stretch xl:sticky xl:top-6">
//             <div
//               role="button"
//               tabIndex={0}
//               onClick={() => productImageInputRef.current?.click()}
//               onKeyDown={event => {
//                 if (event.key === "Enter" || event.key === " ") {
//                   event.preventDefault();
//                   productImageInputRef.current?.click();
//                 }
//               }}
//               className="rounded-2xl border-2 border-dashed border-border/70 bg-background/80 p-3 transition hover:border-primary/40"
//             >
//               <div className="flex flex-col gap-3">
//                 <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
//                   <UploadCloud className="size-5" />
//                 </div>
//                 <div className="min-w-0 flex-1">
//                   <div className="text-sm font-semibold text-foreground">Product image</div>
//                   <p className="text-xs text-muted-foreground">Click or drop to upload.</p>
//                   <div className="mt-2 aspect-square overflow-hidden rounded-xl border bg-muted">
//                     {productImagePreview ? (
//                       <Image
//                         height={500}
//                         width={500}
//                         src={productImagePreview}
//                         alt="Product preview"
//                         className="h-full w-full object-cover"
//                       />
//                     ) : (
//                       <div className="flex h-full items-center justify-center gap-2 text-sm text-muted-foreground">
//                         <ImagePlus className="size-4" />
//                         Preview will appear here
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               </div>
//             </div>
//             <input
//               ref={productImageInputRef}
//               type="file"
//               accept="image/*"
//               className="sr-only"
//               onChange={event => {
//                 const file = event.target.files?.[0];
//                 if (file) {
//                   if (productImagePreview.startsWith("blob:")) {
//                     URL.revokeObjectURL(productImagePreview);
//                   }
//                   setProductImageFile(file);
//                   setProductImagePreview(URL.createObjectURL(file));
//                 }
//                 event.currentTarget.value = "";
//               }}
//             />
//           </div>
//         </CardContent>
//       </Card>

//       <Card className="shadow-sm">
//         <CardHeader className="flex flex-row items-center justify-between space-y-0">
//           <div>
//             <CardTitle>Products</CardTitle>
//             <CardDescription>
//               Showing {products.length} of {paginationMeta.total} items
//             </CardDescription>
//           </div>
//           <TableFilter
//             key={searchTerm}
//             value={search}
//             onChange={handleSearchChange}
//             placeholder="Search products..."
//           />
//         </CardHeader>
//         <CardContent>
//           <TooltipProvider delayDuration={150}>
//             <Table>
//               <TableHeader>
//                 <TableRow>
//                   <TableHead>Product Details</TableHead>
//                   <TableHead>Brand</TableHead>
//                   <TableHead>SKU</TableHead>
//                   <TableHead>Badge</TableHead>
//                   <TableHead>Status</TableHead>
//                   <TableHead>Stock</TableHead>
//                   <TableHead>Featured</TableHead>
//                   <TableHead>No COD</TableHead>
//                   <TableHead>Weight</TableHead>
//                   <TableHead>Price</TableHead>
//                   <TableHead className="text-right">Actions</TableHead>
//                 </TableRow>
//               </TableHeader>
//               <TableBody>
//                 {products.map(product => {
//                   const isEditing = editingSlug === product.slug;
//                   return (
//                     <Fragment key={product.sku}>
//                       <TableRow>
//                         <TableCell className="min-w-0 whitespace-normal font-medium">
//                           <Tooltip>
//                             <TooltipTrigger asChild>
//                               <button
//                                 type="button"
//                                 className="group grid w-full min-w-0 gap-0.5 rounded-md px-1 py-0.5 text-left outline-none transition hover:bg-muted/60 focus-visible:bg-muted/60"
//                               >
//                                 <span className="truncate text-sm font-medium text-foreground">
//                                   {product.title}
//                                 </span>
//                                 <span className="truncate text-xs font-normal text-muted-foreground transition group-hover:text-foreground/70">
//                                   Slug: {product.slug}
//                                 </span>
//                               </button>
//                             </TooltipTrigger>
//                             <TooltipContent className="block w-80 max-w-[20rem] rounded-xl border border-border bg-background p-4 text-foreground shadow-xl [&>svg]:bg-background [&>svg]:fill-background">
//                               <div className="grid gap-3">
//                                 <div className="grid gap-0.5">
//                                   <p className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
//                                     Product info
//                                   </p>
//                                   <p className="text-sm font-semibold leading-tight">{product.title}</p>
//                                 </div>
//                                 <div className="grid gap-2 text-xs">
//                                   <div className="flex items-start justify-between gap-3">
//                                     <span className="text-muted-foreground">Slug</span>
//                                     <span className="break-all text-right font-medium">{product.slug}</span>
//                                   </div>
//                                   <div className="flex items-start justify-between gap-3">
//                                     <span className="text-muted-foreground">Category</span>
//                                     <span className="text-right font-medium">
//                                       {resolveProductRefLabel(product.category)}
//                                     </span>
//                                   </div>
//                                   <div className="flex items-start justify-between gap-3">
//                                     <span className="text-muted-foreground">Sub category</span>
//                                     <span className="text-right font-medium">
//                                       {product.subCategorySlug?.trim() || "-"}
//                                     </span>
//                                   </div>
//                                   <div className="flex items-start justify-between gap-3">
//                                     <span className="text-muted-foreground">Created at</span>
//                                     <span className="text-right font-medium">
//                                       {formatDashboardDate(product.createdAt, { time: true })}
//                                     </span>
//                                   </div>
//                                   <div className="flex items-start justify-between gap-3">
//                                     <span className="text-muted-foreground">Updated at</span>
//                                     <span className="text-right font-medium">
//                                       {formatDashboardDate(product.updatedAt, { time: true })}
//                                     </span>
//                                   </div>
//                                 </div>
//                               </div>
//                             </TooltipContent>
//                           </Tooltip>
//                         </TableCell>
//                         <TableCell className="min-w-0">{resolveProductRefLabel(product.brand)}</TableCell>
//                         <TableCell>{product.sku}</TableCell>
//                         <TableCell className="min-w-0">
//                           {product.badge ? (
//                             <Badge variant="outline" className="max-w-28 truncate">
//                               {product.badge}
//                             </Badge>
//                           ) : (
//                             <Badge variant="secondary">None</Badge>
//                           )}
//                         </TableCell>
//                         <TableCell className="min-w-0">
//                           <Badge variant={product.isActive ? "default" : "secondary"}>
//                             {product.isActive ? "Active" : "Inactive"}
//                           </Badge>
//                         </TableCell>
//                         <TableCell className="min-w-0">
//                           <Badge variant="secondary">{product.stock}</Badge>
//                         </TableCell>
//                         <TableCell className="min-w-0">
//                           <Badge variant={product.isFeatured ? "default" : "secondary"}>
//                             {product.isFeatured ? "Featured" : "No"}
//                           </Badge>
//                         </TableCell>
//                         <TableCell className="min-w-0">
//                           <Badge variant={product.isNoCOD ? "destructive" : "secondary"}>
//                             {product.isNoCOD ? "Blocked" : "Allowed"}
//                           </Badge>
//                         </TableCell>
//                         <TableCell className="min-w-0">{(product.weightKg ?? 1).toFixed(2)} kg</TableCell>
//                         <TableCell className="min-w-0">{product.price}</TableCell>
//                         <TableCell className="text-right">
//                           <div className="flex justify-end gap-2">
//                             {isEditing ? (
//                               <>
//                                 <Button
//                                   size="sm"
//                                   disabled={isPending || isEditingSaving}
//                                   onClick={productEditForm.handleSubmit(async values => {
//                                     setIsEditingSaving(true);
//                                     const result = await updateProduct(product.slug, {
//                                       title: values.title.trim(),
//                                       slug: values.slug.trim(),
//                                       sku: values.sku.trim(),
//                                       price: Number(values.price),
//                                       oldPrice: values.oldPrice?.trim() ? Number(values.oldPrice) : undefined,
//                                       badge: values.badge?.trim() || undefined,
//                                       brand: values.brand.trim(),
//                                       category: values.category.trim(),
//                                       subCategorySlug: values.subCategorySlug?.trim() || undefined,
//                                       stock: Number(values.stock),
//                                       rating: Number(values.rating),
//                                       weightKg: Number(values.weightKg),
//                                       isFeatured: values.isFeatured,
//                                       isNoCOD: values.isNoCOD,
//                                       isActive: values.isActive,
//                                       image: editingProductImageFile ?? undefined,
//                                     });
//                                     setIsEditingSaving(false);

//                                     if (!result?.success) {
//                                       return refresh(result?.message ?? "Failed to update product.", "error");
//                                     }

//                                     stopEditingProduct();
//                                     refresh(result.message ?? "Product updated successfully.", "success");
//                                   })}
//                                 >
//                                   {isEditingSaving ? "Saving..." : "Save"}
//                                 </Button>
//                                 <Button size="sm" variant="outline" onClick={stopEditingProduct}>
//                                   Cancel
//                                 </Button>
//                               </>
//                             ) : (
//                               <>
//                                 <Button
//                                   size="sm"
//                                   variant="outline"
//                                   onClick={() => {
//                                     startEditingProduct(product);
//                                   }}
//                                 >
//                                   <Pencil className="size-4" />
//                                 </Button>
//                                 <Button
//                                   size="sm"
//                                   variant="outline"
//                                   disabled={isPending}
//                                   onClick={() =>
//                                     startTransition(async () => {
//                                       const result = await deleteProduct(product.slug);
//                                       if (!result?.success)
//                                         return refresh(
//                                           result?.message ?? "Failed to delete product.",
//                                           "error",
//                                         );
//                                       refresh(result.message ?? "Product deleted successfully.", "success");
//                                     })
//                                   }
//                                 >
//                                   <Trash2 className="size-4" />
//                                 </Button>
//                               </>
//                             )}
//                           </div>
//                         </TableCell>
//                       </TableRow>
//                       {isEditing ? (
//                         <TableRow key={`${product.sku}-edit`}>
//                           <TableCell colSpan={11} className="bg-muted/20">
//                             <div className="grid gap-6 rounded-xl border bg-background p-4 xl:grid-cols-[minmax(0,1fr)_340px]">
//                               <div className="grid gap-3 md:grid-cols-2">
//                                 <div className="grid gap-1.5 md:col-span-2">
//                                   <DashboardInput
//                                     placeholder="Title"
//                                     {...productEditForm.register("title", {
//                                       onChange: e => handleEditingTitleChange(e.target.value),
//                                     })}
//                                   />
//                                   <ErrorText message={productEditForm.formState.errors.title?.message} />
//                                 </div>

//                                 <div className="grid gap-1.5 md:col-span-2">
//                                   <div className="flex items-center gap-2">
//                                     <span>Slug</span>
//                                     <span className="text-xs font-normal text-destructive">
//                                       (Editing is bad for seo)
//                                     </span>
//                                   </div>
//                                   <DashboardInput
//                                     placeholder="Slug"
//                                     {...productEditForm.register("slug", {
//                                       onChange: e => {
//                                         productEditForm.setValue("slug", slugify(e.target.value), {
//                                           shouldValidate: true,
//                                         });
//                                       },
//                                     })}
//                                   />
//                                   <ErrorText message={productEditForm.formState.errors.slug?.message} />
//                                 </div>

//                                 <div className="grid gap-1.5">
//                                   <DashboardInput
//                                     placeholder="Price"
//                                     type="number"
//                                     min={0}
//                                     step="0.01"
//                                     {...productEditForm.register("price")}
//                                   />
//                                   <ErrorText message={productEditForm.formState.errors.price?.message} />
//                                 </div>

//                                 <div className="grid gap-1.5">
//                                   <DashboardInput
//                                     placeholder="Old price"
//                                     type="number"
//                                     min={0}
//                                     step="0.01"
//                                     {...productEditForm.register("oldPrice")}
//                                   />
//                                   <ErrorText message={productEditForm.formState.errors.oldPrice?.message} />
//                                 </div>

//                                 <div className="grid gap-1.5">
//                                   <DashboardInput
//                                     placeholder="Badge. ex: Sale, New, Hot"
//                                     {...productEditForm.register("badge")}
//                                   />
//                                   <ErrorText message={productEditForm.formState.errors.badge?.message} />
//                                 </div>

//                                 <div className="grid gap-1.5">
//                                   <DashboardInput placeholder="SKU" {...productEditForm.register("sku")} />
//                                   <ErrorText message={productEditForm.formState.errors.sku?.message} />
//                                 </div>

//                                 <div className="grid gap-1.5">
//                                   <select
//                                     className="h-10 rounded-md border border-input bg-background px-3 text-sm"
//                                     {...productEditForm.register("category", {
//                                       onChange: e => handleEditingCategoryChange(e.target.value),
//                                     })}
//                                   >
//                                     <option value="">Category</option>
//                                     {categories.flatMap(category =>
//                                       category._id
//                                         ? [
//                                             <option key={category._id} value={category._id}>
//                                               {category.name}
//                                             </option>,
//                                           ]
//                                         : [],
//                                     )}
//                                   </select>
//                                   <ErrorText message={productEditForm.formState.errors.category?.message} />
//                                 </div>

//                                 <div className="grid gap-1.5">
//                                   <select
//                                     className="h-10 rounded-md border border-input bg-background px-3 text-sm"
//                                     {...productEditForm.register("subCategorySlug")}
//                                     disabled={!editingCategory}
//                                   >
//                                     <option value="">Sub-category</option>
//                                     {editingSubCategoryOptions.map(subCategory => (
//                                       <option key={subCategory.slug} value={subCategory.slug}>
//                                         {subCategory.name}
//                                       </option>
//                                     ))}
//                                   </select>
//                                   <ErrorText
//                                     message={productEditForm.formState.errors.subCategorySlug?.message}
//                                   />
//                                 </div>

//                                 <div className="grid gap-1.5">
//                                   <select
//                                     className="h-10 rounded-md border border-input bg-background px-3 text-sm"
//                                     {...productEditForm.register("brand")}
//                                   >
//                                     <option value="">Brand</option>
//                                     {brandOptions.map(option => (
//                                       <option key={option.value} value={option.value}>
//                                         {option.label}
//                                       </option>
//                                     ))}
//                                   </select>
//                                   <ErrorText message={productEditForm.formState.errors.brand?.message} />
//                                 </div>

//                                 <div className="grid gap-1.5">
//                                   <DashboardInput
//                                     placeholder="Stock quantity"
//                                     type="number"
//                                     min={0}
//                                     step={1}
//                                     {...productEditForm.register("stock")}
//                                   />
//                                   <ErrorText message={productEditForm.formState.errors.stock?.message} />
//                                 </div>

//                                 <div className="grid gap-1.5">
//                                   <DashboardInput
//                                     placeholder="Rating"
//                                     type="number"
//                                     min={0}
//                                     step="0.1"
//                                     {...productEditForm.register("rating")}
//                                   />
//                                   <ErrorText message={productEditForm.formState.errors.rating?.message} />
//                                 </div>

//                                 <div className="grid gap-1.5">
//                                   <DashboardInput
//                                     placeholder="Weight (kg)"
//                                     type="number"
//                                     min={0.01}
//                                     step="0.01"
//                                     {...productEditForm.register("weightKg")}
//                                   />
//                                   <ErrorText message={productEditForm.formState.errors.weightKg?.message} />
//                                 </div>

//                                 <label className="flex items-center gap-2 text-sm">
//                                   <input type="checkbox" {...productEditForm.register("isFeatured")} />
//                                   Featured
//                                 </label>
//                                 <label className="flex items-center gap-2 text-sm">
//                                   <input type="checkbox" {...productEditForm.register("isNoCOD")} />
//                                   No COD
//                                 </label>
//                                 <label className="flex items-center gap-2 text-sm">
//                                   <input type="checkbox" {...productEditForm.register("isActive")} />
//                                   Active
//                                 </label>
//                               </div>

//                               <div className="justify-self-stretch xl:sticky xl:top-6">
//                                 <div
//                                   role="button"
//                                   tabIndex={0}
//                                   onClick={() => {
//                                     editingProductImageInputRef.current?.click();
//                                   }}
//                                   onKeyDown={event => {
//                                     if (event.key === "Enter" || event.key === " ") {
//                                       event.preventDefault();
//                                       editingProductImageInputRef.current?.click();
//                                     }
//                                   }}
//                                   onDragOver={event => event.preventDefault()}
//                                   onDrop={handleEditingProductImageDrop}
//                                   className="rounded-2xl border-2 border-dashed border-border/70 bg-background/80 p-3 transition hover:border-primary/40"
//                                 >
//                                   <div className="flex flex-col gap-3">
//                                     <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
//                                       <UploadCloud className="size-5" />
//                                     </div>
//                                     <div className="min-w-0 flex-1">
//                                       <div className="text-sm font-semibold text-foreground">
//                                         Product image
//                                       </div>
//                                       <p className="text-xs text-muted-foreground">
//                                         Click or drop to replace.
//                                       </p>
//                                       <div className="mt-2 aspect-square overflow-hidden rounded-xl border bg-muted">
//                                         {editingProductImagePreview ? (
//                                           <Image
//                                             height={500}
//                                             width={500}
//                                             src={editingProductImagePreview}
//                                             alt="Editing product preview"
//                                             className="h-full w-full object-cover"
//                                           />
//                                         ) : (
//                                           <div className="flex h-full items-center justify-center gap-2 text-sm text-muted-foreground">
//                                             <ImagePlus className="size-4" />
//                                             Preview will appear here
//                                           </div>
//                                         )}
//                                       </div>
//                                     </div>
//                                   </div>
//                                 </div>
//                                 <input
//                                   ref={editingProductImageInputRef}
//                                   type="file"
//                                   accept="image/*"
//                                   className="sr-only"
//                                   onChange={event => {
//                                     handleEditingProductImageSelect(event.target.files?.[0]);
//                                     event.currentTarget.value = "";
//                                   }}
//                                 />
//                               </div>
//                             </div>
//                           </TableCell>
//                         </TableRow>
//                       ) : null}
//                     </Fragment>
//                   );
//                 })}
//               </TableBody>
//             </Table>
//           </TooltipProvider>
//           {paginationMeta.total > 0 && (
//             <div className="mt-4 border-t pt-4">
//               <TablePagination
//                 page={paginationMeta.page}
//                 limit={paginationMeta.limit}
//                 total={paginationMeta.total}
//                 onPageChange={nextPage => updateProductQuery({ page: nextPage })}
//                 onLimitChange={l => {
//                   updateProductQuery({ page: 1, limit: l });
//                 }}
//               />
//             </div>
//           )}
//         </CardContent>
//       </Card>
//     </div>
//   );
// }
