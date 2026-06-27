'use client';

import { useCallback, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Eye, Mail, Phone } from 'lucide-react';
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
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { TableFilter } from '@/components/ui/table-filter';
import { TablePagination } from '@/components/ui/table-pagination';
import { formatDashboardDate } from '@/lib/formatDate';
import type { BackendContact } from '@/services/Contact';

type Props = {
  contacts: BackendContact[];
  meta: { page: number; limit: number; total: number; totalPages: number };
  searchTerm?: string;
};

function compactText(value: string | undefined, length = 42) {
  if (!value?.trim()) return '-';

  const normalized = value.replace(/\s+/g, ' ').trim();
  return normalized.length > length
    ? `${normalized.slice(0, length)}...`
    : normalized;
}

function DetailBlock({ label, value }: { label: string; value?: string }) {
  return (
    <div className="rounded-lg border bg-muted/20 p-3">
      <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </div>
      <div className="mt-2 whitespace-pre-wrap text-sm leading-6 text-foreground">
        {value?.trim() || '-'}
      </div>
    </div>
  );
}

export function DashboardQuotationRequestsManager({
  contacts,
  meta,
  searchTerm = '',
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchTerm);

  const updateQuery = useCallback(
    (updates: { page?: number; limit?: number; searchTerm?: string }) => {
      const nextParams = new URLSearchParams(searchParams.toString());
      const nextSearch = updates.searchTerm ?? search;

      nextParams.set('page', String(updates.page ?? meta.page));
      nextParams.set('limit', String(updates.limit ?? meta.limit));

      if (nextSearch.trim()) {
        nextParams.set('searchTerm', nextSearch.trim());
      } else {
        nextParams.delete('searchTerm');
      }

      router.push(`${pathname}?${nextParams.toString()}`);
    },
    [meta.limit, meta.page, pathname, router, search, searchParams],
  );

  function handleSearchChange(value: string) {
    setSearch(value);
    updateQuery({ page: 1, searchTerm: value });
  }

  return (
    <Card className="shadow-sm">
      <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
        <div>
          <CardTitle>Quotation Requests</CardTitle>
          <CardDescription>
            Showing {contacts.length} of {meta.total} quotation/contact
            submissions.
          </CardDescription>
        </div>
        <TableFilter
          key={searchTerm}
          value={search}
          onChange={handleSearchChange}
          placeholder="Search requests..."
          className="w-full max-w-xs"
        />
      </CardHeader>
      <CardContent>
        <Table className="table-fixed">
          <TableHeader>
            <TableRow>
              <TableHead className="w-[10%]">Customer</TableHead>
              <TableHead className="w-[10%]">Company</TableHead>
              <TableHead className="w-[16%]">Contact</TableHead>
              <TableHead className="w-[12%]">Brand</TableHead>
              <TableHead className="w-[12%]">Products</TableHead>
              <TableHead className="w-[13%]">Message</TableHead>
              <TableHead className="w-[11%]">Created At</TableHead>
              <TableHead className="w-[8%] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {contacts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">
                  No quotation requests found.
                </TableCell>
              </TableRow>
            ) : null}
            {contacts.map((contact) => (
              <TableRow key={contact._id}>
                <TableCell className="font-medium">
                  <div className="truncate">{contact.name}</div>
                  {/* <div className="truncate text-xs text-muted-foreground">{contact.subject}</div> */}
                </TableCell>
                <TableCell
                  className="truncate"
                  title={contact.company || undefined}
                >
                  {contact.company || '-'}
                </TableCell>
                <TableCell>
                  <div className="truncate" title={contact.email}>
                    {contact.email}
                  </div>
                  <div className="truncate text-xs text-muted-foreground">
                    {contact.phone}
                  </div>
                </TableCell>
                <TableCell
                  className="truncate"
                  title={contact.brand || 'Any suitable brand'}
                >
                  {contact.brand || 'Any suitable brand'}
                </TableCell>
                <TableCell
                  className="truncate text-sm leading-6"
                  title={contact.products || undefined}
                >
                  {compactText(contact.products, 18)}
                </TableCell>
                <TableCell
                  className="truncate text-sm leading-6"
                  title={contact.message}
                >
                  {compactText(contact.message, 20)}
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  <span
                    className="cursor-help"
                    title={formatDashboardDate(contact.createdAt, {
                      time: true,
                    })}
                  >
                    {formatDashboardDate(contact.createdAt)}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        aria-label="View quotation request"
                      >
                        <Eye className="size-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-h-[88vh] overflow-y-auto sm:max-w-220">
                      <DialogHeader className="border-b pb-4">
                        <DialogTitle className="text-xl font-black text-secondary">
                          {contact.name}
                        </DialogTitle>
                        <DialogDescription>
                          {contact.subject} ·{' '}
                          {formatDashboardDate(contact.createdAt, {
                            time: true,
                          })}
                        </DialogDescription>
                      </DialogHeader>

                      <div className="grid gap-4">
                        <div className="grid gap-3 rounded-lg border bg-background p-4 sm:grid-cols-2">
                          <div>
                            <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                              Email
                            </div>
                            <a
                              href={`mailto:${contact.email}`}
                              className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
                            >
                              <Mail className="size-4" />
                              {contact.email}
                            </a>
                          </div>
                          <div>
                            <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                              Phone
                            </div>
                            <a
                              href={`tel:${contact.phone}`}
                              className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
                            >
                              <Phone className="size-4" />
                              {contact.phone}
                            </a>
                          </div>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2">
                          <DetailBlock
                            label="Company"
                            value={contact.company}
                          />
                          <DetailBlock
                            label="Brand preference"
                            value={contact.brand || 'Any suitable brand'}
                          />
                        </div>

                        <DetailBlock
                          label="Interested products"
                          value={contact.products}
                        />
                        <DetailBlock label="Message" value={contact.message} />
                      </div>
                    </DialogContent>
                  </Dialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {meta.total > 0 ? (
          <div className="mt-4 border-t pt-4">
            <TablePagination
              page={meta.page}
              limit={meta.limit}
              total={meta.total}
              onPageChange={(page) => updateQuery({ page })}
              onLimitChange={(limit) => updateQuery({ page: 1, limit })}
            />
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
