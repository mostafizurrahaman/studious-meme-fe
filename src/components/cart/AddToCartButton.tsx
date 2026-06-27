'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useCartStore } from '@/lib/cart-store';
import type { Product } from '@/lib/storefront-types';
import { addCartItem } from '@/services/Cart';

export function AddToCartButton({
  product,
  className,
  disabled = false,
  disabledLabel = 'Out of stock',
}: {
  product: Product;
  className?: string;
  disabled?: boolean;
  disabledLabel?: string;
}) {
  const addProduct = useCartStore((state) => state.addProduct);
  const markItemAsSynced = useCartStore((state) => state.markItemAsSynced);
  const [added, setAdded] = useState(false);

  return (
    <Button
      type="button"
      disabled={disabled}
      onClick={() => {
        if (disabled) {
          return;
        }

        addProduct(product);
        setAdded(true);
        toast.success('Added to cart.', {
          description: product.title,
        });
        if (product.id) {
          void addCartItem(product.id)
            .then((result) => {
              if (result?.success) {
                markItemAsSynced(product.id);
              }
            })
            .catch(() => null);
        }
        window.setTimeout(() => setAdded(false), 1200);
      }}
      className={cn(
        'h-9 w-full rounded-full px-3 text-[9px] font-semibold shadow-sm sm:h-12 sm:w-auto sm:px-6 sm:text-[11px]',
        className,
      )}
    >
      {disabled ? disabledLabel : added ? 'Added' : 'Add to cart'}
    </Button>
  );
}
