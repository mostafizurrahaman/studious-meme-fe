import { siteConfig } from '@/lib/seo';

export const contactChannels = [
  {
    label: 'Hotline',
    value: siteConfig.phone,
    href: `tel:${siteConfig.phone.replace(/\s+/g, '')}`,
  },
  {
    label: 'Sales',
    value: siteConfig.email,
    href: `mailto:${siteConfig.email}`,
  },
  {
    label: 'Support',
    value: siteConfig.supportEmail,
    href: `mailto:${siteConfig.supportEmail}`,
  },
  {
    label: 'WhatsApp',
    value: '+880 1972525821',
    href: 'https://wa.me/8801972525821',
  },
  {
    label: 'B2B Sales',
    value: '+880 1972525828',
    href: 'tel:+8801972525828',
  },
] as const;

export const accountBenefits = [
  'Track orders from one dashboard',
  'Save addresses for faster checkout',
  'Request bulk quotations easily',
  'Build a wishlist for saved purchases',
] as const;

export const policySections = [
  {
    title: 'Information we collect',
    items: [
      'Account details, order details and contact information.',
      'Device and browser data for analytics and performance.',
      'Support conversations and quotation request submissions.',
    ],
  },
  {
    title: 'How we use data',
    items: [
      'To process orders, deliver products and provide support.',
      'To improve the storefront, service quality and product discovery.',
      'To send transactional updates and important notices.',
    ],
  },
  {
    title: 'Your choices',
    items: [
      'Request access or corrections to your personal information.',
      'Opt out of non-essential marketing when available.',
      'Remove inactive account data when needed.',
    ],
  },
] as const;
