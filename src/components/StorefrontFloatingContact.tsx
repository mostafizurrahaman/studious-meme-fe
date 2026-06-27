'use client';

import { usePathname } from 'next/navigation';
import { FloatingContactWidget } from '@/components/FloatingContactWidget';

export function StorefrontFloatingContact() {
  const pathname = usePathname();

  return <FloatingContactWidget key={pathname} />;
}
