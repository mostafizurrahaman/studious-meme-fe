import Script from 'next/script';
import { serializeJsonLd } from '@/lib/seo';

type Props = {
  data: unknown | unknown[];
};

export function SeoScripts({ data }: Props) {
  const schemas = Array.isArray(data) ? data : [data];

  return (
    <>
      {schemas.map((schema, index) => (
        <Script
          key={index}
          id={`jsonld-${index}`}
          type="application/ld+json"
          // strategy="afterInteractive" // Uncomment if you want to load scripts after the page is loaded, but for SEO purposes, it's often better to load them immediately
          dangerouslySetInnerHTML={{
            __html: serializeJsonLd(schema),
          }}
        />
      ))}
    </>
  );
}
