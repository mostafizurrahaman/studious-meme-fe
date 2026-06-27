'use client';

import Image from 'next/image';
import { useMemo, useState, useTransition } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { Loader2, Star } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { formatDashboardDate } from '@/lib/formatDate';
import { makeZodResolver } from '@/lib/form-validation';
import { createProductReview } from '@/services/ProductReview';
import type { BackendOrder } from '@/services/Order';
import { z } from 'zod';

const MAX_REVIEW_IMAGES = 5;

const reviewSchema = z.object({
  product: z
    .string({ error: 'Product is required!' })
    .trim()
    .min(1, { message: 'Product is required!' }),
  rating: z.coerce
    .number({ error: 'Rating is required!' })
    .min(1, { message: 'Rating is required!' })
    .max(5, { message: 'Rating cannot exceed 5!' }),
  comment: z
    .string({ error: 'Comment is required!' })
    .trim()
    .min(1, { message: 'Comment is required!' })
    .max(2000, { message: 'Comment cannot exceed 2000 characters!' }),
});

type ReviewFormValues = z.infer<typeof reviewSchema>;

type Props = {
  order: BackendOrder | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved?: () => void;
};

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }, (_, index) => (
        <Star
          key={index}
          className={
            index < Math.round(rating)
              ? 'size-4 fill-primary text-primary'
              : 'size-4 text-muted-foreground/35'
          }
        />
      ))}
    </div>
  );
}

export function OrderReviewDialog({
  order,
  open,
  onOpenChange,
  onSaved,
}: Props) {
  const [isSubmitting, startSubmitting] = useTransition();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const defaultProduct = useMemo(() => order?.items[0]?.slug ?? '', [order]);

  const form = useForm<ReviewFormValues>({
    resolver: makeZodResolver(reviewSchema),
    defaultValues: {
      product: defaultProduct,
      rating: 5,
      comment: '',
    },
    mode: 'onTouched',
  });

  const selectedProduct =
    useWatch({ control: form.control, name: 'product' }) ?? defaultProduct;
  const watchedRating =
    useWatch({ control: form.control, name: 'rating' }) ?? 5;
  const selectedItem =
    order?.items.find((item) => item.slug === selectedProduct) ??
    order?.items[0] ??
    null;

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      setSelectedFiles([]);
    }

    onOpenChange(nextOpen);
  }

  function submit(values: ReviewFormValues) {
    if (!order) return;

    startSubmitting(async () => {
      const formData = new FormData();
      formData.set(
        'data',
        JSON.stringify({
          product: values.product,
          rating: values.rating,
          comment: values.comment,
        }),
      );

      selectedFiles.forEach((file) => {
        formData.append('images', file);
      });

      const result = await createProductReview(formData);

      if (!result.success) {
        toast.error(result.message ?? 'Unable to submit review.');
        return;
      }

      toast.success(result.message ?? 'Your review has been submitted.');
      form.reset({
        product: defaultProduct,
        rating: 5,
        comment: '',
      });
      setSelectedFiles([]);
      handleOpenChange(false);
      onSaved?.();
    });
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Write a review</DialogTitle>
          <DialogDescription>
            Pick a delivered product from this order and share your experience.
          </DialogDescription>
        </DialogHeader>

        {order ? (
          <div className="space-y-4">
            <div className="rounded-2xl border bg-muted/20 p-4 text-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <div className="font-semibold text-foreground">
                    {order.orderId}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Delivered {formatDashboardDate(order.updatedAt)}
                  </div>
                </div>
                <div className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-700">
                  {order.status}
                </div>
              </div>
            </div>

            <form className="space-y-4" onSubmit={form.handleSubmit(submit)}>
              <div className="space-y-2">
                <div className="text-xs font-medium text-muted-foreground">
                  Product
                </div>
                <Select
                  value={selectedProduct}
                  onValueChange={(value) => form.setValue('product', value)}
                >
                  <SelectTrigger className="h-11 rounded-xl">
                    <SelectValue placeholder="Select product" />
                  </SelectTrigger>
                  <SelectContent>
                    {order.items.map((item) => (
                      <SelectItem key={item.slug} value={item.slug}>
                        {item.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedItem ? (
                <div className="flex gap-3 rounded-2xl border bg-background p-3 text-sm">
                  <div className="relative size-14 shrink-0 overflow-hidden rounded-xl bg-muted">
                    <Image
                      src={selectedItem.image}
                      alt={selectedItem.title}
                      fill
                      sizes="56px"
                      className="object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-foreground">
                      {selectedItem.title}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      SKU {selectedItem.sku} · Qty {selectedItem.quantity}
                    </div>
                  </div>
                </div>
              ) : null}

              <div className="space-y-2">
                <div className="text-xs font-medium text-muted-foreground">
                  Rating
                </div>
                <Input
                  type="number"
                  min={1}
                  max={5}
                  step="1"
                  {...form.register('rating')}
                />
                <Stars rating={Number(watchedRating)} />
                {form.formState.errors.rating?.message ? (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.rating.message}
                  </p>
                ) : null}
              </div>

              <div className="space-y-2">
                <div className="text-xs font-medium text-muted-foreground">
                  Comment
                </div>
                <Textarea
                  className="min-h-28 rounded-2xl"
                  placeholder="Tell others what you think..."
                  {...form.register('comment')}
                />
                {form.formState.errors.comment?.message ? (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.comment.message}
                  </p>
                ) : null}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between gap-3 text-xs font-medium text-muted-foreground">
                  <span>Review images</span>
                  <span>
                    {selectedFiles.length}/{MAX_REVIEW_IMAGES}
                  </span>
                </div>
                <Input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(event) =>
                    setSelectedFiles(
                      Array.from(event.target.files ?? []).slice(
                        0,
                        MAX_REVIEW_IMAGES,
                      ),
                    )
                  }
                />
                {selectedFiles.length > 0 ? (
                  <div className="space-y-1 rounded-2xl border bg-muted/20 p-3 text-xs text-muted-foreground">
                    {selectedFiles.map((file) => (
                      <div key={file.name}>{file.name}</div>
                    ))}
                  </div>
                ) : null}
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting || order.status !== 'DELIVERED'}
                >
                  {isSubmitting ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : null}
                  Submit review
                </Button>
              </DialogFooter>
            </form>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
