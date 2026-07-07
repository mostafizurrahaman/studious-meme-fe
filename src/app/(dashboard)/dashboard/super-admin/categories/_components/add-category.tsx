'use client';

import {
  startTransition,
  useEffect,
  useRef,
  useState,
  useTransition,
} from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';

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
import { categorySchema, type TCreateCategoryType } from '@/schemas/category';
import { handleFormError } from '@/lib/handle-zod-error';
import { slugify } from '@/lib/slug';
import { createCategory } from '@/services/Category';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { CrossIcon, X } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';

interface IAddCategoryModalProps {
  categoryLength: number;
  isOpen: boolean;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function AddCategoryModal({
  categoryLength,
  isOpen,
  onSuccess,
  onCancel,
}: IAddCategoryModalProps) {
  const [isPending, startTransition] = useTransition();
  const form = useForm<TCreateCategoryType>({
    resolver: zodResolver(categorySchema.createCategorySchema),
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
  const [loading, setLoading] = useState(false);

  const name = form.watch('name');
  const router = useRouter();

  useEffect(() => {
    form.setValue('slug', slugify(name));
  }, [name]);

  // HTMLInputElement টাইপ ডিক্লেয়ার করায় টাইপ কাস্টিংয়ের প্রয়োজনীয়তা দূর হয়েছে
  const categoryImageInputRef = useRef<HTMLInputElement>(null);
  const [categoryDragging, setCategoryDragging] = useState(false);
  const [categoryImagePreview, setCategoryImagePreview] = useState<
    string | null
  >(null);

  const handleCategoryImageSelect = (file?: File) => {
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);
    setCategoryImagePreview(previewUrl);

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

  const handleSubmit: SubmitHandler<TCreateCategoryType> = data => {
    if (!data.mediaAttachment) {
      toast.error('Category image is required.');
      return;
    }

    setLoading(true);

    startTransition(() => {
      (async () => {
        try {
          const result = await createCategory({
            name: data.name.trim(),
            slug: data.slug.trim(),
            image: data.mediaAttachment,
            description: data.description?.trim() ?? '',
            accent: data.accent?.trim() || undefined,
            metaTitle: data.metaTitle?.trim() || undefined,
            metaDescription: data.metaDescription?.trim() || undefined,
          });

          if (!result?.success) {
            refreshWithToast(
              result?.message ?? 'Failed to create category.',
              'error',
            );
            return;
          }

          form.reset();
          setCategoryImagePreview(null);
          refreshWithToast(
            result.message ?? 'Category created successfully.',
            'success',
          );
          onSuccess?.();
        } catch {
          refreshWithToast('Failed to create category.', 'error');
        } finally {
          setLoading(false);
        }
      })();
    });
  };

  return (
    <Dialog modal open={isOpen} onOpenChange={open => !open && onCancel?.()}>
      <DialogContent className="max-h-[90vh] overflow-hidden p-0 sm:max-w-7xl [&>button]:hidden">
        {/* handleSubmit-এ সরাসরি handleFormError ব্যবহার করা হয়েছে */}
        <form
          onSubmit={form.handleSubmit(handleSubmit, handleFormError)}
          className="flex max-h-[90vh] flex-col w-full"
        >
          <DialogHeader className="px-6 pb-4 pt-6">
            <DialogTitle>
              <span className="text-2xl font-bold">Add Category</span>
            </DialogTitle>
            <DialogDescription>
              {categoryLength} categories configured in system. Define,
              configure, or optimize hierarchies here.
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
              <X className="size-5 text-white store-white" />
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
                      <FieldLabel htmlFor="name">Category Name</FieldLabel>
                      <Input
                        {...field}
                        id="name"
                        aria-invalid={fieldState.invalid}
                        placeholder="Category name"
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
                      <FieldLabel htmlFor="slug">Slug</FieldLabel>
                      <Input
                        {...field}
                        id="slug"
                        aria-invalid={fieldState.invalid}
                        placeholder="Category slug"
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
                      <FieldLabel htmlFor="accent">
                        Pick Accent Color
                      </FieldLabel>
                      <AccentColorField
                        {...field}
                        id="accent"
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
                      <FieldLabel htmlFor="metaTitle">Meta Title</FieldLabel>
                      <Input
                        {...field}
                        id="metaTitle"
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
                        <FieldLabel htmlFor="metaDescription">
                          Meta Description
                        </FieldLabel>
                        <Textarea
                          {...field}
                          id="metaDescription"
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
                          categoryDragging={categoryDragging}
                          categoryImagePreview={categoryImagePreview}
                          categoryImageInputRef={categoryImageInputRef}
                          setCategoryDragging={setCategoryDragging}
                          handleCategoryImageSelect={file => {
                            field.onChange(file);
                            handleCategoryImageSelect(file);
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
            <Button loading={loading} type="submit">
              Save changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
