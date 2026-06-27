export const AUTH_ROLES = ['SUPER_ADMIN', 'ADMIN', 'USER'] as const;

export type AuthRole = (typeof AUTH_ROLES)[number];

export const DASHBOARD_ROUTE_SEGMENTS = [
  'super-admin',
  'admin',
  'user',
] as const;

export type DashboardRouteSegment = (typeof DASHBOARD_ROUTE_SEGMENTS)[number];

export type AuthUser = {
  _id: string;
  name: string;
  email: string;
  image: string;
  role: AuthRole;
  phone?: string;
  dob?: string;
};

export type TUser = {
  _id: string;
  name: string;
  phone: string;
  image: string;
  email: string;
  isActive: boolean;
  createdAt: Date;
};
