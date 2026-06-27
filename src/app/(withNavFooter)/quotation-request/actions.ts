'use server';

import { z } from 'zod';
import { createContact } from '@/services/Contact';

type QuotationRequestErrors = Partial<
  Record<'name' | 'email' | 'phone' | 'products' | 'message', string>
>;

export type QuotationRequestState =
  | { ok: false; message: string; errors?: QuotationRequestErrors }
  | { ok: true; message: string; errors?: undefined };

const quotationRequestSchema = z.object({
  name: z.string().trim().min(1, { message: 'Please enter your full name.' }),
  company: z.string().trim().optional(),
  email: z
    .string()
    .trim()
    .min(1, { message: 'Please enter your email address.' })
    .email({ message: 'Please enter a valid email address.' }),
  phone: z
    .string()
    .trim()
    .min(1, { message: 'Please enter your phone number.' }),
  products: z.string().trim().min(1, {
    message: 'Please list the products or specifications you need.',
  }),
  brand: z.string().trim().optional(),
  message: z.string().trim().min(20, {
    message:
      'Please add project details or delivery requirements (minimum 20 characters).',
  }),
});

function readValue(formData: FormData, key: string) {
  return String(formData.get(key) ?? '').trim();
}

function flattenErrors(
  error: z.ZodError<z.infer<typeof quotationRequestSchema>>,
) {
  const fieldErrors = error.flatten().fieldErrors;

  return Object.fromEntries(
    Object.entries(fieldErrors).flatMap(([key, value]) => {
      const message = value?.[0];
      return message ? [[key, message]] : [];
    }),
  ) as QuotationRequestErrors;
}

export async function submitQuotationRequest(
  _prevState: QuotationRequestState,
  formData: FormData,
): Promise<QuotationRequestState> {
  const parsed = quotationRequestSchema.safeParse({
    name: readValue(formData, 'name'),
    company: readValue(formData, 'company'),
    email: readValue(formData, 'email').toLowerCase(),
    phone: readValue(formData, 'phone'),
    products: readValue(formData, 'products'),
    brand: readValue(formData, 'brand'),
    message: readValue(formData, 'message'),
  });

  if (!parsed.success) {
    return {
      ok: false,
      message: 'Please fix the highlighted quotation fields.',
      errors: flattenErrors(parsed.error),
    };
  }

  const { name, company, email, phone, products, brand, message } = parsed.data;
  const subjectParts = ['Quotation Request', company, brand].filter(Boolean);
  const payload = {
    name,
    company: company || undefined,
    email,
    phone,
    subject: subjectParts.join(' - ').slice(0, 120),
    products,
    brand: brand || undefined,
    message,
  };

  const result = await createContact(payload);

  if (!result?.success) {
    return {
      ok: false,
      message: result?.message ?? 'Failed to submit quotation request.',
    };
  }

  return {
    ok: true,
    message: result.message ?? 'Quotation request submitted successfully.',
  };
}
