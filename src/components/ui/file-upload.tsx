'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { ImagePlus, Link2, X } from 'lucide-react';
import Image from 'next/image';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type FileUploadProps = {
  value?: string | File | null;
  onChange: (urlOrFile: string | File | null) => void;
  onBlur?: () => void;
  placeholder?: string;
  disabled?: boolean;
};

export function FileUpload({
  value,
  onChange,
  onBlur,
  placeholder = 'Paste image URL',
  disabled,
}: FileUploadProps) {
  const [isEditing, setIsEditing] = useState(!value);
  const [url, setUrl] = useState(typeof value === 'string' ? value : '');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const previewUrl = useMemo(() => {
    if (!value) return '';
    if (typeof value === 'string') return value;

    return URL.createObjectURL(value);
  }, [value]);

  useEffect(() => {
    if (!(value instanceof File)) {
      return;
    }

    return () => URL.revokeObjectURL(previewUrl);
  }, [previewUrl, value]);

  const handleUrlSubmit = () => {
    if (!url) return;
    onChange(url);
    setIsEditing(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    onChange(file);
    setIsEditing(false);
  };

  const handleClear = () => {
    onChange(null);
    setIsEditing(true);
    setUrl('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (previewUrl && !isEditing) {
    return (
      <div className="space-y-2">
        <div className="overflow-hidden rounded-2xl border border-border bg-muted shadow-sm">
          <div className="relative aspect-video w-full">
            <Image
              src={previewUrl}
              alt="Selected image preview"
              fill
              unoptimized
              sizes="(max-width: 768px) 100vw, 400px"
              className="object-cover"
            />
          </div>
          <div className="flex items-center justify-between gap-2 border-t border-border px-3 py-2">
            <span className="truncate text-xs text-muted-foreground">
              {typeof value === 'string'
                ? value
                : (value?.name ?? 'Selected file')}
            </span>
            <Button
              type="button"
              size="sm"
              variant="destructive"
              className="h-8 rounded-full px-3"
              onClick={handleClear}
              disabled={disabled}
            >
              <X className="mr-1 size-4" />
              Clear
            </Button>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setIsEditing(true)}
          disabled={disabled}
        >
          <ImagePlus className="mr-2 size-4" />
          Change image
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileSelect}
        disabled={disabled}
      />
      <div className="flex gap-2">
        <Input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onBlur={onBlur}
          placeholder={placeholder}
          disabled={disabled}
          className="flex-1"
        />
        <Button
          type="button"
          onClick={handleUrlSubmit}
          disabled={disabled || !url}
        >
          <Link2 className="size-4" />
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled}
        >
          <ImagePlus className="size-4" />
        </Button>
      </div>
    </div>
  );
}
