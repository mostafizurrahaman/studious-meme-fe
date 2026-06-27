import { ManagedPageContent } from '@/components/ManagedPageContent';
import { SeoScripts } from '@/components/SeoScripts';
import { deliveryReturnMetadata, deliveryReturnSchemas } from '@/lib/seo';
import { getPageByType } from '@/services/Page';

export const metadata = deliveryReturnMetadata;

export default async function ReturnPolicyPage() {
  const pageResult = await getPageByType('return-policy').catch(() => null);

  return (
    <>
      <SeoScripts data={deliveryReturnSchemas} />
      <ManagedPageContent
        page={pageResult?.data ?? null}
        fallbackTitle="Delivery & Return Policy"
        fallbackDescription="Delivery, return and refund policy for the storefront."
        fallback={
          <div className="grid gap-4 text-sm leading-7 text-foreground/70">
            <p>
              Delivery details, shipping zones, return conditions and refund
              handling are outlined for the store experience.
            </p>
            <p>
              The policy covers order confirmation, shipment timelines and
              accepted return requests.
            </p>
          </div>
        }
      />
    </>
  );
}
