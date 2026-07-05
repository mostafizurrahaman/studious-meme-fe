import { FieldErrors, FieldError, FieldValues } from 'react-hook-form';
import { toast } from 'sonner';

/**
 * কোনো অবজেক্ট আসলেই FieldError টাইপের কি না তা চেক করার জন্য টাইপ গার্ড (Type Guard)
 */
const isFieldError = (value: unknown): value is FieldError => {
  return (
    value !== null &&
    typeof value === 'object' &&
    'type' in value &&
    typeof (value as Record<string, unknown>).type === 'string'
  );
};

/**
 * FieldErrors অবজেক্ট থেকে রিকার্সিভ উপায়ে প্রথম এরর মেসেজটি খুঁজে বের করে।
 */
export const getFirstErrorMessage = (
  errors: FieldErrors | undefined,
): string | null => {
  if (!errors || typeof errors !== 'object') {
    return null;
  }

  for (const key in errors) {
    const error = errors[key];
    if (!error) continue;

    if (isFieldError(error)) {
      if (typeof error.message === 'string' && error.message) {
        return error.message;
      }
    } else {
      // যদি এটি নেস্টেড অবজেক্ট বা অ্যারে হয়, তবে রিকার্সিভলি সার্চ করা হবে
      const nestedMessage = getFirstErrorMessage(error as FieldErrors);
      if (nestedMessage) {
        return nestedMessage;
      }
    }
  }

  return null;
};

export const handleFormError = (errors: FieldErrors<FieldValues>) => {
  console.error('Form Validation Errors:', errors);

  const errorMessage = getFirstErrorMessage(errors);
  toast.error(errorMessage || 'Please fill out all required fields correctly.');
};
