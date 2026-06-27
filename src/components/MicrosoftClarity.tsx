'use client';

import { useEffect, useRef } from 'react';
import Script from 'next/script';
import { usePathname } from 'next/navigation';
import { getClarityId, isClarityEnabled } from '@/lib/clarity';

export function MicrosoftClarity() {
  const clarityId = getClarityId();
  const pathname = usePathname();
  const didMount = useRef(false);

  useEffect(() => {
    if (!isClarityEnabled()) {
      return;
    }

    if (!didMount.current) {
      didMount.current = true;
      return;
    }

    if (typeof window.clarity === 'function') {
      window.clarity('track');
    }
  }, [pathname]);

  if (!clarityId) {
    return null;
  }

  return (
    <Script
      id="microsoft-clarity"
      strategy="afterInteractive"
      src={`https://www.clarity.ms/tag/${clarityId}.js`}
    />
  );
}

declare global {
  interface Window {
    clarity: (command: string) => void;
  }
}
