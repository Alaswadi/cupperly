'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { useTenant } from '@/lib/tenant-context';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

export default function HomePage() {
  const { isAuthenticated, isLoading } = useAuth();
  const { subdomain, isLoading: tenantLoading } = useTenant();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !tenantLoading) {
      if (!subdomain) {
        // No tenant, redirect to landing page or tenant selection
        router.push('/auth/register-organization');
      } else if (isAuthenticated) {
        // Authenticated, redirect to dashboard
        router.push('/dashboard');
      } else {
        // Not authenticated, redirect to login
        router.push('/auth/login');
      }
    }
  }, [isAuthenticated, isLoading, subdomain, tenantLoading, router]);

  if (isLoading || tenantLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <LoadingSpinner size="lg" />
    </div>
  );
}
