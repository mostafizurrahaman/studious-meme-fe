import Link from 'next/link';
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  Package,
  RefreshCcw,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { verifyPortPosPayment } from '@/services/Payment';

type Props = {
  searchParams: Promise<{ orderId?: string; invoiceId?: string }>;
};

export default async function PaymentSuccessPage({ searchParams }: Props) {
  const query = await searchParams;
  const orderId = query.orderId?.trim() ?? '';
  const invoiceId = query.invoiceId?.trim() ?? '';
  const verification = orderId
    ? await verifyPortPosPayment(orderId).catch(() => null)
    : null;
  const result = verification?.data;
  const isPaid = result?.paymentStatus === 'PAID';
  const isVerifying = Boolean(orderId) && verification === null;

  return (
    <main className="flex flex-1 items-center justify-center bg-muted/20 px-4 py-10">
      <div className="w-full max-w-2xl">
        <Card className="overflow-hidden border-0 shadow-sm">
          <div className="border-b bg-background px-6 py-5 sm:px-8">
            <div className="flex items-center gap-3">
              {isPaid ? (
                <CheckCircle2 className="size-10 text-emerald-600" />
              ) : isVerifying ? (
                <Loader2 className="size-10 animate-spin text-primary" />
              ) : (
                <AlertCircle className="size-10 text-amber-600" />
              )}
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                  PortPOS payment
                </p>
                <h1 className="text-2xl font-black text-secondary sm:text-3xl">
                  {isPaid
                    ? 'Payment confirmed'
                    : isVerifying
                      ? 'Verifying payment'
                      : 'Payment status pending'}
                </h1>
              </div>
            </div>
          </div>

          <div className="space-y-4 px-6 py-6 sm:px-8">
            <p className="text-sm leading-7 text-foreground/70">
              We verify payment from the backend before marking anything as
              paid.
            </p>

            <div className="grid gap-3 rounded-2xl bg-muted/40 p-4 text-sm sm:grid-cols-2">
              <div>
                <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  Order ID
                </div>
                <div className="mt-1 font-semibold text-secondary">
                  {orderId || result?.orderId || '-'}
                </div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  Invoice ID
                </div>
                <div className="mt-1 font-semibold text-secondary">
                  {invoiceId || result?.invoiceId || '-'}
                </div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  Payment status
                </div>
                <div className="mt-1 font-semibold text-secondary">
                  {result?.paymentStatus ?? 'PENDING'}
                </div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  Order status
                </div>
                <div className="mt-1 font-semibold text-secondary">
                  {result?.orderStatus ?? 'PENDING_PAYMENT'}
                </div>
              </div>
            </div>

            {!orderId ? (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                Missing order ID. Please open your order details to verify the
                payment.
              </div>
            ) : verification === null ? (
              <div className="rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground/70">
                We could not confirm the payment automatically. Please refresh
                after a moment or check your order history.
              </div>
            ) : null}

            <div className="flex flex-wrap gap-3 pt-2">
              {orderId ? (
                <Button asChild>
                  <Link href={`/my-account/orders/${orderId}`}>
                    <Package className="size-4" />
                    View order
                  </Link>
                </Button>
              ) : null}
              <Button asChild variant="outline" className="hover:text-primary!">
                <Link href="/shop">
                  <RefreshCcw className="size-4" />
                  Continue shopping
                </Link>
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </main>
  );
}
