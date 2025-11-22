'use client';

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Mail, Lock, User, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { Checkbox } from '@/components/ui/checkbox';

const registerSchema = z
  .object({
    email: z.string().email('Please enter a valid email address'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
        'Password must contain uppercase, lowercase, number, and special character',
      ),
    confirmPassword: z.string(),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    acceptedTerms: z
      .boolean()
      .refine((val) => val, {
        message: 'You must agree to the Terms and Conditions.',
      }),
    acceptedPrivacy: z
      .boolean()
      .refine((val) => val, {
        message: 'You must agree to the Privacy Policy (GDPR consent).',
      }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

export function RegisterForm() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { register: registerUser } = useAuth();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      acceptedTerms: false,
      acceptedPrivacy: false,
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    setError(null);
    setSuccess(false);
    setLoading(true);

    try {
      await registerUser(
        data.email,
        data.password,
        data.firstName,
        data.lastName,
      );
      setSuccess(true);
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          'Registration failed. Please try again.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold">Create Account</CardTitle>
        <CardDescription>
          {success
            ? 'Your account has been created. Please check your email to verify your address.'
            : 'Enter your information to create an account'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && !error && (
            <Alert>
              <Mail className="h-4 w-4" />
              <AlertDescription>
                We&apos;ve sent a confirmation email to the address you
                provided. Please click the link in that email to verify your
                account.
              </AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="firstName" className="text-sm font-medium">
                First Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="firstName"
                  placeholder="John"
                  className="pl-9"
                  {...register('firstName')}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="lastName" className="text-sm font-medium">
                Last Name
              </label>
              <Input
                id="lastName"
                placeholder="Doe"
                {...register('lastName')}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                className="pl-9"
                {...register('email')}
              />
            </div>
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                className="pl-9"
                {...register('password')}
              />
            </div>
            {errors.password && (
              <p className="text-sm text-destructive">
                {errors.password.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="confirmPassword" className="text-sm font-medium">
              Confirm Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                className="pl-9"
                {...register('confirmPassword')}
              />
            </div>
            {errors.confirmPassword && (
              <p className="text-sm text-destructive">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          <div className="space-y-3 pt-2">
            <Controller
              name="acceptedTerms"
              control={control}
              render={({ field }) => (
                <div className="flex items-start gap-3">
                  <Checkbox
                    id="acceptedTerms"
                    checked={field.value}
                    onCheckedChange={(checked) => field.onChange(!!checked)}
                  />
                  <label
                    htmlFor="acceptedTerms"
                    className="text-sm text-slate-300 leading-snug"
                  >
                    I have read and agree to the{' '}
                    <Link
                      href="/terms"
                      className="text-primary hover:underline"
                      target="_blank"
                    >
                      Terms and Conditions
                    </Link>
                    .
                  </label>
                </div>
              )}
            />
            {errors.acceptedTerms && (
              <p className="text-xs text-destructive">
                {errors.acceptedTerms.message}
              </p>
            )}

            <Controller
              name="acceptedPrivacy"
              control={control}
              render={({ field }) => (
                <div className="flex items-start gap-3">
                  <Checkbox
                    id="acceptedPrivacy"
                    checked={field.value}
                    onCheckedChange={(checked) => field.onChange(!!checked)}
                  />
                  <label
                    htmlFor="acceptedPrivacy"
                    className="text-sm text-slate-300 leading-snug"
                  >
                    I consent to the processing of my personal data in accordance with the{' '}
                    <Link
                      href="/privacy"
                      className="text-primary hover:underline"
                      target="_blank"
                    >
                      Privacy Policy (GDPR)
                    </Link>
                    .
                  </label>
                </div>
              )}
            />
            {errors.acceptedPrivacy && (
              <p className="text-xs text-destructive">
                {errors.acceptedPrivacy.message}
              </p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={loading || success}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating account...
              </>
            ) : success ? (
              'Check your email'
            ) : (
              'Create Account'
            )}
          </Button>

          <div className="text-center text-sm">
            <span className="text-muted-foreground">Already have an account? </span>
            <Link href="/login" className="text-primary hover:underline">
              Sign in
            </Link>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
