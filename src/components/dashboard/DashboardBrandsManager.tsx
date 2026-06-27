'use client';

import type React from 'react';
import { useEffect, useRef, useState, useTransition } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { ImagePlus, Pencil, Plus, Trash2, UploadCloud } from 'lucide-react';
import { Controller, useForm, useWatch } from 'react-hook-form';
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
  createBrand,
  deleteBrand,
  type BackendBrand,
  updateBrand,
} from '@/services/Brand';
import { slugify } from '@/lib/slug';
import { formatDashboardDate } from '@/lib/formatDate';
import Image from 'next/image';
import { dashboardFormSchemas, makeZodResolver } from '@/lib/form-validation';
import { DeleteConfirmationDialog } from '@/components/dashboard/DeleteConfirmationDialog';

const brandEditSchema = z.object({
  name: z
    .string({ error: 'Brand name is required!' })
    .trim()
    .min(1, { message: 'Brand name is required!' }),
  slug: z
    .string({ error: 'Brand slug is required!' })
    .trim()
    .min(1, { message: 'Brand slug is required!' }),
  description: z
    .string({ error: 'Brand description is required!' })
    .trim()
    .min(1, { message: 'Brand description is required!' }),
  isActive: z.boolean().default(true),
});

type BrandCreateValues = z.infer<typeof dashboardFormSchemas.brand>;
type BrandEditValues = z.infer<typeof brandEditSchema>;

function ErrorText({ message }: { message?: string }) {
  if (!message) return null;

  return <p className="text-xs text-destructive">{message}</p>;
}

function sliceText(value?: string, maxLength = 44) {
  if (!value) return '-';
  return value.length > maxLength
    ? `${value.slice(0, maxLength).trim()}…`
    : value;
}

function getBrandDisplayName(
  brand: Pick<BackendBrand, 'name' | 'slug' | '_id'>,
) {
  return brand.name?.trim() || brand.slug || brand._id || 'Unnamed brand';
}

export function DashboardBrandsManager({
  brands,
  paginationMeta,
  searchTerm,
}: {
  brands: BackendBrand[];
  paginationMeta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  searchTerm: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [brandImageFile, setBrandImageFile] = useState<File | null>(null);
  const [brandImagePreview, setBrandImagePreview] = useState('');
  const [brandSlugSynced, setBrandSlugSynced] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [editingBrandImageFile, setEditingBrandImageFile] =
    useState<File | null>(null);
  const [editingBrandImagePreview, setEditingBrandImagePreview] = useState('');
  const [editingBrandSlugSynced, setEditingBrandSlugSynced] = useState(true);
  const [isEditingDragging, setIsEditingDragging] = useState(false);
  const [pendingDeleteBrand, setPendingDeleteBrand] = useState<Pick<
    BackendBrand,
    'slug' | 'name'
  > | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const editingImageInputRef = useRef<HTMLInputElement>(null);

  const createForm = useForm<BrandCreateValues>({
    resolver: makeZodResolver(dashboardFormSchemas.brand),
    defaultValues: { name: '', slug: '', description: '', isActive: true },
    mode: 'onTouched',
  });

  const brandName = useWatch({
    control: createForm.control,
    name: 'name',
    defaultValue: '',
  });

  useEffect(() => {
    if (brandSlugSynced && brandName.trim()) {
      createForm.setValue('slug', slugify(brandName), {
        shouldDirty: true,
        shouldTouch: false,
        shouldValidate: false,
      });
    }
  }, [brandName, brandSlugSynced, createForm]);

  const editForm = useForm<BrandEditValues>({
    resolver: makeZodResolver(brandEditSchema),
    defaultValues: { name: '', slug: '', description: '', isActive: true },
    mode: 'onTouched',
  });

  const editingBrandName = useWatch({
    control: editForm.control,
    name: 'name',
    defaultValue: '',
  });

  useEffect(() => {
    return () => {
      if (brandImagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(brandImagePreview);
      }
    };
  }, [brandImagePreview]);

  function refresh(message: string, type: 'success' | 'error') {
    if (type === 'success') {
      toast.success(message);
    } else {
      toast.error(message);
    }
    router.refresh();
  }

  function closeDeleteDialog() {
    if (isPending) return;
    setPendingDeleteBrand(null);
  }

  function confirmDeleteBrand() {
    const slug = pendingDeleteBrand?.slug;
    if (!slug) return;

    startTransition(async () => {
      const result = await deleteBrand(slug);
      if (!result?.success)
        return refresh(result?.message ?? 'Failed to delete brand.', 'error');
      setPendingDeleteBrand(null);
      refresh(result.message ?? 'Brand deleted successfully.', 'success');
    });
  }

  function updateQuery(updates: {
    page?: number;
    limit?: number;
    searchTerm?: string;
  }) {
    const params = new URLSearchParams(searchParams.toString());
    const nextPage = updates.page ?? paginationMeta.page;
    const nextLimit = updates.limit ?? paginationMeta.limit;
    const nextSearch = updates.searchTerm ?? params.get('searchTerm') ?? '';

    params.set('page', String(nextPage));
    params.set('limit', String(nextLimit));

    if (nextSearch.trim()) {
      params.set('searchTerm', nextSearch.trim());
    } else {
      params.delete('searchTerm');
    }

    router.push(`${pathname}?${params.toString()}`);
  }

  function handleBrandSlugChange(value: string) {
    setBrandSlugSynced(false);
    createForm.setValue('slug', slugify(value), {
      shouldDirty: true,
      shouldTouch: false,
      shouldValidate: true,
    });
  }

  function handleBrandImageSelect(file?: File) {
    if (!file) return;

    if (brandImagePreview.startsWith('blob:')) {
      URL.revokeObjectURL(brandImagePreview);
    }

    setBrandImageFile(file);
    setBrandImagePreview(URL.createObjectURL(file));
  }

  function handleEditingBrandImageSelect(file?: File) {
    if (!file) return;

    if (editingBrandImagePreview.startsWith('blob:')) {
      URL.revokeObjectURL(editingBrandImagePreview);
    }

    setEditingBrandImageFile(file);
    setEditingBrandImagePreview(URL.createObjectURL(file));
  }

  function handleEditingBrandImageDrop(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsEditingDragging(false);
    handleEditingBrandImageSelect(event.dataTransfer.files?.[0]);
  }

  function handleBrandImageDrop(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(false);
    handleBrandImageSelect(event.dataTransfer.files?.[0]);
  }

  useEffect(() => {
    if (editingSlug && editingBrandSlugSynced && editingBrandName.trim()) {
      editForm.setValue('slug', slugify(editingBrandName), {
        shouldDirty: true,
        shouldTouch: false,
        shouldValidate: false,
      });
    }
  }, [editingBrandName, editingBrandSlugSynced, editingSlug, editForm]);

  return (
    <div className="space-y-6">
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Create brand</CardTitle>
          <CardDescription>Add and manage storefront brands.</CardDescription>
        </CardHeader>
        <CardContent className="grid items-start gap-3 md:grid-cols-2 xl:grid-cols-5">
          <div className="grid gap-1.5">
            <DashboardInput
              placeholder="Name"
              {...createForm.register('name')}
            />
            <ErrorText message={createForm.formState.errors.name?.message} />
          </div>
          <div className="grid gap-1.5">
            <DashboardInput
              placeholder="Slug"
              {...createForm.register('slug')}
              onChange={(e) => handleBrandSlugChange(e.target.value)}
            />
            <ErrorText message={createForm.formState.errors.slug?.message} />
          </div>
          <div className="grid gap-1.5">
            <DashboardInput
              placeholder="Description"
              {...createForm.register('description')}
            />
            <ErrorText
              message={createForm.formState.errors.description?.message}
            />
          </div>
          <div className="space-y-2 self-start xl:col-span-2">
            <div
              role="button"
              tabIndex={0}
              onClick={() => imageInputRef.current?.click()}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  imageInputRef.current?.click();
                }
              }}
              onDragEnter={() => setIsDragging(true)}
              onDragOver={(event) => {
                event.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleBrandImageDrop}
              className={`self-start rounded-2xl border-2 border-dashed p-3 transition ${
                isDragging
                  ? 'border-primary bg-primary/5'
                  : 'border-border/70 bg-background/80 hover:border-primary/40 hover:bg-muted/20'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <UploadCloud className="size-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold text-foreground">
                    Brand image
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Drag and drop an image here or click to upload.
                  </p>
                  <div className="mt-2 overflow-hidden rounded-xl border bg-muted">
                    {brandImagePreview ? (
                      <Image
                        height={500}
                        width={500}
                        src={brandImagePreview}
                        alt="Brand preview"
                        className="h-24 w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-24 items-center justify-center gap-2 text-sm text-muted-foreground">
                        <ImagePlus className="size-4" />
                        Preview will appear here
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={(e) => {
                handleBrandImageSelect(e.target.files?.[0]);
                e.currentTarget.value = '';
              }}
            />
          </div>
          <label className="flex items-center gap-2 self-start text-sm">
            <input type="checkbox" {...createForm.register('isActive')} />
            Active
          </label>
          <div className="self-start xl:col-span-5">
            <Button
              type="button"
              className="gap-2"
              disabled={isCreating}
              onClick={createForm.handleSubmit(async (values) => {
                if (!brandImageFile) {
                  toast.error('Brand image is required.');
                  return;
                }

                setIsCreating(true);
                const result = await createBrand({
                  name: values.name,
                  slug: values.slug,
                  image: brandImageFile,
                  description: values.description,
                  isActive: values.isActive,
                });
                setIsCreating(false);

                if (!result?.success)
                  return refresh(
                    result?.message ?? 'Failed to create brand.',
                    'error',
                  );

                createForm.reset({
                  name: '',
                  slug: '',
                  description: '',
                  isActive: true,
                });
                setBrandImageFile(null);
                setBrandImagePreview('');
                setBrandSlugSynced(true);

                refresh(
                  result.message ?? 'Brand created successfully.',
                  'success',
                );
              })}
            >
              <Plus className="size-4" />
              {isCreating ? 'Creating brand...' : 'Create brand'}
            </Button>
          </div>
        </CardContent>
      </Card>
      <Card className="shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>Brands</CardTitle>
            <CardDescription>
              Showing {brands.length} of {paginationMeta.total}
            </CardDescription>
          </div>
          <TableFilter
            key={searchTerm}
            value={searchTerm}
            onChange={(value) => updateQuery({ page: 1, searchTerm: value })}
            placeholder="Search brands..."
          />
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>No.</TableHead>
                <TableHead>Image</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead>Updated At</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {brands.map((brand, index) => {
                const isEditing = editingSlug === brand.slug;
                return (
                  <TableRow key={brand.slug}>
                    <TableCell className="w-14 font-medium text-muted-foreground">
                      {(paginationMeta.page - 1) * paginationMeta.limit +
                        index +
                        1}
                    </TableCell>
                    <TableCell className="min-w-0">
                      {isEditing ? (
                        <>
                          <div
                            role="button"
                            tabIndex={0}
                            onClick={() =>
                              editingImageInputRef.current?.click()
                            }
                            onKeyDown={(event) => {
                              if (event.key === 'Enter' || event.key === ' ') {
                                event.preventDefault();
                                editingImageInputRef.current?.click();
                              }
                            }}
                            onDragEnter={() => setIsEditingDragging(true)}
                            onDragOver={(event) => {
                              event.preventDefault();
                              setIsEditingDragging(true);
                            }}
                            onDragLeave={() => setIsEditingDragging(false)}
                            onDrop={handleEditingBrandImageDrop}
                            className={`rounded-xl border-2 border-dashed p-2 transition ${
                              isEditingDragging
                                ? 'border-primary bg-primary/5'
                                : 'border-border/70 bg-background/80 hover:border-primary/40'
                            }`}
                          >
                            <div className="flex flex-col items-center gap-2">
                              <div className="flex size-12 items-center justify-center overflow-hidden rounded-lg border bg-muted">
                                {editingBrandImagePreview || brand.image ? (
                                  <Image
                                    height={500}
                                    width={500}
                                    src={
                                      editingBrandImagePreview ||
                                      brand.image ||
                                      ''
                                    }
                                    alt={
                                      editingBrandName ||
                                      getBrandDisplayName(brand)
                                    }
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <ImagePlus className="size-4 text-muted-foreground" />
                                )}
                              </div>
                              <div className="text-center text-[11px] text-muted-foreground">
                                Drop or click to replace
                              </div>
                            </div>
                          </div>
                          <input
                            ref={editingImageInputRef}
                            type="file"
                            accept="image/*"
                            className="sr-only"
                            onChange={(e) => {
                              handleEditingBrandImageSelect(
                                e.target.files?.[0],
                              );
                              e.currentTarget.value = '';
                            }}
                          />
                        </>
                      ) : (
                        <div className="flex size-12 items-center justify-center overflow-hidden rounded-xl border bg-muted">
                          {brand.image ? (
                            <Image
                              height={500}
                              width={500}
                              src={brand.image}
                              alt={getBrandDisplayName(brand)}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <ImagePlus className="size-4 text-muted-foreground" />
                          )}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="min-w-0 whitespace-normal font-medium">
                      {isEditing ? (
                        <div className="grid min-w-0 gap-1.5">
                          <label className="text-[11px] font-medium text-muted-foreground">
                            Brand name
                          </label>
                          <Controller
                            control={editForm.control}
                            name="name"
                            render={({ field, fieldState }) => (
                              <div className="grid min-w-0 gap-1.5">
                                <DashboardInput
                                  {...field}
                                  value={field.value}
                                  placeholder="Brand name"
                                  className="max-w-full"
                                  onChange={(e) =>
                                    field.onChange(e.target.value)
                                  }
                                  onBlur={field.onBlur}
                                  aria-invalid={fieldState.invalid}
                                />
                                <ErrorText
                                  message={fieldState.error?.message}
                                />
                              </div>
                            )}
                          />
                        </div>
                      ) : (
                        getBrandDisplayName(brand)
                      )}
                    </TableCell>
                    <TableCell className="min-w-0 whitespace-normal">
                      {isEditing ? (
                        <div className="grid min-w-0 gap-1.5">
                          <label className="text-[11px] font-medium text-muted-foreground">
                            Brand slug
                          </label>
                          <Controller
                            control={editForm.control}
                            name="slug"
                            render={({ field, fieldState }) => (
                              <div className="grid min-w-0 gap-1.5">
                                <DashboardInput
                                  {...field}
                                  value={field.value}
                                  placeholder="Brand slug"
                                  className="max-w-full"
                                  onBlur={field.onBlur}
                                  aria-invalid={fieldState.invalid}
                                  onChange={(e) => {
                                    setEditingBrandSlugSynced(false);
                                    field.onChange(slugify(e.target.value));
                                  }}
                                />
                                <ErrorText
                                  message={fieldState.error?.message}
                                />
                              </div>
                            )}
                          />
                        </div>
                      ) : (
                        brand.slug
                      )}
                    </TableCell>
                    <TableCell className="min-w-0 max-w-60 whitespace-normal text-sm text-muted-foreground">
                      {isEditing ? (
                        <div className="grid min-w-0 gap-1.5">
                          <label className="text-[11px] font-medium text-muted-foreground">
                            Description
                          </label>
                          <Controller
                            control={editForm.control}
                            name="description"
                            render={({ field, fieldState }) => (
                              <div className="grid min-w-0 gap-1.5">
                                <DashboardInput
                                  {...field}
                                  value={field.value ?? ''}
                                  placeholder="Brand description"
                                  className="max-w-full"
                                  onChange={(e) =>
                                    field.onChange(e.target.value)
                                  }
                                  onBlur={field.onBlur}
                                  aria-invalid={fieldState.invalid}
                                />
                                <ErrorText
                                  message={fieldState.error?.message}
                                />
                              </div>
                            )}
                          />
                        </div>
                      ) : (
                        sliceText(brand.description)
                      )}
                    </TableCell>
                    <TableCell className="min-w-0">
                      <span
                        className="cursor-help"
                        title={formatDashboardDate(brand.createdAt, {
                          time: true,
                        })}
                      >
                        {formatDashboardDate(brand.createdAt)}
                      </span>
                    </TableCell>
                    <TableCell className="min-w-0">
                      <span
                        className="cursor-help"
                        title={formatDashboardDate(brand.updatedAt, {
                          time: true,
                        })}
                      >
                        {formatDashboardDate(brand.updatedAt)}
                      </span>
                    </TableCell>
                    <TableCell className="min-w-0">
                      {isEditing ? (
                        <label className="flex items-center gap-2 text-sm">
                          <Controller
                            control={editForm.control}
                            name="isActive"
                            render={({ field }) => (
                              <input
                                type="checkbox"
                                checked={field.value}
                                onChange={(e) =>
                                  field.onChange(e.target.checked)
                                }
                              />
                            )}
                          />
                          Active
                        </label>
                      ) : (
                        <Badge variant="secondary">
                          {brand.isActive === false ? 'Inactive' : 'Active'}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {isEditing ? (
                          <>
                            <Button
                              size="sm"
                              disabled={isPending}
                              onClick={editForm.handleSubmit((values) =>
                                startTransition(async () => {
                                  const result = await updateBrand(brand.slug, {
                                    name: values.name.trim(),
                                    slug: values.slug.trim(),
                                    image: editingBrandImageFile ?? undefined,
                                    description: values.description?.trim(),
                                    isActive: values.isActive,
                                  });
                                  if (!result?.success)
                                    return refresh(
                                      result?.message ??
                                        'Failed to update brand.',
                                      'error',
                                    );
                                  setEditingSlug(null);
                                  setEditingBrandImageFile(null);
                                  setEditingBrandImagePreview('');
                                  setEditingBrandSlugSynced(true);
                                  editForm.reset({
                                    name: '',
                                    slug: '',
                                    description: '',
                                    isActive: true,
                                  });
                                  refresh(
                                    result.message ??
                                      'Brand updated successfully.',
                                    'success',
                                  );
                                }),
                              )}
                            >
                              Save
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setEditingSlug(null);
                                setEditingBrandImageFile(null);
                                setEditingBrandImagePreview('');
                                setEditingBrandSlugSynced(true);
                                editForm.reset({
                                  name: '',
                                  slug: '',
                                  description: '',
                                  isActive: true,
                                });
                              }}
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
                                if (
                                  editingBrandImagePreview.startsWith('blob:')
                                ) {
                                  URL.revokeObjectURL(editingBrandImagePreview);
                                }
                                setEditingSlug(brand.slug);
                                editForm.reset({
                                  name: getBrandDisplayName(brand),
                                  slug: brand.slug,
                                  description: brand.description ?? '',
                                  isActive: brand.isActive,
                                });
                                setEditingBrandImageFile(null);
                                setEditingBrandImagePreview(brand.image ?? '');
                                setEditingBrandSlugSynced(true);
                              }}
                            >
                              <Pencil className="size-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={isPending}
                              onClick={() =>
                                setPendingDeleteBrand({
                                  slug: brand.slug,
                                  name: getBrandDisplayName(brand),
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
                onPageChange={(page) => updateQuery({ page })}
                onLimitChange={(limit) => updateQuery({ page: 1, limit })}
              />
            </div>
          )}
        </CardContent>
      </Card>
      <DeleteConfirmationDialog
        open={Boolean(pendingDeleteBrand)}
        onOpenChange={(open) => {
          if (!open) closeDeleteDialog();
        }}
        onConfirm={confirmDeleteBrand}
        isPending={isPending}
        title="Delete brand?"
        description={`This will permanently delete ${pendingDeleteBrand?.name || 'this brand'} from the catalog.`}
        confirmLabel="Delete brand"
      />
    </div>
  );
}
