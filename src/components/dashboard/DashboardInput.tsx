import type React from 'react';

import { Input } from '@/components/ui/input';

import { cn } from '@/lib/utils';

export function DashboardInput({
  className,
  ...props
}: React.ComponentProps<typeof Input>) {
  return (
    <Input
      {...props}
      className={cn(
        'h-11 rounded-xl border-border/70 bg-background/90 px-4 text-sm shadow-sm transition focus-visible:border-primary/60 focus-visible:ring-primary/20',
        className,
      )}
    />
  );
}
