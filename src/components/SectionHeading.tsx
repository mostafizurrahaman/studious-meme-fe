import type { Route } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

import { Button } from '@/components/ui/button';

type Props = {
  title: string;
  actionHref?: Route;
  actionLabel?: string;
};

export function SectionHeading({
  title,
  actionHref,
  actionLabel = 'More Products',
}: Props) {
  return (
    <div className="flex items-end justify-between gap-4">
      <h2 className="text-lg font-semibold tracking-tight text-secondary sm:text-xl">
        {title}
      </h2>
      {actionHref ? (
        <Button
          asChild
          variant="outline"
          className="rounded-full border-0 bg-[#dbe7ff] px-4 py-2 text-sm font-semibold text-[#2e5bcb]! shadow-sm hover:bg-[#c9dcff] hover:text-primary!"
        >
          <Link href={actionHref}>
            {actionLabel}
            <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
      ) : null}
    </div>
  );
}
