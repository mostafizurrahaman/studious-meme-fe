'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { useDebouncedCallback } from 'use-debounce';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type TableFilterProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
};

export function TableFilter({
  value,
  onChange,
  placeholder = 'Search...',
  className,
}: TableFilterProps) {
  const [inputValue, setInputValue] = useState(value);
  const debouncedChange = useDebouncedCallback(onChange, 300);

  return (
    <div className={`flex gap-2 ${className}`}>
      <Input
        value={inputValue}
        onChange={(e) => {
          const nextValue = e.target.value;
          setInputValue(nextValue);
          debouncedChange(nextValue);
        }}
        placeholder={placeholder}
        className="flex-1"
      />
      {inputValue && (
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => {
            setInputValue('');
            onChange('');
          }}
        >
          <X className="size-4" />
        </Button>
      )}
    </div>
  );
}
