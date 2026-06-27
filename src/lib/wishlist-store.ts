'use client';

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { Product } from '@/lib/storefront-types';

type WishlistState = {
  items: Product[];
  hydrated: boolean;
  add: (product: Product) => void;
  remove: (sku: string) => void;
  toggle: (product: Product) => boolean;
  has: (sku: string) => boolean;
  clear: () => void;
  replaceItems: (items: Product[]) => void;
  setHydrated: (hydrated: boolean) => void;
};

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      hydrated: false,
      add: (product) =>
        set((state) =>
          state.items.some((item) => item.sku === product.sku)
            ? state
            : { items: [product, ...state.items] },
        ),
      remove: (sku) =>
        set((state) => ({
          items: state.items.filter((item) => item.sku !== sku),
        })),
      clear: () => set({ items: [] }),
      toggle: (product) => {
        const exists = get().has(product.sku);

        if (exists) {
          get().remove(product.sku);
          return false;
        }

        get().add(product);
        return true;
      },
      has: (sku) => get().items.some((item) => item.sku === sku),
      replaceItems: (items) => set({ items }),
      setHydrated: (hydrated) => set({ hydrated }),
    }),
    {
      name: 'malamal-wishlist-v1',
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
      partialize: (state) => ({ items: state.items }),
    },
  ),
);
