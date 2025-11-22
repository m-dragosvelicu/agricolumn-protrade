'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { usersApi, UserListItem } from '@/lib/api/users';
import { subscriptionsApi } from '@/lib/api/subscriptions';
import { UserRole } from '@/types/auth';
import { Search, Users as UsersIcon, Mail, Shield, Calendar } from 'lucide-react';
import { Loader2 } from 'lucide-react';
import { format } from 'date-fns';

export default function UsersPage() {
  const [users, setUsers] = useState<UserListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [subscribedCount, setSubscribedCount] = useState<number | null>(null);
  const router = useRouter();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await usersApi.getAllUsers();
      setUsers(data);

      try {
        const stats = await subscriptionsApi.getAdminSubscriberStats();
        setSubscribedCount(stats.totalSubscribers);
      } catch (err: any) {
        if (err?.response?.status === 403) {
          // Not authorized to see subscriber stats; show users but no subscribed count
          setSubscribedCount(null);
        } else {
          throw err;
        }
      }
    } catch (err: any) {
      console.error('Failed to load users:', err);
      if (err?.response?.status === 403) {
        setError('You are not authorized to view users.');
      } else {
        setError(
          err?.response?.data?.message ||
            err?.message ||
            'Failed to load users.',
        );
      }
      setUsers([]);
      setSubscribedCount(null);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) {
      return users;
    }

    const query = searchQuery.toLowerCase();
    return users.filter((user) => {
      const emailMatch = user.email.toLowerCase().includes(query);
      const firstNameMatch = user.firstName?.toLowerCase().includes(query);
      const lastNameMatch = user.lastName?.toLowerCase().includes(query);
      const fullNameMatch = `${user.firstName || ''} ${user.lastName || ''}`.toLowerCase().includes(query);
      
      return emailMatch || firstNameMatch || lastNameMatch || fullNameMatch;
    });
  }, [users, searchQuery]);

  const getRoleBadgeColor = (role: string) => {
    return role === UserRole.ADMIN ? 'bg-amber-500' : 'bg-slate-600';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Users</h1>
        <p className="text-slate-400">
          Manage and search all registered users
        </p>
      </div>

      {error && (
        <p className="text-sm text-red-400">
          {error}
        </p>
      )}

      {/* Search Card */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Search Users</CardTitle>
          <CardDescription className="text-slate-400">
            Search by email, first name, or last name
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              type="text"
              placeholder="Search by email, first name, or last name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-slate-900 border-slate-700 text-white placeholder:text-slate-500"
            />
          </div>
          {searchQuery && (
            <p className="text-sm text-slate-400 mt-2">
              Found {filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white">All Users</CardTitle>
              <CardDescription className="text-slate-400">
                Total: {users.length} user{users.length !== 1 ? 's' : ''}{' '}
                {subscribedCount !== null && (
                  <span className="ml-1">
                    · Subscribed: {subscribedCount}
                  </span>
                )}
              </CardDescription>
            </div>
            <UsersIcon className="h-5 w-5 text-slate-400" />
          </div>
        </CardHeader>
        <CardContent>
          {filteredUsers.length === 0 ? (
            <div className="text-center py-12">
              <UsersIcon className="h-12 w-12 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400">
                {searchQuery ? 'No users found matching your search.' : 'No users found.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-700 hover:bg-slate-800/50">
                    <TableHead className="text-slate-300">Email</TableHead>
                    <TableHead className="text-slate-300">Name</TableHead>
                    <TableHead className="text-slate-300">Role</TableHead>
                    <TableHead className="text-slate-300">Status</TableHead>
                    <TableHead className="text-slate-300">Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow
                      key={user.id}
                      className="border-slate-700 hover:bg-slate-800/50 cursor-pointer"
                      onClick={() => router.push(`/admin/users/${user.id}`)}
                    >
                      <TableCell className="font-medium text-white">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-slate-400" />
                          {user.email}
                        </div>
                      </TableCell>
                      <TableCell className="text-slate-300">
                        {user.firstName || user.lastName
                          ? `${user.firstName || ''} ${user.lastName || ''}`.trim()
                          : '-'}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={`${getRoleBadgeColor(user.role)} text-white`}
                        >
                          <Shield className="h-3 w-3 mr-1" />
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={
                            user.isActive
                              ? 'bg-green-600 text-white'
                              : 'bg-red-600 text-white'
                          }
                        >
                          {user.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-slate-400">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          {format(new Date(user.createdAt), 'MMM dd, yyyy')}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
