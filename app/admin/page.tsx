'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Ship, TrendingUp, BarChart3, Globe, FileText, Upload } from 'lucide-react';

const stats = [
  {
    name: 'Port Constanta Records',
    value: '17',
    icon: Ship,
    color: 'text-blue-500',
  },
  {
    name: 'Daily Prices',
    value: '24',
    icon: TrendingUp,
    color: 'text-green-500',
  },
  {
    name: 'COT Reports',
    value: '8',
    icon: BarChart3,
    color: 'text-purple-500',
  },
  {
    name: 'DG AGRI Datasets',
    value: '26',
    icon: Globe,
    color: 'text-orange-500',
  },
  {
    name: 'Commodity Reports',
    value: '4',
    icon: FileText,
    color: 'text-pink-500',
  },
];

export default function AdminDashboard() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
        <p className="text-slate-400">
          Manage your commodity trading data and reports
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <Card
            key={stat.name}
            className="bg-slate-800/50 border-slate-700"
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-400">
                {stat.name}
              </CardTitle>
              <stat.icon className={cn("h-5 w-5", stat.color)} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stat.value}</div>
              <p className="text-xs text-slate-500 mt-1">
                records in system
              </p>
            </CardContent>
          </Card>
        ))}
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
              <a
                key={action.name}
                href={action.href}
                className="flex items-center justify-center px-4 py-3 bg-slate-700 rounded-lg text-white hover:bg-slate-600 transition-colors"
              >
                <Upload className="mr-2 h-4 w-4" />
                {action.name}
              </a>
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
