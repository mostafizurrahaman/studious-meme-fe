'use client';

import {
  Fragment,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  ChevronDown,
  ImagePlus,
  Pencil,
  Plus,
  Trash2,
  UploadCloud,
} from 'lucide-react';
import { useForm, useWatch } from 'react-hook-form';
import { z } from 'zod';
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
import { Badge } from '@/components/ui/badge';
import {
  createCategory,
  createCategorySubCategory,
  deleteCategory,
  deleteCategorySubCategory,
  updateCategory,
  updateCategorySubCategory,
} from '@/services/Category';
import { slugify } from '@/lib/slug';
import { formatDashboardDate } from '@/lib/formatDate';
import Image from 'next/image';
import { makeZodResolver } from '@/lib/form-validation';
import { DeleteConfirmationDialog } from '@/components/dashboard/DeleteConfirmationDialog';
import { AddCategoryModal } from '@/app/(dashboard)/dashboard/super-admin/categories/_components/add-category';
import { EditCategoryModal } from '@/app/(dashboard)/dashboard/super-admin/categories/_components/edit-category';

type CategoryRow = {
  _id: string;
  name: string;
  slug?: string;
  image?: string;
  description?: string;
  accent?: string;
  metaTitle?: string;
  metaDescription?: string;
  totalNews?: number;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
  subCategories?: Array<{
    name: string;
    slug: string;
    image?: string;
    description?: string;
    accent?: string;
    isActive?: boolean;
    createdAt?: string;
    updatedAt?: string;
  }>;
};

type DashboardCategoriesManagerProps = {
  categories: CategoryRow[];
};

function sliceText(value?: string, maxLength = 44) {
  if (!value) return '-';
  return value.length > maxLength
    ? `${value.slice(0, maxLength).trim()}…`
    : value;
}

function getCategoryDisplayName(category: CategoryRow) {
  return category.name?.trim() || category.slug || 'Unnamed category';
}

function AccentColorField({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  const colorValue = /^#([0-9a-fA-F]{6})$/.test(value) ? value : '#f97316';

  return (
    <div className="flex h-fit w-full max-w-55 min-w-0 items-center gap-2 rounded-xl border border-input bg-background px-2 py-1.5">
      <label className="relative flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-lg border bg-muted">
        <span className="sr-only">Pick accent color</span>
        <span
          className="absolute inset-0"
          style={{ backgroundColor: colorValue }}
        />
        <input
          type="color"
          value={colorValue}
          onChange={event => onChange(event.target.value)}
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
          aria-label="Pick accent color"
        />
      </label>
      <DashboardInput
        value={value}
        onChange={event => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-fit min-w-0 flex-1 border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
      />
    </div>
  );
}

const categoryEditSchema = z.object({
  name: z
    .string({ error: 'Category name is required!' })
    .trim()
    .min(1, { message: 'Category name is required!' }),
  slug: z
    .string({ error: 'Category slug is required!' })
    .trim()
    .min(1, { message: 'Category slug is required!' }),
  description: z
    .string({ error: 'Category description is required!' })
    .trim()
    .min(1, { message: 'Category description is required!' }),
  accent: z.string().trim().optional(),
  metaTitle: z.string().trim().optional(),
  metaDescription: z.string().trim().optional(),
});

const subCategoryEditSchema = z.object({
  name: z
    .string({ error: 'Sub-category name is required!' })
    .trim()
    .min(1, { message: 'Sub-category name is required!' }),
  slug: z
    .string({ error: 'Sub-category slug is required!' })
    .trim()
    .min(1, { message: 'Sub-category slug is required!' }),
  description: z
    .string({ error: 'Sub-category description is required!' })
    .trim()
    .min(1, { message: 'Sub-category description is required!' }),
  accent: z.string().trim().optional(),
  isActive: z.boolean().default(true),
});

type CategoryEditValues = z.infer<typeof categoryEditSchema>;
type SubCategoryEditValues = z.infer<typeof subCategoryEditSchema>;

function ErrorText({ message }: { message?: string }) {
  if (!message) return null;

  return <p className="text-xs text-destructive">{message}</p>;
}

interface ICategory {
  _id: string;
  name: string;
  slug: string;
  accent?: string;
  description?: string;
  metaTitle?: string;
  metaDescription?: string;
  image?: string;
}

export function DashboardCategoriesManager({
  categories,
}: DashboardCategoriesManagerProps) {
  // ** New lines:
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<CategoryRow | null>(
    null,
  );

  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [newSlugAutoSync, setNewSlugAutoSync] = useState(true);

  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [editingSlugAutoSync, setEditingSlugAutoSync] = useState(true);
  const [expandedSlug, setExpandedSlug] = useState<string | null>(null);
  const [newSubCategory, setNewSubCategory] = useState<
    Record<
      string,
      { name: string; slug: string; description: string; accent: string }
    >
  >({});
  const [newSubCategoryErrors, setNewSubCategoryErrors] = useState<
    Record<string, { name?: string; slug?: string; description?: string }>
  >({});
  const [newSubCategorySlugAutoSync, setNewSubCategorySlugAutoSync] = useState<
    Record<string, boolean>
  >({});
  const [editingSubCategoryKey, setEditingSubCategoryKey] = useState<
    string | null
  >(null);
  const [editingSubCategorySlugAutoSync, setEditingSubCategorySlugAutoSync] =
    useState(true);
  const [categoryImageFile, setCategoryImageFile] = useState<File | null>(null);
  const [categoryImagePreview, setCategoryImagePreview] = useState('');
  const [editingCategoryImageFile, setEditingCategoryImageFile] =
    useState<File | null>(null);
  const [editingCategoryImagePreview, setEditingCategoryImagePreview] =
    useState('');
  const [categoryDragging, setCategoryDragging] = useState(false);
  const [editingCategoryDragging, setEditingCategoryDragging] = useState(false);
  const [subCategoryImageFiles, setSubCategoryImageFiles] = useState<
    Record<string, File | null>
  >({});
  const [subCategoryImagePreviews, setSubCategoryImagePreviews] = useState<
    Record<string, string>
  >({});
  const [subCategoryDraggingKey, setSubCategoryDraggingKey] = useState<
    string | null
  >(null);
  const [editingSubCategoryImageFile, setEditingSubCategoryImageFile] =
    useState<File | null>(null);
  const [editingSubCategoryImagePreview, setEditingSubCategoryImagePreview] =
    useState('');
  const [editingSubCategoryDragging, setEditingSubCategoryDragging] =
    useState(false);
  const [pendingDelete, setPendingDelete] = useState<
    | { type: 'category'; categorySlug: string; label: string }
    | {
        type: 'sub-category';
        categorySlug: string;
        subCategorySlug: string;
        label: string;
      }
    | null
  >(null);
  const categoryImageInputRef = useRef<HTMLInputElement>(null);
  const editingCategoryImageInputRef = useRef<HTMLInputElement>(null);
  const editingSubCategoryImageInputRef = useRef<HTMLInputElement>(null);

  const categoryCreateForm = useForm<{
    name: string;
    slug: string;
    description: string;
    accent: string;
    metaTitle: string;
    metaDescription: string;
  }>({
    resolver: makeZodResolver(
      z.object({
        name: z
          .string({ error: 'Category name is required!' })
          .trim()
          .min(1, { message: 'Category name is required!' }),
        slug: z
          .string({ error: 'Category slug is required!' })
          .trim()
          .min(1, { message: 'Category slug is required!' }),
        description: z
          .string({ error: 'Category description is required!' })
          .trim()
          .min(1, { message: 'Category description is required!' }),
        accent: z.string().trim().optional(),
        metaTitle: z.string().trim().optional(),
        metaDescription: z.string().trim().optional(),
      }),
    ),
    defaultValues: {
      name: '',
      slug: '',
      description: '',
      accent: '',
      metaTitle: '',
      metaDescription: '',
    },
    mode: 'onTouched',
  });

  const categoryCreateName = useWatch({
    control: categoryCreateForm.control,
    name: 'name',
    defaultValue: '',
  });

  const categoryCreateAccent =
    useWatch({ control: categoryCreateForm.control, name: 'accent' }) ?? '';

  const categoryEditForm = useForm<CategoryEditValues>({
    resolver: makeZodResolver(categoryEditSchema),
    defaultValues: {
      name: '',
      slug: '',
      description: '',
      accent: '',
      metaTitle: '',
      metaDescription: '',
    },
    mode: 'onTouched',
  });

  const subCategoryEditForm = useForm<SubCategoryEditValues>({
    resolver: makeZodResolver(subCategoryEditSchema),
    defaultValues: {
      name: '',
      slug: '',
      description: '',
      accent: '',
      isActive: true,
    },
    mode: 'onTouched',
  });

  const categoryEditName =
    useWatch({ control: categoryEditForm.control, name: 'name' }) ?? '';
  const categoryEditAccent =
    useWatch({ control: categoryEditForm.control, name: 'accent' }) ?? '';
  const subCategoryEditName =
    useWatch({ control: subCategoryEditForm.control, name: 'name' }) ?? '';
  const subCategoryEditAccent =
    useWatch({ control: subCategoryEditForm.control, name: 'accent' }) ?? '';
  const subCategoryEditIsActive =
    useWatch({ control: subCategoryEditForm.control, name: 'isActive' }) ??
    true;

  const visibleCategories = useMemo(() => categories, [categories]);

  useEffect(() => {
    return () => {
      [
        categoryImagePreview,
        editingCategoryImagePreview,
        editingSubCategoryImagePreview,
      ]
        .filter((src): src is string => Boolean(src) && src.startsWith('blob:'))
        .forEach(src => URL.revokeObjectURL(src));
      Object.values(subCategoryImagePreviews)
        .filter((src): src is string => Boolean(src) && src.startsWith('blob:'))
        .forEach(src => URL.revokeObjectURL(src));
    };
  }, [
    categoryImagePreview,
    editingCategoryImagePreview,
    editingSubCategoryImagePreview,
    subCategoryImagePreviews,
  ]);

  useEffect(() => {
    if (editingSlugAutoSync) {
      categoryEditForm.setValue('slug', slugify(categoryEditName), {
        shouldValidate: true,
      });
    }
  }, [categoryEditForm, categoryEditName, editingSlugAutoSync]);

  useEffect(() => {
    if (editingSubCategorySlugAutoSync) {
      subCategoryEditForm.setValue('slug', slugify(subCategoryEditName), {
        shouldValidate: true,
      });
    }
  }, [
    editingSubCategorySlugAutoSync,
    subCategoryEditForm,
    subCategoryEditName,
  ]);

  useEffect(() => {
    if (newSlugAutoSync && categoryCreateName.trim()) {
      categoryCreateForm.setValue('slug', slugify(categoryCreateName), {
        shouldDirty: true,
        shouldTouch: false,
        shouldValidate: false,
      });
    }
  }, [categoryCreateForm, categoryCreateName, newSlugAutoSync]);

  function handleNewCategoryNameChange(value: string) {
    categoryCreateForm.setValue('name', value, { shouldValidate: true });
    if (newSlugAutoSync) {
      categoryCreateForm.setValue('slug', slugify(value), {
        shouldDirty: true,
        shouldTouch: false,
        shouldValidate: false,
      });
      if (!value.trim()) {
        categoryCreateForm.clearErrors('slug');
      }
    }
  }

  function handleNewCategorySlugChange(value: string) {
    setNewSlugAutoSync(false);
    categoryCreateForm.setValue('slug', slugify(value), {
      shouldValidate: true,
    });
  }

  function handleEditingCategoryNameChange(value: string) {
    if (editingSlugAutoSync) {
      categoryEditForm.setValue('slug', slugify(value), {
        shouldValidate: true,
      });
    }
    categoryEditForm.setValue('name', value, { shouldValidate: true });
  }

  function handleEditingCategorySlugChange(value: string) {
    setEditingSlugAutoSync(false);
    categoryEditForm.setValue('slug', slugify(value), { shouldValidate: true });
  }

  function handleNewSubCategoryNameChange(categorySlug: string, value: string) {
    setNewSubCategory(current => {
      const existing = current[categorySlug] ?? {
        name: '',
        slug: '',
        description: '',
        accent: '',
      };
      const shouldSync = newSubCategorySlugAutoSync[categorySlug] ?? true;

      return {
        ...current,
        [categorySlug]: {
          ...existing,
          name: value,
          slug: shouldSync ? slugify(value) : existing.slug,
        },
      };
    });
    setNewSubCategoryErrors(current => ({
      ...current,
      [categorySlug]: { ...current[categorySlug], name: '' },
    }));
  }

  function handleNewSubCategorySlugChange(categorySlug: string, value: string) {
    setNewSubCategorySlugAutoSync(current => ({
      ...current,
      [categorySlug]: false,
    }));
    setNewSubCategory(current => {
      const existing = current[categorySlug] ?? {
        name: '',
        slug: '',
        description: '',
        accent: '',
      };

      return {
        ...current,
        [categorySlug]: {
          ...existing,
          slug: slugify(value),
        },
      };
    });
    setNewSubCategoryErrors(current => ({
      ...current,
      [categorySlug]: { ...current[categorySlug], slug: '' },
    }));
  }

  function handleEditingSubCategoryNameChange(value: string) {
    subCategoryEditForm.setValue('name', value, { shouldValidate: true });
    if (editingSubCategorySlugAutoSync) {
      subCategoryEditForm.setValue('slug', slugify(value), {
        shouldValidate: true,
      });
    }
  }

  function handleNewSubCategoryAccentChange(
    categorySlug: string,
    value: string,
  ) {
    setNewSubCategory(current => {
      const existing = current[categorySlug] ?? {
        name: '',
        slug: '',
        description: '',
        accent: '',
      };

      return {
        ...current,
        [categorySlug]: {
          ...existing,
          accent: value,
        },
      };
    });
  }

  function handleEditingSubCategorySlugChange(value: string) {
    setEditingSubCategorySlugAutoSync(false);
    subCategoryEditForm.setValue('slug', slugify(value), {
      shouldValidate: true,
    });
  }

  function handleCategoryImageSelect(file?: File) {
    if (!file) return;
    if (categoryImagePreview.startsWith('blob:'))
      URL.revokeObjectURL(categoryImagePreview);
    setCategoryImageFile(file);
    setCategoryImagePreview(URL.createObjectURL(file));
  }

  function handleEditingCategoryImageSelect(file?: File) {
    if (!file) return;
    if (editingCategoryImagePreview.startsWith('blob:'))
      URL.revokeObjectURL(editingCategoryImagePreview);
    setEditingCategoryImageFile(file);
    setEditingCategoryImagePreview(URL.createObjectURL(file));
  }

  function handleSubCategoryImageSelect(categorySlug: string, file?: File) {
    if (!file) return;
    const current = subCategoryImagePreviews[categorySlug] ?? '';
    if (current.startsWith('blob:')) URL.revokeObjectURL(current);
    setSubCategoryImageFiles(currentFiles => ({
      ...currentFiles,
      [categorySlug]: file,
    }));
    setSubCategoryImagePreviews(currentPreviews => ({
      ...currentPreviews,
      [categorySlug]: URL.createObjectURL(file),
    }));
  }

  function handleEditingSubCategoryImageSelect(file?: File) {
    if (!file) return;
    if (editingSubCategoryImagePreview.startsWith('blob:')) {
      URL.revokeObjectURL(editingSubCategoryImagePreview);
    }
    setEditingSubCategoryImageFile(file);
    setEditingSubCategoryImagePreview(URL.createObjectURL(file));
  }

  function refreshWithToast(message: string, type: 'success' | 'error') {
    if (type === 'success') {
      toast.success(message);
    } else {
      toast.error(message);
    }

    router.refresh();
  }

  function handleCreate() {
    if (!categoryImageFile) {
      toast.error('Category image is required.');
      return;
    }

    categoryCreateForm.handleSubmit(async values => {
      startTransition(async () => {
        const result = await createCategory({
          name: values.name.trim(),
          slug: values.slug.trim(),
          image: categoryImageFile,
          description: values.description?.trim() ?? '',
          accent: values.accent?.trim() || undefined,
          metaTitle: values.metaTitle?.trim() || undefined,
          metaDescription: values.metaDescription?.trim() || undefined,
        });

        if (!result?.success) {
          refreshWithToast(
            result?.message ?? 'Failed to create category.',
            'error',
          );
          return;
        }

        categoryCreateForm.reset({
          name: '',
          slug: '',
          description: '',
          accent: '',
          metaTitle: '',
          metaDescription: '',
        });
        setCategoryImageFile(null);
        setCategoryImagePreview('');
        setNewSlugAutoSync(true);
        refreshWithToast(
          result.message ?? 'Category created successfully.',
          'success',
        );
      });
    })();
  }

  function handleDelete(slug?: string) {
    if (!slug) {
      toast.error('A category slug is required to delete this item.');
      return;
    }

    startTransition(async () => {
      const result = await deleteCategory(slug);

      if (!result?.success) {
        refreshWithToast(
          result?.message ?? 'Failed to delete category.',
          'error',
        );
        return;
      }

      refreshWithToast(
        result.message ?? 'Category deleted successfully.',
        'success',
      );
    });
  }

  function requestDeleteCategory(category: CategoryRow) {
    if (!category.slug) {
      toast.error('A category slug is required to delete this item.');
      return;
    }

    setPendingDelete({
      type: 'category',
      categorySlug: category.slug,
      label: getCategoryDisplayName(category),
    });
  }

  function startEditingCategory(category: CategoryRow) {
    setEditingSlug(category.slug ?? null);
    categoryEditForm.reset({
      name: getCategoryDisplayName(category),
      slug: category.slug ?? '',
      description: category.description ?? '',
      accent: category.accent ?? '',
      metaTitle: category.metaTitle ?? '',
      metaDescription: category.metaDescription ?? '',
    });
    setEditingCategoryImageFile(null);
    setEditingCategoryImagePreview(category.image ?? '');
    setEditingSlugAutoSync(true);
  }

  function stopEditingCategory() {
    setEditingSlug(null);
    categoryEditForm.reset({
      name: '',
      slug: '',
      description: '',
      accent: '',
      metaTitle: '',
      metaDescription: '',
    });
    setEditingCategoryImageFile(null);
    setEditingCategoryImagePreview('');
    setEditingSlugAutoSync(true);
  }

  function handleUpdate(slug?: string) {
    if (!slug) {
      toast.error('A category slug is required to update this item.');
      return;
    }

    categoryEditForm.handleSubmit(async values => {
      startTransition(async () => {
        const result = await updateCategory(slug, {
          name: values.name.trim(),
          slug: values.slug.trim(),
          description: values.description?.trim() ?? '',
          accent: values.accent?.trim() || undefined,
          image: editingCategoryImageFile ?? undefined,
          metaTitle: values.metaTitle?.trim() || undefined,
          metaDescription: values.metaDescription?.trim() || undefined,
        });

        if (!result?.success) {
          refreshWithToast(
            result?.message ?? 'Failed to update category.',
            'error',
          );
          return;
        }

        stopEditingCategory();
        refreshWithToast(
          result.message ?? 'Category updated successfully.',
          'success',
        );
      });
    })();
  }

  function handleCreateSubCategory(categorySlug?: string) {
    if (!categorySlug) {
      toast.error('Category slug is required to add a sub-category.');
      return;
    }

    const payload = newSubCategory[categorySlug];
    const nextErrors: { name?: string; slug?: string; description?: string } =
      {};

    if (!payload?.name?.trim()) {
      nextErrors.name = 'Sub-category name is required!';
    }

    if (!payload?.slug?.trim()) {
      nextErrors.slug = 'Sub-category slug is required!';
    }

    if (!payload?.description?.trim()) {
      nextErrors.description = 'Sub-category description is required!';
    }

    if (Object.keys(nextErrors).length > 0) {
      setNewSubCategoryErrors(current => ({
        ...current,
        [categorySlug]: { ...current[categorySlug], ...nextErrors },
      }));
      return;
    }

    setNewSubCategoryErrors(current => ({
      ...current,
      [categorySlug]: { name: '', slug: '', description: '' },
    }));

    startTransition(async () => {
      const result = await createCategorySubCategory(categorySlug, {
        name: payload.name.trim(),
        slug: payload.slug.trim(),
        description: payload.description.trim(),
        accent: payload.accent.trim() || undefined,
        image: subCategoryImageFiles[categorySlug] ?? undefined,
        isActive: true,
      });

      if (!result?.success) {
        refreshWithToast(
          result?.message ?? 'Failed to create sub-category.',
          'error',
        );
        return;
      }

      setNewSubCategory(current => ({
        ...current,
        [categorySlug]: { name: '', slug: '', description: '', accent: '' },
      }));
      setNewSubCategoryErrors(current => ({
        ...current,
        [categorySlug]: { name: '', slug: '', description: '' },
      }));
      setNewSubCategorySlugAutoSync(current => ({
        ...current,
        [categorySlug]: true,
      }));
      setSubCategoryImageFiles(current => ({
        ...current,
        [categorySlug]: null,
      }));
      setSubCategoryImagePreviews(current => ({
        ...current,
        [categorySlug]: '',
      }));
      refreshWithToast(
        result.message ?? 'Sub-category created successfully.',
        'success',
      );
    });
  }

  function startEditingSubCategory(
    categorySlug: string,
    subCategory: NonNullable<CategoryRow['subCategories']>[number],
  ) {
    setEditingSubCategoryKey(`${categorySlug}:${subCategory.slug}`);
    subCategoryEditForm.reset({
      name: subCategory.name,
      slug: subCategory.slug,
      description: subCategory.description ?? '',
      accent: subCategory.accent ?? '',
      isActive: subCategory.isActive ?? true,
    });
    setEditingSubCategoryImageFile(null);
    setEditingSubCategoryImagePreview(subCategory.image ?? '');
    setEditingSubCategorySlugAutoSync(true);
  }

  function stopEditingSubCategory() {
    setEditingSubCategoryKey(null);
    subCategoryEditForm.reset({
      name: '',
      slug: '',
      description: '',
      accent: '',
      isActive: true,
    });
    setEditingSubCategoryImageFile(null);
    setEditingSubCategoryImagePreview('');
    setEditingSubCategorySlugAutoSync(true);
  }

  function handleUpdateSubCategory(
    categorySlug?: string,
    subCategorySlug?: string,
  ) {
    if (!categorySlug || !subCategorySlug) {
      toast.error('Sub-category details are incomplete.');
      return;
    }

    subCategoryEditForm.handleSubmit(async values => {
      startTransition(async () => {
        const result = await updateCategorySubCategory(
          categorySlug,
          subCategorySlug,
          {
            name: values.name.trim(),
            slug: values.slug.trim(),
            description: values.description?.trim() ?? '',
            accent: values.accent?.trim() || undefined,
            isActive: values.isActive,
            image: editingSubCategoryImageFile ?? undefined,
          },
        );

        if (!result?.success) {
          refreshWithToast(
            result?.message ?? 'Failed to update sub-category.',
            'error',
          );
          return;
        }

        stopEditingSubCategory();
        refreshWithToast(
          result.message ?? 'Sub-category updated successfully.',
          'success',
        );
      });
    })();
  }

  function handleDeleteSubCategory(
    categorySlug?: string,
    subCategorySlug?: string,
  ) {
    if (!categorySlug || !subCategorySlug) {
      toast.error('Sub-category identifiers are required.');
      return;
    }

    startTransition(async () => {
      const result = await deleteCategorySubCategory(
        categorySlug,
        subCategorySlug,
      );
      if (!result?.success) {
        refreshWithToast(
          result?.message ?? 'Failed to delete sub-category.',
          'error',
        );
        return;
      }
      refreshWithToast(
        result.message ?? 'Sub-category deleted successfully.',
        'success',
      );
    });
  }

  function requestDeleteSubCategory(
    categorySlug?: string,
    subCategorySlug?: string,
    label?: string,
  ) {
    if (!categorySlug || !subCategorySlug) {
      toast.error('Sub-category identifiers are required.');
      return;
    }

    setPendingDelete({
      type: 'sub-category',
      categorySlug,
      subCategorySlug,
      label: label ?? subCategorySlug,
    });
  }

  function closeDeleteDialog() {
    if (isPending) return;
    setPendingDelete(null);
  }

  function confirmDelete() {
    if (!pendingDelete) return;

    if (pendingDelete.type === 'category') {
      handleDelete(pendingDelete.categorySlug);
      setPendingDelete(null);
      return;
    }

    handleDeleteSubCategory(
      pendingDelete.categorySlug,
      pendingDelete.subCategorySlug,
    );
    setPendingDelete(null);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-end">
        <Button
          className="cursor-pointer"
          onClick={() => setIsCreateModalOpen(true)}
        >
          Create Category
        </Button>
      </div>

      {isCreateModalOpen && (
        <AddCategoryModal
          categoryLength={categories?.length}
          isOpen={isCreateModalOpen}
          onSuccess={() => {
            setIsCreateModalOpen(prev => !prev);
            console.log('Success');
          }}
          onCancel={() => {
            setIsCreateModalOpen(false);
          }}
        />
      )}

      {/* Main Categories Management Table list */}
      <Card className="shadow-sm">
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>No.</TableHead>
                <TableHead>Image</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Accent</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Meta Title</TableHead>
                <TableHead>Meta Description</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead>Updated At</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visibleCategories.map((category, categoryIndex) => {
                const isEditing = editingSlug === category.slug;

                return (
                  <Fragment
                    key={category.slug ?? getCategoryDisplayName(category)}
                  >
                    <TableRow>
                      <TableCell className="w-14 font-medium text-muted-foreground">
                        {categoryIndex + 1}
                      </TableCell>
                      <TableCell>
                        {isEditing ? (
                          <>
                            <div
                              role="button"
                              tabIndex={0}
                              onClick={() =>
                                editingCategoryImageInputRef.current?.click()
                              }
                              onKeyDown={event => {
                                if (
                                  event.key === 'Enter' ||
                                  event.key === ' '
                                ) {
                                  event.preventDefault();
                                  editingCategoryImageInputRef.current?.click();
                                }
                              }}
                              onDragOver={event => {
                                event.preventDefault();
                                setEditingCategoryDragging(true);
                              }}
                              onDragLeave={() =>
                                setEditingCategoryDragging(false)
                              }
                              onDrop={event => {
                                event.preventDefault();
                                setEditingCategoryDragging(false);
                                handleEditingCategoryImageSelect(
                                  event.dataTransfer.files?.[0],
                                );
                              }}
                              className={`rounded-xl border-2 border-dashed p-2 transition ${
                                editingCategoryDragging
                                  ? 'border-primary bg-primary/5'
                                  : 'border-border/70 bg-background/80 hover:border-primary/40'
                              }`}
                            >
                              <div className="flex size-12 items-center justify-center overflow-hidden rounded-lg border bg-muted">
                                {editingCategoryImagePreview ||
                                category.image ? (
                                  <Image
                                    height={500}
                                    width={500}
                                    src={
                                      editingCategoryImagePreview ||
                                      category.image ||
                                      ''
                                    }
                                    alt={getCategoryDisplayName(category)}
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <ImagePlus className="size-4 text-muted-foreground" />
                                )}
                              </div>
                            </div>
                            <input
                              ref={editingCategoryImageInputRef}
                              type="file"
                              accept="image/*"
                              className="sr-only"
                              onChange={event => {
                                handleEditingCategoryImageSelect(
                                  event.target.files?.[0],
                                );
                                event.currentTarget.value = '';
                              }}
                            />
                          </>
                        ) : (
                          <div className="flex size-12 items-center justify-center overflow-hidden rounded-xl border bg-muted">
                            {category.image ? (
                              <Image
                                height={500}
                                width={500}
                                src={category.image}
                                alt={getCategoryDisplayName(category)}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <ImagePlus className="size-4 text-muted-foreground" />
                            )}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            className="h-7 px-2"
                            onClick={() =>
                              setExpandedSlug(current =>
                                current === category.slug
                                  ? null
                                  : (category.slug ?? null),
                              )
                            }
                          >
                            <ChevronDown
                              className={`size-4 transition ${expandedSlug === category.slug ? 'rotate-180' : ''}`}
                            />
                          </Button>
                          {isEditing ? (
                            <div className="grid min-w-0 gap-1.5 font-normal">
                              <label className="text-[11px] font-medium text-muted-foreground">
                                Category name
                              </label>
                              <DashboardInput
                                placeholder="Category name"
                                className="max-w-full"
                                {...categoryEditForm.register('name', {
                                  onChange: event =>
                                    handleEditingCategoryNameChange(
                                      event.target.value,
                                    ),
                                })}
                              />
                              <ErrorText
                                message={
                                  categoryEditForm.formState.errors.name
                                    ?.message
                                }
                              />
                            </div>
                          ) : (
                            getCategoryDisplayName(category)
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {isEditing ? (
                          <div className="grid min-w-0 gap-1.5">
                            <label className="text-[11px] font-medium text-muted-foreground">
                              Category slug
                            </label>
                            <DashboardInput
                              placeholder="Category slug"
                              className="max-w-full"
                              {...categoryEditForm.register('slug', {
                                onChange: event =>
                                  handleEditingCategorySlugChange(
                                    event.target.value,
                                  ),
                              })}
                            />
                            <ErrorText
                              message={
                                categoryEditForm.formState.errors.slug?.message
                              }
                            />
                          </div>
                        ) : (
                          (category.slug ?? '-')
                        )}
                      </TableCell>
                      <TableCell className="min-w-0 max-w-44 text-sm text-muted-foreground">
                        {isEditing ? (
                          <div className="grid gap-1.5">
                            <label className="text-[11px] font-medium text-muted-foreground">
                              Accent Hex
                            </label>
                            <AccentColorField
                              value={categoryEditAccent}
                              onChange={value =>
                                categoryEditForm.setValue('accent', value, {
                                  shouldValidate: true,
                                })
                              }
                              placeholder="Category accent hex"
                            />
                          </div>
                        ) : (
                          sliceText(category.accent)
                        )}
                      </TableCell>
                      <TableCell className="min-w-0 max-w-60 text-sm text-muted-foreground">
                        {isEditing ? (
                          <div className="grid gap-1.5">
                            <label className="text-[11px] font-medium text-muted-foreground">
                              Description
                            </label>
                            <DashboardInput
                              placeholder="Category description"
                              {...categoryEditForm.register('description')}
                            />
                            <ErrorText
                              message={
                                categoryEditForm.formState.errors.description
                                  ?.message
                              }
                            />
                          </div>
                        ) : (
                          sliceText(category.description)
                        )}
                      </TableCell>
                      {/* Meta Title Column */}
                      <TableCell className="min-w-0 max-w-44 text-sm text-muted-foreground">
                        {isEditing ? (
                          <div className="grid gap-1.5">
                            <label className="text-[11px] font-medium text-muted-foreground">
                              Meta Title
                            </label>
                            <DashboardInput
                              placeholder="SEO Title"
                              {...categoryEditForm.register('metaTitle')}
                            />
                            <ErrorText
                              message={
                                categoryEditForm.formState.errors.metaTitle
                                  ?.message
                              }
                            />
                          </div>
                        ) : (
                          sliceText(category.metaTitle)
                        )}
                      </TableCell>
                      {/* Meta Description Column */}
                      <TableCell className="min-w-0 max-w-60 text-sm text-muted-foreground">
                        {isEditing ? (
                          <div className="grid gap-1.5">
                            <label className="text-[11px] font-medium text-muted-foreground">
                              Meta Description
                            </label>
                            <DashboardInput
                              placeholder="SEO Description"
                              {...categoryEditForm.register('metaDescription')}
                            />
                            <ErrorText
                              message={
                                categoryEditForm.formState.errors
                                  .metaDescription?.message
                              }
                            />
                          </div>
                        ) : (
                          sliceText(category.metaDescription)
                        )}
                      </TableCell>
                      <TableCell>
                        {category.subCategories?.length ??
                          category.totalNews ??
                          0}
                      </TableCell>
                      <TableCell>
                        <span
                          className="cursor-help"
                          title={formatDashboardDate(category.createdAt, {
                            time: true,
                          })}
                        >
                          {formatDashboardDate(category.createdAt)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span
                          className="cursor-help"
                          title={formatDashboardDate(category.updatedAt, {
                            time: true,
                          })}
                        >
                          {formatDashboardDate(category.updatedAt)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {category.isActive === false ? 'Inactive' : 'Active'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {isEditing ? (
                            <Button
                              type="button"
                              size="sm"
                              disabled={isPending}
                              onClick={() => handleUpdate(category.slug)}
                            >
                              Save
                            </Button>
                          ) : (
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              disabled={isPending}
                              onClick={() => {
                                startEditingCategory(category);
                                setIsEditModalOpen(true);
                                setSelectedCategory(category);
                              }}
                            >
                              <Pencil className="size-4" />
                            </Button>
                          )}
                          {isEditing ? (
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={stopEditingCategory}
                            >
                              Cancel
                            </Button>
                          ) : null}
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            disabled={isPending}
                            onClick={() => requestDeleteCategory(category)}
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                    {expandedSlug === category.slug ? (
                      <TableRow>
                        <TableCell colSpan={13}>
                          <div className="space-y-4 rounded-xl border bg-muted/20 p-4">
                            <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_auto]">
                              <div className="grid gap-1.5">
                                <DashboardInput
                                  placeholder="Sub-category name"
                                  value={
                                    newSubCategory[category.slug ?? '']?.name ??
                                    ''
                                  }
                                  onChange={event =>
                                    handleNewSubCategoryNameChange(
                                      category.slug ?? '',
                                      event.target.value,
                                    )
                                  }
                                />
                                <ErrorText
                                  message={
                                    newSubCategoryErrors[category.slug ?? '']
                                      ?.name
                                  }
                                />
                              </div>
                              <div className="grid gap-1.5">
                                <DashboardInput
                                  placeholder="sub-category-slug"
                                  value={
                                    newSubCategory[category.slug ?? '']?.slug ??
                                    ''
                                  }
                                  onChange={event =>
                                    handleNewSubCategorySlugChange(
                                      category.slug ?? '',
                                      event.target.value,
                                    )
                                  }
                                />
                                <ErrorText
                                  message={
                                    newSubCategoryErrors[category.slug ?? '']
                                      ?.slug
                                  }
                                />
                              </div>
                              <div className="grid gap-1.5">
                                <AccentColorField
                                  value={
                                    newSubCategory[category.slug ?? '']
                                      ?.accent ?? ''
                                  }
                                  onChange={value =>
                                    handleNewSubCategoryAccentChange(
                                      category.slug ?? '',
                                      value,
                                    )
                                  }
                                  placeholder="Sub-category accent hex"
                                />
                              </div>
                              <div className="grid gap-1.5">
                                <DashboardInput
                                  placeholder="Sub-category description"
                                  value={
                                    newSubCategory[category.slug ?? '']
                                      ?.description ?? ''
                                  }
                                  onChange={event => {
                                    setNewSubCategory(current => ({
                                      ...current,
                                      [category.slug ?? '']: {
                                        ...(current[category.slug ?? ''] ?? {
                                          name: '',
                                          slug: '',
                                          description: '',
                                          accent: '',
                                        }),
                                        description: event.target.value,
                                      },
                                    }));
                                    setNewSubCategoryErrors(current => ({
                                      ...current,
                                      [category.slug ?? '']: {
                                        ...current[category.slug ?? ''],
                                        description: '',
                                      },
                                    }));
                                  }}
                                />
                                <ErrorText
                                  message={
                                    newSubCategoryErrors[category.slug ?? '']
                                      ?.description
                                  }
                                />
                              </div>
                              <Button
                                type="button"
                                className="bg-primary text-primary-foreground hover:bg-primary/70 md:self-start"
                                disabled={isPending}
                                onClick={() =>
                                  handleCreateSubCategory(category.slug)
                                }
                              >
                                Add sub-category
                              </Button>
                            </div>

                            <div className="rounded-xl border border-dashed border-border/70 bg-background/80 p-4">
                              <div className="flex items-center gap-3">
                                <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                  <UploadCloud className="size-5" />
                                </div>
                                <div>
                                  <div className="text-sm font-semibold">
                                    Sub-category image
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    Click or drop a file for this category.
                                  </div>
                                </div>
                              </div>
                              <label
                                htmlFor={`subcategory-image-${category.slug ?? 'root'}`}
                                onDragOver={event => {
                                  event.preventDefault();
                                  setSubCategoryDraggingKey(
                                    category.slug ?? '',
                                  );
                                }}
                                onDragLeave={() =>
                                  setSubCategoryDraggingKey(null)
                                }
                                onDrop={event => {
                                  event.preventDefault();
                                  setSubCategoryDraggingKey(null);
                                  handleSubCategoryImageSelect(
                                    category.slug ?? '',
                                    event.dataTransfer.files?.[0],
                                  );
                                }}
                                className={`mt-3 rounded-xl border-2 border-dashed p-3 transition ${
                                  subCategoryDraggingKey ===
                                  (category.slug ?? '')
                                    ? 'border-primary bg-primary/5'
                                    : 'border-border/70 bg-background/80 hover:border-primary/40'
                                }`}
                              >
                                <div className="flex items-center gap-3">
                                  <div className="flex size-10 items-center justify-center overflow-hidden rounded-lg border bg-muted">
                                    {subCategoryImagePreviews[
                                      category.slug ?? ''
                                    ] ? (
                                      <Image
                                        height={500}
                                        width={500}
                                        src={
                                          subCategoryImagePreviews[
                                            category.slug ?? ''
                                          ]
                                        }
                                        alt="Sub-category preview"
                                        className="h-full w-full object-cover"
                                      />
                                    ) : (
                                      <ImagePlus className="size-4 text-muted-foreground" />
                                    )}
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    Click or drop sub-category image here
                                  </div>
                                </div>
                              </label>
                              <input
                                id={`subcategory-image-${category.slug ?? 'root'}`}
                                type="file"
                                accept="image/*"
                                className="sr-only"
                                onChange={event => {
                                  handleSubCategoryImageSelect(
                                    category.slug ?? '',
                                    event.target.files?.[0],
                                  );
                                  event.currentTarget.value = '';
                                }}
                              />
                            </div>

                            <div className="grid gap-3">
                              {(category.subCategories ?? []).length > 0 ? (
                                category.subCategories?.map(
                                  (subCategory, index) => {
                                    const subCategoryKey = `${category.slug}:${subCategory.slug}`;
                                    const isEditingSubCategory =
                                      editingSubCategoryKey === subCategoryKey;

                                    return (
                                      <div
                                        key={subCategoryKey}
                                        className="flex flex-col gap-3 rounded-lg border bg-background p-3 md:flex-row md:items-center"
                                      >
                                        <div className="flex items-center gap-3">
                                          <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                                            {index + 1}
                                          </div>
                                          <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-lg border bg-muted">
                                            {subCategory.image ? (
                                              <Image
                                                height={500}
                                                width={500}
                                                src={subCategory.image}
                                                alt={subCategory.name}
                                                className="h-full w-full object-cover"
                                              />
                                            ) : (
                                              <ImagePlus className="size-4 text-muted-foreground" />
                                            )}
                                          </div>
                                        </div>
                                        <div className="grid flex-1 gap-3 md:grid-cols-5">
                                          {isEditingSubCategory ? (
                                            <>
                                              <div className="grid gap-1.5">
                                                <DashboardInput
                                                  placeholder="Name"
                                                  {...subCategoryEditForm.register(
                                                    'name',
                                                    {
                                                      onChange: event =>
                                                        handleEditingSubCategoryNameChange(
                                                          event.target.value,
                                                        ),
                                                    },
                                                  )}
                                                />
                                                <ErrorText
                                                  message={
                                                    subCategoryEditForm
                                                      .formState.errors.name
                                                      ?.message
                                                  }
                                                />
                                              </div>
                                              <div className="grid gap-1.5">
                                                <DashboardInput
                                                  placeholder="Slug"
                                                  {...subCategoryEditForm.register(
                                                    'slug',
                                                    {
                                                      onChange: event =>
                                                        handleEditingSubCategorySlugChange(
                                                          event.target.value,
                                                        ),
                                                    },
                                                  )}
                                                />
                                                <ErrorText
                                                  message={
                                                    subCategoryEditForm
                                                      .formState.errors.slug
                                                      ?.message
                                                  }
                                                />
                                              </div>
                                              <AccentColorField
                                                value={subCategoryEditAccent}
                                                onChange={value =>
                                                  subCategoryEditForm.setValue(
                                                    'accent',
                                                    value,
                                                    {
                                                      shouldValidate: true,
                                                    },
                                                  )
                                                }
                                                placeholder="Accent hex"
                                              />
                                              <select
                                                value={
                                                  subCategoryEditIsActive
                                                    ? 'true'
                                                    : 'false'
                                                }
                                                onChange={event =>
                                                  subCategoryEditForm.setValue(
                                                    'isActive',
                                                    event.target.value ===
                                                      'true',
                                                    { shouldValidate: true },
                                                  )
                                                }
                                                className="h-9 w-fit rounded-md border border-input bg-background px-3 text-sm"
                                              >
                                                <option value="true">
                                                  Active
                                                </option>
                                                <option value="false">
                                                  Inactive
                                                </option>
                                              </select>
                                              <div className="grid gap-1.5 md:col-span-4">
                                                <DashboardInput
                                                  placeholder="Description"
                                                  {...subCategoryEditForm.register(
                                                    'description',
                                                  )}
                                                />
                                                <ErrorText
                                                  message={
                                                    subCategoryEditForm
                                                      .formState.errors
                                                      .description?.message
                                                  }
                                                />
                                              </div>
                                            </>
                                          ) : (
                                            <>
                                              <div className="flex items-center gap-2 font-semibold text-primary">
                                                <span>{subCategory.name}</span>
                                              </div>
                                              <div className="font-medium">
                                                {subCategory.slug}
                                              </div>
                                              <div className="text-sm text-muted-foreground">
                                                Accent:{' '}
                                                {sliceText(subCategory.accent)}
                                              </div>
                                              <div className="text-sm text-muted-foreground">
                                                {sliceText(
                                                  subCategory.description,
                                                )}
                                              </div>
                                              <Badge
                                                variant="secondary"
                                                className="w-fit"
                                              >
                                                {subCategory.isActive === false
                                                  ? 'Inactive'
                                                  : 'Active'}
                                              </Badge>
                                            </>
                                          )}
                                        </div>
                                        {isEditingSubCategory ? (
                                          <>
                                            <div
                                              role="button"
                                              tabIndex={0}
                                              onClick={() =>
                                                editingSubCategoryImageInputRef.current?.click()
                                              }
                                              onKeyDown={event => {
                                                if (
                                                  event.key === 'Enter' ||
                                                  event.key === ' '
                                                ) {
                                                  event.preventDefault();
                                                  editingSubCategoryImageInputRef.current?.click();
                                                }
                                              }}
                                              onDragOver={event => {
                                                event.preventDefault();
                                                setEditingSubCategoryDragging(
                                                  true,
                                                );
                                              }}
                                              onDragLeave={() =>
                                                setEditingSubCategoryDragging(
                                                  false,
                                                )
                                              }
                                              onDrop={event => {
                                                event.preventDefault();
                                                setEditingSubCategoryDragging(
                                                  false,
                                                );
                                                handleEditingSubCategoryImageSelect(
                                                  event.dataTransfer.files?.[0],
                                                );
                                              }}
                                              className={`rounded-xl border-2 border-dashed p-3 transition ${
                                                editingSubCategoryDragging
                                                  ? 'border-primary bg-primary/5'
                                                  : 'border-border/70 bg-background/80 hover:border-primary/40'
                                              }`}
                                            >
                                              <div className="flex items-center gap-3">
                                                <div className="flex size-10 items-center justify-center overflow-hidden rounded-lg border bg-muted">
                                                  {editingSubCategoryImagePreview ||
                                                  subCategory.image ? (
                                                    <Image
                                                      height={500}
                                                      width={500}
                                                      src={
                                                        editingSubCategoryImagePreview ||
                                                        subCategory.image ||
                                                        ''
                                                      }
                                                      alt={subCategory.name}
                                                      className="h-full w-full object-cover"
                                                    />
                                                  ) : (
                                                    <ImagePlus className="size-4 text-muted-foreground" />
                                                  )}
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                  Drop or click to replace
                                                </div>
                                              </div>
                                            </div>
                                            <input
                                              ref={
                                                editingSubCategoryImageInputRef
                                              }
                                              type="file"
                                              accept="image/*"
                                              className="sr-only"
                                              onChange={event => {
                                                handleEditingSubCategoryImageSelect(
                                                  event.target.files?.[0],
                                                );
                                                event.currentTarget.value = '';
                                              }}
                                            />
                                          </>
                                        ) : null}
                                        <div className="flex gap-2">
                                          {isEditingSubCategory ? (
                                            <>
                                              <Button
                                                size="sm"
                                                disabled={isPending}
                                                onClick={() =>
                                                  handleUpdateSubCategory(
                                                    category.slug,
                                                    subCategory.slug,
                                                  )
                                                }
                                              >
                                                Save
                                              </Button>
                                              <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={stopEditingSubCategory}
                                              >
                                                Cancel
                                              </Button>
                                            </>
                                          ) : (
                                            <>
                                              <Button
                                                size="sm"
                                                variant="outline"
                                                disabled={isPending}
                                                onClick={() =>
                                                  startEditingSubCategory(
                                                    category.slug ?? '',
                                                    subCategory,
                                                  )
                                                }
                                              >
                                                <Pencil className="size-4" />
                                              </Button>
                                              <Button
                                                size="sm"
                                                variant="outline"
                                                disabled={isPending}
                                                onClick={() =>
                                                  requestDeleteSubCategory(
                                                    category.slug,
                                                    subCategory.slug,
                                                    subCategory.name,
                                                  )
                                                }
                                              >
                                                <Trash2 className="size-4" />
                                              </Button>
                                            </>
                                          )}
                                        </div>
                                      </div>
                                    );
                                  },
                                )
                              ) : (
                                <div className="text-sm text-muted-foreground">
                                  No sub-categories yet.
                                </div>
                              )}
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
        </CardContent>
      </Card>

      <DeleteConfirmationDialog
        open={Boolean(pendingDelete)}
        onOpenChange={open => {
          if (!open) closeDeleteDialog();
        }}
        onConfirm={confirmDelete}
        isPending={isPending}
        title={
          pendingDelete?.type === 'sub-category'
            ? 'Delete sub-category?'
            : 'Delete category?'
        }
        description={
          pendingDelete?.type === 'sub-category'
            ? `This will permanently delete ${pendingDelete.label} from its category.`
            : `This will permanently delete ${pendingDelete?.label || 'this category'} and remove it from the dashboard.`
        }
        confirmLabel={
          pendingDelete?.type === 'sub-category'
            ? 'Delete sub-category'
            : 'Delete category'
        }
      />

      {isEditModalOpen && (
        <EditCategoryModal
          category={{
            _id: selectedCategory?._id as string,
            name: selectedCategory?.name as string,
            slug: selectedCategory?.slug,
            description: selectedCategory?.description,
            accent: selectedCategory?.accent,
            image: selectedCategory?.image,
            isActive: selectedCategory?.isActive,
            metaDescription: selectedCategory?.metaDescription,
            metaTitle: selectedCategory?.metaTitle,
          }}
          isOpen={isEditModalOpen}
          onSuccess={() => {
            setIsEditModalOpen(prev => !prev);
          }}
          onCancel={() => {
            setIsEditModalOpen(prev => !prev);
          }}
        />
      )}
    </div>
  );
}
