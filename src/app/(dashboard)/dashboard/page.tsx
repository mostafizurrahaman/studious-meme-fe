import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/services/Auth';
import { getDashboardPath } from '@/lib/dashboard';

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/my-account');
  }

  redirect(getDashboardPath(user.role));
}
