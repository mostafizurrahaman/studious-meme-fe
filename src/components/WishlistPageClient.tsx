'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ProductCard } from '@/components/ProductCard';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import type { Product } from '@/lib/storefront-types';
import { useWishlistStore } from '@/lib/wishlist-store';
import { removeWishlistItem } from '@/services/WishlistHistory';
import { toast } from 'sonner';

type Props = {
  authenticated: boolean;
  savedProducts: Product[];
};

export function WishlistPageClient({ authenticated, savedProducts }: Props) {
  const items = useWishlistStore((state) => state.items);
  const hydrated = useWishlistStore((state) => state.hydrated);
  const remove = useWishlistStore((state) => state.remove);
  const [backendProducts, setBackendProducts] = useState(savedProducts);

  if (!authenticated) {
    return (
      <Card className="p-6 shadow-sm sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">
          Saved items
        </p>
        <h1 className="mt-4 text-3xl font-black text-secondary sm:text-4xl">
          Wishlist
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-foreground/65 sm:text-base">
          Wishlist is tied to your account, so please sign in to view saved
          products.
        </p>
        <Button
          asChild
          className="mt-6 h-11 rounded-full px-6 text-sm font-bold text-white! shadow-sm"
        >
          <Link href="/my-account">Sign in</Link>
        </Button>
      </Card>
    );
  }

  const products = hydrated && items.length > 0 ? items : backendProducts;

  return (
    <>
      <Card className="p-6 shadow-sm sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">
          Saved items
        </p>
        <h1 className="mt-4 text-3xl font-black text-secondary sm:text-4xl">
          Wishlist
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-foreground/65 sm:text-base">
          {hydrated && items.length > 0
            ? `${items.length} saved product${items.length === 1 ? '' : 's'}.`
            : backendProducts.length > 0
              ? `${backendProducts.length} saved product${backendProducts.length === 1 ? '' : 's'}.`
              : 'Save products from product pages.'}
        </p>
      </Card>

      {products.length > 0 ? (
        <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {products.map((product) => (
            <div key={product.sku} className="space-y-2">
              <ProductCard
                product={product}
                trailingAction={
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      const snapshot = useWishlistStore.getState().items;
                      remove(product.sku);
                      setBackendProducts((current) =>
                        current.filter((item) => item.sku !== product.sku),
                      );

                      if (!product.id) {
                        toast.error(
                          'Unable to remove this wishlist item right now.',
                        );
                        return;
                      }

                      void removeWishlistItem(product.id).then((result) => {
                        if (!result.success) {
                          remove(product.sku);
                          useWishlistStore.getState().replaceItems(snapshot);
                          setBackendProducts((current) =>
                            current.some((item) => item.sku === product.sku)
                              ? current
                              : [product, ...current],
                          );
                          toast.error(
                            result.message ?? 'Unable to update wishlist.',
                          );
                        }
                      });
                    }}
                    className="h-8 rounded-full border-border px-3 text-[8px] font-semibold text-foreground/70 sm:h-12 sm:text-[11px]"
                  >
                    Remove
                  </Button>
                }
              />
            </div>
          ))}
        </section>
      ) : (
        <Card className="mt-6 p-8 text-center shadow-sm">
          <div className="text-lg font-black text-primary">
            No products added to wishlist
          </div>
          <p className="mt-2 text-sm text-foreground/55">
            Add products from a product page to build your wishlist.
          </p>
          <Button
            asChild
            className="mt-6 h-11 rounded-full px-6 text-sm font-bold text-white! shadow-sm"
          >
            <Link href="/shop">Add products</Link>
          </Button>
        </Card>
      )}
    </>
  );
}
