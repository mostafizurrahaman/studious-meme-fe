'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import {
  buildFacebookPixelInitScript,
  getFacebookPixelId,
  isFacebookPixelEnabled,
  trackFacebookPageView,
} from '@/lib/facebook-pixel';

export function FacebookPixel() {
  const pixelId = getFacebookPixelId();
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

  if (!pixelId) {
    return null;
  }

  return (
    <>
      <script
        id="facebook-pixel"
        dangerouslySetInnerHTML={{
          __html: buildFacebookPixelInitScript(pixelId),
        }}
      />
      <noscript>
        <img
          height="1"
          width="1"
          style={{ display: 'none' }}
          src={`https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1`}
          alt=""
        />
      </noscript>
    </>
  );
}
