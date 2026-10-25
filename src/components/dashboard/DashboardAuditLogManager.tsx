'use client';

import { useCallback, useEffect, useMemo, useState, useTransition } from 'react';
import {
  Activity,
  ArrowUpDown,
  Calendar,
  CheckCircle2,
  Clock,
  Code2,
  Copy,
  Eye,
  Filter,
  Globe,
  Laptop,
  Layers,
  RefreshCw,
  RotateCcw,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  User,
  XCircle,
} from 'lucide-react';
import { toast } from 'sonner';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { TablePagination } from '@/components/ui/table-pagination';
import {
  AuditAction,
  AuditLogStats,
  AuditModule,
  BackendAuditLog,
  getAuditLogs,
  getAuditLogStats,
} from '@/services/AuditLog';
import { cn } from '@/lib/utils';

type DashboardAuditLogManagerProps = {
  initialLogs?: BackendAuditLog[];
  initialStats?: AuditLogStats | null;
  initialTotal?: number;
};

const ACTION_COLORS: Record<
  AuditAction,
  { bg: string; text: string; border: string }
> = {
  CREATE: {
    bg: 'bg-emerald-500/10 dark:bg-emerald-500/15',
    text: 'text-emerald-700 dark:text-emerald-400',
    border: 'border-emerald-500/25',
  },
  UPDATE: {
    bg: 'bg-sky-500/10 dark:bg-sky-500/15',
    text: 'text-sky-700 dark:text-sky-400',
    border: 'border-sky-500/25',
  },
  DELETE: {
    bg: 'bg-rose-500/10 dark:bg-rose-500/15',
    text: 'text-rose-700 dark:text-rose-400',
    border: 'border-rose-500/25',
  },
  STATUS_CHANGE: {
    bg: 'bg-amber-500/10 dark:bg-amber-500/15',
    text: 'text-amber-700 dark:text-amber-400',
    border: 'border-amber-500/25',
  },
  REORDER: {
    bg: 'bg-indigo-500/10 dark:bg-indigo-500/15',
    text: 'text-indigo-700 dark:text-indigo-400',
    border: 'border-indigo-500/25',
  },
  LOGIN: {
    bg: 'bg-teal-500/10 dark:bg-teal-500/15',
    text: 'text-teal-700 dark:text-teal-400',
    border: 'border-teal-500/25',
  },
  BULK_ACTION: {
    bg: 'bg-purple-500/10 dark:bg-purple-500/15',
    text: 'text-purple-700 dark:text-purple-400',
    border: 'border-purple-500/25',
  },
  OTHER: {
    bg: 'bg-slate-500/10 dark:bg-slate-500/15',
    text: 'text-slate-700 dark:text-slate-400',
    border: 'border-slate-500/25',
  },
};

const MODULE_LABELS: Record<AuditModule, string> = {
  HERO_SECTION: 'Hero Banners',
  PRODUCT: 'Products',
  BRAND: 'Brands',
  CATEGORY: 'Categories',
  ORDER: 'Orders',
  PAYMENT: 'Payments',
  COUPON: 'Coupons',
  USER: 'Users',
  ADMIN: 'Admins',
  PAGE: 'Pages',
  AUTH: 'Authentication',
  SYSTEM: 'System',
};

function formatTimestamp(timestamp: string): { relative: string; full: string } {
  try {
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) {
      return { relative: 'Recently', full: timestamp };
    }
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHr = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffHr / 24);

    let relative = '';
    if (diffSec < 60) relative = 'Just now';
    else if (diffMin < 60) relative = `${diffMin}m ago`;
    else if (diffHr < 24) relative = `${diffHr}h ago`;
    else if (diffDays === 1) relative = 'Yesterday';
    else if (diffDays < 7) relative = `${diffDays}d ago`;
    else relative = date.toLocaleDateString();

    const full = `${date.toLocaleDateString()} ${date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })}`;

    return { relative, full };
  } catch {
    return { relative: 'Unknown', full: timestamp };
  }
}

export function DashboardAuditLogManager({
  initialLogs = [],
  initialStats = null,
  initialTotal = 0,
}: DashboardAuditLogManagerProps) {
  const [logs, setLogs] = useState<BackendAuditLog[]>(initialLogs);
  const [stats, setStats] = useState<AuditLogStats | null>(initialStats);
  const [total, setTotal] = useState<number>(initialTotal);

  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(20);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [debouncedSearch, setDebouncedSearch] = useState<string>('');
  const [actionFilter, setActionFilter] = useState<string>('ALL');
  const [moduleFilter, setModuleFilter] = useState<string>('ALL');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');

  const [selectedLog, setSelectedLog] = useState<BackendAuditLog | null>(null);
  const [isPending, startTransition] = useTransition();

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch logs on filter change
  const fetchLogs = useCallback(async () => {
    startTransition(async () => {
      try {
        const [logsRes, statsRes] = await Promise.all([
          getAuditLogs({
            page,
            limit,
            searchTerm: debouncedSearch,
            action: actionFilter,
            module: moduleFilter,
            userRole: roleFilter,
          }),
          getAuditLogStats(),
        ]);

        if (logsRes.success && Array.isArray(logsRes.data)) {
          setLogs(logsRes.data);
          setTotal(logsRes.meta?.total ?? logsRes.data.length);
        } else if (logsRes.error) {
          toast.error(logsRes.error || 'Failed to fetch audit logs');
        }

        if (statsRes.success && statsRes.data) {
          setStats(statsRes.data);
        }
      } catch (err) {
        toast.error('An unexpected error occurred while loading audit logs');
      }
    });
  }, [page, limit, debouncedSearch, actionFilter, moduleFilter, roleFilter]);

  useEffect(() => {
    void fetchLogs();
  }, [fetchLogs]);

  const handleResetFilters = () => {
    setSearchTerm('');
    setDebouncedSearch('');
    setActionFilter('ALL');
    setModuleFilter('ALL');
    setRoleFilter('ALL');
    setPage(1);
  };

  const copyPayloadToClipboard = (data: unknown) => {
    try {
      navigator.clipboard.writeText(JSON.stringify(data, null, 2));
      toast.success('Audit details payload copied to clipboard');
    } catch {
      toast.error('Failed to copy to clipboard');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Audit Logs & Security Ledger
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Immutable tracking and real-time records of all administrative
            modifications, actions, and security operations.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => void fetchLogs()}
            disabled={isPending}
            className="gap-2"
          >
            <RefreshCw
              className={cn('size-4', isPending && 'animate-spin text-primary')}
            />
            <span>Refresh</span>
          </Button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Events */}
        <Card className="relative overflow-hidden border-border/70 bg-gradient-to-br from-card via-card to-primary/5 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Total Logged Actions
            </CardTitle>
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Activity className="size-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold tracking-tight text-foreground">
              {stats?.totalLogs?.toLocaleString() ?? total.toLocaleString()}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Total mutations tracked in database
            </p>
          </CardContent>
        </Card>

        {/* Today's Actions */}
        <Card className="relative overflow-hidden border-border/70 bg-gradient-to-br from-card via-card to-emerald-500/5 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Today&apos;s Activity
            </CardTitle>
            <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Clock className="size-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold tracking-tight text-emerald-600 dark:text-emerald-400">
              {stats?.todayLogs?.toLocaleString() ?? 0}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Actions recorded since midnight
            </p>
          </CardContent>
        </Card>

        {/* Super Admin Events */}
        <Card className="relative overflow-hidden border-border/70 bg-gradient-to-br from-card via-card to-indigo-500/5 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Super Admin Actions
            </CardTitle>
            <div className="flex size-8 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <ShieldCheck className="size-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold tracking-tight text-indigo-600 dark:text-indigo-400">
              {stats?.superAdminLogs?.toLocaleString() ?? 0}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Privileged system alterations
            </p>
          </CardContent>
        </Card>

        {/* Admin Actions */}
        <Card className="relative overflow-hidden border-border/70 bg-gradient-to-br from-card via-card to-sky-500/5 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Standard Admin Actions
            </CardTitle>
            <div className="flex size-8 items-center justify-center rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400">
              <Shield className="size-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold tracking-tight text-sky-600 dark:text-sky-400">
              {stats?.adminLogs?.toLocaleString() ?? 0}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Operations & catalog updates
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <Card className="border-border/70 shadow-sm">
        <CardContent className="p-4 sm:p-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by admin name, email, description, path, or entity ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 text-sm"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Dropdowns */}
            <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center">
              {/* Action Filter */}
              <Select
                value={actionFilter}
                onValueChange={(val) => {
                  setActionFilter(val);
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-full sm:w-[140px] text-xs">
                  <SelectValue placeholder="Action" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Actions</SelectItem>
                  <SelectItem value="CREATE">CREATE</SelectItem>
                  <SelectItem value="UPDATE">UPDATE</SelectItem>
                  <SelectItem value="DELETE">DELETE</SelectItem>
                  <SelectItem value="STATUS_CHANGE">STATUS CHANGE</SelectItem>
                  <SelectItem value="REORDER">REORDER</SelectItem>
                  <SelectItem value="LOGIN">LOGIN</SelectItem>
                  <SelectItem value="BULK_ACTION">BULK ACTION</SelectItem>
                </SelectContent>
              </Select>

              {/* Module Filter */}
              <Select
                value={moduleFilter}
                onValueChange={(val) => {
                  setModuleFilter(val);
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-full sm:w-[150px] text-xs">
                  <SelectValue placeholder="Module" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Modules</SelectItem>
                  <SelectItem value="HERO_SECTION">Hero Banners</SelectItem>
                  <SelectItem value="PRODUCT">Products</SelectItem>
                  <SelectItem value="BRAND">Brands</SelectItem>
                  <SelectItem value="CATEGORY">Categories</SelectItem>
                  <SelectItem value="ORDER">Orders</SelectItem>
                  <SelectItem value="PAYMENT">Payments</SelectItem>
                  <SelectItem value="COUPON">Coupons</SelectItem>
                  <SelectItem value="USER">Users</SelectItem>
                  <SelectItem value="ADMIN">Admins</SelectItem>
                  <SelectItem value="PAGE">Pages</SelectItem>
                  <SelectItem value="AUTH">Authentication</SelectItem>
                  <SelectItem value="SYSTEM">System</SelectItem>
                </SelectContent>
              </Select>

              {/* Role Filter */}
              <Select
                value={roleFilter}
                onValueChange={(val) => {
                  setRoleFilter(val);
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-full sm:w-[130px] text-xs">
                  <SelectValue placeholder="Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Roles</SelectItem>
                  <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                </SelectContent>
              </Select>

              {/* Reset button */}
              {(searchTerm ||
                actionFilter !== 'ALL' ||
                moduleFilter !== 'ALL' ||
                roleFilter !== 'ALL') && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleResetFilters}
                  className="col-span-2 sm:col-span-1 text-xs gap-1 text-muted-foreground hover:text-foreground"
                >
                  <RotateCcw className="size-3" />
                  <span>Reset</span>
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Table */}
      <Card className="border-border/70 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow>
                <TableHead className="w-[170px] text-xs font-bold uppercase tracking-wider">
                  Timestamp
                </TableHead>
                <TableHead className="min-w-[180px] text-xs font-bold uppercase tracking-wider">
                  Admin User
                </TableHead>
                <TableHead className="w-[130px] text-xs font-bold uppercase tracking-wider">
                  Action
                </TableHead>
                <TableHead className="w-[140px] text-xs font-bold uppercase tracking-wider">
                  Module
                </TableHead>
                <TableHead className="min-w-[260px] text-xs font-bold uppercase tracking-wider">
                  Description
                </TableHead>
                <TableHead className="w-[120px] text-xs font-bold uppercase tracking-wider">
                  Method & HTTP
                </TableHead>
                <TableHead className="w-[80px] text-right text-xs font-bold uppercase tracking-wider">
                  Inspect
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isPending && logs.length === 0 ? (
                // Loading Skeleton rows
                Array.from({ length: 6 }).map((_, idx) => (
                  <TableRow key={idx} className="animate-pulse">
                    <TableCell>
                      <div className="h-4 w-24 bg-muted rounded" />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="size-8 rounded-full bg-muted" />
                        <div className="space-y-1">
                          <div className="h-3 w-20 bg-muted rounded" />
                          <div className="h-2.5 w-28 bg-muted rounded" />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="h-5 w-16 bg-muted rounded-full" />
                    </TableCell>
                    <TableCell>
                      <div className="h-5 w-20 bg-muted rounded" />
                    </TableCell>
                    <TableCell>
                      <div className="h-3 w-48 bg-muted rounded" />
                    </TableCell>
                    <TableCell>
                      <div className="h-4 w-12 bg-muted rounded" />
                    </TableCell>
                    <TableCell>
                      <div className="h-7 w-7 bg-muted rounded ml-auto" />
                    </TableCell>
                  </TableRow>
                ))
              ) : logs.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="h-56 text-center py-12 text-muted-foreground"
                  >
                    <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-muted/60 text-muted-foreground">
                      <Layers className="size-6" />
                    </div>
                    <p className="mt-3 text-base font-semibold text-foreground">
                      No audit logs found
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground max-w-sm mx-auto">
                      There are no audit logs matching your current filters. Any
                      modifications by administrators will automatically appear
                      here.
                    </p>
                    {(searchTerm ||
                      actionFilter !== 'ALL' ||
                      moduleFilter !== 'ALL' ||
                      roleFilter !== 'ALL') && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleResetFilters}
                        className="mt-4 text-xs"
                      >
                        Clear Filters
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ) : (
                logs.map((item) => {
                  const actionStyle =
                    ACTION_COLORS[item.action] ?? ACTION_COLORS.OTHER;
                  const time = formatTimestamp(item.timestamp);
                  const isSuccess = item.statusCode < 400;

                  return (
                    <TableRow
                      key={item._id}
                      className="group transition-colors hover:bg-muted/30"
                    >
                      {/* Timestamp */}
                      <TableCell className="text-xs">
                        <div className="font-medium text-foreground">
                          {time.relative}
                        </div>
                        <div className="text-[11px] text-muted-foreground">
                          {time.full}
                        </div>
                      </TableCell>

                      {/* Admin User */}
                      <TableCell>
                        <div className="flex items-center gap-2.5">
                          <Avatar size="sm">
                            {item.userImage && (
                              <AvatarImage
                                src={item.userImage}
                                alt={item.userName}
                              />
                            )}
                            <AvatarFallback className="text-[11px] font-bold uppercase bg-primary/10 text-primary">
                              {item.userName
                                ? item.userName.slice(0, 2)
                                : 'AD'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="truncate text-xs font-semibold text-foreground">
                                {item.userName}
                              </span>
                              {item.userRole === 'SUPER_ADMIN' ? (
                                <Badge
                                  variant="secondary"
                                  className="h-4 px-1 text-[9px] font-bold uppercase tracking-tight bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-500/20"
                                >
                                  Super Admin
                                </Badge>
                              ) : (
                                <Badge
                                  variant="secondary"
                                  className="h-4 px-1 text-[9px] font-bold uppercase tracking-tight bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-500/20"
                                >
                                  Admin
                                </Badge>
                              )}
                            </div>
                            <span className="block truncate text-[11px] text-muted-foreground">
                              {item.userEmail}
                            </span>
                          </div>
                        </div>
                      </TableCell>

                      {/* Action */}
                      <TableCell>
                        <span
                          className={cn(
                            'inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider',
                            actionStyle.bg,
                            actionStyle.text,
                            actionStyle.border,
                          )}
                        >
                          {item.action.replace('_', ' ')}
                        </span>
                      </TableCell>

                      {/* Module */}
                      <TableCell>
                        <span className="inline-flex items-center rounded bg-muted px-2 py-0.5 text-xs font-medium text-foreground">
                          {MODULE_LABELS[item.module] ?? item.module}
                        </span>
                      </TableCell>

                      {/* Description */}
                      <TableCell className="max-w-[320px]">
                        <p className="truncate text-xs text-foreground font-medium">
                          {item.description}
                        </p>
                        <p className="truncate text-[11px] font-mono text-muted-foreground">
                          {item.path}
                        </p>
                      </TableCell>

                      {/* Method & Status */}
                      <TableCell>
                        <div className="flex items-center gap-1.5 font-mono text-xs">
                          <span className="font-semibold text-foreground">
                            {item.method}
                          </span>
                          <span
                            className={cn(
                              'inline-flex items-center gap-0.5 text-[11px] font-bold',
                              isSuccess
                                ? 'text-emerald-600 dark:text-emerald-400'
                                : 'text-rose-600 dark:text-rose-400',
                            )}
                          >
                            {isSuccess ? (
                              <CheckCircle2 className="size-3" />
                            ) : (
                              <XCircle className="size-3" />
                            )}
                            {item.statusCode}
                          </span>
                        </div>
                      </TableCell>

                      {/* Inspect details button */}
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedLog(item)}
                          className="size-8 p-0 text-muted-foreground hover:text-foreground"
                          title="View audit event details"
                        >
                          <Eye className="size-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="border-t border-border/70 p-4">
          <TablePagination
            page={page}
            limit={limit}
            total={total}
            onPageChange={setPage}
            onLimitChange={(newLimit) => {
              setLimit(newLimit);
              setPage(1);
            }}
          />
        </div>
      </Card>

      {/* Audit Detail Modal Dialog */}
      <Dialog
        open={Boolean(selectedLog)}
        onOpenChange={(open) => !open && setSelectedLog(null)}
      >
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          {selectedLog && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      'inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider',
                      ACTION_COLORS[selectedLog.action]?.bg,
                      ACTION_COLORS[selectedLog.action]?.text,
                      ACTION_COLORS[selectedLog.action]?.border,
                    )}
                  >
                    {selectedLog.action.replace('_', ' ')}
                  </span>
                  <Badge variant="outline" className="text-xs">
                    {MODULE_LABELS[selectedLog.module] ?? selectedLog.module}
                  </Badge>
                  <span
                    className={cn(
                      'ml-auto font-mono text-xs font-bold',
                      selectedLog.statusCode < 400
                        ? 'text-emerald-600'
                        : 'text-rose-600',
                    )}
                  >
                    Status: {selectedLog.statusCode}
                  </span>
                </div>
                <DialogTitle className="mt-2 text-lg font-bold text-foreground">
                  {selectedLog.description}
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  Audit Entry ID: {selectedLog._id} • Logged at{' '}
                  {formatTimestamp(selectedLog.timestamp).full}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 pt-2">
                {/* Admin Actor Card */}
                <div className="rounded-lg border border-border/70 bg-muted/20 p-3.5 space-y-2">
                  <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <User className="size-3.5 text-primary" />
                    <span>Actor Information</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-muted-foreground">Name: </span>
                      <span className="font-semibold text-foreground">
                        {selectedLog.userName}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Email: </span>
                      <span className="font-semibold text-foreground">
                        {selectedLog.userEmail}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Role: </span>
                      <span className="font-semibold text-foreground">
                        {selectedLog.userRole}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">User ID: </span>
                      <span className="font-mono text-foreground">
                        {selectedLog.user ?? 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Request Overview Card */}
                <div className="rounded-lg border border-border/70 bg-muted/20 p-3.5 space-y-2">
                  <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <Globe className="size-3.5 text-primary" />
                    <span>Request Context</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-muted-foreground">Method: </span>
                      <span className="font-mono font-bold text-foreground">
                        {selectedLog.method}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Target Path: </span>
                      <span className="font-mono text-foreground break-all">
                        {selectedLog.path}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">IP Address: </span>
                      <span className="font-mono text-foreground">
                        {selectedLog.ipAddress || 'Unknown'}
                      </span>
                    </div>
                    {selectedLog.entityId && (
                      <div>
                        <span className="text-muted-foreground">Target ID: </span>
                        <span className="font-mono font-semibold text-foreground">
                          {selectedLog.entityId}
                        </span>
                      </div>
                    )}
                    <div className="sm:col-span-2">
                      <span className="text-muted-foreground">User Agent: </span>
                      <span className="font-mono text-[11px] text-foreground break-all">
                        {selectedLog.userAgent || 'Unknown'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Payload & Details JSON Viewer */}
                {selectedLog.details && Object.keys(selectedLog.details).length > 0 && (
                  <div className="rounded-lg border border-border/70 bg-card p-3.5 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                        <Code2 className="size-3.5 text-primary" />
                        <span>Payload & Parameters (Sanitized)</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          copyPayloadToClipboard(selectedLog.details)
                        }
                        className="h-7 px-2 text-xs gap-1"
                      >
                        <Copy className="size-3" />
                        <span>Copy JSON</span>
                      </Button>
                    </div>
                    <pre className="max-h-64 overflow-auto rounded bg-muted/60 p-3 text-[11px] font-mono text-foreground leading-relaxed">
                      {JSON.stringify(selectedLog.details, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
