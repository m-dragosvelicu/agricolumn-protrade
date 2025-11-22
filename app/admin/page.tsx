'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Ship,
  TrendingUp,
  BarChart3,
  Globe,
  FileText,
  Upload,
  Users as UsersIcon,
  AlertTriangle,
} from 'lucide-react';
import { vesselsApi } from '@/lib/api/vessels';
import { dailyPricesApi } from '@/lib/api/dailyPrices';
import { cotCftcApi } from '@/lib/api/cotCftc';
import { dgAgriApi } from '@/lib/api/dgAgri';
import { reportsApi } from '@/lib/api/reports';
import { usersApi } from '@/lib/api/users';
import { subscriptionsApi } from '@/lib/api/subscriptions';
import type { UserListItem } from '@/lib/api/users';

type StatKey =
  | 'portConstanta'
  | 'dailyPrices'
  | 'cotPairs'
  | 'dgAgriDatasets'
  | 'commodityReports'
  | 'users'
  | 'subscribedUsers';

type StatValue = number | null;

export default function AdminDashboard() {
  const [stats, setStats] = useState<Record<StatKey, StatValue>>({
    portConstanta: null,
    dailyPrices: null,
    cotPairs: null,
    dgAgriDatasets: null,
    commodityReports: null,
    users: null,
    subscribedUsers: null,
  });
  const [statsLoading, setStatsLoading] = useState(false);
  const [statsError, setStatsError] = useState<string | null>(null);

  useEffect(() => {
    const loadStats = async () => {
      setStatsLoading(true);
      setStatsError(null);
      try {
        const [
          vesselsResponse,
          dailyMetadata,
          cotMetadata,
          dgMetadata,
          reportsResponse,
          usersResponse,
          subscriberStats,
        ] = await Promise.all([
          vesselsApi
            .getVessels({ skip: 0, take: 1 })
            .catch(() => null),
          dailyPricesApi
            .getMetadata()
            .catch(() => null),
          cotCftcApi
            .getMetadata()
            .catch(() => null),
          dgAgriApi
            .getMetadata()
            .catch(() => null),
          reportsApi
            .getReports({ offset: 0, limit: 1 })
            .catch(() => null),
          usersApi
            .getAllUsers()
            .catch((err: any) => {
              if (err?.response?.status === 403) {
                setStatsError('You are not authorized to view user statistics.');
                return null;
              }
              throw err;
            }),
          subscriptionsApi
            .getAdminSubscriberStats()
            .catch((err: any) => {
              if (err?.response?.status === 403) {
                setStatsError((prev) =>
                  prev ||
                  'You are not authorized to view subscriber statistics.',
                );
                return null;
              }
              throw err;
            }),
        ]);

        let totalUsers: number | null = null;
        let subscribedUsers: number | null = null;

        if (usersResponse && Array.isArray(usersResponse)) {
          const list = usersResponse as UserListItem[];
          totalUsers = list.length;
        }

        if (subscriberStats) {
          subscribedUsers = subscriberStats.totalSubscribers;
        }

        setStats({
          portConstanta: vesselsResponse ? vesselsResponse.total : null,
          dailyPrices: dailyMetadata ? dailyMetadata.series.length : null,
          cotPairs: cotMetadata ? cotMetadata.availablePairs.length : null,
          dgAgriDatasets: dgMetadata ? dgMetadata.commodities.length : null,
          commodityReports: reportsResponse ? reportsResponse.total : null,
          users: totalUsers,
          subscribedUsers,
        });
      } catch (error: any) {
        setStatsError(
          error?.response?.data?.message ||
            error?.message ||
            'Failed to load admin statistics.',
        );
      } finally {
        setStatsLoading(false);
      }
    };

    void loadStats();
  }, []);

  const statCards = useMemo(
    () => [
      {
        key: 'portConstanta' as const,
        name: 'Port Constanta Records',
        icon: Ship,
        color: 'text-blue-500',
        subtitle: 'vessel records in system',
      },
      {
        key: 'dailyPrices' as const,
        name: 'Daily Prices',
        icon: TrendingUp,
        color: 'text-green-500',
        subtitle: 'price series configured',
      },
      {
        key: 'cotPairs' as const,
        name: 'COT Data Pairs',
        icon: BarChart3,
        color: 'text-purple-500',
        subtitle: 'exchange/commodity pairs',
      },
      {
        key: 'dgAgriDatasets' as const,
        name: 'DG AGRI Datasets',
        icon: Globe,
        color: 'text-orange-500',
        subtitle: 'DG AGRI commodities',
      },
      {
        key: 'commodityReports' as const,
        name: 'Commodity Reports',
        icon: FileText,
        color: 'text-pink-500',
        subtitle: 'reports in library',
      },
      {
        key: 'users' as const,
        name: 'Users',
        icon: UsersIcon,
        color: 'text-slate-200',
        subtitle: 'registered accounts',
      },
      {
        key: 'subscribedUsers' as const,
        name: 'Subscribed Users',
        icon: UsersIcon,
        color: 'text-emerald-400',
        subtitle: 'active or trial subscriptions',
      },
    ],
    [],
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
        <p className="text-slate-400">
          Manage your commodity trading data and reports
        </p>
      </div>

      {statsError && (
        <div className="flex items-center gap-2 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">
          <AlertTriangle className="h-4 w-4" />
          <span>{statsError}</span>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {statCards.map((card) => {
          const Icon = card.icon;
          const value = stats[card.key];
          const displayValue =
            value === null || value === undefined
              ? statsLoading
                ? '—'
                : 'N/A'
              : value.toLocaleString();
          return (
          <Card
            key={card.name}
            className="bg-slate-800/50 border-slate-700"
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-400">
                {card.name}
              </CardTitle>
              <Icon className={cn("h-5 w-5", card.color)} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {displayValue}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {card.subtitle}
              </p>
            </CardContent>
          </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { name: 'Upload Port Data', href: '/admin/port-constanta' },
              { name: 'Update Daily Prices', href: '/admin/daily-prices' },
              { name: 'Import COT Data', href: '/admin/cot-data' },
              { name: 'Upload DG AGRI', href: '/admin/dg-agri' },
              { name: 'Create Report', href: '/admin/reports' },
            ].map((action) => (
              <Link
                key={action.name}
                href={action.href}
                className="flex items-center justify-center px-4 py-3 bg-slate-700 rounded-lg text-white hover:bg-slate-600 transition-colors"
              >
                <Upload className="mr-2 h-4 w-4" />
                {action.name}
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              {
                action: 'Uploaded Port Constanta data',
                time: '2 hours ago',
                user: 'Admin',
              },
              {
                action: 'Updated Daily Prices',
                time: '5 hours ago',
                user: 'Admin',
              },
              {
                action: 'Created new commodity report',
                time: '1 day ago',
                user: 'Admin',
              },
            ].map((activity, index) => (
              <div
                key={index}
                className="flex items-center justify-between py-3 border-b border-slate-700 last:border-0"
              >
                <div>
                  <p className="text-sm text-white">{activity.action}</p>
                  <p className="text-xs text-slate-500">{activity.user}</p>
                </div>
                <span className="text-xs text-slate-400">{activity.time}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function cn(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}
