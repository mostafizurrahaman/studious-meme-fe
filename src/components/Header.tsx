'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Container } from '@/components/Container';
import { SearchBox } from '@/components/SearchBox';
import { MiniCartDropdown } from '@/components/cart/MiniCartDropdown';
import { UserDropdownMenu } from '@/components/account/UserDropdownMenu';
import { useUser } from '@/context/UserContext';
import { useCompareStore } from '@/lib/compare-store';
import { useWishlistStore } from '@/lib/wishlist-store';
import { getDashboardPath } from '@/lib/dashboard';
import { siteConfig } from '@/lib/seo';
import type { Category } from '@/lib/storefront-types';

type Props = {
  categories: Category[];
};

export function Header({ categories }: Props) {
  const { user } = useUser();
  const pathname = usePathname();
  const categoriesRef = useRef<HTMLDetailsElement>(null);
  const menuRef = useRef<HTMLDetailsElement>(null);
  const cartRef = useRef<HTMLDetailsElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  const lastScrollYRef = useRef(0);
  const scrollTickRef = useRef(false);
  const compareCount = useCompareStore((state) => state.items.length);
  const wishlistCount = useWishlistStore((state) => state.items.length);
  const [mobileDrawerTab, setMobileDrawerTab] = useState<'categories' | 'menu'>(
    'categories',
  );
  const [activeCategorySlug, setActiveCategorySlug] = useState(
    categories[0]?.slug ?? '',
  );
  const [isHidden, setIsHidden] = useState(false);
  const [headerHeight, setHeaderHeight] = useState(0);
  const activeCategory =
    categories.find((category) => category.slug === activeCategorySlug) ??
    categories[0] ??
    null;

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node | null;

      if (
        categoriesRef.current &&
        target &&
        !categoriesRef.current.contains(target)
      ) {
        categoriesRef.current.open = false;
      }

      if (menuRef.current && target && !menuRef.current.contains(target)) {
        menuRef.current.open = false;
      }

      if (cartRef.current && target && !cartRef.current.contains(target)) {
        cartRef.current.open = false;
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);

    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, []);

  useEffect(() => {
    const syncHeaderHeight = () => {
      const nextHeight = Math.ceil(
        headerRef.current?.getBoundingClientRect().height ?? 0,
      );
      document.documentElement.style.setProperty(
        '--storefront-header-height',
        `${nextHeight}px`,
      );
      setHeaderHeight((prev) => (prev === nextHeight ? prev : nextHeight));
    };

    window.requestAnimationFrame(syncHeaderHeight);

    if (!headerRef.current || typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', syncHeaderHeight);

      return () => window.removeEventListener('resize', syncHeaderHeight);
    }

    const observer = new ResizeObserver(() => {
      window.requestAnimationFrame(syncHeaderHeight);
    });

    observer.observe(headerRef.current);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const updateVisibility = () => {
      const currentScrollY = window.scrollY;
      const previousScrollY = lastScrollYRef.current;
      const delta = currentScrollY - previousScrollY;
      const nearTop = currentScrollY <= Math.max(24, headerHeight * 0.35);

      if (nearTop) {
        setIsHidden(false);
      } else if (delta > 10) {
        setIsHidden(true);
      } else if (delta < -10) {
        setIsHidden(false);
      }

      if (delta > 10 && !nearTop) {
        if (categoriesRef.current) categoriesRef.current.open = false;
        if (menuRef.current) menuRef.current.open = false;
        if (cartRef.current) cartRef.current.open = false;
      }

      lastScrollYRef.current = currentScrollY;
      scrollTickRef.current = false;
    };

    const onScroll = () => {
      if (scrollTickRef.current) return;

      scrollTickRef.current = true;
      window.requestAnimationFrame(updateVisibility);
    };

    lastScrollYRef.current = window.scrollY;
    window.addEventListener('scroll', onScroll, { passive: true });

    return () => window.removeEventListener('scroll', onScroll);
  }, [headerHeight]);

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    if (href === '/shop')
      return pathname === '/shop' || pathname.startsWith('/product/');
    if (href === '/main-categories')
      return (
        pathname === '/main-categories' || pathname.startsWith('/category/')
      );
    if (href === '/my-account')
      return pathname === '/my-account' || pathname.startsWith('/my-account/');
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const navLinkClass = (href: string) =>
    `inline-flex items-center rounded-full px-3 py-1.5 transition ${
      isActive(href)
        ? 'bg-primary text-white'
        : 'text-foreground hover:!bg-primary hover:!text-white'
    }`;

  const drawerLinkClass = (href: string) =>
    `rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
      isActive(href)
        ? 'border-primary bg-primary text-white'
        : 'border-border text-foreground hover:border-primary/30 hover:!bg-primary hover:!text-white'
    }`;

  const activeStyle = (href: string) =>
    isActive(href)
      ? { backgroundColor: 'var(--primary)', color: '#ffffff' }
      : undefined;

  const activeDrawerStyle = (href: string) =>
    isActive(href)
      ? {
          backgroundColor: 'var(--primary)',
          borderColor: 'var(--primary)',
          color: '#ffffff',
        }
      : undefined;

  const activePillStyle = (href: string) =>
    isActive(href)
      ? { backgroundColor: 'var(--primary)', color: '#ffffff' }
      : undefined;

  return (
    <header
      ref={headerRef}
      className={`fixed inset-x-0 top-0 z-40 w-full border-b border-border/50 bg-background/75 text-foreground shadow-[0_12px_40px_rgba(15,23,42,0.08)] backdrop-blur-xl supports-backdrop-filter:bg-background/60 motion-safe:transition-transform motion-safe:duration-300 motion-safe:ease-out motion-reduce:transition-none ${isHidden ? '-translate-y-full' : 'translate-y-0'}`}
    >
      {/* 1st layer */}
      <Container>
        <div className="lg:hidden">
          <details ref={menuRef} className="group">
            <summary className="list-none cursor-pointer outline-none [&::-webkit-details-marker]:hidden">
              <div className="grid grid-cols-[36px_1fr_36px] items-center gap-2 py-2.5">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background text-lg leading-none text-foreground">
                  ☰
                </span>
                <Link
                  href="/"
                  className="flex justify-center"
                  aria-label="Malamal Home"
                >
                  <Image
                    src="/logo.png"
                    alt={siteConfig.name}
                    width={160}
                    height={32}
                    priority
                    className="h-7 w-34 object-contain sm:w-36"
                  />
                </Link>
                <UserDropdownMenu compact />
              </div>
            </summary>

            <Card className="mt-3 overflow-hidden rounded-none rounded-r-3xl p-0 shadow-2xl">
              <div className="grid grid-cols-2 border-b border-border text-sm font-bold uppercase tracking-[0.14em] text-foreground/45">
                <button
                  type="button"
                  onClick={() => setMobileDrawerTab('categories')}
                  className={`border-b-2 px-4 py-3 text-left transition ${mobileDrawerTab === 'categories' ? 'border-primary text-foreground' : 'border-transparent'}`}
                >
                  Categories
                </button>
                <button
                  type="button"
                  onClick={() => setMobileDrawerTab('menu')}
                  className={`border-b-2 px-4 py-3 text-left transition ${mobileDrawerTab === 'menu' ? 'border-primary text-foreground' : 'border-transparent'}`}
                >
                  Menu
                </button>
              </div>

              <div className="max-h-[70vh] overflow-y-auto">
                {mobileDrawerTab === 'categories' ? (
                  <div className="grid">
                    {categories.map((category) => (
                      <Link
                        key={category.name}
                        href={category.href}
                        onClick={() => setMobileDrawerTab('categories')}
                        className="border-b border-border px-4 py-4 text-sm font-semibold text-foreground transition hover:text-primary"
                      >
                        {category.name}
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="grid">
                    {(
                      [
                        ...(user
                          ? [
                              [
                                'Dashboard',
                                getDashboardPath(user.role),
                              ] as const,
                            ]
                          : []),
                        ['Hardware Store', '/main-categories'],
                        ['Our Contacts', '/our-contacts'],
                        ['Return Policy', '/return-policy'],
                        ['Wishlist', '/wishlist'],
                        ['Compare', '/compare'],
                      ] as const
                    ).map(([label, href], index) => (
                      <Link
                        key={label}
                        href={href}
                        className={`border-b border-border px-4 py-4 text-sm font-semibold transition ${index === 0 || index === 2 ? 'text-primary' : 'text-foreground'} hover:text-primary`}
                      >
                        {label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          </details>

          <div className="pb-3">
            <SearchBox />
          </div>
        </div>

        <div className="hidden min-h-18 items-center gap-4 py-2.5 lg:flex lg:min-h-18 lg:py-3">
          <Link
            href="/"
            className="flex shrink-0 items-center"
            aria-label="Malamal Home"
          >
            <Image
              src="/logo.png"
              alt={siteConfig.name}
              width={182}
              height={36}
              priority
              className="h-8 w-32 object-contain sm:w-36  lg:w-48"
            />
          </Link>

          {/* categories */}
          <div className="hidden items-center lg:flex">
            <details ref={categoriesRef} className="group relative">
              <summary className="list-none cursor-pointer rounded-full bg-secondary px-4 py-3 text-sm font-semibold text-secondary-foreground outline-none [&::-webkit-details-marker]:hidden">
                Categories
              </summary>
              <div className="absolute left-0 top-full z-20 mt-3 hidden w-176 rounded-3xl border border-border bg-card p-5 shadow-2xl ring-1 ring-black/5 group-open:block">
                <div className="grid gap-4 lg:grid-cols-[1fr_1.15fr]">
                  <div>
                    <div className="text-xs font-bold uppercase tracking-[0.28em] text-primary">
                      Top categories
                    </div>
                    <div className="mt-4 grid gap-2">
                      {categories.map((category) => (
                        <Link
                          key={category.name}
                          href={category.href}
                          onMouseEnter={() =>
                            setActiveCategorySlug(category.slug)
                          }
                          onFocus={() => setActiveCategorySlug(category.slug)}
                          className={`rounded-2xl border px-4 py-3 transition ${activeCategorySlug === category.slug ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/30 hover:bg-primary/5'}`}
                        >
                          <div className="text-sm font-bold text-foreground">
                            {category.name}
                          </div>
                          {/* <div className="mt-1 text-xs font-normal text-foreground/55">
                            {category.description}
                          </div> */}
                        </Link>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between text-xs font-bold uppercase tracking-[0.28em] text-primary">
                      <span>Sub categories</span>
                      <span className="text-foreground/45">
                        {activeCategory?.name ?? 'Hover a category'}
                      </span>
                    </div>
                    <div className="mt-4 grid gap-2">
                      {activeCategory?.subCategories?.length ? (
                        activeCategory.subCategories.map((subCategory) => (
                          <Link
                            key={subCategory.slug}
                            href={`/category/${activeCategory.slug}?subCategorySlug=${subCategory.slug}`}
                            className="rounded-2xl border border-border px-4 py-3 transition hover:border-primary/30 hover:bg-primary/5"
                          >
                            <div className="text-sm font-bold text-foreground">
                              {subCategory.name}
                            </div>
                            {/* {subCategory.description ? (
                              <div className="mt-1 text-xs font-normal text-foreground/55">
                                {subCategory.description}
                              </div>
                            ) : null} */}
                          </Link>
                        ))
                      ) : (
                        <div className="rounded-2xl border border-dashed border-border px-4 py-6 text-sm text-foreground/55">
                          Hover a category to show sub categories.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </details>
          </div>

          {/* search input */}
          <div className="hidden flex-1 items-center lg:flex">
            <SearchBox />
          </div>

          {/* compare and wishlist button with Quotation Request button */}
          <div className="ml-auto hidden items-center gap-3 md:flex">
            {(
              [
                ['Compare', '/compare', compareCount],
                ['Wishlist', '/wishlist', wishlistCount],
              ] as const
            ).map(([label, href, count]) => (
              <Link
                key={label}
                href={href}
                className="inline-flex h-10 items-center justify-center rounded-full border border-border px-3 text-xs font-semibold text-foreground transition hover:border-primary/30 hover:bg-primary! hover:text-white!"
                style={activePillStyle(href)}
              >
                {label}
                {count > 0 ? (
                  <span className="ml-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold leading-none text-white">
                    {count}
                  </span>
                ) : null}
              </Link>
            ))}
            <MiniCartDropdown ref={cartRef} active={pathname === '/cart'} />
            {/* Quotation Request button */}
            <Link
              className="inline-flex h-10 items-center justify-center rounded-full border border-border px-3 text-xs font-semibold text-foreground transition hover:border-primary/30 hover:bg-primary! hover:text-white!"
              href="/quotation-request"
              style={activePillStyle('/quotation-request')}
            >
              Quotation Request
            </Link>
            <UserDropdownMenu />
          </div>
        </div>
      </Container>

      {/* 2nd layer */}
      <div className="border-t border-border bg-muted/70">
        <Container>
          <nav className="hidden min-h-12 items-center justify-between gap-4 py-2 text-xs font-semibold text-foreground lg:flex">
            {/* left part */}
            <div className="flex flex-wrap items-center gap-5">
              <Link
                className={navLinkClass('/main-categories')}
                href="/main-categories"
                style={activeStyle('/main-categories')}
              >
                Categories
              </Link>
              <Link
                className={navLinkClass('/shop')}
                href="/shop"
                style={activeStyle('/shop')}
              >
                Shop
              </Link>
              <Link
                className={navLinkClass('/promotions')}
                href="/promotions"
                style={activeStyle('/promotions')}
              >
                Promotions/Campaigns
              </Link>
              <Link
                className={navLinkClass('/shop-by-brands')}
                href="/shop-by-brands"
                style={activeStyle('/shop-by-brands')}
              >
                Shop By Brands
              </Link>
              <Link
                className={navLinkClass('/our-contacts')}
                href="/our-contacts"
                style={activeStyle('/our-contacts')}
              >
                Our Contacts
              </Link>
              <Link
                className={navLinkClass('/return-policy')}
                href="/return-policy"
                style={activeStyle('/return-policy')}
              >
                Return Policy
              </Link>
              <Link
                className={navLinkClass('/terms-and-conditions')}
                href="/terms-and-conditions"
                style={activeStyle('/terms-and-conditions')}
              >
                Terms & Conditions
              </Link>
            </div>

            {/* right part */}
            <div className="flex flex-wrap items-center gap-5">
              <div className="text-sm leading-tight text-right">
                <div className="font-semibold text-foreground">
                  Dedicated Support
                </div>
                <a
                  className="font-semibold text-secondary"
                  href="tel:+8809638212121"
                >
                  +880 9638212121
                </a>
              </div>
            </div>
          </nav>

          <details className="hidden py-3 lg:hidden">
            <summary className="list-none cursor-pointer rounded-full border border-border bg-background px-4 py-2 text-sm font-semibold text-foreground outline-none [&::-webkit-details-marker]:hidden">
              Menu
            </summary>
            <Card className="mt-3 p-4 shadow-lg ring-1 ring-black/5">
              <div className="grid gap-3">
                {(
                  [
                    ['Shop', '/shop'],
                    ['Promotions/Campaigns', '/promotions'],
                    ['Main Categories', '/main-categories'],
                    ['Shop By Brands', '/shop-by-brands'],
                    ['Return Policy', '/return-policy'],
                    ['Terms & Conditions', '/terms-and-conditions'],
                    ['Quotation Request', '/quotation-request'],
                    ['Our Contacts', '/our-contacts'],
                    ['Compare', '/compare'],
                    ['Wishlist', '/wishlist'],
                    ['Cart', '/cart'],
                    ['My account', '/my-account'],
                  ] as const
                ).map(([label, href]) => (
                  <Link
                    key={label}
                    href={href}
                    className={drawerLinkClass(href)}
                    style={activeDrawerStyle(href)}
                  >
                    {label}
                  </Link>
                ))}
              </div>
              <div className="mt-4">
                <div className="text-xs font-bold uppercase tracking-[0.28em] text-primary">
                  Categories
                </div>
                <div className="mt-3 grid gap-2">
                  {categories.map((category) => (
                    <Link
                      key={category.name}
                      href={category.href}
                      className={drawerLinkClass(category.href)}
                      style={activeDrawerStyle(category.href)}
                    >
                      {category.name}
                    </Link>
                  ))}
                </div>
              </div>
            </Card>
          </details>
        </Container>
      </div>
    </header>
  );
}

// 'use client';

// import Image from 'next/image';
// import Link from 'next/link';
// import { useEffect, useRef, useState } from 'react';
// import { usePathname } from 'next/navigation';
// import { Card } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Container } from '@/components/Container';
// import { MiniCartDropdown } from '@/components/cart/MiniCartDropdown';
// import { UserDropdownMenu } from '@/components/account/UserDropdownMenu';
// import { useUser } from '@/context/UserContext';
// import { getDashboardPath } from '@/lib/dashboard';
// import type { Brand, Category } from '@/lib/storefront-types';

// type Props = {
//   categories: Category[];
//   brands: Brand[];
// };

// export function Header({ categories, brands }: Props) {
//   const { user } = useUser();
//   const pathname = usePathname();
//   const categoriesRef = useRef<HTMLDetailsElement>(null);
//   const menuRef = useRef<HTMLDetailsElement>(null);
//   const cartRef = useRef<HTMLDetailsElement>(null);
//   const [mobileDrawerTab, setMobileDrawerTab] = useState<'categories' | 'menu'>('categories');

//   useEffect(() => {
//     const handlePointerDown = (event: PointerEvent) => {
//       const target = event.target as Node | null;

//       if (categoriesRef.current && target && !categoriesRef.current.contains(target)) {
//         categoriesRef.current.open = false;
//       }

//       if (menuRef.current && target && !menuRef.current.contains(target)) {
//         menuRef.current.open = false;
//       }

//       if (cartRef.current && target && !cartRef.current.contains(target)) {
//         cartRef.current.open = false;
//       }
//     };

//     document.addEventListener('pointerdown', handlePointerDown);

//     return () => document.removeEventListener('pointerdown', handlePointerDown);
//   }, []);

//   const isActive = (href: string) => {
//     if (href === '/') return pathname === '/';
//     if (href === '/shop') return pathname === '/shop' || pathname.startsWith('/product/');
//     if (href === '/main-categories')
//       return pathname === '/main-categories' || pathname.startsWith('/category/');
//     if (href === '/my-account') return pathname === '/my-account' || pathname.startsWith('/my-account/');
//     return pathname === href || pathname.startsWith(`${href}/`);
//   };

//   const navLinkClass = (href: string) =>
//     `inline-flex items-center rounded-full px-3 py-1.5 transition ${
//       isActive(href) ? 'bg-primary text-white' : 'text-foreground hover:!bg-primary hover:!text-white'
//     }`;

//   const drawerLinkClass = (href: string) =>
//     `rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
//       isActive(href)
//         ? 'border-primary bg-primary text-white'
//         : 'border-border text-foreground hover:border-primary/30 hover:!bg-primary hover:!text-white'
//     }`;

//   const activeStyle = (href: string) =>
//     isActive(href) ? { backgroundColor: 'var(--primary)', color: '#ffffff' } : undefined;

//   const activeDrawerStyle = (href: string) =>
//     isActive(href)
//       ? { backgroundColor: 'var(--primary)', borderColor: 'var(--primary)', color: '#ffffff' }
//       : undefined;

//   const activePillStyle = (href: string) =>
//     isActive(href) ? { backgroundColor: 'var(--primary)', color: '#ffffff' } : undefined;

//   return (
//     <header className="sticky top-0 z-40 w-full border-b border-border bg-background text-foreground shadow-sm">
//       {/* 1st layer */}
//       <Container>
//         <div className="lg:hidden">
//           <details ref={menuRef} className="group">
//             <summary className="list-none cursor-pointer outline-none [&::-webkit-details-marker]:hidden">
//               <div className="grid grid-cols-[36px_1fr_36px] items-center gap-2 py-2.5">
//                 <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background text-lg leading-none text-foreground">
//                   ☰
//                 </span>
//                 <Link href="/" className="flex justify-center" aria-label="Malamal Home">
//                   <Image
//                     src="/logo.png"
//                     alt="Malamal.com.bd"
//                     width={160}
//                     height={32}
//                     priority
//                     className="h-7 w-34 object-contain sm:w-36"
//                   />
//                 </Link>
//                 <UserDropdownMenu compact />
//               </div>
//             </summary>

//             <Card className="mt-3 overflow-hidden rounded-none rounded-r-3xl p-0 shadow-2xl">
//               <div className="grid grid-cols-2 border-b border-border text-sm font-bold uppercase tracking-[0.14em] text-foreground/45">
//                 <button
//                   type="button"
//                   onClick={() => setMobileDrawerTab('categories')}
//                   className={`border-b-2 px-4 py-3 text-left transition ${mobileDrawerTab === 'categories' ? 'border-primary text-foreground' : 'border-transparent'}`}
//                 >
//                   Categories
//                 </button>
//                 <button
//                   type="button"
//                   onClick={() => setMobileDrawerTab('menu')}
//                   className={`border-b-2 px-4 py-3 text-left transition ${mobileDrawerTab === 'menu' ? 'border-primary text-foreground' : 'border-transparent'}`}
//                 >
//                   Menu
//                 </button>
//               </div>

//               <div className="max-h-[70vh] overflow-y-auto">
//                 {mobileDrawerTab === 'categories' ? (
//                   <div className="grid">
//                     {categories.map(category => (
//                       <Link
//                         key={category.name}
//                         href={category.href}
//                         onClick={() => setMobileDrawerTab('categories')}
//                         className="border-b border-border px-4 py-4 text-sm font-semibold text-foreground transition hover:text-primary"
//                       >
//                         {category.name}
//                       </Link>
//                     ))}
//                   </div>
//                 ) : (
//                   <div className="grid">
//                     {(
//                       [
//                         ...(user ? [['Dashboard', getDashboardPath(user.role)] as const] : []),
//                         ['Hardware Store', '/main-categories'],
//                         ['Our Contacts', '/our-contacts'],
//                         ['Return Policy', '/return-policy'],
//                         ['Wishlist', '/wishlist'],
//                         ['Compare', '/compare'],
//                       ] as const
//                     ).map(([label, href], index) => (
//                       <Link
//                         key={label}
//                         href={href}
//                         className={`border-b border-border px-4 py-4 text-sm font-semibold transition ${index === 0 || index === 2 ? 'text-primary' : 'text-foreground'} hover:text-primary`}
//                       >
//                         {label}
//                       </Link>
//                     ))}
//                   </div>
//                 )}
//               </div>
//             </Card>
//           </details>

//           <div className="pb-3">
//             <div className="flex overflow-hidden rounded-full border border-border bg-background shadow-sm">
//               <Input
//                 className="h-11 w-full rounded-none border-0 bg-background px-4 text-sm text-foreground placeholder:text-foreground/60 shadow-none focus-visible:ring-0"
//                 placeholder="Search…"
//                 aria-label="Search"
//               />
//               <Button
//                 type="button"
//                 variant="secondary"
//                 className="h-11 rounded-none bg-primary px-3 text-sm font-semibold text-white hover:bg-primary/80"
//               >
//                 <span className="text-lg leading-none">⌕</span>
//               </Button>
//             </div>
//           </div>
//         </div>

//         <div className="hidden min-h-18 items-center gap-4 py-2.5 lg:flex lg:min-h-18 lg:py-3">
//           <Link href="/" className="flex shrink-0 items-center" aria-label="Malamal Home">
//             <Image
//               src="/logo.png"
//               alt="Malamal.com.bd"
//               width={182}
//               height={36}
//               priority
//               className="h-8 w-32 object-contain sm:w-36  lg:w-44"
//             />
//           </Link>

//           {/* categories */}
//           <div className="hidden items-center lg:flex">
//             <details ref={categoriesRef} className="group relative">
//               <summary className="list-none cursor-pointer rounded-full bg-secondary px-4 py-3 text-sm font-semibold text-secondary-foreground outline-none [&::-webkit-details-marker]:hidden">
//                 Categories
//               </summary>
//               <div className="absolute left-0 top-full z-20 mt-3 hidden w-240 rounded-3xl border border-border bg-card p-5 shadow-2xl ring-1 ring-black/5 group-open:block">
//                 <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr_0.9fr]">
//                   <div>
//                     <div className="text-xs font-bold uppercase tracking-[0.28em] text-primary">
//                       Top categories
//                     </div>
//                     <div className="mt-4 grid gap-2">
//                       {categories.map(category => (
//                         <Link
//                           key={category.name}
//                           href={category.href}
//                           className="rounded-2xl border border-border px-4 py-3 transition hover:border-primary/30 hover:bg-primary! hover:text-white!"
//                         >
//                           <div className="text-sm font-bold text-foreground">{category.name}</div>
//                           <div className="mt-1 text-xs font-normal text-foreground/55">
//                             {category.description}
//                           </div>
//                         </Link>
//                       ))}
//                     </div>
//                   </div>
//                   <div>
//                     <div className="text-xs font-bold uppercase tracking-[0.28em] text-primary">
//                       Quick links
//                     </div>
//                     <div className="mt-4 grid gap-2">
//                       {(
//                         [
//                           ['Shop', '/shop'],
//                           ['Promotions', '/promotions'],
//                           ['Main Categories', '/main-categories'],
//                           ['Brands', '/shop-by-brands'],
//                           ['Quotation Request', '/quotation-request'],
//                           ['Our Contacts', '/our-contacts'],
//                         ] as const
//                       ).map(([label, href]) => (
//                         <Link
//                           key={label}
//                           href={href}
//                           className="rounded-2xl border border-border px-4 py-3 transition hover:border-primary/30 hover:bg-primary! hover:text-white!"
//                         >
//                           {label}
//                         </Link>
//                       ))}
//                     </div>
//                   </div>
//                   <div>
//                     <div className="text-xs font-bold uppercase tracking-[0.28em] text-primary">
//                       Popular brands
//                     </div>
//                     <div className="mt-4 grid grid-cols-2 gap-2">
//                       {brands.map(brand => (
//                         <Link
//                           key={brand.name}
//                           href={brand.href}
//                           className="rounded-2xl border border-border px-4 py-3 text-center transition hover:border-primary/30 hover:bg-primary! hover:text-white!"
//                         >
//                           {brand.name}
//                         </Link>
//                       ))}
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </details>
//           </div>

//           {/* search input */}
//           <div className="hidden flex-1 items-center lg:flex">
//             <div className="flex w-full overflow-hidden rounded-full border border-border bg-background shadow-sm">
//               <Input
//                 className="h-11 w-full rounded-none border-0 bg-background px-4 text-sm text-foreground placeholder:text-muted-foreground/60 shadow-none focus-visible:ring-0"
//                 placeholder="Search…"
//                 aria-label="Search"
//               />
//               <Button
//                 type="button"
//                 variant="secondary"
//                 className="h-11 rounded-none px-2 text-sm font-semibold"
//               >
//                 Search
//               </Button>
//             </div>
//           </div>

//           {/* compare and wishlist button with Quotation Request button */}
//           <div className="ml-auto hidden items-center gap-3 md:flex">
//             {(
//               [
//                 ['Compare', '/compare'],
//                 ['Wishlist', '/wishlist'],
//               ] as const
//             ).map(([label, href]) => (
//               <Link
//                 key={label}
//                 href={href}
//                 className="inline-flex h-10 items-center justify-center rounded-full border border-border px-3 text-xs font-semibold text-foreground transition hover:border-primary/30 hover:bg-primary! hover:text-white!"
//                 style={activePillStyle(href)}
//               >
//                 {label}
//               </Link>
//             ))}
//             <MiniCartDropdown ref={cartRef} active={pathname === '/cart'} />
//             <div className="text-sm leading-tight">
//               <div className="font-semibold text-foreground">Dedicated Support</div>
//               <a className="font-semibold text-secondary" href="tel:+8809638212121">
//                 +880 9638212121
//               </a>
//             </div>
//             {/* Quotation Request button */}
//             <Link
//               className="inline-flex h-10 items-center justify-center rounded-full border border-border px-3 text-xs font-semibold text-foreground transition hover:border-primary/30 hover:bg-primary! hover:text-white!"
//               href="/quotation-request"
//               style={activePillStyle('/quotation-request')}
//             >
//               Quotation Request
//             </Link>
//             <UserDropdownMenu />
//           </div>
//         </div>
//       </Container>

//       {/* 2nd layer */}
//       <div className="border-t border-border bg-muted/70">
//         <Container>
//           <nav className="hidden min-h-12 items-center justify-between gap-4 py-2 text-xs font-semibold text-foreground lg:flex">
//             {/* left part */}
//             <div className="flex flex-wrap items-center gap-5">
//               <Link
//                 className={navLinkClass('/main-categories')}
//                 href="/main-categories"
//                 style={activeStyle('/main-categories')}
//               >
//                 Categories
//               </Link>
//               <Link className={navLinkClass('/shop')} href="/shop" style={activeStyle('/shop')}>
//                 Shop
//               </Link>
//               <Link
//                 className={navLinkClass('/promotions')}
//                 href="/promotions"
//                 style={activeStyle('/promotions')}
//               >
//                 Promotions/Campaigns
//               </Link>
//               <Link
//                 className={navLinkClass('/shop-by-brands')}
//                 href="/shop-by-brands"
//                 style={activeStyle('/shop-by-brands')}
//               >
//                 Shop By Brands
//               </Link>
//               <Link
//                 className={navLinkClass('/our-contacts')}
//                 href="/our-contacts"
//                 style={activeStyle('/our-contacts')}
//               >
//                 Our Contacts
//               </Link>
//             </div>

//             {/* right part */}
//             <div className="flex flex-wrap items-center gap-5">
//               {/* <Link className={navLinkClass('/main-categories')} href="/main-categories">
//                                 All Categories
//                             </Link> */}
//               <Link
//                 className={navLinkClass('/return-policy')}
//                 href="/return-policy"
//                 style={activeStyle('/return-policy')}
//               >
//                 Return Policy
//               </Link>
//               <Link
//                 className={navLinkClass('/terms-and-conditions')}
//                 href="/terms-and-conditions"
//                 style={activeStyle('/terms-and-conditions')}
//               >
//                 Terms & Conditions
//               </Link>
//             </div>
//           </nav>

//           <details className="hidden py-3 lg:hidden">
//             <summary className="list-none cursor-pointer rounded-full border border-border bg-background px-4 py-2 text-sm font-semibold text-foreground outline-none [&::-webkit-details-marker]:hidden">
//               Menu
//             </summary>
//             <Card className="mt-3 p-4 shadow-lg ring-1 ring-black/5">
//               <div className="grid gap-3">
//                 {(
//                   [
//                     ['Shop', '/shop'],
//                     ['Promotions/Campaigns', '/promotions'],
//                     ['Main Categories', '/main-categories'],
//                     ['Shop By Brands', '/shop-by-brands'],
//                     ['Return Policy', '/return-policy'],
//                     ['Terms & Conditions', '/terms-and-conditions'],
//                     ['Quotation Request', '/quotation-request'],
//                     ['Our Contacts', '/our-contacts'],
//                     ['Compare', '/compare'],
//                     ['Wishlist', '/wishlist'],
//                     ['Cart', '/cart'],
//                     ['My account', '/my-account'],
//                   ] as const
//                 ).map(([label, href]) => (
//                   <Link
//                     key={label}
//                     href={href}
//                     className={drawerLinkClass(href)}
//                     style={activeDrawerStyle(href)}
//                   >
//                     {label}
//                   </Link>
//                 ))}
//               </div>
//               <div className="mt-4">
//                 <div className="text-xs font-bold uppercase tracking-[0.28em] text-primary">Categories</div>
//                 <div className="mt-3 grid gap-2">
//                   {categories.map(category => (
//                     <Link
//                       key={category.name}
//                       href={category.href}
//                       className={drawerLinkClass(category.href)}
//                       style={activeDrawerStyle(category.href)}
//                     >
//                       {category.name}
//                     </Link>
//                   ))}
//                 </div>
//               </div>
//             </Card>
//           </details>
//         </Container>
//       </div>
//     </header>
//   );
// }
