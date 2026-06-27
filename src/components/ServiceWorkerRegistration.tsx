'use client';

import { useEffect } from 'react';

export function ServiceWorkerRegistration() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) {
      return;
    }

    let cancelled = false;

    const register = async () => {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');

        if (!cancelled) {
          void registration.update().catch(() => null);
        }
      } catch {
        // Ignore registration failures so the app still works normally online.
      }
    };

    void register();

    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}
