import Script from 'next/script';
import {
  buildFacebookPixelInitScript,
  getFacebookPixelId,
} from '@/lib/facebook-pixel';

export function FacebookPixelScript() {
  const pixelId = getFacebookPixelId();

  if (!pixelId) {
    return null;
  }

  return (
    <>
      <Script
        id="facebook-pixel-init"
        strategy="afterInteractive"
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
