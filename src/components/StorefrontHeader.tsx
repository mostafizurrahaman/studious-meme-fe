'use client';

import { usePathname } from 'next/navigation';
import { Header } from '@/components/Header';
import type { Category } from '@/lib/storefront-types';

type Props = {
  categories: Category[];
};

export function StorefrontHeader({ categories }: Props) {
  const pathname = usePathname();

  return <Header key={pathname} categories={categories} />;
}
