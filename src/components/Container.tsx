import type { PropsWithChildren } from 'react';

export function Container({ children }: PropsWithChildren) {
  return (
    <div className="mx-auto w-full max-w-(--site-max-width) px-(--site-gutter-x)">
      {children}
    </div>
  );
}
