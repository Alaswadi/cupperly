'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

const organizationSchema = z.object({
  organizationName: z.string().min(2, 'Organization name must be at least 2 characters'),
  subdomain: z.string()
    .min(3, 'Subdomain must be at least 3 characters')
    .max(50, 'Subdomain must be less than 50 characters')
    .regex(/^[a-z0-9-]+$/, 'Subdomain can only contain lowercase letters, numbers, and hyphens'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/, 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
});

type OrganizationFormData = z.infer<typeof organizationSchema>;

export default function RegisterOrganizationPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<OrganizationFormData>({
    resolver: zodResolver(organizationSchema),
  });

  const organizationName = watch('organizationName');

  // Auto-generate subdomain from organization name
  const generateSubdomain = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const onSubmit = async (data: OrganizationFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/register-organization', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Registration failed');
      }

      const result = await response.json();
      
      // Redirect to login with success message
      router.push(`/auth/login?message=Organization registered successfully. Please log in.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">CuppingLab</h1>
          <p className="mt-2 text-sm text-gray-600">
            Professional Coffee Cupping Platform
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Register Your Organization</CardTitle>
            <CardDescription>
              Create a new organization to start using CuppingLab for your coffee cupping needs.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
              )}

              <div>
                <Label htmlFor="organizationName">Organization Name</Label>
                <Input
                  id="organizationName"
                  type="text"
                  {...register('organizationName')}
                  placeholder="Your Coffee Company"
                  className="mt-1"
                />
                {errors.organizationName && (
                  <p className="mt-1 text-sm text-red-600">{errors.organizationName.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="subdomain">Organization Subdomain</Label>
                <Input
                  id="subdomain"
                  type="text"
                  {...register('subdomain')}
                  placeholder={organizationName ? generateSubdomain(organizationName) : 'your-company'}
                  className="mt-1"
                />
                <p className="mt-1 text-xs text-gray-500">
                  This will be used in your organization's URL: {'{subdomain}'}.cuppinglab.com
                </p>
                {errors.subdomain && (
                  <p className="mt-1 text-sm text-red-600">{errors.subdomain.message}</p>
                )}
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Administrator Account</h3>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        type="text"
                        {...register('firstName')}
                        placeholder="John"
                        className="mt-1"
                      />
                      {errors.firstName && (
                        <p className="mt-1 text-sm text-red-600">{errors.firstName.message}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        type="text"
                        {...register('lastName')}
                        placeholder="Doe"
                        className="mt-1"
                      />
                      {errors.lastName && (
                        <p className="mt-1 text-sm text-red-600">{errors.lastName.message}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      {...register('email')}
                      placeholder="john@yourcompany.com"
                      className="mt-1"
                    />
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      {...register('password')}
                      placeholder="Min 8 chars, include A-Z, a-z, 0-9, @$!%*?&"
                      className="mt-1"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Must contain uppercase, lowercase, number, and special character
                    </p>
                    {errors.password && (
                      <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                    )}
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full btn-primary"
              >
                {isLoading ? (
                  <>
                    <LoadingSpinner className="mr-2 h-4 w-4" />
                    Creating Organization...
                  </>
                ) : (
                  'Create Organization'
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link href="/auth/login" className="font-medium text-orange-600 hover:text-orange-500">
                  Sign in here
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
