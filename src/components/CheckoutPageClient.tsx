'use client';

import { useActionState, useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { formatMoney } from '@/lib/cart';
import { useCartStore } from '@/lib/cart-store';
import {
  mergeBackendCartIntoLocalItems,
  mapBackendCartItemsToStoreItems,
} from '@/lib/cart-hydration';
import { BANGLADESH_DISTRICTS } from '@/lib/bangladesh-districts';
import {
  CASH_ON_DELIVERY_LABEL,
  CHECKOUT_PAYMENT_OPTIONS,
  PORTPOS_LABEL,
  getCheckoutPaymentLabel,
} from '@/lib/payment-method';
import { submitCheckoutAction } from '@/app/(withNavFooter)/checkout/actions';
import type { CheckoutActionState } from '@/app/(withNavFooter)/checkout/actions';
import {
  calculateFulfillmentSummary,
  formatShippingZoneLabel,
} from '@/lib/fulfillment';
import { getMyCart } from '@/services/Cart';

const CHECKOUT_LOGIN_MESSAGE = 'Sign in to place your order.';

function isCheckoutLoginRequired(error: string) {
  return error === CHECKOUT_LOGIN_MESSAGE;
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;

  return <p className="text-xs font-medium text-destructive">{message}</p>;
}

function getCheckoutFieldError(
  field: 'name' | 'phone' | 'email' | 'city' | 'address',
  values: {
    name: string;
    phone: string;
    email: string;
    city: string;
    address: string;
  },
  submitted: boolean,
) {
  if (!submitted) return undefined;

  if (field === 'name') {
    return values.name.trim() ? undefined : 'Please enter your full name.';
  }

  if (field === 'phone') {
    const phone = values.phone.trim();

    if (!phone) return 'Please enter your phone number.';
    return /^01\d{9}$/.test(phone)
      ? undefined
      : 'Please enter a valid Bangladesh phone number starting with 01.';
  }

  if (field === 'email') {
    const email = values.email.trim();

    if (!email) return 'Please enter your email address.';
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
      ? undefined
      : 'Please enter a valid email address.';
  }

  if (field === 'city') {
    return values.city.trim() ? undefined : 'Please select a district.';
  }

  if (field === 'address') {
    return values.address.trim()
      ? undefined
      : 'Please enter your delivery address.';
  }

  return undefined;
}

export function CheckoutPageClient() {
  const items = useCartStore((state) => state.items);
  const hydrated = useCartStore((state) => state.hydrated);
  const checkout = useCartStore((state) => state.checkout);
  const appliedCoupon = useCartStore((state) => state.appliedCoupon);
  const couponVerification = useCartStore((state) => state.couponVerification);
  const updateCheckout = useCartStore((state) => state.updateCheckout);
  const clear = useCartStore((state) => state.clear);
  const replaceItems = useCartStore((state) => state.replaceItems);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [result, formAction, pending] = useActionState<
    CheckoutActionState,
    FormData
  >(submitCheckoutAction, {
    ok: false,
    error: '',
  });

  const fulfillment = calculateFulfillmentSummary({
    items,
    city: checkout.city,
    // address: checkout.address,
    couponSummary: couponVerification,
  });
  const paymentValue = getCheckoutPaymentLabel(checkout.payment);
  const selectedPayment =
    paymentValue === CASH_ON_DELIVERY_LABEL && !fulfillment.codEligible
      ? PORTPOS_LABEL
      : paymentValue;
  const discount = fulfillment.discount;
  const delivery = fulfillment.shippingCharge;
  const total = fulfillment.total;
  const summaryItems = items.slice(0, 4);
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const nameError = getCheckoutFieldError('name', checkout, submitAttempted);
  const phoneError = getCheckoutFieldError('phone', checkout, submitAttempted);
  const emailError = getCheckoutFieldError('email', checkout, submitAttempted);
  const cityError = getCheckoutFieldError('city', checkout, submitAttempted);
  const addressError = getCheckoutFieldError(
    'address',
    checkout,
    submitAttempted,
  );

  useEffect(() => {
    if (fulfillment.codEligible || paymentValue !== CASH_ON_DELIVERY_LABEL) {
      return;
    }

    updateCheckout('payment', PORTPOS_LABEL);
  }, [checkout.payment, fulfillment.codEligible, paymentValue, updateCheckout]);

  useEffect(() => {
    let active = true;

    getMyCart()
      .then((result) => {
        if (
          !active ||
          !result.success ||
          !Array.isArray(result.data?.items) ||
          result.data.items.length === 0
        ) {
          return;
        }

        const backendItems = mapBackendCartItemsToStoreItems(result.data.items);
        replaceItems(
          mergeBackendCartIntoLocalItems(
            useCartStore.getState().items,
            backendItems,
          ),
        );
      })
      .catch(() => null);

    return () => {
      active = false;
    };
  }, [replaceItems]);

  useEffect(() => {
    if (!result.ok) {
      if (isCheckoutLoginRequired(result.error)) {
        const currentPath = `${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
        router.replace(
          `/my-account?redirect=${encodeURIComponent(currentPath)}`,
        );
      }

      return;
    }

    clear();
    toast.success(
      result.gatewayUrl
        ? 'Redirecting to PortPOS payment gateway...'
        : 'Order submitted successfully.',
    );

    if (result.gatewayUrl) {
      window.location.href = result.gatewayUrl;
      return;
    }

    const timeout = window.setTimeout(() => {
      router.push('/dashboard/user');
    }, 800);

    return () => window.clearTimeout(timeout);
  }, [clear, pathname, result, router, searchParams]);

  if (!hydrated) {
    return (
      <main className="flex-1 bg-background pb-16">
        <div className="mx-auto w-full max-w-310 px-4 py-6 lg:px-0">
          <Card className="p-6 shadow-sm">Loading checkout...</Card>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 bg-background pb-16">
      <div className="mx-auto w-full max-w-310 px-4 py-6 lg:px-0">
        <Card className="p-6 shadow-sm sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">
            Checkout
          </p>
          <h1 className="mt-4 text-3xl font-black text-secondary sm:text-4xl">
            Place order
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-foreground/65 sm:text-base">
            Complete your order with cash on delivery or PortPOS online payment.
          </p>
          <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold text-foreground/60">
            <span className="rounded-full bg-muted px-3 py-1">
              {formatShippingZoneLabel(fulfillment.zone)}
            </span>
            <span className="rounded-full bg-muted px-3 py-1">
              Weight {fulfillment.totalWeightKg.toFixed(2)} kg
            </span>
            <span className="rounded-full bg-muted px-3 py-1">
              COD {fulfillment.codEligible ? 'available' : 'restricted'}
            </span>
          </div>
        </Card>

        <section className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <Card className="p-6 shadow-sm">
            <form
              className="grid gap-4"
              action={formAction}
              noValidate
              onSubmit={() => setSubmitAttempted(true)}
            >
              {!result.ok &&
              result.error &&
              !isCheckoutLoginRequired(result.error) ? (
                <div className="rounded-2xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                  {result.error}
                </div>
              ) : null}

              <div className="grid gap-4 md:grid-cols-2">
                {[
                  ['name', 'Full name', checkout.name],
                  ['phone', 'Phone number', checkout.phone],
                  ['email', 'Email address', checkout.email],
                ].map(([key, label, value]) => (
                  <label
                    key={key}
                    className="grid gap-2 text-sm font-semibold text-foreground"
                  >
                    {label}
                    <Input
                      className="text-gray-500"
                      name={key}
                      value={value}
                      aria-invalid={Boolean(
                        key === 'name'
                          ? nameError
                          : key === 'phone'
                            ? phoneError
                            : key === 'email'
                              ? emailError
                              : false,
                      )}
                      type={key === 'email' ? 'email' : 'text'}
                      inputMode={key === 'phone' ? 'numeric' : undefined}
                      maxLength={key === 'phone' ? 11 : undefined}
                      placeholder={key === 'phone' ? '01XXXXXXXXX' : undefined}
                      onChange={(event) =>
                        updateCheckout(
                          key as 'name' | 'phone' | 'email' | 'city',
                          event.target.value,
                        )
                      }
                    />
                    <FieldError
                      message={
                        key === 'name'
                          ? nameError
                          : key === 'phone'
                            ? phoneError
                            : key === 'email'
                              ? emailError
                              : undefined
                      }
                    />
                  </label>
                ))}
                <label className="grid gap-2 text-sm font-semibold text-foreground md:col-span-2">
                  District
                  <select
                    name="city"
                    value={checkout.city}
                    aria-invalid={Boolean(cityError)}
                    onChange={(event) =>
                      updateCheckout('city', event.target.value)
                    }
                    className={`h-11 rounded-2xl border bg-background px-4 outline-none text-gray-500 ${cityError ? 'border-destructive/50 ring-2 ring-destructive/15' : 'border-input'}`}
                  >
                    <option value="" disabled>
                      Select district
                    </option>
                    {BANGLADESH_DISTRICTS.map((district) => (
                      <option key={district} value={district}>
                        {district}
                      </option>
                    ))}
                  </select>
                  <FieldError message={cityError} />
                </label>
              </div>

              <input
                type="hidden"
                name="cartItemsJson"
                value={JSON.stringify(items)}
              />
              <input
                type="hidden"
                name="couponCode"
                value={appliedCoupon?.code ?? ''}
              />

              <label className="grid gap-2 text-sm font-semibold text-foreground">
                Delivery address
                <Textarea
                  name="address"
                  value={checkout.address}
                  aria-invalid={Boolean(addressError)}
                  onChange={(event) =>
                    updateCheckout('address', event.target.value)
                  }
                  className={`${addressError ? 'border-destructive/50 ring-2 ring-destructive/15' : ''} text-gray-500`}
                />
                <FieldError message={addressError} />
              </label>
              <label className="grid gap-2 text-sm font-semibold text-foreground">
                Order note
                <Textarea
                  name="note"
                  value={checkout.note}
                  onChange={(event) =>
                    updateCheckout('note', event.target.value)
                  }
                  className="text-gray-500"
                />
              </label>
              <fieldset className="grid gap-3">
                <legend className="text-sm font-semibold text-foreground pb-2">
                  Payment method
                </legend>
                <div className="grid gap-3">
                  {CHECKOUT_PAYMENT_OPTIONS.map((option) => {
                    const disabled =
                      option === CASH_ON_DELIVERY_LABEL &&
                      !fulfillment.codEligible;

                    return (
                      <label
                        key={option}
                        className={`flex cursor-pointer items-center gap-3 rounded-2xl border px-4 py-3 text-sm transition ${
                          disabled
                            ? 'cursor-not-allowed border-border/50 bg-muted/50 text-foreground/40'
                            : selectedPayment === option
                              ? 'border-primary/30 bg-primary/5 text-foreground'
                              : 'border-input bg-background text-foreground'
                        }`}
                      >
                        <input
                          type="radio"
                          name="payment"
                          value={option}
                          checked={selectedPayment === option}
                          disabled={disabled}
                          onChange={(event) =>
                            updateCheckout('payment', event.target.value)
                          }
                          className="h-4 w-4 accent-primary"
                        />
                        <span className="font-medium">{option}</span>
                      </label>
                    );
                  })}
                </div>
              </fieldset>

              {!fulfillment.codEligible ? (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                  {fulfillment.codReasons.join(' ')}
                </div>
              ) : null}

              <div className="mt-2 flex flex-wrap gap-3">
                <Button
                  type="submit"
                  disabled={pending}
                  className="h-11 rounded-full px-6 text-sm font-bold shadow-sm"
                >
                  {pending ? 'Submitting...' : 'Place order'}
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="h-11 rounded-full border-border px-6 text-sm font-bold text-foreground/75"
                >
                  <Link href="/cart">Back to cart</Link>
                </Button>
              </div>
            </form>
          </Card>

          <Card className="border-0 bg-secondary p-6 text-secondary-foreground shadow-sm h-fit">
            <h2 className="text-2xl font-black">Order summary</h2>
            <div className="mt-4 space-y-3 text-sm text-secondary-foreground/80">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatMoney(fulfillment.subtotal)}</span>
              </div>
              {discount > 0 ? (
                <div className="flex justify-between">
                  <span>Discount</span>
                  <span>- {formatMoney(discount)}</span>
                </div>
              ) : null}
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>{formatMoney(delivery)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping zone</span>
                <span>{formatShippingZoneLabel(fulfillment.zone)}</span>
              </div>
              <div className="flex justify-between font-bold text-secondary-foreground">
                <span>Total</span>
                <span>{formatMoney(total)}</span>
              </div>
            </div>

            <Separator className="my-6 bg-white/15" />

            <Card className="bg-white/10 p-4 text-sm text-secondary-foreground/80">
              {items.length > 0
                ? `${items.length} product line${items.length === 1 ? '' : 's'} ready for checkout.`
                : 'Your cart is empty.'}
            </Card>

            <Card className="mt-6 space-y-3 bg-white/10 p-4 text-secondary-foreground">
              <div className="text-sm font-semibold">Item breakdown</div>
              {summaryItems.length > 0 ? (
                summaryItems.map((item) => (
                  <div
                    key={item.sku}
                    className="flex items-start justify-between gap-4 rounded-2xl border border-white/10 bg-white/5 p-3 text-sm text-secondary-foreground/80"
                  >
                    <div className="min-w-0 flex-1 line-clamp-2 font-medium text-secondary-foreground">
                      {item.quantity} *{' '}
                      <span className="font-semibold tracking-tight text-primary">
                        {item.title}
                      </span>
                    </div>
                    <span className="shrink-0 rounded-full bg-white/10 px-3 py-1 font-semibold text-secondary-foreground">
                      {formatMoney(item.unitPrice * item.quantity)}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-sm text-secondary-foreground/70">
                  No items yet.
                </div>
              )}
              {items.length > summaryItems.length ? (
                <div className="text-xs text-secondary-foreground/65">
                  + {items.length - summaryItems.length} more line
                  {items.length - summaryItems.length === 1 ? '' : 's'}
                </div>
              ) : null}
            </Card>
          </Card>
        </section>
      </div>
    </main>
  );
}
