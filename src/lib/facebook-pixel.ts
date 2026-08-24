export function getFacebookPixelId() {
  return process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID?.trim() ?? '';
}

type FacebookPixelEventParams = Record<
  string,
  string | number | boolean | string[] | undefined
>;

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    _fbq?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

export function isFacebookPixelEnabled() {
  return Boolean(getFacebookPixelId());
}

export function trackFacebookPixelEvent(
  eventName: string,
  params?: FacebookPixelEventParams,
) {
  if (typeof window === 'undefined' || typeof window.fbq !== 'function') {
    return;
  }

  if (params && Object.keys(params).length > 0) {
    window.fbq('track', eventName, params);
    return;
  }

  window.fbq('track', eventName);
}

export function trackFacebookPageView() {
  trackFacebookPixelEvent('PageView');
}

// ---------------------------------------------------------------------------
// Typed e-commerce event helpers
// ---------------------------------------------------------------------------

/** Fired when a user views a product detail page. */
export function trackViewContent(product: {
  id?: string;
  title: string;
  price: string;
}) {
  const value = parseFloat(product.price.replace(/[^0-9.]/g, ''));
  trackFacebookPixelEvent('ViewContent', {
    content_ids: product.id ? [product.id] : [],
    content_name: product.title,
    content_type: 'product',
    value: isNaN(value) ? 0 : value,
    currency: 'BDT',
  });
}

/** Fired when a product is added to the cart. */
export function trackAddToCart(product: {
  id?: string;
  title: string;
  price: string;
}, quantity = 1) {
  const unitPrice = parseFloat(product.price.replace(/[^0-9.]/g, ''));
  trackFacebookPixelEvent('AddToCart', {
    content_ids: product.id ? [product.id] : [],
    content_name: product.title,
    content_type: 'product',
    value: isNaN(unitPrice) ? 0 : unitPrice * quantity,
    currency: 'BDT',
    num_items: quantity,
  });
}

/** Fired when the user clicks "Proceed to checkout". */
export function trackInitiateCheckout(
  items: Array<{ productId?: string; unitPrice: number; quantity: number }>,
  total: number,
) {
  const contentIds = items
    .map((i) => i.productId)
    .filter((id): id is string => Boolean(id));
  const numItems = items.reduce((sum, i) => sum + i.quantity, 0);
  trackFacebookPixelEvent('InitiateCheckout', {
    content_ids: contentIds,
    num_items: numItems,
    value: total,
    currency: 'BDT',
  });
}

/** Fired when the user types into the search box and results return. */
export function trackSearch(searchString: string) {
  if (!searchString.trim()) return;
  trackFacebookPixelEvent('Search', { search_string: searchString.trim() });
}

/** Fired after a successful order is placed (COD or card). */
export function trackPurchase(
  orderId: string,
  items: Array<{ productId?: string; unitPrice: number; quantity: number }>,
  total: number,
) {
  const contentIds = items
    .map((i) => i.productId)
    .filter((id): id is string => Boolean(id));
  const numItems = items.reduce((sum, i) => sum + i.quantity, 0);
  trackFacebookPixelEvent('Purchase', {
    order_id: orderId,
    content_ids: contentIds,
    num_items: numItems,
    value: total,
    currency: 'BDT',
  });
}

export function buildFacebookPixelInitScript(pixelId: string) {
  return `
        !(function(f,b,e,v,n,t,s){
            if(f.fbq){return;}
            n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq){f._fbq=n;}
            n.push=n;
            n.loaded=!0;
            n.version='2.0';
            n.queue=[];
            t=b.createElement(e);
            t.async=!0;
            t.src=v;
            s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s);
        })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
        fbq('init', '${pixelId}');
        fbq('track', 'PageView');
    `;
}
