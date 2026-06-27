'use client';

import { Button } from '@/components/ui/button';

export default function StorefrontError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-6 px-4">
        <div className="space-y-2">
          <h1 className="text-6xl font-bold text-muted-foreground">Oops!</h1>
          <h2 className="text-2xl font-semibold">Something went wrong</h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            An unexpected error occurred. Please try again, or browse our
            homepage.
          </p>
        </div>
        {error?.digest && (
          <p className="text-xs text-muted-foreground">
            Error ID: {error.digest}
          </p>
        )}
        <div className="flex gap-3 justify-center">
          <Button onClick={reset}>Try again</Button>
          <Button
            variant="outline"
            onClick={() => (window.location.href = '/')}
          >
            Go to Homepage
          </Button>
        </div>
      </div>
    </div>
  );
}
