'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { usersApi, UserDetail } from '@/lib/api/users';
import { Loader2, Shield, ArrowLeft, Mail, Calendar, User as UserIcon, CheckCircle, XCircle, Key } from 'lucide-react';
import { format } from 'date-fns';

export default function AdminUserDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const userId = params?.id as string;

  const [user, setUser] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPromoting, setIsPromoting] = useState(false);

  useEffect(() => {
    if (!userId) return;
    const fetchUser = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await usersApi.getUser(userId);
        setUser(data);
      } catch (err: any) {
        setError(err?.response?.data?.message || 'Failed to load user');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId]);

  const handleMakeAdmin = async () => {
    if (!user) return;
    try {
      setIsPromoting(true);
      const updated = await usersApi.makeAdmin(user.id);
      setUser(updated);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to promote user');
    } finally {
      setIsPromoting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => router.back()} className="text-slate-300 hover:text-white">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Card className="bg-slate-800/60 border border-red-500/40">
          <CardHeader>
            <CardTitle className="text-white">Unable to load user</CardTitle>
            <CardDescription className="text-red-300">{error || 'User not found'}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const isAdmin = user.role === 'ADMIN';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="text-slate-300 hover:text-white hover:bg-slate-700/50"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <Separator orientation="vertical" className="h-6 bg-slate-700" />
          <Link
            href="/admin/users"
            className="text-sm text-slate-400 hover:text-amber-400 transition-colors"
          >
            All Users
          </Link>
        </div>
      </div>

      {/* User Profile Header */}
      <Card className="bg-gradient-to-br from-slate-800/80 to-slate-800/40 border-slate-700 shadow-xl">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
            {/* User Info */}
            <div className="flex items-start gap-4">
              <div className="rounded-full bg-gradient-to-br from-amber-500 to-amber-600 p-4 shadow-lg">
                <UserIcon className="h-8 w-8 text-white" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold text-white">
                    {user.firstName && user.lastName
                      ? `${user.firstName} ${user.lastName}`
                      : 'User Profile'}
                  </h1>
                  <Badge
                    className={isAdmin
                      ? 'bg-amber-500 hover:bg-amber-600 text-white'
                      : 'bg-slate-600 hover:bg-slate-700 text-white'
                    }
                  >
                    <Shield className="mr-1 h-3 w-3" />
                    {user.role}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <Mail className="h-4 w-4 text-slate-400" />
                  {user.email}
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
                  <Key className="h-3 w-3" />
                  {user.id}
                </div>
              </div>
            </div>

            {/* Status Badge */}
            <div className="flex items-center gap-2">
              {user.isActive ? (
                <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-500/10 border border-green-500/30">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-sm font-medium text-green-400">Active</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/30">
                  <XCircle className="h-5 w-5 text-red-500" />
                  <span className="text-sm font-medium text-red-400">Inactive</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Details Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Personal Information */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <UserIcon className="h-5 w-5 text-amber-500" />
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <InfoField label="First Name" value={user.firstName} icon={<UserIcon className="h-4 w-4" />} />
            <InfoField label="Last Name" value={user.lastName} icon={<UserIcon className="h-4 w-4" />} />
            <InfoField label="Email Address" value={user.email} icon={<Mail className="h-4 w-4" />} />
          </CardContent>
        </Card>

        {/* Account Details */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Shield className="h-5 w-5 text-amber-500" />
              Account Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <InfoField
              label="Account Role"
              value={user.role}
              icon={<Shield className="h-4 w-4" />}
              valueClassName={isAdmin ? "text-amber-400 font-semibold" : "text-white"}
            />
            <InfoField
              label="Account Status"
              value={user.isActive ? 'Active' : 'Inactive'}
              icon={user.isActive ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
              valueClassName={user.isActive ? "text-green-400" : "text-red-400"}
            />
            <InfoField
              label="Created Date"
              value={user.createdAt ? format(new Date(user.createdAt), 'PPP') : '—'}
              icon={<Calendar className="h-4 w-4" />}
            />
            <InfoField
              label="Last Updated"
              value={user.updatedAt ? format(new Date(user.updatedAt), 'PPP') : '—'}
              icon={<Calendar className="h-4 w-4" />}
            />
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Administrative Actions</CardTitle>
          <CardDescription className="text-slate-400">
            Manage permissions and access levels for this user account
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isAdmin ? (
            <div className="flex items-center gap-3 p-4 rounded-lg bg-amber-500/10 border border-amber-500/30">
              <Shield className="h-5 w-5 text-amber-500" />
              <div>
                <p className="text-sm font-medium text-amber-400">Administrator Account</p>
                <p className="text-xs text-slate-400 mt-1">
                  This user has full administrative privileges
                </p>
              </div>
            </div>
          ) : (
            <Button
              className="bg-amber-500 hover:bg-amber-600 text-white"
              disabled={isPromoting}
              onClick={handleMakeAdmin}
            >
              {isPromoting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Promoting to Admin...
                </>
              ) : (
                <>
                  <Shield className="mr-2 h-4 w-4" />
                  Promote to Administrator
                </>
              )}
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function InfoField({
  label,
  value,
  icon,
  valueClassName = "text-white"
}: {
  label: string;
  value?: string;
  icon?: React.ReactNode;
  valueClassName?: string;
}) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg border border-slate-700/50 bg-slate-900/20 hover:bg-slate-900/40 transition-colors">
      {icon && (
        <div className="text-slate-400">
          {icon}
        </div>
      )}
      <div className="flex-1">
        <p className="text-xs uppercase tracking-wider text-slate-500 mb-1">{label}</p>
        <p className={`text-sm font-medium ${valueClassName}`}>{value || '—'}</p>
      </div>
    </div>
  );
}


