'use client';

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ComponentProps,
} from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import {
  Controller,
  useForm,
  type FieldErrors,
  type FieldValues,
} from 'react-hook-form';
import { type z } from 'zod';
import { OTPInput, type SlotProps, REGEXP_ONLY_DIGITS } from 'input-otp';
import {
  resendForgotPasswordOtpAction,
  resendSignupOtpAction,
  submitForgotPassword,
  submitForgotPasswordOtp,
  submitSignIn,
  submitSignUp,
  submitResetPassword,
  submitSignupOtp,
} from '@/app/(withNavFooter)/my-account/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { accountBenefits } from '@/lib/static-site-content';
import { useUser } from '@/context/UserContext';
import { authFormSchemas, makeZodResolver } from '@/lib/form-validation';
import { useCartStore } from '@/lib/cart-store';
import { getSafeRedirectPath } from '@/lib/auth/redirect';
import { getDashboardPathByRole } from '@/lib/auth/roles';

const initialState = { ok: false, message: '' } as const;

type SignInValues = z.infer<typeof authFormSchemas.signIn>;
type SignUpValues = z.infer<typeof authFormSchemas.signUp>;
type OtpValues = z.infer<typeof authFormSchemas.otp>;
type ForgotPasswordValues = z.infer<typeof authFormSchemas.forgotPassword>;
type ForgotPasswordOtpValues = z.infer<
  typeof authFormSchemas.forgotPasswordOtp
>;
type ForgotPasswordResetValues = z.infer<
  typeof authFormSchemas.forgotPasswordReset
>;

function LabeledInput({
  id,
  label,
  ...props
}: ComponentProps<typeof Input> & { id: string; label: string }) {
  return (
    <div className="grid gap-2">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      <Input id={id} {...props} aria-label={label} />
    </div>
  );
}

function PasswordField({
  id,
  label,
  placeholder,
  onToggle,
  visible,
  autoComplete,
  ...props
}: ComponentProps<typeof Input> & {
  id: string;
  label: string;
  placeholder: string;
  onToggle: () => void;
  visible: boolean;
  autoComplete?: string;
}) {
  return (
    <div className="grid gap-2">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>

      <div className="relative">
        <Input
          id={id}
          placeholder={placeholder}
          type={visible ? 'text' : 'password'}
          aria-label={label}
          className="h-11 px-4 pr-14 text-sm"
          autoComplete={autoComplete}
          {...props}
        />

        <button
          type="button"
          onClick={onToggle}
          aria-label={visible ? 'Hide password' : 'Show password'}
          title={visible ? 'Hide password' : 'Show password'}
          className="absolute right-1 top-1/2 z-10 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-foreground/60 transition hover:bg-muted hover:text-foreground"
        >
          {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </button>
      </div>
    </div>
  );
}

function ErrorText({ message }: { message?: string }) {
  if (!message) return null;

  return <p className="text-xs text-destructive">{message}</p>;
}

function getFirstErrorMessage(errors: FieldErrors<FieldValues>): string {
  for (const error of Object.values(errors)) {
    if (!error) {
      continue;
    }

    if ('message' in error && typeof error.message === 'string') {
      return error.message;
    }

    if (typeof error === 'object') {
      const message = getFirstErrorMessage(error as FieldErrors<FieldValues>);
      if (message) {
        return message;
      }
    }
  }

  return 'Please fix the highlighted fields.';
}

function showFirstFormError(errors: FieldErrors<FieldValues>) {
  toast.error(getFirstErrorMessage(errors));
}

function OtpSlot(props: SlotProps) {
  return (
    <div
      className={`relative flex h-14 w-12 items-center justify-center rounded-2xl border text-xl font-black transition-all shadow-sm sm:h-16 sm:w-14 ${
        props.isActive
          ? 'border-primary/70 bg-primary/10 text-primary ring-2 ring-primary/15'
          : 'border-border/80 bg-background text-secondary'
      }`}
    >
      <span className={props.char ? 'opacity-100' : 'opacity-35'}>
        {props.char ?? props.placeholderChar}
      </span>
      {props.hasFakeCaret ? (
        <span className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <span className="h-8 w-px animate-pulse bg-primary" />
        </span>
      ) : null}
    </div>
  );
}

function OtpInputField({
  value,
  onChange,
  onComplete,
  label,
}: {
  value: string;
  onChange: (value: string) => void;
  onComplete?: (value: string) => void;
  label: string;
}) {
  return (
    <div className="grid gap-3 rounded-3xl border border-border/70 bg-muted/20 p-4 shadow-sm sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <label className="text-sm font-semibold text-secondary">{label}</label>
        <span className="rounded-full bg-background px-3 py-1 text-[11px] font-semibold text-foreground/55 shadow-sm">
          6 digits
        </span>
      </div>
      <OTPInput
        maxLength={6}
        value={value}
        onChange={onChange}
        onComplete={onComplete}
        inputMode="numeric"
        pattern={REGEXP_ONLY_DIGITS}
        pasteTransformer={(pasted) => pasted.replace(/\D/g, '').slice(0, 6)}
        containerClassName="group mx-auto flex w-fit items-center justify-center gap-2 sm:gap-3"
        render={({ slots }) => (
          <>
            {slots.map((slot, index) => (
              <OtpSlot key={index} {...slot} />
            ))}
          </>
        )}
      />
      <p className="text-center text-xs text-foreground/50">
        Paste the full code or type it digit by digit.
      </p>
    </div>
  );
}

export function MyAccountAuthForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setIsLoading } = useUser();
  const [view, setView] = useState<
    | 'signin'
    | 'signup'
    | 'signup-otp'
    | 'forgot-email'
    | 'forgot-otp'
    | 'forgot-reset'
  >('signin');
  const [showSigninPassword, setShowSigninPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [showSignupConfirmPassword, setShowSignupConfirmPassword] =
    useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [showResetConfirmPassword, setShowResetConfirmPassword] =
    useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [signupEmail, setSignupEmail] = useState('');
  const [forgotEmail, setForgotEmail] = useState('');
  const authNoticeShownRef = useRef('');
  const checkoutNoticeShownRef = useRef('');
  const guestCartItems = useCartStore((state) => state.items);
  const replaceItems = useCartStore((state) => state.replaceItems);
  const guestCartJson = useMemo(
    () =>
      JSON.stringify(
        guestCartItems
          .map((item) => {
            const syncedQuantity = item.syncedQuantity ?? 0;
            const quantity = item.quantity - syncedQuantity;

            if (quantity <= 0 || !item.productId) {
              return null;
            }

            return {
              productId: item.productId,
              quantity,
            };
          })
          .filter(Boolean),
      ),
    [guestCartItems],
  );
  const safeRedirect = getSafeRedirectPath(searchParams.get('redirect'));

  const signInForm = useForm<SignInValues>({
    resolver: makeZodResolver(authFormSchemas.signIn),
    defaultValues: { email: '', password: '' },
    mode: 'onTouched',
  });

  const signUpForm = useForm<SignUpValues>({
    resolver: makeZodResolver(authFormSchemas.signUp),
    defaultValues: { name: '', email: '', password: '', confirmPassword: '' },
    mode: 'onTouched',
  });

  const otpForm = useForm<OtpValues>({
    resolver: makeZodResolver(authFormSchemas.otp),
    defaultValues: { otp: '' },
    mode: 'onTouched',
  });

  const forgotPasswordForm = useForm<ForgotPasswordValues>({
    resolver: makeZodResolver(authFormSchemas.forgotPassword),
    defaultValues: { email: '' },
    mode: 'onTouched',
  });

  const forgotPasswordOtpForm = useForm<ForgotPasswordOtpValues>({
    resolver: makeZodResolver(authFormSchemas.forgotPasswordOtp),
    defaultValues: { otp: '' },
    mode: 'onTouched',
  });

  const forgotPasswordResetForm = useForm<ForgotPasswordResetValues>({
    resolver: makeZodResolver(authFormSchemas.forgotPasswordReset),
    defaultValues: { newPassword: '', confirmPassword: '' },
    mode: 'onTouched',
  });

  function toFormData(values: Record<string, string>) {
    const formData = new FormData();

    Object.entries(values).forEach(([key, value]) => {
      formData.set(key, value);
    });

    return formData;
  }

  function getPostAuthDestination(role?: string) {
    if (role === 'ADMIN' || role === 'SUPER_ADMIN') {
      return getDashboardPathByRole(role) ?? '/';
    }

    return '/';
  }

  function applyAuthResultCart(cartItems?: typeof guestCartItems) {
    if (!cartItems?.length) return;

    replaceItems(cartItems);
  }

  useEffect(() => {
    const compareNotice = searchParams.get('notice');
    if (compareNotice && authNoticeShownRef.current !== compareNotice) {
      authNoticeShownRef.current = compareNotice;

      if (compareNotice === 'compare') {
        toast.info('Sign in to save comparison items to your account.');
      }

      if (compareNotice === 'wishlist') {
        toast.info('Sign in to save wishlist items to your account.');
      }
    }

    if (
      safeRedirect?.startsWith('/checkout') &&
      checkoutNoticeShownRef.current !== safeRedirect
    ) {
      checkoutNoticeShownRef.current = safeRedirect;
      toast.info('Sign in to place your order.');
    }
  }, [safeRedirect, searchParams]);

  return (
    <section className="mt-6 grid gap-6 lg:grid-cols-[1fr_0.9fr]">
      <Card className="p-6 shadow-sm">
        <CardHeader className="p-0">
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant={view === 'signin' ? 'default' : 'outline'}
              onClick={() => setView('signin')}
            >
              Login
            </Button>
            <Button
              type="button"
              variant={view.startsWith('signup') ? 'default' : 'outline'}
              onClick={() => setView('signup')}
            >
              Sign up
            </Button>
            <Button
              type="button"
              variant={view.startsWith('forgot') ? 'default' : 'outline'}
              onClick={() => setView('forgot-email')}
            >
              Forgot password
            </Button>
          </div>
          <h2 className="mt-4 text-2xl font-black text-secondary">
            {view === 'signin'
              ? 'Login'
              : view === 'signup'
                ? 'Create account'
                : view === 'signup-otp' || view === 'forgot-otp'
                  ? 'Verify OTP'
                  : view === 'forgot-reset'
                    ? 'Reset password'
                    : 'Forgot password'}
          </h2>
        </CardHeader>
        <CardContent className="mt-5 p-0">
          {view === 'signin' ? (
            <form
              key="signin-form"
              className="grid gap-4"
              onSubmit={signInForm.handleSubmit(async (values) => {
                setIsSubmitting(true);
                const result = await submitSignIn(
                  initialState,
                  toFormData({ ...values, guestCartJson }),
                );
                setIsSubmitting(false);

                if (!result.ok) {
                  toast.error(result.message);
                  if (
                    result.message.toLowerCase().includes('verify your account')
                  ) {
                    setSignupEmail(values.email);
                    setView('signup-otp');
                  }
                  return;
                }

                toast.success(result.message);
                applyAuthResultCart(result.cartItems);
                setIsLoading(true);
                router.push(
                  safeRedirect ?? getPostAuthDestination(result.role),
                );
              })}
            >
              <LabeledInput
                id="login-email"
                label="Email address"
                {...signInForm.register('email')}
                type="email"
                placeholder="Email address"
                autoComplete="email"
                className="h-11 px-4 text-sm"
              />
              <ErrorText message={signInForm.formState.errors.email?.message} />
              <PasswordField
                id="signin-password"
                label="Password"
                placeholder="Password"
                autoComplete="current-password"
                onToggle={() => setShowSigninPassword((value) => !value)}
                visible={showSigninPassword}
                {...signInForm.register('password')}
              />
              <ErrorText
                message={signInForm.formState.errors.password?.message}
              />
              <div className="flex flex-wrap items-center gap-3">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="h-11 w-fit rounded-full px-6 text-sm font-bold shadow-sm"
                >
                  {isSubmitting ? 'Signing in...' : 'Sign in'}
                </Button>
                <Button
                  type="button"
                  variant="link"
                  className="h-11 px-0 text-sm font-semibold"
                  onClick={() => setView('forgot-email')}
                >
                  Forgot password?
                </Button>
              </div>
            </form>
          ) : view === 'signup' ? (
            <form
              key="signup-form"
              className="grid gap-4"
              onSubmit={signUpForm.handleSubmit(async (values) => {
                setIsSubmitting(true);
                const result = await submitSignUp(
                  initialState,
                  toFormData(values),
                );
                setIsSubmitting(false);

                if (!result.ok) {
                  toast.error(result.message);
                  return;
                }

                toast.success(result.message);
                setSignupEmail(result.email);
                setView('signup-otp');
              }, showFirstFormError)}
            >
              <LabeledInput
                id="signup-name"
                label="Full name"
                {...signUpForm.register('name')}
                placeholder="Full name"
                className="h-11 px-4 text-sm"
              />
              <ErrorText message={signUpForm.formState.errors.name?.message} />
              <LabeledInput
                id="signup-email"
                label="Email address"
                {...signUpForm.register('email')}
                type="email"
                placeholder="Email address"
                autoComplete="email"
                className="h-11 px-4 text-sm"
              />
              <ErrorText message={signUpForm.formState.errors.email?.message} />
              <PasswordField
                id="signup-password"
                label="Password"
                placeholder="Password"
                autoComplete="new-password"
                onToggle={() => setShowSignupPassword((value) => !value)}
                visible={showSignupPassword}
                {...signUpForm.register('password')}
              />
              <ErrorText
                message={signUpForm.formState.errors.password?.message}
              />
              <PasswordField
                id="signup-confirm-password"
                label="Confirm password"
                placeholder="Confirm password"
                autoComplete="new-password"
                onToggle={() => setShowSignupConfirmPassword((value) => !value)}
                visible={showSignupConfirmPassword}
                {...signUpForm.register('confirmPassword')}
              />
              <ErrorText
                message={signUpForm.formState.errors.confirmPassword?.message}
              />
              <Button
                type="submit"
                disabled={isSubmitting}
                className="h-11 w-fit rounded-full px-6 text-sm font-bold shadow-sm"
              >
                {isSubmitting ? 'Creating account...' : 'Create account'}
              </Button>
            </form>
          ) : view === 'signup-otp' ? (
            <form
              key="signup-otp-form"
              className="grid gap-4"
              onSubmit={otpForm.handleSubmit(async (values) => {
                setIsSubmitting(true);
                const result = await submitSignupOtp(
                  initialState,
                  toFormData({
                    'otp-email': signupEmail,
                    otp: values.otp,
                    guestCartJson,
                  }),
                );
                setIsSubmitting(false);

                if (!result.ok) {
                  toast.error(result.message);
                  return;
                }

                toast.success(result.message);
                applyAuthResultCart(result.cartItems);
                setIsLoading(true);
                router.push(
                  safeRedirect ?? getPostAuthDestination(result.role),
                );
              })}
            >
              <LabeledInput
                id="otp-email"
                label="Email address"
                name="otp-email"
                type="email"
                value={signupEmail}
                readOnly
                className="h-11 px-4 text-sm"
              />
              <Controller
                control={otpForm.control}
                name="otp"
                render={({ field }) => (
                  <OtpInputField
                    label="OTP code"
                    value={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
              <ErrorText message={otpForm.formState.errors.otp?.message} />
              <div className="flex flex-wrap gap-3">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="h-11 rounded-full px-6 text-sm font-bold shadow-sm"
                >
                  {isSubmitting ? 'Verifying...' : 'Verify OTP'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  disabled={isResending || !signupEmail}
                  onClick={() => {
                    setIsResending(true);
                    void (async () => {
                      const result = await resendSignupOtpAction(signupEmail);
                      setIsResending(false);
                      if (!result?.success) {
                        toast.error(result?.message ?? 'Failed to resend OTP.');
                        return;
                      }
                      toast.success(
                        result.message ?? 'OTP sent again successfully.',
                      );
                    })();
                  }}
                >
                  {isResending ? 'Sending...' : 'Resend OTP'}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setView('signin')}
                >
                  Back to login
                </Button>
              </div>
            </form>
          ) : view === 'forgot-email' ? (
            <form
              key="forgot-email-form"
              className="grid gap-4"
              onSubmit={forgotPasswordForm.handleSubmit(async (values) => {
                setIsSubmitting(true);
                const result = await submitForgotPassword(
                  { ok: false, message: '', step: 'email' },
                  toFormData(values),
                );
                setIsSubmitting(false);

                if (!result.ok) {
                  if (
                    result.message
                      .toLowerCase()
                      .includes('last otp is valid till now')
                  ) {
                    toast.info(result.message);
                    setForgotEmail(values.email);
                    setView('forgot-otp');
                    return;
                  }

                  toast.error(result.message);
                  return;
                }

                toast.success(result.message);
                setForgotEmail(values.email);
                setView('forgot-otp');
              })}
            >
              <LabeledInput
                id="forgot-email"
                label="Email address"
                {...forgotPasswordForm.register('email')}
                type="email"
                placeholder="Email address"
                autoComplete="email"
                className="h-11 px-4 text-sm"
              />
              <ErrorText
                message={forgotPasswordForm.formState.errors.email?.message}
              />
              <div className="flex flex-wrap gap-3">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="h-11 rounded-full px-6 text-sm font-bold shadow-sm"
                >
                  {isSubmitting ? 'Sending OTP...' : 'Send OTP'}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setView('signin')}
                >
                  Back to login
                </Button>
              </div>
            </form>
          ) : view === 'forgot-otp' ? (
            <form
              key="forgot-otp-form"
              className="grid gap-4"
              onSubmit={forgotPasswordOtpForm.handleSubmit(async (values) => {
                setIsSubmitting(true);
                const result = await submitForgotPasswordOtp(
                  { ok: false, message: '', step: 'otp' },
                  toFormData({ otp: values.otp }),
                );
                setIsSubmitting(false);

                if (!result.ok) {
                  toast.error(result.message);
                  return;
                }

                toast.success(result.message);
                setView('forgot-reset');
              })}
            >
              <LabeledInput
                id="forgot-otp-email"
                label="Email address"
                name="forgot-otp-email"
                type="email"
                value={forgotEmail}
                readOnly
                className="h-11 px-4 text-sm"
              />
              <Controller
                control={forgotPasswordOtpForm.control}
                name="otp"
                render={({ field }) => (
                  <OtpInputField
                    label="OTP code"
                    value={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
              <ErrorText
                message={forgotPasswordOtpForm.formState.errors.otp?.message}
              />
              <div className="flex flex-wrap gap-3">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="h-11 rounded-full px-6 text-sm font-bold shadow-sm"
                >
                  {isSubmitting ? 'Verifying...' : 'Verify OTP'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  disabled={isResending || !forgotEmail}
                  onClick={() => {
                    setIsResending(true);
                    void (async () => {
                      const result = await resendForgotPasswordOtpAction();
                      setIsResending(false);
                      if (!result?.success) {
                        toast.error(result?.message ?? 'Failed to resend OTP.');
                        return;
                      }
                      toast.success(
                        result.message ?? 'OTP sent again successfully.',
                      );
                    })();
                  }}
                >
                  {isResending ? 'Sending...' : 'Resend OTP'}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setView('forgot-email')}
                >
                  Back
                </Button>
              </div>
            </form>
          ) : (
            <form
              key="forgot-reset-form"
              className="grid gap-4"
              onSubmit={forgotPasswordResetForm.handleSubmit(async (values) => {
                setIsSubmitting(true);
                const result = await submitResetPassword(
                  { ok: false, message: '', step: 'reset' },
                  toFormData(values),
                );
                setIsSubmitting(false);

                if (!result.ok) {
                  toast.error(result.message);
                  return;
                }

                toast.success(result.message);
                forgotPasswordForm.reset();
                forgotPasswordOtpForm.reset();
                forgotPasswordResetForm.reset();
                setForgotEmail('');
                setView('signin');
              })}
            >
              <div className="rounded-2xl border border-dashed border-border px-4 py-3 text-sm text-foreground/65">
                Set a new password for{' '}
                <span className="font-semibold text-secondary">
                  {forgotEmail || 'your account'}
                </span>
                .
              </div>
              <PasswordField
                id="reset-password"
                label="New password"
                placeholder="New password"
                autoComplete="new-password"
                onToggle={() => setShowResetPassword((value) => !value)}
                visible={showResetPassword}
                {...forgotPasswordResetForm.register('newPassword')}
              />
              <ErrorText
                message={
                  forgotPasswordResetForm.formState.errors.newPassword?.message
                }
              />
              <PasswordField
                id="reset-confirm-password"
                label="Confirm password"
                placeholder="Confirm password"
                autoComplete="new-password"
                onToggle={() => setShowResetConfirmPassword((value) => !value)}
                visible={showResetConfirmPassword}
                {...forgotPasswordResetForm.register('confirmPassword')}
              />
              <ErrorText
                message={
                  forgotPasswordResetForm.formState.errors.confirmPassword
                    ?.message
                }
              />
              <div className="flex flex-wrap gap-3">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="h-11 rounded-full px-6 text-sm font-bold shadow-sm"
                >
                  {isSubmitting ? 'Saving...' : 'Reset password'}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setView('signin')}
                >
                  Back to login
                </Button>
              </div>
            </form>
          )}
        </CardContent>
        <div className="mt-6 text-sm text-foreground/55">
          {view === 'signin'
            ? 'Use your existing account to access orders and dashboards.'
            : view === 'signup'
              ? 'New users receive an OTP by email before the account is activated.'
              : view === 'signup-otp'
                ? `OTP sent to ${signupEmail || 'your email address'}.`
                : view === 'forgot-email'
                  ? 'Enter your account email to receive a password reset OTP.'
                  : view === 'forgot-otp'
                    ? `Verify the OTP sent to ${forgotEmail || 'your email address'}.`
                    : 'Choose a new password to finish the reset.'}
        </div>
      </Card>

      <Card className="border-0 bg-secondary p-6 text-secondary-foreground shadow-sm">
        <h2 className="text-2xl font-black">Why create an account</h2>
        <div className="mt-4 space-y-3 text-sm text-secondary-foreground/80">
          {accountBenefits.map((item) => (
            <div key={item} className="rounded-2xl bg-white/10 px-4 py-3">
              {item}
            </div>
          ))}
        </div>
      </Card>
    </section>
  );
}
