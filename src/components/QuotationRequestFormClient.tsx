'use client';

import { useActionState, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import {
  submitQuotationRequest,
  type QuotationRequestState,
} from '@/app/(withNavFooter)/quotation-request/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

type QuotationRequestFormClientProps = {
  brands: string[];
};

const initialState: QuotationRequestState = {
  ok: false,
  message: '',
};

function FieldError({ message }: { message?: string }) {
  if (!message) return null;

  return <p className="text-xs font-medium text-destructive">{message}</p>;
}

export function QuotationRequestFormClient({
  brands,
}: QuotationRequestFormClientProps) {
  const [state, formAction, isPending] = useActionState(
    submitQuotationRequest,
    initialState,
  );
  const [values, setValues] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    products: '',
    brand: '',
    message: '',
  });
  const [touchedFields, setTouchedFields] = useState<
    Record<keyof typeof values, boolean>
  >({
    name: false,
    company: false,
    email: false,
    phone: false,
    products: false,
    brand: false,
    message: false,
  });
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!state.message) {
      return;
    }

    if (state.ok) {
      toast.success(state.message);
      queueMicrotask(() => {
        setValues({
          name: '',
          company: '',
          email: '',
          phone: '',
          products: '',
          brand: '',
          message: '',
        });
        setTouchedFields({
          name: false,
          company: false,
          email: false,
          phone: false,
          products: false,
          brand: false,
          message: false,
        });
      });
      return;
    }

    toast.error(state.message);
  }, [state]);

  function markTouched(field: keyof typeof values) {
    setTouchedFields((current) => ({ ...current, [field]: true }));
  }

  function updateValue(field: keyof typeof values, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
    markTouched(field);
  }

  function getLocalFieldError(
    field: 'name' | 'email' | 'phone' | 'products' | 'message',
  ) {
    const value = values[field].trim();

    if (field === 'name')
      return value ? undefined : 'Please enter your full name.';
    if (field === 'email')
      return value
        ? value.includes('@')
          ? undefined
          : 'Please enter a valid email address.'
        : 'Please enter your email address.';
    if (field === 'phone')
      return value ? undefined : 'Please enter your phone number.';
    if (field === 'products')
      return value
        ? undefined
        : 'Please list the products or specifications you need.';
    if (field === 'message') {
      return value.length >= 20
        ? undefined
        : 'Please add project details or delivery requirements (minimum 20 characters).';
    }

    return undefined;
  }

  function getFieldError(
    field: 'name' | 'email' | 'phone' | 'products' | 'message',
  ) {
    if (touchedFields[field]) {
      return getLocalFieldError(field);
    }

    return state.errors?.[field];
  }

  const nameError = getFieldError('name');
  const emailError = getFieldError('email');
  const phoneError = getFieldError('phone');
  const productsError = getFieldError('products');
  const messageError = getFieldError('message');

  return (
    <form
      ref={formRef}
      action={formAction}
      noValidate
      className="grid gap-4"
      onSubmit={() => {
        setTouchedFields((current) => ({
          ...current,
          name: true,
          email: true,
          phone: true,
          products: true,
          message: true,
        }));
      }}
    >
      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-2 text-sm font-semibold text-foreground">
          Full name
          <Input
            name="name"
            placeholder="Your name"
            value={values.name}
            aria-invalid={Boolean(nameError)}
            onBlur={() => markTouched('name')}
            onChange={(event) => updateValue('name', event.target.value)}
          />
          <FieldError message={nameError} />
        </label>
        <label className="grid gap-2 text-sm font-semibold text-foreground">
          Company
          <Input
            name="company"
            placeholder="Company / organization"
            value={values.company}
            onBlur={() => markTouched('company')}
            onChange={(event) => updateValue('company', event.target.value)}
          />
        </label>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-2 text-sm font-semibold text-foreground">
          Email
          <Input
            name="email"
            type="email"
            placeholder="name@company.com"
            value={values.email}
            aria-invalid={Boolean(emailError)}
            onBlur={() => markTouched('email')}
            onChange={(event) => updateValue('email', event.target.value)}
          />
          <FieldError message={emailError} />
        </label>
        <label className="grid gap-2 text-sm font-semibold text-foreground">
          Phone
          <Input
            name="phone"
            placeholder="01XXXXXXXXX"
            value={values.phone}
            aria-invalid={Boolean(phoneError)}
            onBlur={() => markTouched('phone')}
            onChange={(event) => updateValue('phone', event.target.value)}
          />
          <FieldError message={phoneError} />
        </label>
      </div>
      <label className="grid gap-2 text-sm font-semibold text-foreground">
        Interested products
        <Textarea
          name="products"
          placeholder="List the items, quantity and any specification details"
          className="min-h-32"
          value={values.products}
          aria-invalid={Boolean(productsError)}
          onBlur={() => markTouched('products')}
          onChange={(event) => updateValue('products', event.target.value)}
        />
        <FieldError message={productsError} />
      </label>
      <label className="grid gap-2 text-sm font-semibold text-foreground">
        Brand preference
        <select
          name="brand"
          value={values.brand}
          onBlur={() => markTouched('brand')}
          onChange={(event) => updateValue('brand', event.target.value)}
          className="h-11 rounded-2xl border border-input bg-background px-4 outline-none"
        >
          <option value="">Any suitable brand</option>
          {brands.map((brand) => (
            <option key={brand} value={brand}>
              {brand}
            </option>
          ))}
        </select>
      </label>
      <label className="grid gap-2 text-sm font-semibold text-foreground">
        Message
        <Textarea
          name="message"
          placeholder="Tell us about the project timeline, delivery location and special requirements"
          className="min-h-36"
          value={values.message}
          aria-invalid={Boolean(messageError)}
          onBlur={() => markTouched('message')}
          onChange={(event) => updateValue('message', event.target.value)}
        />
        <FieldError message={messageError} />
      </label>
      <Button
        type="submit"
        disabled={isPending}
        className="h-11 w-fit rounded-full px-6 text-sm font-bold shadow-sm"
      >
        {isPending ? 'Submitting...' : 'Request quotation'}
      </Button>
    </form>
  );
}
