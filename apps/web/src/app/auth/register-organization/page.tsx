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
import Image from 'next/image';

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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-coffee-light via-white to-coffee-cream/30 py-12 px-4 sm:px-6 lg:px-8">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23${encodeURIComponent('8B5A3C').substring(1)}' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      <div className="max-w-md w-full space-y-8 relative z-10">
        <div className="text-center">
          <div className="flex flex-col items-center mb-4">
            <Image
              src="/logo.png"
              alt="Cupperly Logo"
              width={200}
              height={200}
              className="mb-6"
            />
            <h1 className="text-4xl font-pacifico text-coffee-brown mb-2">Cupperly</h1>
          </div>
          <p className="text-coffee-dark/70 text-lg font-medium">
            Professional Coffee Cupping Platform
          </p>
          <p className="mt-2 text-sm text-coffee-dark/60">
            Create your organization to get started
          </p>
        </div>

        <Card className="shadow-xl border-0 bg-white/95 backdrop-blur-sm">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2xl text-coffee-brown">Register Your Organization</CardTitle>
            <CardDescription className="text-coffee-dark/70">
              Create a new organization to start using CuppingLab for your coffee cupping needs.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-button">
                  {error}
                </div>
              )}

              <div>
                <Label htmlFor="organizationName" className="text-coffee-dark font-medium">Organization Name</Label>
                <Input
                  id="organizationName"
                  type="text"
                  {...register('organizationName')}
                  placeholder="Your Coffee Company"
                  className="mt-2 border-coffee-cream/50 focus:border-coffee-brown focus:ring-coffee-brown/20"
                />
                {errors.organizationName && (
                  <p className="mt-2 text-sm text-red-600">{errors.organizationName.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="subdomain" className="text-coffee-dark font-medium">Organization Subdomain</Label>
                <Input
                  id="subdomain"
                  type="text"
                  {...register('subdomain')}
                  placeholder={organizationName ? generateSubdomain(organizationName) : 'your-company'}
                  className="mt-2 border-coffee-cream/50 focus:border-coffee-brown focus:ring-coffee-brown/20"
                />
                <p className="mt-2 text-xs text-coffee-dark/60">
                  This will be used in your organization's URL: {'{subdomain}'}.cupperly.com
                </p>
                {errors.subdomain && (
                  <p className="mt-2 text-sm text-red-600">{errors.subdomain.message}</p>
                )}
              </div>

              <div className="border-t border-coffee-cream/30 pt-6">
                <h3 className="text-lg font-medium text-coffee-brown mb-4">Administrator Account</h3>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName" className="text-coffee-dark font-medium">First Name</Label>
                      <Input
                        id="firstName"
                        type="text"
                        {...register('firstName')}
                        placeholder="John"
                        className="mt-2 border-coffee-cream/50 focus:border-coffee-brown focus:ring-coffee-brown/20"
                      />
                      {errors.firstName && (
                        <p className="mt-2 text-sm text-red-600">{errors.firstName.message}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="lastName" className="text-coffee-dark font-medium">Last Name</Label>
                      <Input
                        id="lastName"
                        type="text"
                        {...register('lastName')}
                        placeholder="Doe"
                        className="mt-2 border-coffee-cream/50 focus:border-coffee-brown focus:ring-coffee-brown/20"
                      />
                      {errors.lastName && (
                        <p className="mt-2 text-sm text-red-600">{errors.lastName.message}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="email" className="text-coffee-dark font-medium">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      {...register('email')}
                      placeholder="john@yourcompany.com"
                      className="mt-2 border-coffee-cream/50 focus:border-coffee-brown focus:ring-coffee-brown/20"
                    />
                    {errors.email && (
                      <p className="mt-2 text-sm text-red-600">{errors.email.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="password" className="text-coffee-dark font-medium">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      {...register('password')}
                      placeholder="Min 8 chars, include A-Z, a-z, 0-9, @$!%*?&"
                      className="mt-2 border-coffee-cream/50 focus:border-coffee-brown focus:ring-coffee-brown/20"
                    />
                    <p className="mt-2 text-xs text-coffee-dark/60">
                      Must contain uppercase, lowercase, number, and special character
                    </p>
                    {errors.password && (
                      <p className="mt-2 text-sm text-red-600">{errors.password.message}</p>
                    )}
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-coffee-brown hover:bg-coffee-dark text-white font-medium py-3 rounded-button transition-all duration-200 shadow-lg hover:shadow-xl"
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

            <div className="mt-8 text-center">
              <p className="text-sm text-coffee-dark/70">
                Already have an account?{' '}
                <Link href="/auth/login" className="font-medium text-coffee-brown hover:text-coffee-dark transition-colors">
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
