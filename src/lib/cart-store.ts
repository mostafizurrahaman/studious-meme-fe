'use client';

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { CartItem } from '@/lib/cart';
import { toCartItem } from '@/lib/cart';
import type { Coupon, CouponVerificationSummary } from '@/lib/coupons';
import { verifyCoupon } from '@/services/Coupon';
import type { Product } from '@/lib/storefront-types';
import { isOutOfStockLabel } from '@/lib/stock';

type CheckoutForm = {
  name: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  note: string;
  payment: string;
};

export type OrderStatus = 'Placed' | 'Processing' | 'Delivered' | 'Cancelled';

export type OrderRecord = {
  id: string;
  createdAt: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  delivery: number;
  total: number;
  customer: CheckoutForm;
  payment: string;
  couponCode: string;
  status: OrderStatus;
};

type CouponApplyResult = {
  success: boolean;
  message: string;
};

type CartState = {
  items: CartItem[];
  hydrated: boolean;
  couponCode: string;
  appliedCoupon: Coupon | null;
  couponVerification: CouponVerificationSummary | null;
  isApplyingCoupon: boolean;
  checkout: CheckoutForm;
  orders: OrderRecord[];
  addProduct: (product: Product) => void;
  addProductQuantity: (product: Product, quantity: number) => void;
  increase: (sku: string) => void;
  decrease: (sku: string) => void;
  remove: (sku: string) => void;
  clear: () => void;
  setCouponCode: (code: string) => void;
  applyCoupon: () => Promise<CouponApplyResult>;
  clearCoupon: () => void;
  updateCheckout: <K extends keyof CheckoutForm>(
    key: K,
    value: CheckoutForm[K],
  ) => void;
  addItems: (items: CartItem[]) => void;
  addOrder: (order: OrderRecord) => void;
  updateOrderStatus: (id: string, status: OrderStatus) => void;
  replaceItems: (items: CartItem[]) => void;
  setHydrated: (hydrated: boolean) => void;
  markItemAsSynced: (productId?: string) => void;
};

const defaultCheckout: CheckoutForm = {
  name: '',
  phone: '',
  email: '',
  address: '',
  city: '',
  note: '',
  payment: 'Cash on delivery',
};

function getItemKey(item: Pick<CartItem, 'productId' | 'sku'>) {
  return item.productId ?? item.sku;
}

const resetCouponState = {
  appliedCoupon: null,
  couponVerification: null,
  isApplyingCoupon: false,
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      hydrated: false,
      couponCode: '',
      appliedCoupon: null,
      couponVerification: null,
      isApplyingCoupon: false,
      checkout: defaultCheckout,
      orders: [],
      addProduct: (product) => {
        if (isOutOfStockLabel(product.stock)) {
          return;
        }

        const nextItem = toCartItem(product);

        set((state) => {
          const existing = state.items.find(
            (item) => item.sku === nextItem.sku,
          );
          if (existing) {
            return {
              items: state.items.map((item) =>
                item.sku === nextItem.sku
                  ? { ...item, quantity: item.quantity + 1 }
                  : item,
              ),
              ...resetCouponState,
            };
          }

          return { items: [...state.items, nextItem], ...resetCouponState };
        });
      },
      addProductQuantity: (product, quantity) => {
        if (isOutOfStockLabel(product.stock)) {
          return;
        }

        const safeQuantity =
          Number.isInteger(quantity) && quantity > 0 ? quantity : 1;
        const nextItem = { ...toCartItem(product), quantity: safeQuantity };

        set((state) => {
          const existing = state.items.find(
            (item) => item.sku === nextItem.sku,
          );
          if (existing) {
            return {
              items: state.items.map((item) =>
                item.sku === nextItem.sku
                  ? { ...item, quantity: item.quantity + safeQuantity }
                  : item,
              ),
              ...resetCouponState,
            };
          }

          return { items: [...state.items, nextItem], ...resetCouponState };
        });
      },
      increase: (sku) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.sku === sku ? { ...item, quantity: item.quantity + 1 } : item,
          ),
          ...resetCouponState,
        })),
      decrease: (sku) =>
        set((state) => ({
          items: state.items
            .map((item) =>
              item.sku === sku
                ? { ...item, quantity: item.quantity - 1 }
                : item,
            )
            .filter((item) => item.quantity > 0),
          ...resetCouponState,
        })),
      remove: (sku) =>
        set((state) => ({
          items: state.items.filter((item) => item.sku !== sku),
          ...resetCouponState,
        })),
      clear: () =>
        set({
          items: [],
          couponCode: '',
          ...resetCouponState,
        }),
      setCouponCode: (code) =>
        set({
          couponCode: code.toUpperCase(),
          ...resetCouponState,
        }),
      applyCoupon: async () => {
        const state = get();
        const couponCode = state.couponCode.trim();
        const snapshot = JSON.stringify({
          couponCode,
          city: state.checkout.city,
          address: state.checkout.address,
          items: state.items.map((item) => ({
            sku: item.sku,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            weightKg: item.weightKg,
            isNoCOD: item.isNoCOD,
          })),
        });

        if (!couponCode) {
          return { success: false, message: 'Enter a coupon code first.' };
        }

        if (state.items.length === 0) {
          return {
            success: false,
            message: 'Add items to cart before applying a coupon.',
          };
        }

        set({ isApplyingCoupon: true });

        try {
          const result = await verifyCoupon({
            couponCode,
            items: state.items.map((item) => ({
              unitPrice: item.unitPrice,
              quantity: item.quantity,
              weightKg: item.weightKg,
              isNoCOD: item.isNoCOD,
            })),
            city: state.checkout.city,
            address: state.checkout.address,
          });

          const verification = result?.data ?? null;
          const success = Boolean(verification?.isValid && verification.coupon);
          const currentSnapshot = JSON.stringify({
            couponCode: get().couponCode.trim(),
            city: get().checkout.city,
            address: get().checkout.address,
            items: get().items.map((item) => ({
              sku: item.sku,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              weightKg: item.weightKg,
              isNoCOD: item.isNoCOD,
            })),
          });

          if (currentSnapshot !== snapshot) {
            set({
              appliedCoupon: null,
              couponVerification: null,
              isApplyingCoupon: false,
            });

            return {
              success: false,
              message:
                'Cart details changed while verifying the coupon. Please try again.',
            };
          }

          set({
            appliedCoupon: success ? (verification?.coupon ?? null) : null,
            couponVerification: verification,
            isApplyingCoupon: false,
          });

          return {
            success,
            message:
              verification?.message ??
              result?.message ??
              (success
                ? 'Coupon applied successfully.'
                : 'Coupon code was not recognized.'),
          };
        } catch {
          set({
            appliedCoupon: null,
            couponVerification: null,
            isApplyingCoupon: false,
          });

          return {
            success: false,
            message: 'Failed to verify coupon code. Please try again.',
          };
        }
      },
      clearCoupon: () =>
        set({
          couponCode: '',
          ...resetCouponState,
        }),
      updateCheckout: (key, value) =>
        set((state) => ({
          checkout: {
            ...state.checkout,
            [key]: value,
          },
          ...(key === 'city' || key === 'address' ? resetCouponState : {}),
        })),
      addItems: (items) =>
        set((state) => ({
          items: [...state.items, ...items],
          ...resetCouponState,
        })),
      replaceItems: (items) =>
        set({
          items,
          ...resetCouponState,
        }),
      markItemAsSynced: (productId) => {
        if (!productId) return;

        set((state) => ({
          items: state.items.map((item) =>
            getItemKey(item) === productId
              ? { ...item, syncedQuantity: item.quantity }
              : item,
          ),
        }));
      },
      addOrder: (order) =>
        set((state) => ({
          orders: [order, ...state.orders],
        })),
      updateOrderStatus: (id, status) =>
        set((state) => ({
          orders: state.orders.map((order) =>
            order.id === id ? { ...order, status } : order,
          ),
        })),
      setHydrated: (hydrated) => set({ hydrated }),
    }),
    {
      name: 'malamal-cart-v1',
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
      partialize: (state) => ({
        items: state.items,
        couponCode: state.couponCode,
        checkout: state.checkout,
        orders: state.orders,
      }),
    },
  ),
);
