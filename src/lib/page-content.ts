export const dashboardPageSlugs = [
  'about-us',
  'privacy-policy',
  'terms-and-conditions',
  'return-policy',
] as const;

export type DashboardPageSlug = (typeof dashboardPageSlugs)[number];

export type BackendPage = {
  _id?: string;
  slug: DashboardPageSlug;
  title: string;
  content: string;
  createdAt?: string;
  updatedAt?: string;
};

export const pageLabels: Record<DashboardPageSlug, string> = {
  'about-us': 'About Us',
  'privacy-policy': 'Privacy Policy',
  'terms-and-conditions': 'Terms & Conditions',
  'return-policy': 'Delivery & Return',
};

export const publicPagePathBySlug: Record<DashboardPageSlug, string> = {
  'about-us': '/about-us',
  'privacy-policy': '/privacy-policy',
  'terms-and-conditions': '/terms-and-conditions',
  'return-policy': '/return-policy',
};

export function isDashboardPageSlug(value: string): value is DashboardPageSlug {
  return dashboardPageSlugs.includes(value as DashboardPageSlug);
}
