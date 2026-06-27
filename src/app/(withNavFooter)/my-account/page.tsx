import { SeoScripts } from '@/components/SeoScripts';
import { MyAccountAuthForm } from '@/components/MyAccountAuthForm';
import { Card } from '@/components/ui/card';
import { myAccountMetadata, myAccountSchemas } from '@/lib/seo';
import { getCurrentUser } from '@/services/Auth';
import { getDashboardPath } from '@/lib/dashboard';
import { getSafeRedirectPath } from '@/lib/auth/redirect';
import { redirect } from 'next/navigation';

export const metadata = myAccountMetadata;

type Props = {
  searchParams: Promise<{ redirect?: string }>;
};

export default async function MyAccountPage({ searchParams }: Props) {
  const query = await searchParams;
  const safeRedirect = getSafeRedirectPath(query.redirect);

  const user = await getCurrentUser();

  if (user) {
    if (safeRedirect) {
      redirect(safeRedirect);
    }

    if (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') {
      redirect(getDashboardPath(user.role));
    }

    redirect('/');
  }

  return (
    <>
      <SeoScripts data={myAccountSchemas} />
      <main className="flex-1 bg-background pb-16">
        <div className="px-4 py-6 lg:px-6">
          <Card className="p-6 shadow-sm sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">
              Account access
            </p>
            <h1 className="mt-4 text-3xl font-black text-secondary sm:text-4xl">
              Sign in
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-foreground/65 sm:text-base">
              Sign in to continue to your account or return to checkout.
            </p>
          </Card>
          <MyAccountAuthForm />
        </div>
      </main>
    </>
  );
}
