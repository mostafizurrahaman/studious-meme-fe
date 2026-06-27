'use server';

import { z } from 'zod';
import { createOrder, previewCheckout } from '@/services/Order';
import { BANGLADESH_DISTRICTS } from '@/lib/bangladesh-districts';
import { normalizeOrderPaymentMethod } from '@/lib/payment-method';
import { getValidAccessTokenForServerActions } from '@/lib/getValidAccessToken';

type CheckoutActionErrors = Partial<
  Record<'name' | 'phone' | 'email' | 'city' | 'address', string>
>;

const CHECKOUT_LOGIN_MESSAGE = 'Sign in to place your order.';

function isUnauthorizedMessage(message?: string | null) {
  return message?.trim() === 'You are not authorized!';
}

type CartItem = {
  sku: string;
  title: string;
  href: '/shop';
  image: string;
  brand: string;
  unitPrice: number;
  unitPriceLabel: string;
  oldPriceLabel?: string;
  sellingUnit?: string;
  quantity: number;
};

export type CheckoutActionState =
  | { ok: false; error: string; errors?: CheckoutActionErrors }
  | { ok: true; orderId: string; gatewayUrl?: string };

const checkoutSchema = z.object({
  name: z.string().trim().min(1, { message: 'Please enter your full name.' }),
  phone: z
    .string()
    .trim()
    .min(1, { message: 'Please enter your phone number.' })
    .regex(/^01\d{9}$/, {
      message: 'Please enter a valid Bangladesh phone number.',
    }),
  email: z
    .string()
    .trim()
    .min(1, { message: 'Please enter your email address.' })
    .email({ message: 'Please enter a valid email address.' }),
  city: z
    .string()
    .trim()
    .min(1, { message: 'Please select a district.' })
    .refine(
      (value) =>
        BANGLADESH_DISTRICTS.includes(
          value as (typeof BANGLADESH_DISTRICTS)[number],
        ),
      {
        message: 'Please select a valid district.',
      },
    ),
  address: z
    .string()
    .trim()
    .min(1, { message: 'Please enter your delivery address.' }),
});

function isCartItem(value: unknown): value is CartItem {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const item = value as Record<string, unknown>;

  return (
    typeof item.sku === 'string' &&
    typeof item.title === 'string' &&
    typeof item.href === 'string' &&
    typeof item.image === 'string' &&
    typeof item.brand === 'string' &&
    typeof item.unitPrice === 'number' &&
    typeof item.unitPriceLabel === 'string' &&
    typeof item.quantity === 'number' &&
    Number.isFinite(item.unitPrice) &&
    Number.isInteger(item.quantity) &&
    item.quantity > 0
  );
}

function readString(formData: FormData, key: string) {
  return String(formData.get(key) ?? '').trim();
}

function fail(error: string): CheckoutActionState {
  return { ok: false, error };
}

function failWithErrors(
  error: string,
  errors: CheckoutActionErrors,
): CheckoutActionState {
  return { ok: false, error, errors };
}

function flattenErrors(
  error: z.ZodError<z.infer<typeof checkoutSchema>>,
): CheckoutActionErrors {
  const fieldErrors = error.flatten().fieldErrors;

  return Object.fromEntries(
    Object.entries(fieldErrors).flatMap(([key, value]) => {
      const message = value?.[0];
      return message ? [[key, message]] : [];
    }),
  ) as CheckoutActionErrors;
}

export async function submitCheckoutAction(
  _prevState: CheckoutActionState,
  formData: FormData,
): Promise<CheckoutActionState> {
  const accessToken = await getValidAccessTokenForServerActions();

  if (!accessToken) {
    return fail(CHECKOUT_LOGIN_MESSAGE);
  }

  let items: CartItem[] = [];

  try {
    const parsed = JSON.parse(
      String(formData.get('cartItemsJson') ?? '[]'),
    ) as unknown[];
    items = parsed.filter(isCartItem);
  } catch {
    return fail('Cart data is invalid. Please try again.');
  }

  if (items.length === 0) {
    return fail('Add items to cart before placing the order.');
  }

  const parsed = checkoutSchema.safeParse({
    name: readString(formData, 'name'),
    phone: readString(formData, 'phone'),
    email: readString(formData, 'email'),
    city: readString(formData, 'city'),
    address: readString(formData, 'address'),
  });

  if (!parsed.success) {
    return failWithErrors(
      'Please fix the highlighted checkout fields.',
      flattenErrors(parsed.error),
    );
  }

  const customer = {
    ...parsed.data,
    email: parsed.data.email || undefined,
    note: readString(formData, 'note'),
  };

  const couponCode = readString(formData, 'couponCode');

  const payment = readString(formData, 'payment') || 'Cash on delivery';
  const normalizedPayment = normalizeOrderPaymentMethod(payment);

  const previewResult = await previewCheckout({
    items: items.map((item) => ({ sku: item.sku, quantity: item.quantity })),
    customer,
    couponCode,
    paymentMethod: normalizedPayment,
  });

  if (!previewResult?.success || !previewResult.data) {
    if (isUnauthorizedMessage(previewResult?.message ?? previewResult?.error)) {
      return fail(CHECKOUT_LOGIN_MESSAGE);
    }

    return fail(
      previewResult?.message ?? 'Failed to preview checkout summary.',
    );
  }

  if (
    normalizedPayment === 'CASH_ON_DELIVERY' &&
    !previewResult.data.codEligible
  ) {
    return fail(previewResult.data.codReasons.join(' '));
  }

  const orderResult = await createOrder({
    items: items.map((item) => ({ sku: item.sku, quantity: item.quantity })),
    customer,
    couponCode,
    paymentMethod: normalizedPayment,
  });

  if (!orderResult?.success || !orderResult.data) {
    if (isUnauthorizedMessage(orderResult?.message ?? orderResult?.error)) {
      return fail(CHECKOUT_LOGIN_MESSAGE);
    }

    return fail(orderResult?.message ?? 'Failed to place order.');
  }

  if (normalizedPayment === 'PORTPOS') {
    const gatewayUrl =
      orderResult.data.paymentUrl ?? orderResult.data.gatewayUrl;

    if (!gatewayUrl) {
      return fail('Failed to initiate PortPOS payment.');
    }

    return {
      ok: true,
      orderId: orderResult.data.orderId,
      gatewayUrl,
    };
  }

  return { ok: true, orderId: orderResult.data.orderId };
}
