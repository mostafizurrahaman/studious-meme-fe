'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { AddToCartButton } from '@/components/cart/AddToCartButton';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { formatMoney, formatPriceLabelWithUnit } from '@/lib/cart';
import { getProductPrimaryImage, type Product } from '@/lib/storefront-types';
import { isOutOfStockLabel } from '@/lib/stock';
import { useCompareStore } from '@/lib/compare-store';
import {
  MAX_COMPARE_ITEMS,
  buildCompareSpecRows,
  comparisonHistoryRecordToProduct,
} from '@/lib/compare';
import { getMyComparisonHistory } from '@/services/ComparisonHistory';
import { CompareRemoveButton } from './CompareRemoveButton';

type Props = {
  authenticated: boolean;
  initialProducts: Product[];
};

export function ComparePageClient({ authenticated, initialProducts }: Props) {
  const items = useCompareStore((state) => state.items);
  const replaceItems = useCompareStore((state) => state.replaceItems);
  const [backendProducts, setBackendProducts] =
    useState<Product[]>(initialProducts);

  useEffect(() => {
    if (!authenticated) {
      return;
    }

    let active = true;

    void getMyComparisonHistory()
      .then((result) => {
        if (!active || !result.success || !Array.isArray(result.data)) {
          return;
        }

        const refreshed = result.data
          .map(comparisonHistoryRecordToProduct)
          .filter((product): product is Product => Boolean(product))
          .slice(0, MAX_COMPARE_ITEMS);

        setBackendProducts(refreshed);
        replaceItems(refreshed);
      })
      .catch(() => null);

    return () => {
      active = false;
    };
  }, [authenticated, replaceItems]);

  const products = useMemo(() => {
    if (!authenticated) {
      return [];
    }

    return items.length > 0 ? items : backendProducts;
  }, [authenticated, backendProducts, items]);

  const visibleProducts = products.slice(0, MAX_COMPARE_ITEMS);
  const rows = buildCompareSpecRows(visibleProducts);

  if (!authenticated) {
    return (
      <Card className="p-6 shadow-sm sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">
          Comparison
        </p>
        <h1 className="mt-4 text-3xl font-black text-secondary sm:text-4xl">
          Compare
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-foreground/65 sm:text-base">
          Compare is available after sign in so your list always stays tied to
          your account.
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

  return (
    <>
      <Card className="p-6 shadow-sm sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">
          Comparison
        </p>
        <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-secondary sm:text-4xl">
              Compare
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-foreground/65 sm:text-base">
              Compare up to four products from the same category.
            </p>
          </div>
          <div className="rounded-full bg-muted px-4 py-2 text-sm font-semibold text-foreground/70">
            {visibleProducts.length}/{MAX_COMPARE_ITEMS} items
          </div>
        </div>
      </Card>

      {visibleProducts.length > 0 ? (
        <section className="mt-6 space-y-6">
          <div className="overflow-x-auto pb-2">
            <div className="flex min-w-max gap-4">
              {visibleProducts.map((product) => (
                <Card
                  key={product.sku}
                  className="w-72 shrink-0 overflow-hidden border-border shadow-sm sm:w-80"
                >
                  <CardContent className="flex h-full flex-col p-4">
                    <div className="relative aspect-square overflow-hidden rounded-2xl bg-muted">
                      <Image
                        src={getProductPrimaryImage(product)}
                        alt={product.title}
                        fill
                        sizes="(max-width: 768px) 100vw, 288px"
                        className="object-contain p-3"
                      />
                    </div>
                    <div className="mt-4 space-y-2">
                      <h2 className="line-clamp-2 text-base font-bold text-secondary">
                        {product.title}
                      </h2>
                      <div className="text-sm text-foreground/60">
                        Brand: {product.brand}
                      </div>
                      <div className="flex items-end gap-2">
                        <div className="text-lg font-black text-primary">
                          {formatPriceLabelWithUnit(
                            product.price,
                            product.sellingUnit,
                          )}
                        </div>
                        {product.oldPrice ? (
                          <div className="pb-0.5 text-sm text-foreground/40 line-through">
                            {formatMoney(Number(product.oldPrice))}
                          </div>
                        ) : null}
                      </div>
                      <div className="flex flex-wrap gap-2 text-xs font-semibold text-foreground/60">
                        <span className="rounded-full bg-muted px-3 py-1">
                          {product.stock}
                        </span>
                        <span className="rounded-full bg-muted px-3 py-1">
                          Rating {product.rating}
                        </span>
                      </div>
                    </div>
                    <div className="mt-4 grid gap-2 rounded-2xl bg-muted/50 p-3 text-xs text-foreground/70">
                      <div className="flex items-center justify-between gap-3">
                        <span className="font-semibold text-secondary">
                          Category
                        </span>
                        <span className="text-right">{product.category}</span>
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <span className="font-semibold text-secondary">
                          SKU
                        </span>
                        <span className="text-right">{product.sku}</span>
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <span className="font-semibold text-secondary">
                          Weight
                        </span>
                        <span className="text-right">
                          {product.weightKg} kg
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <span className="font-semibold text-secondary">
                          COD
                        </span>
                        <span className="text-right">
                          {product.isNoCOD ? 'Unavailable' : 'Available'}
                        </span>
                      </div>
                    </div>
                    <div className="mt-4 grid gap-1.5 pt-1 sm:grid-cols-1 sm:gap-2">
                      <AddToCartButton
                        product={product}
                        disabled={isOutOfStockLabel(product.stock)}
                        className="h-8 rounded-full px-3 text-[8px] font-semibold sm:h-12 sm:text-[11px]"
                      />
                      <div className="flex items-center gap-2">
                        <Button
                          asChild
                          variant="outline"
                          className="h-8 flex-1 rounded-full border-border px-3 text-[8px] font-semibold text-foreground/70 sm:h-12 sm:text-[11px]"
                        >
                          <Link href={`/product/${product.slug}`}>View</Link>
                        </Button>
                        {product.id ? (
                          <CompareRemoveButton
                            product={product}
                            productId={product.id}
                            onRemoved={(sku) => {
                              setBackendProducts((current) =>
                                current.filter((item) => item.sku !== sku),
                              );
                            }}
                          />
                        ) : null}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <Card className="overflow-hidden shadow-sm">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <div className="min-w-max">
                  <div
                    className="grid border-b border-border bg-muted/50"
                    style={{
                      gridTemplateColumns: `180px repeat(${visibleProducts.length}, minmax(12rem, 1fr))`,
                    }}
                  >
                    <div className="p-4 text-sm font-semibold text-secondary">
                      Attribute
                    </div>
                    {visibleProducts.map((product) => (
                      <div
                        key={product.sku}
                        className="p-4 text-sm font-semibold text-secondary"
                      >
                        {product.brand}
                      </div>
                    ))}
                  </div>

                  {rows.map((row) => (
                    <div
                      key={row.label}
                      className="grid border-b border-border last:border-b-0"
                      style={{
                        gridTemplateColumns: `180px repeat(${visibleProducts.length}, minmax(12rem, 1fr))`,
                      }}
                    >
                      <div className="p-4 text-sm font-semibold text-secondary">
                        {row.label}
                      </div>
                      {row.values.map((value, index) => (
                        <div
                          key={`${row.label}-${visibleProducts[index]?.sku ?? index}`}
                          className="p-4 text-sm text-foreground/70"
                        >
                          {value}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      ) : (
        <Card className="mt-6 p-8 text-center shadow-sm">
          <div className="text-lg font-black text-primary">
            No products added to compare
          </div>
          <p className="mt-2 text-sm text-foreground/55">
            Add products from a product page to build your compare list.
          </p>
          <Button
            asChild
            className="mt-6 h-11 rounded-full px-6 text-sm font-bold text-white! shadow-sm"
          >
            <Link href="/shop">Browse products</Link>
          </Button>
        </Card>
      )}
    </>
  );
}
