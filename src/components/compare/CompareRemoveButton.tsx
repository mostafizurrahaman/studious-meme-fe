'use client';

import { useTransition } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { useCompareStore } from '@/lib/compare-store';
import type { Product } from '@/lib/storefront-types';
import { removeCompareItem } from '@/services/ComparisonHistory';

type Props = {
  product: Product;
  productId: string;
  onRemoved?: (productSku: string) => void;
};

export function CompareRemoveButton({ product, productId, onRemoved }: Props) {
  const [isPending, startTransition] = useTransition();
  const remove = useCompareStore((state) => state.remove);
  const replaceItems = useCompareStore((state) => state.replaceItems);

  return (
    <Button
      type="button"
      variant="outline"
      disabled={isPending}
      className="h-9 rounded-full border-border px-4 text-xs font-semibold text-foreground/70"
      onClick={() => {
        const snapshot = useCompareStore.getState().items;
        remove(product.sku);

        startTransition(async () => {
          const result = await removeCompareItem(productId);

          if (!result.success) {
            toast.error(result.message ?? 'Unable to update compare list.');
            replaceItems(snapshot);
            return;
          }

          onRemoved?.(product.sku);
        });
      }}
    >
      {isPending ? 'Removing...' : 'Remove'}
    </Button>
  );
}
