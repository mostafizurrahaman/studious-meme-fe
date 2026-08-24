'use client';

import * as React from 'react';

import { Badge } from '@/components/ui/badge';
import { useCartStore } from '@/lib/cart-store';

export const MiniCartDropdown = React.forwardRef<
  HTMLButtonElement,
  { active?: boolean }
>(function MiniCartDropdown({ active = false }, ref) {
  const count = useCartStore((state) =>
    state.items.reduce((sum, item) => sum + item.quantity, 0),
  );
  const setDrawerOpen = useCartStore((state) => state.setDrawerOpen);

  return (
    <div className="hidden md:block">
      <button
        ref={ref}
        type="button"
        onClick={() => setDrawerOpen(true)}
        className="inline-flex h-11 items-center justify-center rounded-full border border-border px-4 text-sm font-semibold text-foreground transition hover:border-primary/30 hover:bg-primary/5"
        style={
          active
            ? {
              backgroundColor: 'var(--primary)',
              borderColor: 'var(--primary)',
              color: '#ffffff',
            }
            : undefined
        }
      >
        Cart
        <Badge className="ml-2 h-5 min-w-5 px-1.5 text-[11px] leading-none">
          {count}
        </Badge>
      </button>
    </div>
  );
});
