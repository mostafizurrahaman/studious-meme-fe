'use server';

import { revalidatePath } from 'next/cache';
import {
  forgotPassword,
  logOut,
  sendForgotPasswordOtpAgain,
  sendSignupOtpAgain,
  setNewPasswordIntoDB,
  signInUser,
  signUpUser,
  verifyOtpForForgotPassword,
  verifySignupOtp,
} from '@/services/Auth';
import { addCartItem, getMyCart, updateCartItem } from '@/services/Cart';
import { decodeAuthToken } from '@/lib/auth/session';
import type { CartItem } from '@/lib/cart';
import { mapBackendCartItemsToStoreItems } from '@/lib/cart-hydration';

type GuestCartItem = {
  productId: string;
  quantity: number;
};

export type SignInState =
  | { ok: false; message: string; role?: string; cartItems?: CartItem[] }
  | { ok: true; message: string; role?: string; cartItems?: CartItem[] };

export type ForgotPasswordState =
  | {
      ok: false;
      message: string;
      email?: string;
      step?: 'email' | 'otp' | 'reset';
    }
  | {
      ok: true;
      message: string;
      email?: string;
      step: 'otp' | 'reset' | 'done';
    };

export type SignUpState =
  | {
      ok: false;
      message: string;
      email?: string;
      role?: string;
      cartItems?: CartItem[];
    }
  | {
      ok: true;
      message: string;
      email: string;
      step: 'otp' | 'done';
      role?: string;
      cartItems?: CartItem[];
    };

function readValue(formData: FormData, key: string) {
  return String(formData.get(key) ?? '').trim();
}

function readGuestCartItems(formData: FormData): GuestCartItem[] {
  const raw = readValue(formData, 'guestCartJson');

  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw) as unknown[];

    return parsed.reduce<GuestCartItem[]>((acc, item) => {
      if (!item || typeof item !== 'object') {
        return acc;
      }

      const record = item as Record<string, unknown>;
      const productId =
        typeof record.productId === 'string' ? record.productId : '';
      const quantity = Number(record.quantity);

      if (!productId || !Number.isInteger(quantity) || quantity <= 0) {
        return acc;
      }

      acc.push({ productId, quantity });
      return acc;
    }, []);
  } catch {
    return [];
  }
}

function getBackendProductId(product: unknown) {
  if (!product || typeof product !== 'object') {
    return typeof product === 'string' ? product : undefined;
  }

  const record = product as { _id?: string; id?: string };
  return record._id ?? record.id;
}

async function hydrateBackendCartFromGuestCart(formData: FormData) {
  try {
    const guestItems = readGuestCartItems(formData);

    if (!guestItems.length) {
      const cart = await getMyCart();
      return mapBackendCartItemsToStoreItems(cart?.data?.items ?? []);
    }

    const currentCart = await getMyCart();
    const backendItems = Array.isArray(currentCart?.data?.items)
      ? currentCart.data.items
      : [];
    const backendItemMap = new Map(
      backendItems
        .map((item) => {
          const productId = getBackendProductId(item.product);
          return productId ? [productId, item.quantity] : null;
        })
        .filter((entry): entry is [string, number] => Boolean(entry)),
    );

    for (const item of guestItems) {
      const existingQuantity = backendItemMap.get(item.productId);
      const nextQuantity = (existingQuantity ?? 0) + item.quantity;

      if (existingQuantity) {
        await updateCartItem(item.productId, nextQuantity);
      } else {
        await addCartItem(item.productId, item.quantity);
      }

      backendItemMap.set(item.productId, nextQuantity);
    }

    const refreshedCart = await getMyCart();
    return mapBackendCartItemsToStoreItems(refreshedCart?.data?.items ?? []);
  } catch {
    const cart = await getMyCart().catch(() => null);
    return mapBackendCartItemsToStoreItems(cart?.data?.items ?? []);
  }
}

export async function submitSignIn(
  _prevState: SignInState,
  formData: FormData,
): Promise<SignInState> {
  const email = readValue(formData, 'email').toLowerCase();
  const password = readValue(formData, 'password');

  if (!email || !password) {
    return { ok: false, message: 'Email and password are required.' };
  }

  const result = await signInUser({ email, password });

  if (!result?.success) {
    return { ok: false, message: result?.message ?? 'Failed to sign in.' };
  }

  const cartItems = await hydrateBackendCartFromGuestCart(formData);
  const user = result.data?.accessToken
    ? decodeAuthToken(result.data.accessToken)
    : null;

  revalidatePath('/my-account');
  revalidatePath('/dashboard');

  return {
    ok: true,
    message: result.message ?? 'Signed in successfully.',
    role: user?.role,
    cartItems,
  };
}

export type SignOutState =
  | { ok: false; message: string }
  | { ok: true; message: string };

export async function submitSignOut(
  prevState: SignOutState,
  formData?: FormData,
): Promise<SignOutState> {
  void prevState;
  void formData;

  await logOut();
  revalidatePath('/my-account');
  revalidatePath('/dashboard');

  return {
    ok: true,
    message: 'Signed out successfully.',
  };
}

export async function submitSignUp(
  _prevState: SignUpState,
  formData: FormData,
): Promise<SignUpState> {
  const name = readValue(formData, 'name');
  const email = readValue(formData, 'email').toLowerCase();
  const password = readValue(formData, 'password');
  const confirmPassword = readValue(formData, 'confirmPassword');

  if (!name || !email || !password || !confirmPassword) {
    return { ok: false, message: 'All signup fields are required.', email };
  }

  if (password !== confirmPassword) {
    return { ok: false, message: 'Passwords must match.', email };
  }

  const result = await signUpUser({ name, email, password });
  if (!result?.success) {
    return {
      ok: false,
      message: result?.message ?? 'Failed to create account.',
      email,
    };
  }

  return {
    ok: true,
    email: result.data?.userEmail ?? email,
    step: 'otp',
    message: result.message ?? 'OTP sent successfully.',
  };
}

export async function submitSignupOtp(
  _prevState: SignUpState,
  formData: FormData,
): Promise<SignUpState> {
  const userEmail = readValue(formData, 'otp-email').toLowerCase();
  const otp = readValue(formData, 'otp');

  if (!userEmail || !otp) {
    return {
      ok: false,
      message: 'Email and OTP are required.',
      email: userEmail,
    };
  }

  const result = await verifySignupOtp({ userEmail, otp });
  if (!result?.success) {
    return {
      ok: false,
      message: result?.message ?? 'Failed to verify OTP.',
      email: userEmail,
    };
  }

  const cartItems = await hydrateBackendCartFromGuestCart(formData);
  const user = result.data?.accessToken
    ? decodeAuthToken(result.data.accessToken)
    : null;

  revalidatePath('/my-account');
  revalidatePath('/dashboard');

  return {
    ok: true,
    email: userEmail,
    step: 'done',
    message: result.message ?? 'Account verified successfully.',
    role: user?.role,
    cartItems,
  };
}

export async function resendSignupOtpAction(email: string) {
  return sendSignupOtpAgain(email);
}

export async function submitForgotPassword(
  _prevState: ForgotPasswordState,
  formData: FormData,
): Promise<ForgotPasswordState> {
  const email = readValue(formData, 'email').toLowerCase();

  if (!email) {
    return { ok: false, message: 'Email is required.', step: 'email' };
  }

  const result = await forgotPassword(email);

  if (!result?.success) {
    return {
      ok: false,
      message: result?.message ?? 'Failed to start password reset.',
      email,
      step: 'email',
    };
  }

  return {
    ok: true,
    message: result.message ?? 'OTP sent successfully.',
    email,
    step: 'otp',
  };
}

export async function submitForgotPasswordOtp(
  _prevState: ForgotPasswordState,
  formData: FormData,
): Promise<ForgotPasswordState> {
  const otp = readValue(formData, 'otp');

  if (!otp) {
    return { ok: false, message: 'OTP is required.', step: 'otp' };
  }

  const result = await verifyOtpForForgotPassword(otp);

  if (!result?.success) {
    return {
      ok: false,
      message: result?.message ?? 'Failed to verify OTP.',
      step: 'otp',
    };
  }

  return {
    ok: true,
    message: result.message ?? 'OTP verified successfully.',
    step: 'reset',
  };
}

export async function resendForgotPasswordOtpAction() {
  return sendForgotPasswordOtpAgain();
}

export async function submitResetPassword(
  _prevState: ForgotPasswordState,
  formData: FormData,
): Promise<ForgotPasswordState> {
  const newPassword = readValue(formData, 'newPassword');
  const confirmPassword = readValue(formData, 'confirmPassword');

  if (!newPassword || !confirmPassword) {
    return {
      ok: false,
      message: 'All password fields are required.',
      step: 'reset',
    };
  }

  if (newPassword !== confirmPassword) {
    return { ok: false, message: 'Passwords must match.', step: 'reset' };
  }

  const result = await setNewPasswordIntoDB(newPassword);

  if (!result?.success) {
    return {
      ok: false,
      message: result?.message ?? 'Failed to reset password.',
      step: 'reset',
    };
  }

  revalidatePath('/my-account');

  return {
    ok: true,
    message: result.message ?? 'Password reset successfully.',
    step: 'done',
  };
}
