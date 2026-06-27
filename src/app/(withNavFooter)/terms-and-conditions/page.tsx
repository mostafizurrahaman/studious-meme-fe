import { ManagedPageContent } from '@/components/ManagedPageContent';
import { SeoScripts } from '@/components/SeoScripts';
import { policySections } from '@/lib/static-site-content';
import { termsAndConditionMetadata, termsAndConditionSchemas } from '@/lib/seo';
import { getPageByType } from '@/services/Page';

export const metadata = termsAndConditionMetadata;

export default async function TermsAndConditionsPage() {
  const pageResult = await getPageByType('terms-and-conditions').catch(
    () => null,
  );

  return (
    <>
      <SeoScripts data={termsAndConditionSchemas} />
      <ManagedPageContent
        page={pageResult?.data ?? null}
        fallbackTitle="Terms & Conditions"
        fallbackDescription="Terms and conditions for using the Malamal storefront."
        fallback={
          <div className="space-y-6">
            {policySections.map((section) => (
              <div key={section.title}>
                <h2 className="text-xl font-black text-secondary">
                  {section.title}
                </h2>
                <ul className="mt-3 space-y-2 text-sm leading-7 text-foreground/65">
                  {section.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        }
      />
    </>
  );
}
