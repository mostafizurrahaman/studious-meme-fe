'use client';

import Link from 'next/link';
import { useCartStore } from '@/lib/cart-store';

export function CartCountLink() {
  const count = useCartStore((state) =>
    state.items.reduce((sum, item) => sum + item.quantity, 0),
  );

  return (
    <Link
      href="/cart"
      className="inline-flex h-11 items-center justify-center rounded-full border border-border px-4 text-sm font-semibold text-foreground transition hover:border-primary/30 hover:bg-primary/5"
      aria-label={`Cart with ${count} items`}
    >
      Cart
      <span className="ml-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[11px] font-bold leading-none text-primary-foreground">
        {count}
      </span>
    </Link>
  );
}
