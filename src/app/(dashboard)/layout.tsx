import { Suspense, type ReactNode } from 'react';
import { DashboardShell } from '@/components/dashboard/DashboardShell';
import { requireDashboardUser } from '@/lib/dashboard-auth';
import Loading from './loading';

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await requireDashboardUser();

  return (
    <DashboardShell user={user}>
      <Suspense fallback={<Loading />}>{children}</Suspense>
    </DashboardShell>
  );
}
