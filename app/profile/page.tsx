'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Mail, Shield, LogOut, Lock, ArrowLeft, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
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
import { useProfileViewModel } from '@/hooks/viewModels';
import type { AuthSession } from '@/types/auth';

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <ProfileContent />
    </ProtectedRoute>
  );
}

/**
 * ProfileContent - View Component
 * Pure presentational component that renders UI based on ViewModel state
 */
function ProfileContent() {
  const vm = useProfileViewModel();

  if (!vm.user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-900 py-6 sm:py-10">
      <div className="container mx-auto px-4 sm:px-6 max-w-4xl">
        {/* Back Button */}
        <div className="mb-4">
          <Button
            variant="outline"
            size="sm"
            onClick={vm.navigateBack}
            className="border-slate-700 text-slate-300 hover:bg-slate-800"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </div>

        {/* Page Header */}
        <PageHeader logout={vm.logout} />

        <div className="space-y-6">
          {/* Profile Header Card */}
          <ProfileHeaderCard
            email={vm.user.email}
            role={vm.user.role}
            initials={vm.initials}
          />

          {/* Subscription Card */}
          <SubscriptionCard
            subscription={vm.subscription}
            hasActiveSubscription={vm.hasActiveSubscription}
            isInTrial={vm.isInTrial}
            isCanceledWithAccess={vm.isCanceledWithAccess}
            hasScheduledChange={vm.hasScheduledChange}
            formatDate={vm.formatDate}
            onManageSubscription={vm.navigateToBilling}
          />

          {/* Account Information Card */}
          <AccountInfoCard user={vm.user} />

          {/* Security Card */}
          <SecurityCard
            onChangePassword={vm.openChangePasswordDialog}
            sessions={vm.sessions}
            sessionsLoading={vm.sessionsLoading}
            sessionsError={vm.sessionsError}
            logoutOthersLoading={vm.logoutOthersLoading}
            onReloadSessions={vm.reloadSessions}
            onLogoutOthers={vm.logoutOtherSessions}
            formatDate={vm.formatDate}
          />
        </div>
      </div>

      {/* Change Password Dialog */}
      <ChangePasswordDialog
        isOpen={vm.isChangePasswordDialogOpen}
        onClose={vm.closeChangePasswordDialog}
        onSubmit={vm.handleChangePassword}
        isLoading={vm.isLoading}
        error={vm.error}
        success={vm.success}
        email={vm.user.email}
      />
    </div>
  );
}

// --- Sub-components ---

interface PageHeaderProps {
  logout: () => void;
}

function PageHeader({ logout }: PageHeaderProps) {
  return (
    <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Profile</h1>
        <p className="text-slate-400 text-sm sm:text-base">
          View and manage your account information
        </p>
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
  );
}

interface ProfileHeaderCardProps {
  email: string;
  role?: string;
  initials: string;
}

function ProfileHeaderCard({ email, role, initials }: ProfileHeaderCardProps) {
  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader>
        <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-4">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-slate-700 rounded-full flex items-center justify-center border-2 border-slate-600">
            <span className="text-xl sm:text-2xl font-bold text-white">{initials}</span>
          </div>
          <div className="flex-1 text-center sm:text-left">
            <CardTitle className="text-white text-xl sm:text-2xl mb-2 break-words">
              {email}
            </CardTitle>
            {role === 'ADMIN' && (
              <div className="flex items-center justify-center sm:justify-start space-x-2">
                <Badge variant="default" className="bg-amber-500 text-white">
                  <Shield className="w-3 h-3 mr-1" />
                  {role}
                </Badge>
              </div>
            )}
          </div>
        </div>
      </CardHeader>
    </Card>
  );
}

interface SubscriptionCardProps {
  subscription: any;
  hasActiveSubscription: boolean;
  isInTrial: boolean;
  isCanceledWithAccess: boolean;
  hasScheduledChange: boolean;
  formatDate: (value?: string) => string;
  onManageSubscription: () => void;
}

function SubscriptionCard({
  subscription,
  hasActiveSubscription,
  isInTrial,
  isCanceledWithAccess,
  hasScheduledChange,
  formatDate,
  onManageSubscription,
}: SubscriptionCardProps) {
  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white">Subscription</CardTitle>
        <CardDescription className="text-slate-400">
          Your current subscription status
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!subscription ? (
          <p className="text-sm text-slate-300">You do not have an active subscription yet.</p>
        ) : (
          <>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <p className="text-sm text-slate-400">Plan</p>
                <p className="text-base font-semibold text-white">{subscription.plan.name}</p>
                <p className="text-sm text-slate-300">
                  {subscription.plan.price.toLocaleString(undefined, {
                    style: 'currency',
                    currency: subscription.plan.currency,
                    maximumFractionDigits: 0,
                  })}{' '}
                  / {subscription.plan.interval === 'month' ? 'month' : 'year'}
                </p>
              </div>
              <Badge variant="outline" className="border-amber-500 text-amber-300 capitalize">
                {subscription.status.replace('_', ' ')}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-slate-400">
                {subscription.status === 'canceled' &&
                new Date(subscription.currentPeriodEnd) > new Date()
                  ? 'Access until'
                  : 'Next renewal'}
              </p>
              <p className="text-sm text-slate-200">{formatDate(subscription.currentPeriodEnd)}</p>
            </div>
            {hasActiveSubscription && !isCanceledWithAccess && (
              <p className="text-xs text-emerald-300">
                {isInTrial ? 'Your trial is active.' : 'Your subscription is active.'} Recurring
                billing is enabled.
              </p>
            )}
            {isCanceledWithAccess && (
              <p className="text-xs text-amber-300">
                Your subscription will end on {formatDate(subscription.currentPeriodEnd)}. You still
                have access until then, but it won&apos;t renew automatically.
              </p>
            )}
            {hasScheduledChange && (
              <div className="rounded-md border border-amber-500/40 bg-amber-500/10 p-3 text-xs text-amber-100">
                <p className="font-semibold text-amber-200">Scheduled plan change at renewal</p>
                <p className="mt-1">
                  Will switch to{' '}
                  <span className="font-semibold">
                    {subscription.pendingPlan?.name || 'new plan'}
                  </span>{' '}
                  on{' '}
                  {formatDate(
                    subscription.pendingPlanEffectiveDate || subscription.currentPeriodEnd
                  )}
                  .
                </p>
              </div>
            )}
          </>
        )}
        <Button
          variant="outline"
          className="border-slate-600 text-slate-200 hover:bg-slate-700"
          onClick={onManageSubscription}
        >
          Manage subscription
        </Button>
      </CardContent>
    </Card>
  );
}

interface AccountInfoCardProps {
  user: {
    email: string;
    role?: string;
    firstName?: string;
    lastName?: string;
  };
}

function AccountInfoCard({ user }: AccountInfoCardProps) {
  return (
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
              <Badge variant="default" className="bg-amber-500 text-white">
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
  );
}

interface SecurityCardProps {
  onChangePassword: () => void;
  sessions: AuthSession[];
  sessionsLoading: boolean;
  sessionsError: string | null;
  logoutOthersLoading: boolean;
  onReloadSessions: () => Promise<void>;
  onLogoutOthers: () => Promise<void>;
  formatDate: (value?: string) => string;
}

function SecurityCard({
  onChangePassword,
  sessions,
  sessionsLoading,
  sessionsError,
  logoutOthersLoading,
  onReloadSessions,
  onLogoutOthers,
  formatDate,
}: SecurityCardProps) {
  const hasOtherSessions = sessions.some((session) => !session.isCurrent);

  return (
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
              onClick={onChangePassword}
              className="text-sm text-amber-500 hover:text-amber-400 transition-colors text-left sm:text-right flex items-center gap-2"
            >
              <Lock className="w-4 h-4" />
              Change Password
            </button>
          </div>

          <div className="flex flex-col gap-3 p-4 bg-slate-900/50 rounded-lg border border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white">Active sessions</p>
                <p className="text-xs text-slate-400 mt-1">
                  Manage the devices that are currently logged in to your account.
                </p>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="border-slate-600 text-slate-200 hover:bg-slate-700"
                onClick={() => {
                  void onReloadSessions();
                }}
                disabled={sessionsLoading}
              >
                {sessionsLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  'Refresh'
                )}
              </Button>
            </div>

            {sessionsError && (
              <p className="text-xs text-red-400">{sessionsError}</p>
            )}

            <div className="space-y-2">
              {sessionsLoading && sessions.length === 0 ? (
                <p className="text-sm text-slate-400">Loading sessions…</p>
              ) : sessions.length === 0 ? (
                <p className="text-sm text-slate-400">
                  No active sessions found.
                </p>
              ) : (
                sessions.map((session) => (
                  <div
                    key={session.id}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border border-slate-700/60 rounded-md px-3 py-2 bg-slate-900/60"
                  >
                    <div className="space-y-0.5">
                      <p className="text-sm text-white">
                        {session.deviceName || 'Unknown device'}
                      </p>
                      <p className="text-xs text-slate-400">
                        Last active:{' '}
                        {session.lastActiveAt
                          ? formatDate(session.lastActiveAt)
                          : 'Unknown'}
                      </p>
                      {session.ipAddress && (
                        <p className="text-xs text-slate-500">
                          IP: {session.ipAddress}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {session.isCurrent && (
                        <Badge
                          variant="outline"
                          className="border-emerald-500 text-emerald-300"
                        >
                          Current device
                        </Badge>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="flex justify-end">
              <Button
                variant="outline"
                className="border-red-600/70 text-red-300 hover:bg-red-900/40"
                onClick={() => {
                  void onLogoutOthers();
                }}
                disabled={!hasOtherSessions || logoutOthersLoading}
              >
                {logoutOthersLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Logging out others…
                  </>
                ) : (
                  'Logout all other devices'
                )}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface ChangePasswordDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
  success: boolean;
  email: string;
}

function ChangePasswordDialog({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
  error,
  success,
  email,
}: ChangePasswordDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
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
              A password reset link has been sent to <strong>{email}</strong>. Please check your
              inbox and follow the instructions to reset your password.
            </AlertDescription>
          </Alert>
        )}

        <DialogFooter>
          {success ? (
            <Button onClick={onClose} className="bg-slate-700 hover:bg-slate-600 text-white">
              Close
            </Button>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={onClose}
                disabled={isLoading}
                className="border-slate-600 text-slate-300 hover:bg-slate-700"
              >
                Cancel
              </Button>
              <Button
                onClick={onSubmit}
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
  );
}
