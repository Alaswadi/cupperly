'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Bell,
  Search,
  User,
  LogOut,
  Settings,
  ChevronDown,
  Plus
} from 'lucide-react';
import Image from 'next/image';

const getNavigation = (userRole?: string) => {
  const baseNav = [
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'Sessions', href: '/dashboard/sessions' },
    { name: 'Samples', href: '/dashboard/samples' },
    { name: 'Reports', href: '/dashboard/reports' },
  ];

  // Only show Team and Settings to ADMIN users
  if (userRole === 'ADMIN') {
    return [
      ...baseNav,
      { name: 'Team', href: '/dashboard/team' },
      { name: 'Settings', href: '/dashboard/settings' },
    ];
  }

  return baseNav;
};

export function DashboardHeader() {
  const { user, organization, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const pathname = usePathname();

  const handleLogout = async () => {
    await logout();
    setShowUserMenu(false);
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo and Navigation */}
          <div className="flex items-center space-x-8">
            <Link href="/dashboard" className="flex items-center">
              <h1 className="text-2xl font-pacifico text-coffee-brown cursor-pointer">
                Cupperly
              </h1>
            </Link>
            <nav className="flex space-x-6">
              {getNavigation(user?.role).map((item) => {
                // More precise active state detection
                const isActive = item.href === '/dashboard'
                  ? pathname === '/dashboard'
                  : pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`font-medium pb-1 transition-colors ${
                      isActive
                        ? 'text-gray-900 border-b-2 border-coffee-brown'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-4">
            {/* New Session Button */}
            <Link href="/dashboard/sessions/new">
              <button className="bg-coffee-brown text-white px-6 py-2 rounded-lg whitespace-nowrap hover:bg-coffee-dark transition-colors flex items-center space-x-2">
                <Plus className="h-4 w-4" />
                <span>New Session</span>
              </button>
            </Link>

            {/* Notifications */}
            <button className="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-gray-900 transition-colors">
              <Bell className="h-5 w-5" />
            </button>

            {/* User Avatar */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="w-8 h-8 bg-coffee-brown rounded-full flex items-center justify-center hover:bg-coffee-dark transition-colors"
              >
                <User className="h-4 w-4 text-white" />
              </button>

              {/* Dropdown menu */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                  <div className="py-1">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">
                        {user?.firstName} {user?.lastName}
                      </p>
                      <p className="text-xs text-gray-500">{user?.email}</p>
                    </div>

                    <Link href="/dashboard/profile">
                      <button className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        <User className="h-4 w-4 mr-2" />
                        Profile
                      </button>
                    </Link>

                    {user?.role === 'ADMIN' && (
                      <Link href="/dashboard/settings">
                        <button className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                          <Settings className="h-4 w-4 mr-2" />
                          Settings
                        </button>
                      </Link>
                    )}

                    <div className="border-t border-gray-100">
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Sign out
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
