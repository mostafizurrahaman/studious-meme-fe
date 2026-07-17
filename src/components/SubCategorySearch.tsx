'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import type { Route } from 'next';
import { TableFilter } from '@/components/ui/table-filter';

type SubCategorySearchProps = {
  initialSearchTerm?: string;
  placeholder?: string;
  className?: string;
};

export function SubCategorySearch({
  initialSearchTerm = '',
  placeholder = 'Search subcategories...',
  className,
}: SubCategorySearchProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleSearch = (val: string) => {
    const params = new URLSearchParams(searchParams.toString());
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
