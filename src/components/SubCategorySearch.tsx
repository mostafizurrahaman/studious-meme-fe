'use client';

import { usePathname, useRouter } from 'next/navigation';
import type { Route } from 'next';
import { TableFilter } from '@/components/ui/table-filter';

type SubCategorySearchProps = {
  initialSearchTerm?: string;
  placeholder?: string;
  className?: string;
  searchParams: Record<string, string | undefined>;
};

export function SubCategorySearch({
  initialSearchTerm = '',
  placeholder = 'Search subcategories...',
  className,
  searchParams,
}: SubCategorySearchProps) {
  const router = useRouter();
  const pathname = usePathname();

  const handleSearch = (val: string) => {
    // Filter out undefined values to pass to URLSearchParams
    const safeParams = Object.fromEntries(
      Object.entries(searchParams).filter(([_, v]) => v !== undefined)
    ) as Record<string, string>;
    const params = new URLSearchParams(safeParams);
    if (val) {
      params.set('searchTerm', val);
    } else {
      params.delete('searchTerm');
    }
    params.set('page', '1');
    router.push(`${pathname}?${params.toString()}` as Route);
  };

  return (
    <TableFilter
      value={initialSearchTerm}
      onChange={handleSearch}
      placeholder={placeholder}
      className={className}
    />
  );
}
