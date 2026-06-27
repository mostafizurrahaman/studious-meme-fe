'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowLeftRight, Heart, ShoppingCart, UserRound } from 'lucide-react';

import { useUser } from '@/context/UserContext';
import { useCartStore } from '@/lib/cart-store';
import { useCompareStore } from '@/lib/compare-store';
import { useWishlistStore } from '@/lib/wishlist-store';
import { getDashboardPathByRole } from '@/lib/auth/roles';

const items = [
  ['Compare', '/compare', ArrowLeftRight],
  ['Wishlist', '/wishlist', Heart],
  ['Cart', '/cart', ShoppingCart],
  ['Account', '/my-account', UserRound],
] as const;

export function MobileToolbar() {
  const { user } = useUser();
  const pathname = usePathname();
  const cartCount = useCartStore((state) =>
    state.items.reduce((sum, item) => sum + item.quantity, 0),
  );
  const compareCount = useCompareStore((state) => state.items.length);
  const wishlistCount = useWishlistStore((state) => state.items.length);

  const accountHref = user
    ? (getDashboardPathByRole(user.role) ?? '/dashboard')
    : '/my-account';

  const isActivePath = (href: string) => {
    if (href === '/compare')
      return pathname === '/compare' || pathname.startsWith('/compare/');
    if (href === '/wishlist')
      return pathname === '/wishlist' || pathname.startsWith('/wishlist/');
    if (href === '/cart')
      return pathname === '/cart' || pathname.startsWith('/cart/');
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const isAccountActive =
    pathname === accountHref ||
    pathname.startsWith(`${accountHref}/`) ||
    pathname === '/my-account' ||
    pathname.startsWith('/my-account/') ||
    pathname === '/dashboard' ||
    pathname.startsWith('/dashboard/');

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 lg:hidden">
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-linear-to-t from-background/95 to-transparent" />
      <div className="border-t border-border/60 bg-background/92 px-2 pt-2 pb-[max(0.65rem,env(safe-area-inset-bottom))] shadow-[0_-8px_24px_rgba(15,23,42,0.08)] backdrop-blur-xl supports-backdrop-filter:bg-background/80">
        <div className="mx-auto grid max-w-310 grid-cols-4 gap-1">
          {items.map(([label, href, Icon]) => {
            const active =
              label === 'Account' ? isAccountActive : isActivePath(href);
            const count =
              label === 'Cart'
                ? cartCount
                : label === 'Compare'
                  ? compareCount
                  : wishlistCount;

            return (
              <Link
                key={label}
                href={label === 'Account' ? accountHref : href}
                aria-current={active ? 'page' : undefined}
                className={`relative flex min-h-14 flex-col items-center justify-center gap-1 rounded-2xl px-1 py-2 text-[11px] transition duration-200 ${
                  active
                    ? 'bg-primary/10 text-primary ring-1 ring-primary/20 shadow-sm'
                    : 'text-foreground/65 hover:bg-muted/80 hover:text-foreground'
                }`}
              >
                <span className="relative inline-flex items-center justify-center">
                  <span
                    className={`flex h-8 w-8 items-center justify-center rounded-full transition ${
                      active
                        ? 'bg-primary text-white shadow-sm'
                        : 'bg-background/85 text-foreground ring-1 ring-border/70'
                    }`}
                  >
                    <Icon
                      className={`h-5 w-5 transition-transform duration-200 ${active ? 'scale-105' : ''}`}
                    />
                  </span>
                  {label === 'Account' ? null : (
                    <span
                      className={`absolute -right-2 -top-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[9px] font-bold leading-none shadow-sm ${
                        active
                          ? 'bg-primary text-white'
                          : 'bg-secondary text-secondary-foreground'
                      }`}
                    >
                      {count}
                    </span>
                  )}
                </span>
                <span className={active ? 'font-semibold' : 'font-medium'}>
                  {label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
