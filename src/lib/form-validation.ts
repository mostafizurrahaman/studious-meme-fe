import type { FieldErrors, FieldValues, Resolver } from 'react-hook-form';
import { z } from 'zod';

export function makeZodResolver<
  TValues extends FieldValues,
  TSchema extends z.ZodType,
>(schema: TSchema): Resolver<TValues> {
  const resolver = async (values: TValues) => {
    const parsed = schema.safeParse(values as z.input<TSchema>);

    if (parsed.success) {
      return {
        values: parsed.data as TValues,
        errors: {},
      };
    }

    const errors = {} as FieldErrors<TValues>;

    for (const issue of parsed.error.issues) {
      const path = issue.path.join('.');

      if (!path || errors[path]) {
        continue;
      }

      errors[path as keyof TValues] = {
        type: issue.code,
        message: issue.message,
      } as FieldErrors<TValues>[keyof TValues];
    }

    return {
      values: {} as TValues,
      errors,
    };
  };

  return resolver as Resolver<TValues>;
}

const requiredText = (label: string, minLength = 1) =>
  z
    .string({ error: `${label} is required!` })
    .trim()
    .min(1, { message: `${label} is required!` })
    .refine((value) => value.length >= minLength, {
      message: `${label} must be at least ${minLength} characters long!`,
    });

const optionalText = () => z.string().trim().optional();

const requiredEmail = (label = 'Email') =>
  z
    .string({ error: `${label} is required!` })
    .trim()
    .min(1, { message: `${label} is required!` })
    .email({ message: 'Invalid email format!' })
    .transform((value) => value.toLowerCase());

const requiredPassword = (label: string) =>
  z
    .string({ error: `${label} is required!` })
    .trim()
    .min(6, {
      message: 'Password must be at least 6 characters long.',
    })
    .max(20, { message: 'Password must be between 6 and 20 characters.' });

const requiredPhone = () =>
  z
    .string({ error: 'Phone is required!' })
    .trim()
    .min(1, { message: 'Phone is required!' })
    .regex(/^[0-9+]+$/, { message: 'Invalid phone number format!' })
    .min(10, { message: 'Phone must be at least 10 digits long!' });

const requiredDate = () =>
  z
    .string({ error: 'Date of birth is required!' })
    .trim()
    .min(1, { message: 'Date of birth is required!' })
    .regex(/^\d{4}-\d{2}-\d{2}$/, { message: 'Invalid date format!' })
    .transform((value) => new Date(`${value}T00:00:00.000Z`).toISOString());

const requiredNumber = (
  label: string,
  options?: { min?: number; integer?: boolean },
) =>
  z
    .string({ error: `${label} is required!` })
    .trim()
    .min(1, { message: `${label} is required!` })
    .refine((value) => !Number.isNaN(Number(value)), {
      message: `${label} must be a valid number!`,
    })
    .refine(
      (value) => (options?.integer ? Number.isInteger(Number(value)) : true),
      {
        message: `${label} must be a whole number!`,
      },
    )
    .refine(
      (value) =>
        options?.min === undefined ? true : Number(value) >= options.min,
      {
        message: `${label} must be at least ${options?.min ?? 0}!`,
      },
    )
    .transform((value) => Number(value));

export const authFormSchemas = {
  signIn: z.object({
    email: requiredEmail(),
    password: requiredPassword('Password'),
  }),
  forgotPassword: z.object({
    email: requiredEmail(),
  }),
  forgotPasswordOtp: z.object({
    otp: z
      .string({ error: 'OTP is required!' })
      .trim()
      .min(6, { message: 'OTP must be 6 digits long!' })
      .max(6, { message: 'OTP must be 6 digits long!' }),
  }),
  forgotPasswordReset: z
    .object({
      newPassword: requiredPassword('New password'),
      confirmPassword: z
        .string({ error: 'Confirm password is required!' })
        .trim()
        .min(1, {
          message: 'Confirm password is required!',
        }),
    })
    .superRefine(({ newPassword, confirmPassword }, ctx) => {
      if (newPassword !== confirmPassword) {
        ctx.addIssue({
          code: 'custom',
          path: ['confirmPassword'],
          message: 'Passwords must match!',
        });
      }
    }),
  signUp: z
    .object({
      name: requiredText('Name', 2),
      email: requiredEmail(),
      password: requiredPassword('Password'),
      confirmPassword: z
        .string({ error: 'Confirm password is required!' })
        .trim()
        .min(1, {
          message: 'Confirm password is required!',
        }),
    })
    .superRefine(({ password, confirmPassword }, ctx) => {
      if (password !== confirmPassword) {
        ctx.addIssue({
          code: 'custom',
          path: ['confirmPassword'],
          message: 'Passwords must match!',
        });
      }
    }),
  otp: z.object({
    otp: z
      .string({ error: 'OTP is required!' })
      .trim()
      .min(6, { message: 'OTP must be 6 digits long!' })
      .max(6, { message: 'OTP must be 6 digits long!' }),
  }),
};

export const profileFormSchemas = {
  profile: z.object({
    name: requiredText('Name', 3),
    phone: requiredPhone(),
    dob: requiredDate(),
  }),
  password: z.object({
    oldPassword: requiredPassword('Old password'),
    newPassword: requiredPassword('New password'),
  }),
};

export const dashboardFormSchemas = {
  product: z.object({
    title: requiredText('Title'),
    slug: requiredText('Slug'),
    sku: requiredText('SKU'),
    price: requiredNumber('Price', { min: 0 }),
    oldPrice: z
      .union([z.literal(''), z.string().trim().min(1)])
      .transform((value) => (value === '' ? undefined : Number(value)))
      .refine(
        (value) => value === undefined || (!Number.isNaN(value) && value >= 0),
        {
          message: 'Old price must be a valid non-negative number!',
        },
      ),
    badge: optionalText(),
    brand: requiredText('Brand'),
    category: requiredText('Category'),
    subCategorySlug: optionalText(),
    stock: z
      .string()
      .trim()
      .refine((value) => value === '' || /^\d+$/.test(value), {
        message: 'Stock must be a valid non-negative whole number!',
      }),
    rating: requiredNumber('Rating', { min: 0 }),
    isFeatured: z.boolean().default(false),
    isActive: z.boolean().default(true),
  }),
  admin: z
    .object({
      name: requiredText('Name', 3),
      email: requiredEmail(),
      phone: requiredPhone(),
      password: requiredPassword('Password'),
      confirmPassword: z
        .string({ error: 'Confirm password is required!' })
        .trim()
        .min(1, {
          message: 'Confirm password is required!',
        }),
      role: z
        .string({ error: 'Role is required!' })
        .trim()
        .min(1, { message: 'Role is required!' }),
    })
    .superRefine(({ password, confirmPassword }, ctx) => {
      if (password !== confirmPassword) {
        ctx.addIssue({
          code: 'custom',
          path: ['confirmPassword'],
          message: 'Passwords must match!',
        });
      }
    }),
  category: z.object({
    name: requiredText('Category name', 1),
    slug: requiredText('Category slug', 1),
    description: requiredText('Category description', 1),
    accent: optionalText(),
  }),
  brand: z.object({
    name: requiredText('Brand name', 3),
    slug: requiredText('Brand slug', 3),
    description: requiredText('Brand description', 1),
    isActive: z.boolean().default(true),
  }),
};
