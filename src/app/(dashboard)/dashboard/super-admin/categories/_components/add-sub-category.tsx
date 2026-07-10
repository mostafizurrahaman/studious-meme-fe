// src/app/(dashboard)/dashboard/super-admin/categories/_components/add-sub-category.tsx
'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { X } from 'lucide-react';

import { Button } from '@/components/ui/button';
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
import {
  categorySchema,
  type TCreateSubCategoryType,
} from '@/schemas/category';
import { handleFormError } from '@/lib/handle-zod-error';
import { slugify } from '@/lib/slug';
import { createCategorySubCategory } from '@/services/Category';

interface IAddSubCategoryModalProps {
  categorySlug: string;
  isOpen: boolean;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function AddSubCategoryModal({
  categorySlug,
  isOpen,
  onSuccess,
  onCancel,
}: IAddSubCategoryModalProps) {
  const [isPending, startTransition] = useTransition();
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const form = useForm<TCreateSubCategoryType>({
    resolver: zodResolver(categorySchema.createSubCategorySchema),
    mode: 'onBlur',
    defaultValues: {
      name: '',
      slug: '',
      accent: '#f97316',
      description: '',
      metaTitle: '',
      metaDescription: '',
      mediaAttachment: undefined,
    },
  });

  const watchedName = form.watch('name');

  useEffect(() => {
    if (watchedName) {
      form.setValue('slug', slugify(watchedName), {
        shouldValidate: true,
        shouldDirty: true,
      });
    }
  }, [watchedName, form]);

  const [subCategoryDragging, setSubCategoryDragging] = useState(false);
  const [subCategoryImagePreview, setSubCategoryImagePreview] = useState<
    string | null
  >(null);
  const subCategoryImageInputRef = useRef<HTMLInputElement>(null);

  const handleSubCategoryImageSelect = (file?: File) => {
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);
    setSubCategoryImagePreview(previewUrl);

    form.setValue('mediaAttachment', file, {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  function refreshWithToast(message: string, type: 'success' | 'error') {
    if (type === 'success') {
      toast.success(message);
    } else {
      toast.error(message);
    }
    router.refresh();
  }

  const handleSubmit: SubmitHandler<TCreateSubCategoryType> = data => {
    setLoading(true);

    startTransition(() => {
      (async () => {
        try {
          const result = await createCategorySubCategory(categorySlug, {
            name: data.name.trim(),
            slug: data.slug.trim(),
            image: data.mediaAttachment,
            description: data.description?.trim() ?? '',
            accent: data.accent?.trim() || undefined,
            metaTitle: data?.metaTitle?.trim() as string,
            metaDescription: data.metaDescription?.trim() || undefined,
            isActive: true,
          });

          if (!result?.success) {
            refreshWithToast(
              result?.message ?? 'Failed to create sub-category.',
              'error',
            );
            return;
          }

          form.reset();
          setSubCategoryImagePreview(null);
          refreshWithToast(
            result.message ?? 'Sub-category created successfully.',
            'success',
          );
          onSuccess?.();
        } catch {
          refreshWithToast('Failed to create sub-category.', 'error');
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
            <DialogTitle>
              <span className="text-2xl font-bold">Add Sub-Category</span>
            </DialogTitle>
            <DialogDescription>
              Create a new sub-category under the parent category.
            </DialogDescription>
          </DialogHeader>

          <DialogClose asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-4 top-4 z-10 h-8 w-8 rounded-full bg-destructive text-muted-foreground transition-colors hover:bg-destructive hover:text-destructive-foreground cursor-pointer focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
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
                      <FieldLabel htmlFor="sub-name">
                        Sub-Category Name
                      </FieldLabel>
                      <Input
                        {...field}
                        id="sub-name"
                        aria-invalid={fieldState.invalid}
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
                      <FieldLabel htmlFor="sub-slug">Slug</FieldLabel>
                      <Input
                        {...field}
                        id="sub-slug"
                        aria-invalid={fieldState.invalid}
                        placeholder="Sub-category slug"
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
                      <FieldLabel htmlFor="sub-accent">Accent Color</FieldLabel>
                      <AccentColorField
                        {...field}
                        id="sub-accent"
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
                      <FieldLabel htmlFor="sub-metaTitle">
                        Meta Title
                      </FieldLabel>
                      <Input
                        {...field}
                        id="sub-metaTitle"
                        aria-invalid={fieldState.invalid}
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
                        <FieldLabel htmlFor="sub-metaDescription">
                          Meta Description
                        </FieldLabel>
                        <Textarea
                          {...field}
                          id="sub-metaDescription"
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
                          categoryImagePreview={subCategoryImagePreview}
                          categoryImageInputRef={subCategoryImageInputRef}
                          setCategoryDragging={setSubCategoryDragging}
                          handleCategoryImageSelect={file => {
                            field.onChange(file);
                            handleSubCategoryImageSelect(file);
                          }}
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
              Save changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
