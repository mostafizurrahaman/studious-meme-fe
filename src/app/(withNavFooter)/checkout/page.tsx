import { CheckoutPageClient } from '@/components/CheckoutPageClient';
import { SeoScripts } from '@/components/SeoScripts';
import { Card } from '@/components/ui/card';
import { checkoutMetadata, checkoutSchemas } from '@/lib/seo';

export const metadata = checkoutMetadata;

type Props = {
  searchParams: Promise<{ payment?: string; orderId?: string }>;
};

export default async function CheckoutPage({ searchParams }: Props) {
  const query = await searchParams;
  const paymentState = query.payment;

  return (
    <>
      <SeoScripts data={checkoutSchemas} />
      {paymentState ? (
        <main className="bg-background px-4 pt-6">
          <div className="mx-auto max-w-310">
            <Card
              className={`p-4 text-sm font-semibold shadow-sm ${paymentState === 'success' ? 'border-emerald-500/30 bg-emerald-50 text-emerald-700' : paymentState === 'failed' ? 'border-destructive/30 bg-destructive/5 text-destructive' : 'border-amber-500/30 bg-amber-50 text-amber-700'}`}
            >
              {paymentState === 'success'
                ? `Payment completed successfully${query.orderId ? ` for ${query.orderId}` : ''}.`
                : paymentState === 'failed'
                  ? 'Payment failed. You can try placing the order again.'
                  : 'Payment was cancelled before completion.'}
            </Card>
          </div>
        </main>
      ) : null}
      <CheckoutPageClient />
    </>
  );
}
