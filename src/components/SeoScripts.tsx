import { serializeJsonLd } from '@/lib/seo';

type Props = {
  data: unknown | unknown[];
};

export function SeoScripts({ data }: Props) {
  const schemas = Array.isArray(data) ? data : [data];

  return (
    <>
      {schemas.map((schema, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: serializeJsonLd(schema),
          }}
        />
      ))}
    </>
  );
}
