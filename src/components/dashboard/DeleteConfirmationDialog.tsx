'use client';

import { Loader2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

type DeleteConfirmationDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void | Promise<void>;
  isPending?: boolean;
  title?: string;
  description: string;
  confirmLabel?: string;
};

export function DeleteConfirmationDialog({
  open,
  onOpenChange,
  onConfirm,
  isPending = false,
  title = 'Confirm deletion',
  description,
  confirmLabel = 'Delete',
}: DeleteConfirmationDialogProps) {
  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) =>
        !isPending ? onOpenChange(nextOpen) : undefined
      }
    >
      <DialogContent className="max-w-md" showCloseButton={!isPending}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={() => void onConfirm()}
            disabled={isPending}
          >
            {isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Trash2 className="size-4" />
            )}
            {isPending ? 'Deleting...' : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
