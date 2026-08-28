import { z } from 'zod';

export const addressSchema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  phoneNumber: z
  .string()
  .regex(
    /^01[3-9]\d{8}$/,
    'Please enter a valid Bangladesh phone number starting with 01.',
  ),
  email: z.string().email('Valid email required'),
  district: z.string().min(1, 'District is required'),
  deliveryAddress: z.string().min(1, 'Delivery address is required'),
  type: z.enum(['home', 'office', 'business', 'work', 'other']),
  isDefault: z.boolean().optional(),
});

export type TAddressSchema = z.infer<typeof addressSchema>;
