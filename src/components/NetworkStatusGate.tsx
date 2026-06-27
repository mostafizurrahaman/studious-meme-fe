'use client';

import Link from 'next/link';
import { useSyncExternalStore } from 'react';
import { RefreshCcw, WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

function subscribe(callback: () => void) {
  window.addEventListener('online', callback);
  window.addEventListener('offline', callback);

  return () => {
    window.removeEventListener('online', callback);
    window.removeEventListener('offline', callback);
  };
}

function getSnapshot() {
  return navigator.onLine;
}

function getServerSnapshot() {
  return true;
}

function useOnlineStatus() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function NetworkStatusGate() {
  const isOnline = useOnlineStatus();

  if (isOnline) {
    return null;
  }

  return (
    <div
      className={cn(
        'fixed inset-0 z-[200] flex items-start justify-center overflow-y-auto overflow-x-hidden bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.15),transparent_28%),radial-gradient(circle_at_20%_80%,rgba(249,115,22,0.12),transparent_26%),linear-gradient(180deg,#07111f_0%,#020617_100%)] px-4 py-5 sm:items-center sm:px-6',
      )}
      role="alert"
      aria-live="assertive"
    >
      <div className="pointer-events-none absolute inset-0 opacity-70">
        <div className="absolute top-8 left-8 size-36 rounded-full bg-sky-500/10 blur-3xl" />
        <div className="absolute top-1/4 right-8 size-52 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute bottom-12 left-1/2 size-64 -translate-x-1/2 rounded-full bg-orange-500/10 blur-3xl" />
      </div>

      <div className="relative w-full max-w-4xl">
        <div className="grid gap-4 rounded-[2rem] border border-white/10 bg-white/5 p-3 shadow-[0_28px_90px_-54px_rgba(15,23,42,0.95)] backdrop-blur-xl sm:p-4 lg:grid-cols-[0.95fr_1.05fr] lg:p-5">
          <div className="relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.92),rgba(8,15,27,0.95))] p-5 text-white sm:p-6">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,0.16),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(249,115,22,0.14),transparent_30%)]" />
            <div className="relative flex h-full min-h-[250px] flex-col justify-between gap-7">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/8 px-3 py-1 text-xs font-semibold text-white/80">
                  <span className="size-2 rounded-full bg-red-400" />
                  Connection lost
                </div>

                <div className="space-y-2.5">
                  <p className="text-xs font-bold uppercase tracking-[0.36em] text-sky-200/80">
                    Malamal offline mode
                  </p>
                  <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
                    You&apos;re offline
                  </h1>
                  <p className="max-w-xl text-sm leading-7 text-white/70 sm:text-base">
                    We need an internet connection to load live products,
                    orders, dashboard data, and updates.
                  </p>
                </div>
              </div>

              <div className="grid gap-3 text-sm text-white/82 sm:grid-cols-3">
                {[
                  'Check Wi-Fi or mobile data',
                  'Turn off airplane mode',
                  'Tap reload when connected',
                ].map((item) => (
                  <div
                    key={item}
                    className="rounded-2xl border border-white/10 bg-white/6 px-3 py-3 shadow-[0_10px_30px_-24px_rgba(255,255,255,0.6)]"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-between rounded-[1.75rem] border border-white/10 bg-slate-950/70 p-5 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] sm:p-6">
            <div className="space-y-5">
              <div className="flex items-center justify-between gap-4">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-white/70">
                  <WifiOff className="size-4 text-sky-300" />
                  No internet connection
                </div>
                <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-white/60">
                  Automatic retry is off
                </div>
              </div>

              <div className="space-y-4">
                <div className="rounded-[1.75rem] border border-white/10 bg-white/4 p-4">
                  <div className="flex items-center gap-4">
                    <div className="relative flex size-14 items-center justify-center rounded-2xl border border-white/10 bg-linear-to-br from-sky-500/20 via-sky-400/10 to-transparent shadow-[0_12px_40px_-18px_rgba(56,189,248,0.8)]">
                      <WifiOff className="size-8 text-sky-200" />
                      <div className="absolute -right-1 -top-1 size-3 rounded-full bg-red-400 shadow-[0_0_0_6px_rgba(248,113,113,0.12)]" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-white/85">
                        Connection unavailable
                      </div>
                      <div className="mt-1 text-sm leading-6 text-white/60">
                        Malamal will come back once your network is restored.
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-white/10 bg-white/4 p-4">
                    <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-white/40">
                      What to do
                    </p>
                    <p className="mt-2 text-sm text-white/72">
                      Reconnect to Wi-Fi, hotspot, or mobile data.
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/4 p-4">
                    <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-white/40">
                      Then
                    </p>
                    <p className="mt-2 text-sm text-white/72">
                      Refresh the page to resume browsing.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Button
                type="button"
                onClick={() => window.location.reload()}
                className="h-12 rounded-full bg-white px-5 text-sm font-bold text-slate-950 shadow-lg shadow-black/20 hover:bg-white/90"
              >
                <RefreshCcw className="size-4" />
                Try again
              </Button>
              <Button
                asChild
                variant="outline"
                className="h-12 rounded-full border-white/15 bg-white/5 px-5 text-sm font-bold text-white hover:bg-white/10 hover:text-white"
              >
                <Link href="/">Go home</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
