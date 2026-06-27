import Link from 'next/link';
import { UserAvatar } from '@/components/UserAvatar';
import { ProfileSettingsForm } from '@/components/ProfileSettingsForm';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { formatDashboardDate } from '@/lib/formatDate';
import { getDashboardRoleConfig } from '@/lib/dashboard-navigation';
import { getDashboardPathByRole } from '@/lib/auth/roles';
import type { AuthRole } from '@/types';

export async function RoleProfilePage({
  role,
  user,
}: {
  role: AuthRole;
  user: {
    name: string;
    email: string;
    phone?: string;
    dob?: string;
    image?: string;
  };
}) {
  const config = getDashboardRoleConfig(role);
  const dashboardPath = getDashboardPathByRole(role) ?? '/dashboard';
  const profile = user;

  return (
    <section className="space-y-6">
      <Card className="shadow-sm">
        <CardHeader>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary">
            {config.eyebrow}
          </p>
          <CardTitle className="text-3xl">{config.title} profile</CardTitle>
          <CardDescription>{config.description}</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-[auto_1fr] sm:items-center">
          <UserAvatar
            name={profile.name}
            image={profile.image}
            className="size-16"
          />
          <div className="space-y-1 text-sm text-muted-foreground">
            <div className="font-semibold text-foreground">{profile.name}</div>
            <div>{profile.email}</div>
            <div>DOB: {formatDashboardDate(profile.dob, { time: false })}</div>
            <div>{role}</div>
          </div>
        </CardContent>
        <CardContent className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          <Button asChild className="justify-start text-white!">
            <Link href={dashboardPath}>Back to dashboard</Link>
          </Button>
          <Button asChild variant="outline" className="justify-start">
            <Link href="/shop">Continue shopping</Link>
          </Button>
        </CardContent>
      </Card>

      <ProfileSettingsForm
        key={`${profile.name}-${profile.email}-${profile.phone ?? ''}-${profile.dob ?? ''}-${profile.image ?? ''}`}
        profile={{
          name: profile.name,
          email: profile.email,
          phone: profile.phone,
          dob: profile.dob,
          image: profile.image,
        }}
      />

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Access summary</CardTitle>
          <CardDescription>
            Current authenticated dashboard user.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div>
            <span className="font-semibold">Name:</span> {user.name}
          </div>
          <div>
            <span className="font-semibold">Email:</span> {user.email}
          </div>
          <div>
            <span className="font-semibold">Role:</span> {role}
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
