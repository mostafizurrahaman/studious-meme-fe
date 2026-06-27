'use client';

import Image from 'next/image';
import Link from 'next/link';
import * as React from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { formatMoney } from '@/lib/cart';
import { useCartStore } from '@/lib/cart-store';

export const MiniCartDropdown = React.forwardRef<
  HTMLDetailsElement,
  { active?: boolean }
>(function MiniCartDropdown({ active = false }, ref) {
  const items = useCartStore((state) => state.items);
  const count = useCartStore((state) =>
    state.items.reduce((sum, item) => sum + item.quantity, 0),
  );
  const subtotal = useCartStore((state) =>
    state.items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0),
  );

  return (
    <details ref={ref} className="group relative hidden md:block">
      <summary className="list-none cursor-pointer outline-none [&::-webkit-details-marker]:hidden">
        <div
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
        </div>
      </summary>

      <Card className="absolute right-0 top-full z-30 mt-3 w-90 p-4 shadow-2xl">
        <div className="flex items-center justify-between">
          <div className="text-sm font-bold text-secondary">Mini cart</div>
          <div className="text-xs font-semibold text-foreground/55">
            {count} items
          </div>
        </div>
        <div className="mt-4 space-y-3">
          {items.length > 0 ? (
            items.slice(0, 3).map((item) => (
              <div
                key={item.sku}
                className="flex gap-3 rounded-2xl border border-border p-3"
              >
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-muted">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    sizes="56px"
                    className="object-contain p-1.5"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="line-clamp-2 text-sm font-semibold text-foreground">
                    {item.title}
                  </div>
                  <div className="mt-1 text-xs text-foreground/55">
                    Qty {item.quantity}
                  </div>
                </div>
                <div className="text-xs font-semibold text-primary">
                  {formatMoney(item.unitPrice * item.quantity)}
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-2xl border border-dashed border-border p-4 text-sm text-foreground/55">
              Your cart is empty.
            </div>
          )}
        </div>
        <Separator className="my-4" />
        <div className="rounded-2xl bg-muted px-4 py-3 text-sm font-semibold text-foreground">
          Subtotal: {formatMoney(subtotal)}
        </div>
        <Button
          asChild
          className="mt-4 h-11 w-full rounded-full bg-primary/90 px-6 text-sm font-bold text-white shadow-sm transition-all duration-200 ease-out hover:bg-primary/60 hover:shadow-md hover:-translate-y-px"
        >
          <Link href="/cart">
            <span className="text-white transition group-hover/button:text-black">
              View cart
            </span>
          </Link>
        </Button>
      </Card>
    </details>
  );
});
