'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import {
  isFacebookPixelEnabled,
  trackFacebookPageView,
} from '@/lib/facebook-pixel';

export function FacebookPixel() {
  const pathname = usePathname();
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (!isFacebookPixelEnabled()) {
      return;
    }

    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    trackFacebookPageView();
  }, [pathname]);

  return null;
}

