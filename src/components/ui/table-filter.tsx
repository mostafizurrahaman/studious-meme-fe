'use client';

import { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type TableFilterProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  debounceMs?: number;
};

export function TableFilter({
  value,
  onChange,
  placeholder = 'Search...',
  className = '',
}: TableFilterProps) {
  const [inputValue, setInputValue] = useState(value);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const handleSearch = () => {
    onChange(inputValue);
  };

  const handleClear = () => {
    setInputValue('');
    onChange('');
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="relative flex-1">
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleSearch();
            }
          }}
          placeholder={placeholder}
          className={`flex-1 ${inputValue ? 'pr-8' : ''}`}
        />
        {inputValue && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-0.5 rounded-sm"
            title="Clear search"
            aria-label="Clear search"
          >
            <X className="size-4" />
          </button>
        )}
      </div>
      <Button
        type="button"
        variant="outline"
        size="icon"
        onClick={handleSearch}
        title="Search"
        aria-label="Search"
      >
        <Search className="size-4" />
      </Button>
    </div>
  );
}
