// src/schemas/category.ts
import z from 'zod';

export const createCategorySchema = z.object({
  name: z
    .string({
      error: () => 'Category name is required!',
    })
    .trim()
    .min(3, 'Category name must be at least 3 characters.')
    .max(100, 'Category name cannot exceed 100 characters.'),

  slug: z
    .string({
      error: 'Slug is required!',
    })
    .trim()
    .min(3, 'Slug is required.')
    .max(200, 'Slug cannot exceed 100 characters.')
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      'Slug must contain only lowercase letters, numbers, and hyphens.',
    ),

  accent: z
    .string()
    .trim()
    .regex(
      /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
      'Please enter a valid hex color.',
    ),

  description: z
    .string()
    .trim()
    .max(10000, 'Description cannot exceed 500 characters.')
    .optional()
    .or(z.literal('')),

  metaTitle: z
    .string()
    .trim()
    .max(60, 'Meta title should not exceed 60 characters.')
    .optional()
    .or(z.literal('')),

  metaDescription: z
    .string()
    .trim()
    .max(160, 'Meta description should not exceed 160 characters.')
    .optional()
    .or(z.literal('')),

  mediaAttachment: z
    .instanceof(File, {
      message: 'Please upload a valid image.',
    })
    .optional(),
});

export const editCategorySchema = z.object({
  name: z
    .string({
      error: () => 'Category name is required!',
    })
    .trim()
    .min(3, 'Category name must be at least 3 characters.')
    .max(100, 'Category name cannot exceed 100 characters.'),

  slug: z
    .string({
      error: 'Slug is required!',
    })
    .trim()
    .min(3, 'Slug is required.')
    .max(200, 'Slug cannot exceed 100 characters.')
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      'Slug must contain only lowercase letters, numbers, and hyphens.',
    ),

  accent: z
    .string()
    .trim()
    .regex(
      /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
      'Please enter a valid hex color.',
    ),

  description: z
    .string()
    .trim()
    .max(10000, 'Description cannot exceed 500 characters.')
    .optional()
    .or(z.literal('')),

  metaTitle: z
    .string()
    .trim()
    .max(60, 'Meta title should not exceed 60 characters.')
    .optional()
    .or(z.literal('')),

  metaDescription: z
    .string()
    .trim()
    .max(160, 'Meta description should not exceed 160 characters.')
    .optional()
    .or(z.literal('')),
  isActive: z.boolean({
    error: 'isActive is required!',
  }),

  mediaAttachment: z
    .instanceof(File, {
      message: 'Please upload a valid image.',
    })
    .optional(),
});

export const createSubCategorySchema = z.object({
  name: z
    .string({
      error: () => 'Sub-category name is required!',
    })
    .trim()
    .min(3, 'Sub-category name must be at least 3 characters.')
    .max(100, 'Sub-category name cannot exceed 100 characters.'),

  slug: z
    .string({
      error: 'Slug is required!',
    })
    .trim()
    .min(3, 'Slug is required.')
    .max(200, 'Slug cannot exceed 100 characters.')
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      'Slug must contain only lowercase letters, numbers, and hyphens.',
    ),

  accent: z
    .string()
    .trim()
    .regex(
      /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
      'Please enter a valid hex color.',
    ),

  description: z
    .string()
    .trim()
    .max(10000, 'Description cannot exceed 500 characters.')
    .optional()
    .or(z.literal('')),

  metaTitle: z
    .string()
    .trim()
    .max(60, 'Meta title should not exceed 60 characters.')
    .optional()
    .or(z.literal('')),

  metaDescription: z
    .string()
    .trim()
    .max(160, 'Meta description should not exceed 160 characters.')
    .optional()
    .or(z.literal('')),

  mediaAttachment: z
    .instanceof(File, {
      message: 'Please upload a valid image.',
    })
    .optional(),
});

export const editSubCategorySchema = z.object({
  name: z
    .string({
      error: () => 'Sub-category name is required!',
    })
    .trim()
    .min(3, 'Sub-category name must be at least 3 characters.')
    .max(100, 'Sub-category name cannot exceed 100 characters.'),

  slug: z
    .string({
      error: 'Slug is required!',
    })
    .trim()
    .min(3, 'Slug is required.')
    .max(200, 'Slug cannot exceed 100 characters.')
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      'Slug must contain only lowercase letters, numbers, and hyphens.',
    ),

  accent: z
    .string()
    .trim()
    .regex(
      /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
      'Please enter a valid hex color.',
    ),

  description: z
    .string()
    .trim()
    .max(10000, 'Description cannot exceed 500 characters.')
    .optional()
    .or(z.literal('')),

  metaTitle: z
    .string()
    .trim()
    .max(60, 'Meta title should not exceed 60 characters.')
    .optional()
    .or(z.literal('')),

  metaDescription: z
    .string()
    .trim()
    .max(160, 'Meta description should not exceed 160 characters.')
    .optional()
    .or(z.literal('')),

  isActive: z.boolean({
    error: 'isActive is required!',
  }),

  mediaAttachment: z
    .instanceof(File, {
      message: 'Please upload a valid image.',
    })
    .optional(),
});

export const categorySchema = {
  createCategorySchema,
  editCategorySchema,
  createSubCategorySchema,
  editSubCategorySchema,
};

export type TCreateCategoryType = z.infer<typeof createCategorySchema>;
export type TEditCategoryType = z.infer<typeof editCategorySchema>;
export type TCreateSubCategoryType = z.infer<typeof createSubCategorySchema>;
export type TEditSubCategoryType = z.infer<typeof editSubCategorySchema>;
