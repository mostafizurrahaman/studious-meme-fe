import type { Metadata } from 'next';
import { DashboardAuditLogManager } from '@/components/dashboard/DashboardAuditLogManager';
import { requireDashboardRoles } from '@/lib/dashboard-auth';
import { buildMetadata } from '@/lib/seo';
import { getAuditLogs, getAuditLogStats } from '@/services/AuditLog';

export const metadata: Metadata = buildMetadata({
  title: 'Audit Logs',
  description: 'Review admin activity and security audit trail.',
  path: '/dashboard/admin/audit-logs',
  noindex: true,
});

export const dynamic = 'force-dynamic';

export default async function AdminAuditLogsPage() {
  await requireDashboardRoles(['ADMIN', 'SUPER_ADMIN']);

  const [logsRes, statsRes] = await Promise.all([
    getAuditLogs({ page: 1, limit: 20 }).catch(() => null),
    getAuditLogStats().catch(() => null),
  ]);

  const logs = logsRes?.data ?? [];
  const stats = statsRes?.data ?? null;
  const total = logsRes?.meta?.total ?? logs.length;

  return (
    <DashboardAuditLogManager
      initialLogs={logs}
      initialStats={stats}
      initialTotal={total}
    />
  );
}
