'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

interface TenantContextType {
  subdomain: string | null;
  tenantId: string | null;
  isLoading: boolean;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export function TenantProvider({ children }: { children: React.ReactNode }) {
  const [subdomain, setSubdomain] = useState<string | null>(null);
  const [tenantId, setTenantId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Extract subdomain from hostname
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      const parts = hostname.split('.');
      
      // Check if we have a subdomain (not www, not localhost)
      if (parts.length > 2 && parts[0] !== 'www') {
        setSubdomain(parts[0]);
      } else if (hostname === 'localhost' || hostname.startsWith('127.0.0.1')) {
        // For development, check for X-Tenant-ID header or use demo
        setSubdomain('demo');
      }
    }
    setIsLoading(false);
  }, []);

  const value: TenantContextType = {
    subdomain,
    tenantId,
    isLoading,
  };

  return (
    <TenantContext.Provider value={value}>
      {children}
    </TenantContext.Provider>
  );
}

export function useTenant() {
  const context = useContext(TenantContext);
  if (context === undefined) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
}
