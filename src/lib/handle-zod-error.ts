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
      if (typeof error.message === 'string' && error.message.trim() !== '') {
        return error.message;
      }
      // If it's a FieldError but has no specific message, try to return a generic one based on type
      if (error.type === 'required') {
        return `${key} is required.`;
      }
      return `Invalid input for ${key}.`;
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
  // Safely log the errors avoiding circular references (like DOM nodes in refs)
  try {
    console.error('Form Validation Errors:', JSON.stringify(errors, (key, value) => {
      if (key === 'ref' && value && typeof value === 'object') return '[DOM Node]';
      return value;
    }, 2));
  } catch (e) {
    console.error('Form Validation Errors:', errors);
  }

  const errorMessage = getFirstErrorMessage(errors);
  toast.error(errorMessage || 'Please fill out all required fields correctly.');
};
