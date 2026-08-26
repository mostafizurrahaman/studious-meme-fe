'use client';

import Image from 'next/image';
import Link from 'next/link';
import * as React from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@/components/ui/sheet';
import { formatMoney } from '@/lib/cart';
import { useCartStore } from '@/lib/cart-store';
import {
  calculateFulfillmentSummary,
  formatShippingZoneLabel,
} from '@/lib/fulfillment';
import { Minus, Plus, ShoppingBag, Tag, X, Trash2 } from 'lucide-react';
import {
  updateCartItem,
  removeCartItem,
  clearCart as clearCartPersisted,
} from '@/services/Cart';
import { trackInitiateCheckout } from '@/lib/facebook-pixel';

export function CartDrawer() {
  const isDrawerOpen = useCartStore(state => state.isDrawerOpen);
  const setDrawerOpen = useCartStore(state => state.setDrawerOpen);
  const items = useCartStore(state => state.items);
  const checkout = useCartStore(state => state.checkout);
  const couponCode = useCartStore(state => state.couponCode);
  const appliedCoupon = useCartStore(state => state.appliedCoupon);
  const couponVerification = useCartStore(state => state.couponVerification);
  const isApplyingCoupon = useCartStore(state => state.isApplyingCoupon);
  const setCouponCode = useCartStore(state => state.setCouponCode);
  const applyCoupon = useCartStore(state => state.applyCoupon);
  const clearCoupon = useCartStore(state => state.clearCoupon);
  const count = useCartStore(state =>
    state.items.reduce((sum, item) => sum + item.quantity, 0),
  );
  const increase = useCartStore(state => state.increase);
  const decrease = useCartStore(state => state.decrease);
  const remove = useCartStore(state => state.remove);
  const clear = useCartStore(state => state.clear);
  const markItemAsSynced = useCartStore(state => state.markItemAsSynced);

  const [toast, setToast] = React.useState('');

  const fulfillment = calculateFulfillmentSummary({
    items,
    city: checkout.city,
    couponSummary: couponVerification,
  });
  const discount = fulfillment.discount;
  const delivery = fulfillment.shippingCharge;
  const total = fulfillment.total;

  return (
    <Sheet open={isDrawerOpen} onOpenChange={setDrawerOpen}>
      <SheetContent className="flex w-full flex-col gap-0 p-0 sm:max-w-md">
        {/* Header */}
        <SheetHeader className="gap-1 border-b border-border/70 bg-muted/40 px-6 py-5">
          <SheetTitle className="flex items-center gap-2 text-left text-lg font-black text-secondary">
            <ShoppingBag className="h-5 w-5 text-primary" />
            Your Cart
            <span className="ml-1 inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-primary px-1.5 text-[11px] font-bold leading-none text-primary-foreground">
              {count}
            </span>
          </SheetTitle>
          {items.length > 0 ? (
            <div className="mt-2 flex flex-wrap gap-1.5">
              <span className="rounded-full bg-background px-2.5 py-1 text-[10px] font-semibold text-foreground/60 ring-1 ring-border">
                {formatShippingZoneLabel(fulfillment.zone)}
              </span>
              <span className="rounded-full bg-background px-2.5 py-1 text-[10px] font-semibold text-foreground/60 ring-1 ring-border">
                {fulfillment.totalWeightKg.toFixed(2)} kg
              </span>
              <span
                className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ring-1 ${
                  fulfillment.codEligible
                    ? 'bg-emerald-50 text-emerald-700 ring-emerald-200'
                    : 'bg-amber-50 text-amber-700 ring-amber-200'
                }`}
              >
                COD {fulfillment.codEligible ? 'available' : 'restricted'}
              </span>
            </div>
          ) : null}
        </SheetHeader>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-4 py-4">
          {items.length > 0 ? (
            <div className="space-y-3">
              {items.map(item => (
                <div
                  key={item.sku}
                  className="flex gap-3 rounded-2xl border border-border/70 bg-card p-3 shadow-sm transition hover:border-primary/25"
                >
                  <Link
                    href={item.href}
                    onClick={() => setDrawerOpen(false)}
                    className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-muted"
                  >
                    <Image
                      src={item.image}
                      alt={item?.imageAlt || item.title}
                      title={item.title}
                      fill
                      sizes="80px"
                      className="object-contain p-2"
                    />
                  </Link>

                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex items-start justify-between gap-2">
                      <Link
                        href={item.href}
                        onClick={() => setDrawerOpen(false)}
                        className="line-clamp-2 text-sm font-semibold text-foreground transition-colors hover:text-primary"
                      >
                        {item.title}
                      </Link>
                      <button
                        type="button"
                        aria-label="Remove item"
                        className="shrink-0 rounded-full p-1 text-muted-foreground/70 transition hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => {
                          remove(item.sku);
                          if (item.productId) {
                            void removeCartItem(item.productId).catch(
                              () => null,
                            );
                          }
                        }}
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <div className="mt-0.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                      SKU {item.sku} {item.brand ? `· ${item.brand}` : ''}
                    </div>

                    <div className="mt-auto flex items-end justify-between pt-2">
                      <div className="flex items-center gap-2 rounded-full border border-border bg-muted/40 px-1.5 py-1">
                        <button
                          type="button"
                          aria-label="Decrease quantity"
                          className="flex h-5 w-5 items-center justify-center rounded-full text-foreground/70 transition hover:bg-background hover:text-foreground"
                          onClick={() => {
                            const nextQuantity = item.quantity - 1;
                            decrease(item.sku);
                            if (item.productId) {
                              void (
                                nextQuantity > 0
                                  ? updateCartItem(item.productId, nextQuantity)
                                  : removeCartItem(item.productId)
                              )
                                .then(result => {
                                  if (
                                    result?.success &&
                                    nextQuantity > 0 &&
                                    item.productId
                                  ) {
                                    markItemAsSynced(item.productId);
                                  }
                                })
                                .catch(() => null);
                            }
                          }}
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="min-w-5 text-center text-xs font-bold">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          aria-label="Increase quantity"
                          className="flex h-5 w-5 items-center justify-center rounded-full text-foreground/70 transition hover:bg-background hover:text-foreground"
                          onClick={() => {
                            const nextQuantity = item.quantity + 1;
                            increase(item.sku);
                            if (item.productId) {
                              void updateCartItem(item.productId, nextQuantity)
                                .then(result => {
                                  if (result?.success) {
                                    markItemAsSynced(item.productId);
                                  }
                                })
                                .catch(() => null);
                            }
                          }}
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>

                      <div className="text-right">
                        <div className="text-sm font-black text-primary">
                          {formatMoney(item.unitPrice * item.quantity)}
                        </div>
                        <div className="text-[10px] text-muted-foreground">
                          {item.unitPriceLabel || formatMoney(item.unitPrice)}{' '}
                          each
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-3 py-16 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                <ShoppingBag className="h-7 w-7 text-muted-foreground" />
              </div>
              <div className="text-base font-black text-secondary">
                Your cart is empty
              </div>
              <p className="max-w-[220px] text-sm text-muted-foreground">
                Add products from the shop to see them here.
              </p>
              <Button
                onClick={() => setDrawerOpen(false)}
                asChild
                className="mt-2 rounded-full px-6 shadow-sm"
              >
                <Link href="/shop">Continue shopping</Link>
              </Button>
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <SheetFooter className="block border-t border-border/70 bg-muted/40 p-5">
            {/* Coupon */}
            <div className="mb-4 rounded-2xl border border-dashed border-border bg-background/60 p-3">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Tag className="h-4 w-4" />
                </div>
                <Input
                  value={couponCode}
                  onChange={event => setCouponCode(event.target.value)}
                  placeholder="Coupon code"
                  className="h-9 flex-1 rounded-full text-xs"
                />
                {appliedCoupon ? (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      clearCoupon();
                      setToast('');
                    }}
                    className="h-9 shrink-0 rounded-full px-3 text-xs font-semibold"
                  >
                    Remove
                  </Button>
                ) : (
                  <Button
                    type="button"
                    disabled={isApplyingCoupon}
                    onClick={() => {
                      void (async () => {
                        const result = await applyCoupon();
                        setToast(result.message);
                        window.setTimeout(() => setToast(''), 2200);
                      })();
                    }}
                    className="h-9 shrink-0 rounded-full px-4 text-xs font-bold shadow-sm"
                  >
                    {isApplyingCoupon ? 'Checking...' : 'Apply'}
                  </Button>
                )}
              </div>
              {(appliedCoupon || couponVerification?.message) && (
                <div className="mt-2 pl-10 text-[11px] font-medium text-muted-foreground">
                  {appliedCoupon
                    ? `Applied ${appliedCoupon.code} · ${appliedCoupon.label}`
                    : couponVerification?.message}
                </div>
              )}
            </div>

            {/* Summary */}
            <div className="space-y-2 text-sm text-foreground/80">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-medium text-foreground">
                  {formatMoney(fulfillment.subtotal)}
                </span>
              </div>
              {discount > 0 ? (
                <div className="flex justify-between text-emerald-600">
                  <span>Discount</span>
                  <span className="font-medium">- {formatMoney(discount)}</span>
                </div>
              ) : null}
              <div className="flex justify-between">
                <span>
                  Shipping ({formatShippingZoneLabel(fulfillment.zone)})
                </span>
                <span className="font-medium text-foreground">
                  {formatMoney(delivery)}
                </span>
              </div>
            </div>

            <Separator className="my-4 bg-border/60" />

            <div className="mb-5 flex items-end justify-between">
              <span className="text-base font-bold text-foreground">Total</span>
              <span className="text-2xl font-black text-primary">
                {formatMoney(total)}
              </span>
            </div>

            {!fulfillment.codEligible ? (
              <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                {fulfillment.codReasons.join(' ')}
              </div>
            ) : null}

            <div className="grid gap-2">
              <Button
                asChild
                className="h-11 w-full rounded-full text-sm font-bold shadow-sm"
                onClick={() => {
                  trackInitiateCheckout(items, total);
                  setDrawerOpen(false);
                }}
              >
                <Link className="!text-white" href="/checkout">
                  Proceed to checkout
                </Link>
              </Button>
              {/* <Button
                asChild
                variant="outline"
                className="h-11 w-full rounded-full border-border text-sm font-semibold text-foreground/70"
                onClick={() => setDrawerOpen(false)}
              >
                <Link href="/cart">View full cart</Link>
              </Button> */}
            </div>

            <div className="mt-3 flex items-center gap-2">
              <Button
                type="button"
                onClick={() => {
                  clear();
                  void clearCartPersisted().catch(() => null);
                }}
                className="group flex items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-4 py-2 text-xs font-semibold text-red-500 transition-all hover:border-red-400 hover:bg-red-500 hover:text-white active:scale-95 w-full cursor-pointer"
              >
                <Trash2 className="h-3.5 w-3.5 transition-transform group-hover:scale-110" />
                Clear all items
              </Button>
            </div>

            {toast ? (
              <div className="mt-3 rounded-xl bg-secondary px-3 py-2 text-center text-xs font-semibold text-secondary-foreground">
                {toast}
              </div>
            ) : null}
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
}
