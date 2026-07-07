import * as React from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

type AccentColorFieldProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  id?: string;
  label?: string;
  className?: string;
};

export function AccentColorField({
  value,
  onChange,
  placeholder = 'Enter accent color',
  id = 'accent-color',
  label = 'Pick accent color',
  className = '',
}: AccentColorFieldProps) {
  const colorValue = /^#([0-9a-fA-F]{6})$/.test(value) ? value : '#f97316';

  return (
    <div
      className={cn(
        'flex h-fit w-full max-w-sm min-w-0 items-center gap-2 rounded-md border border-input bg-background px-3 py-1 shadow-sm',
        className,
      )}
    >
      <label
        htmlFor={id}
        className="relative flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-md border border-input bg-muted"
      >
        {/* <span className="sr-only">{label}</span> */}
        <span
          className="absolute inset-0"
          style={{ backgroundColor: colorValue }}
        />
        <input
          id={`${id}-picker`}
          type="color"
          value={colorValue}
          onChange={event => onChange(event.target.value)}
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
          aria-label={label}
        />
      </label>

      <Input
        id={id}
        value={value}
        onChange={event => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-9 min-w-0 flex-1 border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
      />
    </div>
  );
}
