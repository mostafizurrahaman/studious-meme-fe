import { SeoScripts } from '@/components/SeoScripts';
import { ComparePageClient } from '@/components/compare/ComparePageClient';
import { compareMetadata, compareSchemas } from '@/lib/seo';
import { comparisonHistoryRecordToProduct } from '@/lib/compare';
import type { Product } from '@/lib/storefront-types';
import { getMyComparisonHistory } from '@/services/ComparisonHistory';

export const metadata = compareMetadata;
export const dynamic = 'force-dynamic';

export default async function ComparePage() {
  const result = await getMyComparisonHistory().catch(() => null);
  const authenticated = Boolean(result?.success);
  const savedProducts =
    authenticated && Array.isArray(result?.data)
      ? result.data
          .map(comparisonHistoryRecordToProduct)
          .filter((product): product is Product => Boolean(product))
          .slice(0, 4)
      : [];

  return (
    <>
      <SeoScripts data={compareSchemas} />
      <main className="flex-1 bg-background pb-16">
        <div className="mx-auto w-full max-w-350 px-4 py-6 lg:px-6">
          <ComparePageClient
            authenticated={authenticated}
            initialProducts={savedProducts}
          />
        </div>
      </main>
    </>
  );
}
