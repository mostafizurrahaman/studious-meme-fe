'use client';

import { useEffect } from 'react';
import { trackPurchase } from '@/lib/facebook-pixel';

type Props = {
  orderId: string;
  total: number;
};

/**
 * Fires the Meta Pixel `Purchase` event once when the PortPOS payment success
 * page confirms the payment is `PAID`. Rendered server-side with `isPaid` guard.
 */
export function PaymentSuccessPixel({ orderId, total }: Props) {
  useEffect(() => {
    if (!orderId) return;
    // Items are no longer in the store (cart was cleared on order submit),
    // so we pass an empty items array - orderId + value are the key signals.
    trackPurchase(orderId, [], total);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
