// src/app/(dashboard)/dashboard/super-admin/categories/_components/edit-sub-category.tsx
'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { AccentColorField } from '@/components/accent-color-field';
import { DashboardRichTextEditor } from '@/components/dashboard/DashboardRichTextEditor';
import { MediaAttachment } from '@/components/media-attachment';
import { Textarea } from '@/components/ui/textarea';
import { categorySchema, type TEditSubCategoryType } from '@/schemas/category';
import { handleFormError } from '@/lib/handle-zod-error';
import { updateCategorySubCategory } from '@/services/Category';
import { slugify } from '@/lib/slug';
import { ISubCategory } from '@/components/dashboard/DashboardCategoriesManager';

interface IEditSubCategoryModalProps {
  categorySlug: string;
  subCategory: ISubCategory | null;
  isOpen: boolean;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function EditSubCategoryModal({
  categorySlug,
  subCategory,
  isOpen,
  onSuccess,
  onCancel,
}: IEditSubCategoryModalProps) {
  const [isPending, startTransition] = useTransition();
  const [loading, setLoading] = useState(false);
  const [isAutoSlug, setIsAutoSlug] = useState(true);
  const router = useRouter();

  const form = useForm<TEditSubCategoryType>({
    resolver: zodResolver(categorySchema.editSubCategorySchema),
    mode: 'onBlur',
    defaultValues: {
      name: subCategory?.name ?? '',
      slug: subCategory?.slug ?? '',
      accent: subCategory?.accent || '#f97316',
      description: subCategory?.description || '',
      metaTitle: subCategory?.metaTitle || '',
      metaDescription: subCategory?.metaDescription || '',
      isActive: subCategory?.isActive ?? true,
      mediaAttachment: undefined,
    },
  });

  const watchedName = form.watch('name');

  useEffect(() => {
    if (isAutoSlug && watchedName) {
      form.setValue('slug', slugify(watchedName), {
        shouldValidate: true,
        shouldDirty: true,
      });
    }
  }, [watchedName, isAutoSlug, form]);

  const mediaFile = form.watch('mediaAttachment');
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [subCategoryDragging, setSubCategoryDragging] = useState(false);
  const subCategoryImageInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen || !subCategory) {
    return null;
  }

  const displayImage = filePreview || subCategory.image || null;

  useEffect(() => {
    if (isOpen && subCategory) {
      form.reset({
        name: subCategory.name,
        slug: subCategory.slug,
        accent: subCategory.accent || '#f97316',
        description: subCategory.description || '',
        metaTitle: subCategory.metaTitle || '',
        metaDescription: subCategory.metaDescription || '',
        isActive: subCategory.isActive ?? true,
        mediaAttachment: undefined,
      });
      setFilePreview(null);
      setIsAutoSlug(true);
    }
  }, [subCategory, isOpen, form]);

  useEffect(() => {
    if (mediaFile instanceof File) {
      const objectUrl = URL.createObjectURL(mediaFile);
      setFilePreview(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    }
  }, [mediaFile]);

  function refreshWithToast(message: string, type: 'success' | 'error') {
    if (type === 'success') {
      toast.success(message);
    } else {
      toast.error(message);
    }
    router.refresh();
  }

  const handleSubmit: SubmitHandler<TEditSubCategoryType> = data => {
    const parentIdentifier = categorySlug;
    const currentSubSlug = subCategory.slug;

    if (!parentIdentifier || !currentSubSlug) {
      toast.error('Identifier missing.');
      return;
    }

    setLoading(true);

    startTransition(() => {
      (async () => {
        try {
          const result = await updateCategorySubCategory(
            parentIdentifier,
            currentSubSlug,
            {
              name: data.name.trim(),
              slug: data.slug.trim(),
              isActive: data.isActive,
              image:
                data.mediaAttachment instanceof File
                  ? data.mediaAttachment
                  : undefined,
              description: data.description?.trim() ?? '',
              accent: data.accent?.trim() || undefined,
              metaTitle: data.metaTitle?.trim() || undefined,
              metaDescription: data.metaDescription?.trim() || undefined,
            },
          );

          if (!result?.success) {
            refreshWithToast(
              result?.message ?? 'Failed to update sub-category.',
              'error',
            );
            return;
          }

          refreshWithToast(
            result.message ?? 'Sub-category updated successfully.',
            'success',
          );
          onSuccess?.();
        } catch {
          refreshWithToast('Failed to update sub-category.', 'error');
        } finally {
          setLoading(false);
        }
      })();
    });
  };

  return (
    <Dialog modal open={isOpen} onOpenChange={open => !open && onCancel?.()}>
      <DialogContent className="max-h-[90vh] overflow-hidden p-0 sm:max-w-7xl [&>button]:hidden">
        <form
          onSubmit={form.handleSubmit(handleSubmit, handleFormError)}
          className="flex max-h-[90vh] flex-col w-full"
        >
          <DialogHeader className="px-6 pb-4 pt-6">
            <div className="flex items-center justify-between pr-10">
              <div>
                <DialogTitle>
                  <span className="text-2xl font-bold">Edit Sub-Category</span>
                </DialogTitle>
                <DialogDescription>
                  Modify the details for <strong>{subCategory.name}</strong>.
                </DialogDescription>
              </div>

              <Controller
                name="isActive"
                control={form.control}
                render={({ field }) => (
                  <div className="flex items-center gap-3 rounded-lg border bg-muted/50 px-3 py-2">
                    <FieldLabel className="mb-0 cursor-pointer text-sm font-semibold">
                      {field.value ? 'Active' : 'Inactive'}
                    </FieldLabel>
                    <Switch
                      checked={!!field.value}
                      onCheckedChange={field.onChange}
                    />
                  </div>
                )}
              />
            </div>
          </DialogHeader>

          <DialogClose asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-4 top-4 z-10 h-8 w-8 rounded-full bg-destructive text-muted-foreground transition-colors hover:bg-destructive hover:text-destructive-foreground cursor-pointer"
              aria-label="Close dialog"
            >
              <X className="size-5 text-white" />
            </Button>
          </DialogClose>

          <div className="flex-1 overflow-y-auto px-6">
            <FieldGroup className="pb-6">
              <div className="grid gap-5 sm:grid-cols-2">
                <Controller
                  name="name"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="edit-sub-name">
                        Sub-Category Name
                      </FieldLabel>
                      <Input
                        {...field}
                        id="edit-sub-name"
                        placeholder="Sub-category name"
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />

                <Controller
                  name="slug"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="edit-sub-slug">Slug</FieldLabel>
                      <Input
                        {...field}
                        id="edit-sub-slug"
                        placeholder="sub-category-slug"
                        onChange={e => {
                          field.onChange(e);
                          setIsAutoSlug(false);
                        }}
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />

                <Controller
                  name="accent"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="edit-sub-accent">
                        Accent Color
                      </FieldLabel>
                      <AccentColorField
                        {...field}
                        id="edit-sub-accent"
                        className="w-full max-w-full"
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />

                <Controller
                  name="metaTitle"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="edit-sub-metaTitle">
                        Meta Title
                      </FieldLabel>
                      <Input
                        {...field}
                        id="edit-sub-metaTitle"
                        placeholder="Enter meta title"
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />

                <div className="md:col-span-2 lg:col-span-1">
                  <Controller
                    name="description"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <DashboardRichTextEditor
                          label="Description"
                          {...field}
                          value={field.value || ''}
                          minHeightClassName="h-32"
                        />
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />
                </div>

                <div className="md:col-span-2 lg:col-span-1">
                  <Controller
                    name="metaDescription"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor="edit-sub-metaDescription">
                          Meta Description
                        </FieldLabel>
                        <Textarea
                          {...field}
                          id="edit-sub-metaDescription"
                          aria-invalid={fieldState.invalid}
                          placeholder="Enter meta description"
                          rows={12}
                        />
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />
                </div>

                <div className="sm:col-span-2">
                  <Controller
                    name="mediaAttachment"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <MediaAttachment
                          categoryDragging={subCategoryDragging}
                          categoryImagePreview={displayImage}
                          categoryImageInputRef={subCategoryImageInputRef}
                          setCategoryDragging={setSubCategoryDragging}
                          handleCategoryImageSelect={file => {
                            field.onChange(file);
                          }}
                          submitButtonText="Update Image"
                        />
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />
                </div>
              </div>
            </FieldGroup>
          </div>

          <DialogFooter className="border-t px-6 py-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button loading={loading || isPending} type="submit">
              Update Sub-Category
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
