import type { Metadata } from 'next';
import { ManagedPageContent } from '@/components/ManagedPageContent';
import { aboutUsMetadata } from '@/lib/seo';
import { getPageByType } from '@/services/Page';

export const metadata: Metadata = aboutUsMetadata;

export default async function AboutUsPage() {
  const pageResult = await getPageByType('about-us').catch(() => null);

  return (
    <ManagedPageContent
      page={pageResult?.data ?? null}
      fallbackTitle="About Us"
      fallbackDescription="Learn more about Malamal and the storefront experience."
      fallback={
        <div className="grid gap-4 text-sm leading-7 text-foreground/70">
          <p>
            Malamal helps customers browse hardware, tools, and home improvement
            products with a clean shopping experience.
          </p>
          <p>
            This page can be fully managed from the dashboard by admins and
            super admins.
          </p>
        </div>
      }
    />
  );
}
