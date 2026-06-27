// 'use client';

// import Link from 'next/link';
// import { usePathname } from 'next/navigation';
// import {
//   ChevronDown,
//   FileText,
//   LayoutDashboard,
//   ShoppingBag,
//   Tags,
//   ReceiptText,
//   Users as UsersIcon,
//   BadgeCheck,
//   Settings,
//   ShieldUser,
// } from 'lucide-react';
// import {
//   Sidebar,
//   SidebarContent,
//   SidebarFooter,
//   SidebarGroup,
//   SidebarGroupContent,
//   SidebarGroupLabel,
//   SidebarHeader,
//   SidebarInset,
//   SidebarMenu,
//   SidebarMenuButton,
//   SidebarMenuItem,
//   SidebarProvider,
//   SidebarRail,
//   SidebarTrigger,
// } from '@/components/ui/sidebar';
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuTrigger,
// } from '@/components/ui/dropdown-menu';
// import { UserDropdownMenu } from '@/components/account/UserDropdownMenu';
// import { getRoleLabel, normalizeRole, normalizeRoleSegment } from '@/lib/auth/roles';
// import { getDashboardNavigationItems, getDashboardRoleConfig } from '@/lib/dashboard-navigation';
// import { dashboardPageSlugs, pageLabels } from '@/lib/page-content';
// import { cn } from '@/lib/utils';

// type DashboardShellProps = {
//   children: React.ReactNode;
//   user?: {
//     name?: string | null;
//     email?: string | null;
//     image?: string | null;
//     role?: string | null;
//   } | null;
// };

// export function DashboardShell({ children, user }: DashboardShellProps) {
//   const pathname = usePathname();
//   const role = normalizeRole(user?.role) ?? 'USER';
//   const roleConfig = getDashboardRoleConfig(role);
//   const normalizedRole = normalizeRoleSegment(user?.role) ?? 'user';
//   const iconByLabel: Record<string, typeof LayoutDashboard> = {
//     Dashboard: LayoutDashboard,
//     Admins: ShieldUser,
//     Users: UsersIcon,
//     Products: ShoppingBag,
//     Brands: BadgeCheck,
//     Categories: Tags,
//     Orders: ReceiptText,
//     Payments: ReceiptText,
//     Quotations: ReceiptText,
//     Profile: Settings,
//   };
//   const navItems = getDashboardNavigationItems(role).map(item => ({
//     ...item,
//     icon: iconByLabel[item.label] ?? LayoutDashboard,
//   }));
//   const canManagePages = role === 'ADMIN' || role === 'SUPER_ADMIN';
//   const pageBasePath = `/dashboard/${normalizedRole}/pages`;
//   const pageManagementItems = dashboardPageSlugs.map(slug => ({
//     label: pageLabels[slug],
//     href: `${pageBasePath}/${slug}`,
//   }));
//   const hasActivePage = pathname.startsWith(pageBasePath);

//   return (
//     <SidebarProvider defaultOpen>
//       <Sidebar
//         collapsible="icon"
//         variant="inset"
//         className="border-r border-sidebar-border/60 bg-linear-to-b from-sidebar via-sidebar to-sidebar-accent/15 shadow-[0_18px_60px_-22px_rgba(0,0,0,0.28)]"
//       >
//         <SidebarHeader>
//           <Link
//             href="/"
//             className="flex items-center gap-3 rounded-2xl border border-sidebar-border/60 bg-white/5 p-3 shadow-sm backdrop-blur"
//           >
//             <div className="flex size-10 items-center justify-center rounded-2xl bg-linear-to-br from-primary to-primary/70 text-sm font-black text-primary-foreground shadow-lg shadow-primary/20">
//               M
//             </div>
//             <div className="min-w-0 flex-1">
//               <p className="truncate text-sm font-semibold text-sidebar-foreground">Malamal Dashboard</p>
//               <p className="truncate text-xs text-sidebar-foreground/70">Storefront control center</p>
//             </div>
//           </Link>
//         </SidebarHeader>

//         <SidebarContent>
//           <SidebarGroup>
//             <SidebarGroupLabel className="text-[11px] font-bold uppercase tracking-[0.28em] text-sidebar-foreground/55">
//               Main
//             </SidebarGroupLabel>
//             <SidebarGroupContent>
//               <SidebarMenu>
//                 {canManagePages ? (
//                   <SidebarMenuItem>
//                     <DropdownMenu>
//                       <DropdownMenuTrigger asChild>
//                         <SidebarMenuButton
//                           isActive={hasActivePage}
//                           size="lg"
//                           className={cn(
//                             'relative rounded-2xl border border-transparent px-3 py-3 text-sm font-medium transition-all',
//                             hasActivePage
//                               ? 'bg-linear-to-r from-primary via-primary/90 to-primary/75 shadow-xl shadow-primary/25 ring-1 ring-primary/30 before:absolute before:inset-y-3 before:left-1 before:w-1 before:rounded-full before:bg-primary-foreground/90 text-white!'
//                               : 'border-sidebar-border/0 bg-white/0 text-sidebar-foreground/80 hover:-translate-y-0.5 hover:border-sidebar-border/70 hover:bg-primary/30 hover:text-primary-foreground hover:shadow-lg hover:shadow-primary/15 hover:ring-1 hover:ring-primary/25',
//                           )}
//                         >
//                           <span className="flex items-center gap-2">
//                             <FileText />
//                             <span>Pages</span>
//                             <ChevronDown className="ml-auto size-4" />
//                           </span>
//                         </SidebarMenuButton>
//                       </DropdownMenuTrigger>
//                       <DropdownMenuContent align="start" side="right" className="w-52">
//                         {pageManagementItems.map(pageItem => (
//                           <DropdownMenuItem key={pageItem.href} asChild>
//                             <Link href={pageItem.href}>{pageItem.label}</Link>
//                           </DropdownMenuItem>
//                         ))}
//                       </DropdownMenuContent>
//                     </DropdownMenu>
//                   </SidebarMenuItem>
//                 ) : null}
//                 {navItems.map(item => {
//                   const active =
//                     pathname === item.href ||
//                     (item.href !== `/dashboard/${normalizedRole}` && pathname.startsWith(`${item.href}/`));

//                   return (
//                     <SidebarMenuItem key={item.href}>
//                       <SidebarMenuButton
//                         asChild
//                         isActive={active}
//                         size="lg"
//                         className={cn(
//                           'relative rounded-2xl border border-transparent px-3 py-3 text-sm font-medium transition-all',
//                           active
//                             ? 'bg-linear-to-r from-primary via-primary/90 to-primary/75 shadow-xl shadow-primary/25 ring-1 ring-primary/30 before:absolute before:inset-y-3 before:left-1 before:w-1 before:rounded-full before:bg-primary-foreground/90 text-white!'
//                             : 'border-sidebar-border/0 bg-white/0 text-sidebar-foreground/80 hover:-translate-y-0.5 hover:border-sidebar-border/70 hover:bg-primary/30 hover:text-primary-foreground hover:shadow-lg hover:shadow-primary/15 hover:ring-1 hover:ring-primary/25',
//                         )}
//                       >
//                         <Link href={item.href}>
//                           <item.icon />
//                           <span>{item.label}</span>
//                         </Link>
//                       </SidebarMenuButton>
//                     </SidebarMenuItem>
//                   );
//                 })}
//               </SidebarMenu>
//             </SidebarGroupContent>
//           </SidebarGroup>
//         </SidebarContent>

//         <SidebarFooter>
//           <div className="px-1">
//             <UserDropdownMenu
//               user={
//                 user
//                   ? {
//                       name: user.name ?? 'Guest',
//                       email: user.email ?? '',
//                       image: user.image?.trim() || null,
//                       role: role,
//                     }
//                   : null
//               }
//             />
//           </div>
//         </SidebarFooter>
//         <SidebarRail />
//       </Sidebar>

//       <SidebarInset>
//         <header className="sticky top-0 z-20 border-b border-border/60 bg-background/75 px-4 py-3 backdrop-blur supports-backdrop-filter:bg-background/60 md:px-6">
//           <div className="flex items-center gap-3 rounded-3xl border border-border/60 bg-linear-to-r from-background via-background to-muted/30 px-4 py-3 shadow-[0_10px_30px_-20px_rgba(0,0,0,0.45)]">
//             <SidebarTrigger />
//             <div className="min-w-0 flex-1">
//               <div className="flex flex-wrap items-center gap-2">
//                 <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
//                   {roleConfig.eyebrow}
//                 </span>
//                 <span className="rounded-full border border-border px-2.5 py-1 text-xs font-semibold text-muted-foreground">
//                   {getRoleLabel(role)}
//                 </span>
//               </div>
//               <h1 className="mt-1 truncate text-base font-semibold text-foreground">{`${getRoleLabel(role)} dashboard`}</h1>
//               <p className="truncate text-sm text-muted-foreground">{roleConfig.description}</p>
//             </div>
//           </div>
//         </header>

//         <div className="min-h-[calc(100vh-4rem)] bg-muted/20 px-4 py-6 md:px-6">{children}</div>
//       </SidebarInset>
//     </SidebarProvider>
//   );
// }

'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ChevronDown,
  Crown,
  FileText,
  GitCompareArrows,
  Heart,
  LayoutDashboard,
  ShoppingBag,
  ShoppingCart,
  Sparkles,
  Tags,
  ReceiptText,
  MessageSquareText,
  Users as UsersIcon,
  BadgeCheck,
  Settings,
  ShieldUser,
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { UserDropdownMenu } from '@/components/account/UserDropdownMenu';
import {
  getRoleLabel,
  normalizeRole,
  normalizeRoleSegment,
} from '@/lib/auth/roles';
import {
  getDashboardNavigationItems,
  getDashboardRoleConfig,
} from '@/lib/dashboard-navigation';
import { dashboardPageSlugs, pageLabels } from '@/lib/page-content';
import { cn } from '@/lib/utils';

type DashboardShellProps = {
  children: React.ReactNode;
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role?: string | null;
  } | null;
};

function DashboardFooterUser() {
  const { state } = useSidebar();
  const compact = state === 'collapsed';

  return <UserDropdownMenu compact={compact} />;
}

export function DashboardShell({ children, user }: DashboardShellProps) {
  const pathname = usePathname();
  const role = normalizeRole(user?.role) ?? 'USER';
  const roleConfig = getDashboardRoleConfig(role);
  const normalizedRole = normalizeRoleSegment(user?.role) ?? 'user';
  const iconByLabel: Record<string, typeof LayoutDashboard> = {
    Dashboard: LayoutDashboard,
    Admins: ShieldUser,
    Users: UsersIcon,
    Products: ShoppingBag,
    Brands: BadgeCheck,
    Categories: Tags,
    // TODO: add coupons back
    // Coupons: Sparkles,
    Orders: ReceiptText,
    Payments: ReceiptText,
    Quotations: ReceiptText,
    'Product Questions': MessageSquareText,
    'Product Reviews': MessageSquareText,
    Wishlist: Heart,
    Compare: GitCompareArrows,
    Cart: ShoppingCart,
    Profile: Settings,
  };
  const navItems = getDashboardNavigationItems(role).map((item) => ({
    ...item,
    icon: iconByLabel[item.label] ?? LayoutDashboard,
  }));
  const canManagePages = role === 'ADMIN' || role === 'SUPER_ADMIN';
  const pageBasePath = `/dashboard/${normalizedRole}/pages`;
  const pageManagementItems = dashboardPageSlugs.map((slug) => ({
    label: pageLabels[slug],
    href: `${pageBasePath}/${slug}`,
  }));
  const hasActivePage = pathname.startsWith(pageBasePath);
  const navSections = [
    {
      label: 'Overview',
      items: navItems.filter((item) => ['Dashboard'].includes(item.label)),
    },
    {
      label: 'Management',
      items: navItems.filter((item) =>
        [
          'Admins',
          'Hero Sections',
          'Users',
          'Products',
          'Product Questions',
          'Product Reviews',
          'Brands',
          'Categories',
        ].includes(item.label),
      ),
      // TODO: add coupons back
      // items: navItems.filter(item =>
      //   ['Admins', 'Hero Sections', 'Users', 'Products', 'Brands', 'Categories', 'Coupons'].includes(
      //     item.label,
      //   ),
      // ),
    },
    {
      label: 'Sales',
      items: navItems.filter((item) =>
        [
          'Orders',
          'Payments',
          'Quotations',
          'Wishlist',
          'Compare',
          'Cart',
        ].includes(item.label),
      ),
    },
    {
      label: 'Account',
      items: navItems.filter((item) => ['Profile'].includes(item.label)),
    },
  ].filter((section) => section.items.length > 0);

  return (
    <SidebarProvider defaultOpen>
      <Sidebar
        collapsible="icon"
        variant="inset"
        className="border-r border-sidebar-border/70 bg-sidebar shadow-[18px_0_55px_-42px_rgba(15,23,42,0.55)]"
      >
        <SidebarHeader className="gap-3 p-3">
          <Link
            href="/"
            aria-label="Malamal Dashboard"
            className="group flex items-center gap-3 rounded-lg border border-sidebar-border/70 bg-sidebar-accent/40 p-3 shadow-sm transition hover:border-primary/35 hover:bg-sidebar-accent/65 group-data-[collapsible=icon]:mx-auto group-data-[collapsible=icon]:size-11 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:gap-0 group-data-[collapsible=icon]:rounded-2xl group-data-[collapsible=icon]:border-sidebar-border/60 group-data-[collapsible=icon]:bg-sidebar-accent/70 group-data-[collapsible=icon]:p-1.5 group-data-[collapsible=icon]:shadow-[0_8px_22px_-18px_rgba(15,23,42,0.55)]"
          >
            <Image
              src="/icon.png"
              alt="Malamal icon"
              width={48}
              height={48}
              className="size-12 shrink-0 object-contain transition group-data-[collapsible=icon]:size-8"
            />
            <div className="min-w-0 flex-1 group-data-[collapsible=icon]:hidden">
              <p className="truncate text-sm font-bold text-sidebar-foreground">
                Malamal Dashboard
              </p>
              <p className="truncate text-xs font-medium text-sidebar-foreground/65">
                {roleConfig.eyebrow}
              </p>
            </div>
          </Link>
          <div className="flex items-center gap-2 rounded-lg border border-primary/15 bg-primary/8 px-3 py-2 text-primary group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-2">
            {role === 'SUPER_ADMIN' ? (
              <Crown className="size-4 shrink-0" />
            ) : (
              <Sparkles className="size-4 shrink-0" />
            )}
            <span className="truncate text-xs font-semibold group-data-[collapsible=icon]:hidden">
              {getRoleLabel(role)}
            </span>
          </div>
        </SidebarHeader>

        <SidebarContent className="px-2 py-1">
          {navSections.map((section, sectionIndex) => (
            <SidebarGroup key={section.label} className="py-2">
              <SidebarGroupLabel className="px-2 text-[10px] font-bold uppercase tracking-[0.22em] text-sidebar-foreground/45">
                {section.label}
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu className="gap-1">
                  {section.label === 'Management' && canManagePages ? (
                    <SidebarMenuItem>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <SidebarMenuButton
                            isActive={hasActivePage}
                            size="lg"
                            className={cn(
                              'group/item relative h-12 rounded-lg border border-transparent px-2 text-sm font-semibold transition-all',
                              hasActivePage
                                ? 'border-primary/20 bg-primary/12 text-primary shadow-sm ring-1 ring-primary/15 before:absolute before:inset-y-2 before:left-0 before:w-1 before:rounded-r-full before:bg-primary'
                                : 'text-sidebar-foreground/75 hover:border-sidebar-border/70 hover:bg-sidebar-accent/70 hover:text-sidebar-foreground',
                            )}
                          >
                            <span className="flex items-center gap-3">
                              <span
                                className={cn(
                                  'flex size-8 shrink-0 items-center justify-center rounded-md transition',
                                  hasActivePage
                                    ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/20'
                                    : 'bg-sidebar-accent text-sidebar-foreground/70 group-hover/item:bg-background group-hover/item:text-primary',
                                )}
                              >
                                <FileText className="size-4" />
                              </span>
                              <span className="truncate group-data-[collapsible=icon]:hidden">
                                Pages
                              </span>
                              <ChevronDown className="ml-auto size-4 opacity-70 group-data-[collapsible=icon]:hidden" />
                            </span>
                          </SidebarMenuButton>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="start"
                          side="right"
                          className="w-52"
                        >
                          {pageManagementItems.map((item) => (
                            <DropdownMenuItem key={item.href} asChild>
                              <Link href={item.href}>{item.label}</Link>
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </SidebarMenuItem>
                  ) : null}
                  {section.items.map((item) => {
                    const active =
                      pathname === item.href ||
                      (item.href !== `/dashboard/${normalizedRole}` &&
                        pathname.startsWith(`${item.href}/`));

                    return (
                      <SidebarMenuItem key={item.href}>
                        <SidebarMenuButton
                          asChild
                          isActive={active}
                          size="lg"
                          className={cn(
                            'group/item relative h-12 rounded-lg border border-transparent px-2 text-sm font-semibold transition-all',
                            active
                              ? 'border-primary/20 bg-primary/12 text-primary shadow-sm ring-1 ring-primary/15 before:absolute before:inset-y-2 before:left-0 before:w-1 before:rounded-r-full before:bg-primary'
                              : 'text-sidebar-foreground/75 hover:border-sidebar-border/70 hover:bg-sidebar-accent/70 hover:text-sidebar-foreground',
                          )}
                        >
                          <Link
                            href={item.href}
                            className="flex items-center gap-3"
                          >
                            <span
                              className={cn(
                                'flex size-8 shrink-0 items-center justify-center rounded-md transition',
                                active
                                  ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/20'
                                  : 'bg-sidebar-accent text-sidebar-foreground/70 group-hover/item:bg-background group-hover/item:text-primary',
                              )}
                            >
                              <item.icon className="size-4" />
                            </span>
                            <span className="truncate group-data-[collapsible=icon]:hidden">
                              {item.label}
                            </span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
              {sectionIndex < navSections.length - 1 ? (
                <SidebarSeparator className="mt-2 bg-sidebar-border/45" />
              ) : null}
            </SidebarGroup>
          ))}
        </SidebarContent>

        <SidebarFooter className="border-t border-sidebar-border/60 p-3 group-data-[collapsible=icon]:border-0 group-data-[collapsible=icon]:p-2">
          <div className="rounded-lg border border-sidebar-border/70 bg-sidebar-accent/35 p-1 shadow-sm transition group-data-[collapsible=icon]:mx-auto group-data-[collapsible=icon]:border-0 group-data-[collapsible=icon]:bg-transparent group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:shadow-none">
            <DashboardFooterUser />
          </div>
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>

      <SidebarInset>
        <header className="sticky top-0 z-20 border-b border-border/60 bg-background/75 px-4 py-3 backdrop-blur supports-backdrop-filter:bg-background/60 md:px-6">
          <div className="flex items-center gap-3 rounded-3xl border border-border/60 bg-linear-to-r from-background via-background to-muted/30 px-4 py-3 shadow-[0_10px_30px_-20px_rgba(0,0,0,0.45)]">
            <SidebarTrigger className="inline-flex h-11 w-auto min-w-18 shrink-0 items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 text-sm font-semibold whitespace-nowrap text-primary shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary hover:text-white hover:shadow-md hover:shadow-primary/20 md:h-10 md:w-10 md:min-w-0 md:justify-center md:px-0">
              <span className="text-sm font-semibold md:hidden">Menu</span>
            </SidebarTrigger>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                  {roleConfig.eyebrow}
                </span>
                <span className="rounded-full border border-border px-2.5 py-1 text-xs font-semibold text-muted-foreground">
                  {getRoleLabel(role)}
                </span>
              </div>
              <h1 className="mt-1 truncate text-base font-semibold text-foreground">{`${getRoleLabel(role)} dashboard`}</h1>
              <p className="truncate text-sm text-muted-foreground">
                {roleConfig.description}
              </p>
            </div>
          </div>
        </header>

        <div className="min-h-[calc(100vh-4rem)] bg-muted/20 px-4 py-6 md:px-6">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
