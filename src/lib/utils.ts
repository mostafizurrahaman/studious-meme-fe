import { clsx, type ClassValue } from 'clsx';
import { toast } from 'sonner';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// loading Toast
export const loadingToast = (msg: string) => toast.loading(msg);

// success Toast
export const successToast = (
  msg: string,
  options?: Parameters<typeof toast.success>[1],
) => toast.success(msg, options);

// error Toast
export const errorToast = (
  msg: string,
  options?: Parameters<typeof toast.error>[1],
) => toast.error(msg, options);

// warning Toast
export const warningToast = (
  msg: string,
  options?: Parameters<typeof toast.warning>[1],
) => {
  toast.warning(msg, options);
};

// info Toast
export const infoToast = (
  msg: string,
  options?: Parameters<typeof toast.info>[1],
) => {
  toast.info(msg, options);
};
