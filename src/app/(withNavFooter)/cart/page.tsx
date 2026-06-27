import { CartPageClient } from '@/components/CartPageClient';
import { SeoScripts } from '@/components/SeoScripts';
import { cartMetadata, cartSchemas } from '@/lib/seo';

export const metadata = cartMetadata;

export default function CartPage() {
  return (
    <>
      <SeoScripts data={cartSchemas} />
      <CartPageClient />
    </>
  );
}
