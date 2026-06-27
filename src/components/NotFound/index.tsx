'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Home, Search, ShoppingBag } from 'lucide-react';
import notFoundImage from '@/assets/404.png';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

const helpfulLinks = [
  { label: 'Shop', href: '/shop', icon: ShoppingBag },
  { label: 'Return Policy', href: '/return-policy', icon: Search },
  { label: 'Contact', href: '/our-contacts', icon: Search },
];

const NotFound = () => {
  const router = useRouter();

  return (
    <main className="flex min-h-dvh items-center justify-center bg-muted/20 px-4 py-8">
      <Card className="mx-auto grid w-full max-w-260 items-center gap-8 overflow-hidden p-6 shadow-sm md:grid-cols-[0.9fr_1.1fr] md:p-10">
        <div className="relative mx-auto aspect-square w-full max-w-70">
          <Image
            src={notFoundImage}
            alt="404 Not Found"
            fill
            sizes="(max-width: 768px) 100vw, 280px"
            className="object-contain"
            priority
          />
        </div>

        <div className="text-center md:text-left">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-primary">
            Page not found
          </p>
          <h1 className="mt-4 text-3xl font-black text-secondary sm:text-5xl">
            This page is out of stock
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-7 text-foreground/65 sm:text-base">
            The page may have moved, the link may be old, or the product shelf
            you were looking for is no longer available.
          </p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row md:justify-start">
            <Button type="button" size="lg" onClick={() => router.back()}>
              <ArrowLeft className="size-4" />
              Go back
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/">
                <Home className="size-4" />
                Home
              </Link>
            </Button>
          </div>

          <div className="mt-8 grid gap-2 sm:grid-cols-3">
            {helpfulLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center justify-center gap-2 rounded-lg border border-border bg-background px-3 py-3 text-sm font-semibold transition hover:border-primary/35 hover:bg-primary hover:text-white! md:justify-start"
              >
                <item.icon className="size-4" />
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </Card>
    </main>
  );
};

export default NotFound;
