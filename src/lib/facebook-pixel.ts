export function getFacebookPixelId() {
  return process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID?.trim() ?? '';
}

type FacebookPixelEventParams = Record<
  string,
  string | number | boolean | undefined
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
