import Script from 'next/script';

export function GoogleAnalytics() {
  const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim() ?? '';

  if (!measurementId) {
    return null;
  }

  return (
    <>
      <Script
        id="google-analytics-src"
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
      />
      <Script id="google-analytics-init" strategy="afterInteractive">
        {`
                    window.dataLayer = window.dataLayer || [];
                    function gtag(){dataLayer.push(arguments);}
                    gtag('js', new Date());
                    gtag('config', '${measurementId}');
                `}
      </Script>
    </>
  );
}
