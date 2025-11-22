import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  TrendingUp,
  Download,
  Maximize2,
  Clock,
  Filter,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { UserMenu } from './UserMenu';

interface DashboardLayoutProps {
  children: React.ReactNode;
  className?: string;
}

interface PanelHeaderProps {
  title: string;
  lastUpdated: string;
  onFilter?: () => void;
  onExport?: () => void;
  onFullscreen?: () => void;
  className?: string;
}

export function DashboardLayout({ children, className }: DashboardLayoutProps) {
  return (
    <div className={cn("min-h-screen bg-slate-900", className)}>
      {/* Header */}
      <header className="bg-slate-900 border-b border-slate-700/50 sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold tracking-wider">
              <span className="text-white">PRO</span> <span className="text-primary">TRADE</span>
            </h1>
            <UserMenu />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-10">
        {children}
      </main>
    </div>
  );
}

export function PanelHeader({ 
  title, 
  lastUpdated, 
  onFilter, 
  onExport, 
  onFullscreen,
  className 
}: PanelHeaderProps) {
  return (
    <div className={cn("flex items-center justify-between p-4 border-b", className)}>
      <div className="flex items-center space-x-2">
        <h3 className="text-lg font-semibold">{title}</h3>
        <div className="flex items-center text-xs text-muted-foreground">
          <Clock className="mr-1 h-3 w-3" />
          <span>Updated {lastUpdated}</span>
        </div>
      </div>
      
      <div className="flex items-center space-x-1">
        {onFilter && (
          <Button variant="ghost" size="sm" onClick={onFilter}>
            <Filter className="h-4 w-4" />
          </Button>
        )}
        {onExport && (
          <Button variant="ghost" size="sm" onClick={onExport}>
            <Download className="h-4 w-4" />
          </Button>
        )}
        {onFullscreen && (
          <Button variant="ghost" size="sm" onClick={onFullscreen}>
            <Maximize2 className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}

export function DashboardGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
      {children}
    </div>
  );
}

export function DashboardPanel({
  children,
  className
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("", className)}>
      {children}
    </div>
  );
}