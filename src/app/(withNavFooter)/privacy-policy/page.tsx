import { ManagedPageContent } from '@/components/ManagedPageContent';
import { SeoScripts } from '@/components/SeoScripts';
import { policySections } from '@/lib/static-site-content';
import { privacyPolicyMetadata, privacyPolicySchemas } from '@/lib/seo';
import { getPageByType } from '@/services/Page';

export const metadata = privacyPolicyMetadata;

export default async function PrivacyPolicyPage() {
  const pageResult = await getPageByType('privacy-policy').catch(() => null);

  return (
    <>
      <SeoScripts data={privacyPolicySchemas} />
      <ManagedPageContent
        page={pageResult?.data ?? null}
        fallbackTitle="Privacy Policy"
        fallbackDescription="Privacy policy for the Malamal storefront."
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
