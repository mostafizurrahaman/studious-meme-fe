import { describe, expect, it } from 'vitest';
import { authFormSchemas, dashboardFormSchemas } from './form-validation';

describe('form validation schemas', () => {
  it('validates forgot password flow fields', () => {
    expect(
      authFormSchemas.forgotPassword.safeParse({ email: 'USER@EXAMPLE.COM' })
        .success,
    ).toBe(true);
    expect(
      authFormSchemas.forgotPasswordOtp.safeParse({ otp: '123456' }).success,
    ).toBe(true);
    expect(
      authFormSchemas.forgotPasswordReset.safeParse({
        newPassword: '123456',
        confirmPassword: '123456',
      }).success,
    ).toBe(true);
  });

  it('uses the simplified password rule', () => {
    const validPassword = authFormSchemas.signUp.safeParse({
      name: 'Amina',
      email: 'amina@example.com',
      password: '123456',
      confirmPassword: '123456',
    });

    const shortPassword = authFormSchemas.signUp.safeParse({
      name: 'Amina',
      email: 'amina@example.com',
      password: '12345',
      confirmPassword: '12345',
    });

    expect(validPassword.success).toBe(true);
    expect(shortPassword.success).toBe(false);
    if (!shortPassword.success) {
      expect(shortPassword.error.issues[0]?.message).toBe(
        'Password must be at least 6 characters long.',
      );
    }
  });

  it('rejects mismatched reset passwords', () => {
    const result = authFormSchemas.forgotPasswordReset.safeParse({
      newPassword: '123456',
      confirmPassword: '123457',
    });

    expect(result.success).toBe(false);
  });

  it('accepts stock values on dashboard products', () => {
    expect(
      dashboardFormSchemas.product.safeParse({
        title: 'Test',
        slug: 'test',
        sku: 'SKU-1',
        price: '100',
        oldPrice: '',
        brand: 'Brand',
        category: 'Category',
        stock: '12',
        rating: '5',
        isFeatured: false,
        isActive: true,
      }).success,
    ).toBe(true);
  });
});
