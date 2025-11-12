'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { UserRole } from '@/types/auth';
import { UserMenu } from '@/components/layout/UserMenu';
import {
  LayoutDashboard,
  Ship,
  TrendingUp,
  BarChart3,
  Globe,
  FileText,
  Users,
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Users', href: '/admin/users', icon: Users },
  { name: 'Port Constanta', href: '/admin/port-constanta', icon: Ship },
  { name: 'Daily Prices', href: '/admin/daily-prices', icon: TrendingUp },
  { name: 'COT Data', href: '/admin/cot-data', icon: BarChart3 },
  { name: 'DG AGRI', href: '/admin/dg-agri', icon: Globe },
  { name: 'Reports', href: '/admin/reports', icon: FileText },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute requiredRole={UserRole.ADMIN}>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </ProtectedRoute>
  );
}

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 z-50 w-64 bg-slate-800 border-r border-slate-700">
        {/* Logo */}
        <div className="flex items-center justify-center h-16 border-b border-slate-700">
          <h1 className="text-xl font-bold text-white">ProTrade Admin</h1>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors',
                  isActive
                    ? 'bg-amber-500 text-white'
                    : 'text-slate-300 hover:bg-slate-700 hover:text-white',
                )}
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Main content */}
      <div className="pl-64">
        {/* Top header with user menu */}
        <header className="sticky top-0 z-40 bg-slate-900 border-b border-slate-700">
          <div className="flex items-center justify-end px-8 py-4">
            <UserMenu />
          </div>
        </header>
        <main className="p-8">{children}</main>
      </div>
    </div>
  );
}
