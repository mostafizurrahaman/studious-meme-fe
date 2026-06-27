import { SeoScripts } from '@/components/SeoScripts';
import { WishlistPageClient } from '@/components/WishlistPageClient';
import { wishlistMetadata, wishlistSchemas } from '@/lib/seo';
import { mapBackendProductToStorefrontProduct } from '@/services/Product';
import type { BackendProduct } from '@/services/Product';
import { getMyWishlist } from '@/services/WishlistHistory';

export const metadata = wishlistMetadata;
export const dynamic = 'force-dynamic';

export default async function WishlistPage() {
  const wishlistResult = await getMyWishlist().catch(() => null);
  const authenticated = Boolean(wishlistResult?.success);
  const savedProducts = Array.isArray(wishlistResult?.data)
    ? (
        await Promise.all(
          wishlistResult.data.map((record) => {
            const product = record.product as BackendProduct | undefined;
            return product?.title
              ? mapBackendProductToStorefrontProduct(product)
              : null;
          }),
        )
      ).filter((product) => product !== null)
    : [];

  return (
    <>
      <SeoScripts data={wishlistSchemas} />
      <main className="flex-1 bg-background pb-16">
        <div className="px-4 py-6 lg:px-6">
          <WishlistPageClient
            authenticated={authenticated}
            savedProducts={savedProducts}
          />
        </div>
      </main>
    </>
  );
}
