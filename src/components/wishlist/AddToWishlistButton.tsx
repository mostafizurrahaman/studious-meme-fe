'use client';

import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import type { Product } from '@/lib/storefront-types';
import { useWishlistStore } from '@/lib/wishlist-store';
import {
  addWishlistItem,
  removeWishlistItem,
} from '@/services/WishlistHistory';

type Props = {
  product: Product;
  compact?: boolean;
  className?: string;
};

export function AddToWishlistButton({
  product,
  compact = false,
  className,
}: Props) {
  const router = useRouter();
  const hydrated = useWishlistStore((state) => state.hydrated);
  const saved = useWishlistStore((state) =>
    state.items.some((item) => item.sku === product.sku),
  );
  const [isPending, startTransition] = useTransition();

  function handleToggle() {
    if (!product.id) {
      toast.error('This product cannot be saved right now.');
      return;
    }

    const productId = product.id;
    const nextSaved = !saved;

    startTransition(async () => {
      if (nextSaved) {
        const result = await addWishlistItem(productId);
        if (!result.success) {
          if (
            result.message === 'Sign in to save wishlist items to your account.'
          ) {
            router.push('/my-account?notice=wishlist');
            return;
          }

          toast.error(result.message ?? 'Unable to update wishlist.');
          return;
        }

        useWishlistStore.getState().add(product);
        return;
      } else {
        const result = await removeWishlistItem(productId);
        if (!result.success) {
          toast.error(result.message ?? 'Unable to update wishlist.');
          return;
        }

        useWishlistStore.getState().remove(product.sku);
      }
    });
  }

  return (
    <Button
      type="button"
      variant={saved ? 'secondary' : 'outline'}
      disabled={!hydrated || isPending}
      onClick={handleToggle}
      className={cn(
        compact
          ? 'h-9 w-full justify-center rounded-full border-border px-2 py-0.5 text-[10px] font-semibold shadow-sm'
          : 'h-12 rounded-full px-6 text-sm font-bold shadow-sm',
        className,
      )}
    >
      {saved ? 'In wishlist' : compact ? 'Wishlist' : 'Add to wishlist'}
    </Button>
  );
}
