'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  Home,
  Coffee,
  Calendar,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Beaker
} from 'lucide-react';
import Image from 'next/image';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Sessions', href: '/dashboard/sessions', icon: Calendar },
  { name: 'Samples', href: '/dashboard/samples', icon: Coffee },
  { name: 'Templates', href: '/dashboard/templates', icon: Beaker },
  { name: 'Reports', href: '/dashboard/reports', icon: BarChart3 },
];

export function DashboardNav() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  return (
    <div className={cn(
      'bg-white border-r border-gray-200 transition-all duration-300',
      collapsed ? 'w-16' : 'w-64'
    )}>
      <div className="flex flex-col h-screen">
        {/* Logo */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          {!collapsed && (
            <div className="flex items-center">
              <Image
                src="/logo.png"
                alt="Cupperly Logo"
                width={32}
                height={32}
              />
              <span className="ml-2 text-xl font-pacifico text-coffee-brown">Cupperly</span>
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1 rounded-md hover:bg-gray-100"
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                )}
                title={collapsed ? item.name : undefined}
              >
                <item.icon className={cn('h-5 w-5', collapsed ? 'mx-auto' : 'mr-3')} />
                {!collapsed && <span>{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        {!collapsed && (
          <div className="p-4 border-t border-gray-200">
            <div className="text-xs text-gray-500">
              <p>Cupperly v1.0</p>
              <p>Professional Coffee Cupping</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
