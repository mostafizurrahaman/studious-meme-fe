'use client';

import { useEffect, useRef } from 'react';
import Script from 'next/script';
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
  const didMount = useRef(false);

  useEffect(() => {
    if (!isFacebookPixelEnabled()) {
      return;
    }

    if (!didMount.current) {
      didMount.current = true;
      return;
    }

    trackFacebookPageView();
  }, [pathname]);

  if (!pixelId) {
    return null;
  }

  return (
    <>
      <Script id="facebook-pixel" strategy="afterInteractive">
        {buildFacebookPixelInitScript(pixelId)}
      </Script>
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
