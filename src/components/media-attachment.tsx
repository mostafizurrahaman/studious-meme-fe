import * as React from 'react';
import { ImagePlus, UploadCloud, Plus } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';

type MediaAttachmentProps = {
  categoryDragging: boolean;
  setCategoryDragging: (value: boolean) => void;
  categoryImagePreview: string | null;
  handleCategoryImageSelect: (file?: File) => void;
  categoryImageInputRef: React.RefObject<HTMLInputElement | null>;
  isPending?: boolean;
  onSubmit?: () => void;
  submitButtonText?: string;
};

export function MediaAttachment({
  categoryDragging,
  setCategoryDragging,
  categoryImagePreview,
  handleCategoryImageSelect,
  categoryImageInputRef,
  isPending = false,
  onSubmit,
  submitButtonText = 'Add Category',
}: MediaAttachmentProps) {
  return (
    <div className="flex flex-col justify-between space-y-6 ">
      <div className="space-y-4">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground border-b border-border/30 pb-2 lg:border-0 lg:pb-0">
          Media Attachment
        </h3>
        <div
          role="button"
          tabIndex={0}
          onClick={() => categoryImageInputRef.current?.click()}
          onKeyDown={event => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              categoryImageInputRef.current?.click();
            }
          }}
          onDragOver={event => {
            event.preventDefault();
            setCategoryDragging(true);
          }}
          onDragLeave={() => setCategoryDragging(false)}
          onDrop={event => {
            event.preventDefault();
            setCategoryDragging(false);
            handleCategoryImageSelect(event.dataTransfer.files?.[0]);
          }}
          className={`group relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 transition-all duration-200 cursor-pointer ${
            categoryDragging
              ? 'border-primary bg-primary/5 scale-[0.99]'
              : 'border-border/70 bg-background/50 hover:border-primary/50 hover:bg-muted/10'
          }`}
        >
          <div className="flex flex-col items-center text-center">
            <div className="flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-3 shadow-sm transition group-hover:scale-105">
              <UploadCloud className="size-5" />
            </div>
            <div className="text-sm font-semibold text-foreground">
              Cover Artwork
            </div>
            <p className="text-xs text-muted-foreground mt-1 max-w-[200px]">
              Drag and drop image or click viewport to browse files.
            </p>
          </div>

          <div className="mt-4 w-full overflow-hidden rounded-xl border bg-muted/40">
            {categoryImagePreview ? (
              <div className="relative h-28 w-full">
                <Image
                  height={500}
                  width={500}
                  src={categoryImagePreview}
                  alt="Category preview"
                  className="h-full w-full object-cover"
                />
              </div>
            ) : (
              <div className="flex h-28 items-center justify-center gap-2 text-xs text-muted-foreground bg-muted/10">
                <ImagePlus className="size-4" />
                Preview Container
              </div>
            )}
          </div>
        </div>
      </div>

      <input
        ref={categoryImageInputRef}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={event => {
          handleCategoryImageSelect(event.target.files?.[0]);
          event.currentTarget.value = '';
        }}
      />

      {onSubmit && (
        <Button
          type="button"
          disabled={isPending}
          onClick={onSubmit}
          className="w-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm transition-colors py-5 text-sm font-medium rounded-xl"
        >
          <Plus className="size-4" />
          {submitButtonText}
        </Button>
      )}
    </div>
  );
}
