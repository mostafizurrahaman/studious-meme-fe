'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import {
  isFacebookPixelEnabled,
  trackFacebookPageView,
} from '@/lib/facebook-pixel';

export function FacebookPixel() {
  const pathname = usePathname();

  useEffect(() => {
    if (!isFacebookPixelEnabled()) {
      return;
    }

    trackFacebookPageView();
  }, [pathname]);

  return null;
}

