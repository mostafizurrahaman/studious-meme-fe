import type { AuthRole } from '@/types';

import { getDashboardPathByRole, getProfilePathByRole } from './auth/roles';

export type DashboardNavigationItem = {
  label: string;
  href: string;
  description: string;
};

export type DashboardRoleConfig = {
  title: string;
  description: string;
  eyebrow: string;
  responsibilities: string[];
  metricsLabel: string;
  navigationItems: DashboardNavigationItem[];
};

function getCommonNavigationItems(role: AuthRole): DashboardNavigationItem[] {
  return [
    {
      label: 'Dashboard',
      href: getDashboardPathByRole(role) ?? '/dashboard',
      description: 'Role overview',
    },
    {
      label: 'Profile',
      href: getProfilePathByRole(role) ?? '/my-account',
      description: 'Update profile',
    },
  ];
}

function getUserNavigationItems(role: AuthRole): DashboardNavigationItem[] {
  return [
    getCommonNavigationItems(role)[0],
    {
      label: 'Orders',
      href: `${getDashboardPathByRole(role) ?? '/dashboard/user'}/orders`,
      description: 'View your orders',
    },
    {
      label: 'Payments',
      href: `${getDashboardPathByRole(role) ?? '/dashboard/user'}/payments`,
      description: 'Review payments',
    },
    getCommonNavigationItems(role)[1],
  ];
}

function getAdminNavigationItems(role: AuthRole): DashboardNavigationItem[] {
  const base = getDashboardPathByRole(role) ?? '/dashboard/admin';

  return [
    { label: 'Dashboard', href: base, description: 'Role overview' },
    {
      label: 'Hero Sections',
      href: `${base}/hero-sections`,
      description: 'Manage homepage hero banners',
    },
    {
      label: 'Products',
      href: `${base}/products`,
      description: 'Manage product catalog',
    },
    {
      label: 'Product Questions',
      href: `${base}/product-questions`,
      description: 'Review and answer product questions',
    },
    {
      label: 'Product Reviews',
      href: `${base}/product-reviews`,
      description: 'Manage product reviews',
    },
    { label: 'Brands', href: `${base}/brands`, description: 'Manage brands' },
    {
      label: 'Categories',
      href: `${base}/categories`,
      description: 'Manage categories',
    },
    {
      label: 'Coupons',
      href: `${base}/coupons`,
      description: 'Manage discount offers',
    },
    {
      label: 'Orders',
      href: `${base}/orders`,
      description: 'View and update orders',
    },
    {
      label: 'Payments',
      href: `${base}/payments`,
      description: 'Review payments',
    },
    {
      label: 'Quotations',
      href: `${base}/quotations`,
      description: 'Review quotation requests',
    },
    {
      label: 'Wishlist',
      href: `${base}/wishlist`,
      description: 'Review saved products',
    },
    {
      label: 'Compare',
      href: `${base}/compare`,
      description: 'Review comparison activity',
    },
    {
      label: 'Cart',
      href: `${base}/cart`,
      description: 'Review cart activity',
    },
    { label: 'Users', href: `${base}/users`, description: 'Manage users' },
    {
      label: 'Profile',
      href: `${base}/profile`,
      description: 'Update profile',
    },
  ];
}

function getSuperAdminNavigationItems(
  role: AuthRole,
): DashboardNavigationItem[] {
  const base = getDashboardPathByRole(role) ?? '/dashboard/super-admin';

  return [
    { label: 'Dashboard', href: base, description: 'Role overview' },
    { label: 'Admins', href: `${base}/admins`, description: 'Manage admins' },
    {
      label: 'Hero Sections',
      href: `${base}/hero-sections`,
      description: 'Manage homepage hero banners',
    },
    { label: 'Users', href: `${base}/users`, description: 'Manage users' },
    {
      label: 'Products',
      href: `${base}/products`,
      description: 'Manage product catalog',
    },
    {
      label: 'Product Questions',
      href: `${base}/product-questions`,
      description: 'Review and answer product questions',
    },
    {
      label: 'Product Reviews',
      href: `${base}/product-reviews`,
      description: 'Manage product reviews',
    },
    { label: 'Brands', href: `${base}/brands`, description: 'Manage brands' },
    {
      label: 'Categories',
      href: `${base}/categories`,
      description: 'Manage categories',
    },
    {
      label: 'Coupons',
      href: `${base}/coupons`,
      description: 'Manage discount offers',
    },
    {
      label: 'Orders',
      href: `${base}/orders`,
      description: 'View and update orders',
    },
    {
      label: 'Payments',
      href: `${base}/payments`,
      description: 'Review payments',
    },
    {
      label: 'Quotations',
      href: `${base}/quotations`,
      description: 'Review quotation requests',
    },
    {
      label: 'Wishlist',
      href: `${base}/wishlist`,
      description: 'Review saved products',
    },
    {
      label: 'Compare',
      href: `${base}/compare`,
      description: 'Review comparison activity',
    },
    {
      label: 'Cart',
      href: `${base}/cart`,
      description: 'Review cart activity',
    },
    {
      label: 'Profile',
      href: `${base}/profile`,
      description: 'Update profile',
    },
  ];
}

const ROLE_CONFIG: Record<AuthRole, DashboardRoleConfig> = {
  USER: {
    title: 'User dashboard',
    description:
      'Track your own orders, payments, and profile updates from one secure place.',
    eyebrow: 'Customer access',
    responsibilities: [
      'View your own orders and payment history',
      'Update your own profile information',
      'Keep tabs on delivery and payment status',
    ],
    metricsLabel: 'Customer activity',
    navigationItems: getUserNavigationItems('USER'),
  },
  ADMIN: {
    title: 'Admin dashboard',
    description:
      'Manage catalog, orders, payments, and users with backend-backed data.',
    eyebrow: 'Operations access',
    responsibilities: [
      'Manage products, categories, and brands',
      // TODO: add coupons back
      // 'Manage coupons and promotional offers',
      'Monitor orders and payment status',
      'Update your own profile securely',
    ],
    metricsLabel: 'Operational health',
    navigationItems: getAdminNavigationItems('ADMIN'),
  },
  SUPER_ADMIN: {
    title: 'Super admin dashboard',
    description:
      'Full administrative control with everything admins can do plus admin management.',
    eyebrow: 'Platform control',
    responsibilities: [
      'Manage admins and platform access',
      // TODO: add coupons back
      // 'Manage coupons and promotional offers',
      'Handle catalog, orders, payments, and users',
      'Update your own profile securely',
    ],
    metricsLabel: 'Platform health',
    navigationItems: getSuperAdminNavigationItems('SUPER_ADMIN'),
  },
};

export function getDashboardRoleConfig(role: AuthRole): DashboardRoleConfig {
  return ROLE_CONFIG[role];
}

export function getDashboardNavigationItems(
  role: AuthRole,
): DashboardNavigationItem[] {
  return ROLE_CONFIG[role].navigationItems;
}

export function getRoleShortDescription(role: AuthRole): string {
  return ROLE_CONFIG[role].description;
}
