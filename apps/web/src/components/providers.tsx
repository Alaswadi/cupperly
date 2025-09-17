'use client';

import { AuthProvider } from '@/lib/auth-context';
import { TenantProvider } from '@/lib/tenant-context';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <TenantProvider>
      <AuthProvider>
        {children}
      </AuthProvider>
    </TenantProvider>
  );
}
