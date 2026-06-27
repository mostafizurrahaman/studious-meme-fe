'use client';

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { Product } from '@/lib/storefront-types';

type CompareState = {
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

export const useCompareStore = create<CompareState>()(
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
      clear: () => set({ items: [] }),
      replaceItems: (items) => set({ items }),
      setHydrated: (hydrated) => set({ hydrated }),
    }),
    {
      name: 'malamal-compare-v1',
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
      partialize: (state) => ({ items: state.items }),
    },
  ),
);
