import Link from 'next/link';
import { AlertCircle, ArrowLeft, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function PaymentFailPage() {
  return (
    <main className="flex flex-1 items-center justify-center bg-muted/20 px-4 py-10">
      <div className="w-full max-w-2xl">
        <Card className="space-y-5 border-0 p-6 shadow-sm sm:p-8">
          <div className="flex items-center gap-3">
            <AlertCircle className="size-10 text-red-600" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                PortPOS payment
              </p>
              <h1 className="text-2xl font-black text-secondary sm:text-3xl">
                Payment failed
              </h1>
            </div>
          </div>

          <p className="text-sm leading-7 text-foreground/70">
            Your payment attempt was not completed. No payment has been marked
            as successful.
          </p>

          <div className="flex flex-wrap gap-3">
            <Button asChild className="text-white! hover:text-black!">
              <Link href="/checkout">
                <ArrowLeft className="size-4" />
                Back to checkout
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/cart">
                <ShoppingCart className="size-4" />
                Go to cart
              </Link>
            </Button>
          </div>
        </Card>
      </div>
    </main>
  );
}
