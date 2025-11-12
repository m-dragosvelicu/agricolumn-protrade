'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/auth/auth-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Mail, Shield, LogOut, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { authApi } from '@/lib/api/auth';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <ProfileContent />
    </ProtectedRoute>
  );
}

function ProfileContent() {
  const { user, logout } = useAuth();
  const [isChangePasswordDialogOpen, setIsChangePasswordDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!user) {
    return null;
  }

  const handleChangePassword = async () => {
    setError(null);
    setSuccess(false);
    setIsLoading(true);

    try {
      await authApi.changePassword();
      setSuccess(true);
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          'Failed to send password reset email. Please try again.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDialogClose = () => {
    setIsChangePasswordDialogOpen(false);
    setError(null);
    setSuccess(false);
  };

  const getInitials = (email: string) => {
    return email
      .split('@')[0]
      .substring(0, 2)
      .toUpperCase();
  };

  return (
    <div className="min-h-screen bg-slate-900 py-6 sm:py-10">
      <div className="container mx-auto px-4 sm:px-6 max-w-4xl">
        <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Profile</h1>
            <p className="text-slate-400 text-sm sm:text-base">View and manage your account information</p>
          </div>
          <Button
            onClick={logout}
            variant="destructive"
            className="bg-red-600 hover:bg-red-700 w-full sm:w-auto"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>

        <div className="space-y-6">
          {/* Profile Header Card */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-4">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-slate-700 rounded-full flex items-center justify-center border-2 border-slate-600">
                  <span className="text-xl sm:text-2xl font-bold text-white">
                    {getInitials(user.email)}
                  </span>
                </div>
                <div className="flex-1 text-center sm:text-left">
                  <CardTitle className="text-white text-xl sm:text-2xl mb-2 break-words">
                    {user.email}
                  </CardTitle>
                  {user.role === 'ADMIN' && (
                    <div className="flex items-center justify-center sm:justify-start space-x-2">
                      <Badge
                        variant="default"
                        className="bg-amber-500 text-white"
                      >
                        <Shield className="w-3 h-3 mr-1" />
                        {user.role}
                      </Badge>
                    </div>
                  )}
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Account Information */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Account Information</CardTitle>
              <CardDescription className="text-slate-400">
                Your account details and settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-slate-400">
                    <Mail className="w-4 h-4" />
                    <span className="text-sm font-medium">Email Address</span>
                  </div>
                  <p className="text-white break-words">{user.email}</p>
                </div>

                {user.role === 'ADMIN' && (
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-slate-400">
                      <Shield className="w-4 h-4" />
                      <span className="text-sm font-medium">Role</span>
                    </div>
                    <Badge
                      variant="default"
                      className="bg-amber-500 text-white"
                    >
                      {user.role}
                    </Badge>
                  </div>
                )}

                {user.firstName && (
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-slate-400">
                      <Mail className="w-4 h-4" />
                      <span className="text-sm font-medium">First Name</span>
                    </div>
                    <p className="text-white">{user.firstName}</p>
                  </div>
                )}

                {user.lastName && (
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-slate-400">
                      <Mail className="w-4 h-4" />
                      <span className="text-sm font-medium">Last Name</span>
                    </div>
                    <p className="text-white">{user.lastName}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Security Information */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Security</CardTitle>
              <CardDescription className="text-slate-400">
                Manage your account security settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 bg-slate-900/50 rounded-lg border border-slate-700">
                  <div>
                    <p className="text-sm font-medium text-white">Password</p>
                    <p className="text-xs text-slate-400 mt-1">
                      Change your password via email verification
                    </p>
                  </div>
                  <button
                    onClick={() => setIsChangePasswordDialogOpen(true)}
                    className="text-sm text-amber-500 hover:text-amber-400 transition-colors text-left sm:text-right flex items-center gap-2"
                  >
                    <Lock className="w-4 h-4" />
                    Change Password
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Change Password Dialog */}
      <Dialog open={isChangePasswordDialogOpen} onOpenChange={handleDialogClose}>
        <DialogContent className="bg-slate-800 border-slate-700 text-white">
          <DialogHeader>
            <DialogTitle className="text-white">Change Password</DialogTitle>
            <DialogDescription className="text-slate-400">
              {success
                ? 'A password reset link has been sent to your email address.'
                : 'We will send a password reset link to your email address. Click the link in the email to set a new password.'}
            </DialogDescription>
          </DialogHeader>

          {error && (
            <Alert variant="destructive" className="bg-red-900/20 border-red-700">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-red-200">{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="bg-green-900/20 border-green-700">
              <CheckCircle2 className="h-4 w-4 text-green-400" />
              <AlertDescription className="text-green-200">
                A password reset link has been sent to <strong>{user.email}</strong>. 
                Please check your inbox and follow the instructions to reset your password.
              </AlertDescription>
            </Alert>
          )}

          <DialogFooter>
            {success ? (
              <Button
                onClick={handleDialogClose}
                className="bg-slate-700 hover:bg-slate-600 text-white"
              >
                Close
              </Button>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={handleDialogClose}
                  disabled={isLoading}
                  className="border-slate-600 text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleChangePassword}
                  disabled={isLoading}
                  className="bg-amber-500 hover:bg-amber-600 text-white"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Mail className="mr-2 h-4 w-4" />
                      Send Reset Link
                    </>
                  )}
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

