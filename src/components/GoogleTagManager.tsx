import Script from 'next/script';

export function GoogleTagManager() {
  const tagManagerId = process.env.NEXT_PUBLIC_GTM_ID?.trim() ?? '';

  if (!tagManagerId) {
    return null;
  }

  return (
    <>
      <Script id="google-tag-manager" strategy="afterInteractive">
        {`
                    (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
                    new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
                    j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
                    'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
                    })(window,document,'script','dataLayer','${tagManagerId}');
                `}
      </Script>

      <noscript>
        <iframe
          src={`https://www.googletagmanager.com/ns.html?id=${tagManagerId}`}
          height="0"
          width="0"
          className="hidden invisible"
          title="Google Tag Manager"
        />
      </noscript>
    </>
  );
}
