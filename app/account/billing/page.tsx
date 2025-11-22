'use client';

import React from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Loader2, ArrowLeft } from 'lucide-react';
import { useBillingViewModel } from '@/hooks/viewModels';
import { BillingForm } from '@/components/subscriptions/BillingForm';

export default function BillingPage() {
  return (
    <ProtectedRoute>
      <BillingContent />
    </ProtectedRoute>
  );
}

/**
 * BillingContent - View Component
 * Pure presentational component that renders UI based on ViewModel state
 */
function BillingContent() {
  const vm = useBillingViewModel();

  return (
    <div className="min-h-screen bg-slate-900 py-8">
      <div className="container mx-auto px-4 sm:px-6 max-w-3xl">
        {/* Header */}
        <BillingHeader onBack={vm.navigateBack} />

        {/* Error Alert */}
        {vm.localError && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{vm.localError}</AlertDescription>
          </Alert>
        )}

        {/* Subscription Card */}
        <SubscriptionCard
          subscription={vm.subscription}
          statusLabel={vm.statusLabel}
          hasActiveSubscription={vm.hasActiveSubscription}
          isInTrial={vm.isInTrial}
          isCanceledWithAccess={vm.isCanceledWithAccess}
          hasScheduledChange={vm.hasScheduledChange}
          showCancel={vm.showCancel}
          isCancelling={vm.isCancelling}
          isCancellingChange={vm.isCancellingChange}
          formatDate={vm.formatDate}
          onCancel={vm.handleCancel}
          onCancelScheduledChange={vm.handleCancelScheduledChange}
          onChangePlan={vm.navigateToPricing}
        />

        {/* Billing Info Card */}
        <BillingInfoCard
          billingInfo={vm.billingInfo}
          loading={vm.billingInfoLoading}
          error={vm.billingInfoError}
          isSaving={vm.isSavingBillingInfo}
          reload={vm.reloadBillingInfo}
          onSave={vm.saveBillingInfo}
        />
      </div>
    </div>
  );
}

// --- Sub-components ---

interface BillingHeaderProps {
  onBack: () => void;
}

function BillingHeader({ onBack }: BillingHeaderProps) {
  return (
    <div className="mb-6 flex items-center justify-between">
      <Button
        variant="outline"
        size="sm"
        onClick={onBack}
        className="border-slate-700 text-slate-300 hover:bg-slate-800"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back
      </Button>
      <h1 className="text-2xl sm:text-3xl font-bold text-white">Billing</h1>
    </div>
  );
}

interface SubscriptionCardProps {
  subscription: any;
  statusLabel: string;
  hasActiveSubscription: boolean;
  isInTrial: boolean;
  isCanceledWithAccess: boolean;
  hasScheduledChange: boolean;
  showCancel: boolean;
  isCancelling: boolean;
  isCancellingChange: boolean;
  formatDate: (value?: string) => string;
  onCancel: () => Promise<void>;
  onCancelScheduledChange: () => Promise<void>;
  onChangePlan: () => void;
}

function SubscriptionCard({
  subscription,
  statusLabel,
  hasActiveSubscription,
  isInTrial,
  isCanceledWithAccess,
  hasScheduledChange,
  showCancel,
  isCancelling,
  isCancellingChange,
  formatDate,
  onCancel,
  onCancelScheduledChange,
  onChangePlan,
}: SubscriptionCardProps) {
  return (
    <Card className="bg-slate-800 border-slate-700 mb-6">
      <CardHeader>
        <CardTitle className="text-white">Subscription</CardTitle>
        <CardDescription className="text-slate-400">
          View and manage your subscription
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!subscription ? (
          <NoSubscription onChangePlan={onChangePlan} />
        ) : (
          <>
            {/* Plan Info */}
            <PlanInfo subscription={subscription} statusLabel={statusLabel} />

            {/* Period Info */}
            <PeriodInfo subscription={subscription} formatDate={formatDate} />

            {/* Scheduled Change */}
            {hasScheduledChange && (
              <ScheduledChangeInfo
                subscription={subscription}
                formatDate={formatDate}
                isCancellingChange={isCancellingChange}
                onCancelScheduledChange={onCancelScheduledChange}
              />
            )}

            {/* Status Messages */}
            <StatusMessages
              subscription={subscription}
              hasActiveSubscription={hasActiveSubscription}
              isInTrial={isInTrial}
              isCanceledWithAccess={isCanceledWithAccess}
              formatDate={formatDate}
            />

            {/* Actions */}
            <SubscriptionActions
              subscription={subscription}
              showCancel={showCancel}
              isCancelling={isCancelling}
              onCancel={onCancel}
              onChangePlan={onChangePlan}
            />
          </>
        )}
      </CardContent>
    </Card>
  );
}

interface NoSubscriptionProps {
  onChangePlan: () => void;
}

function NoSubscription({ onChangePlan }: NoSubscriptionProps) {
  return (
    <>
      <div className="text-slate-300">You do not have an active subscription.</div>
      <Button
        variant="outline"
        className="border-slate-600 text-slate-200 hover:bg-slate-700"
        onClick={onChangePlan}
      >
        Choose a plan
      </Button>
    </>
  );
}

interface PlanInfoProps {
  subscription: any;
  statusLabel: string;
}

function PlanInfo({ subscription, statusLabel }: PlanInfoProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div>
        <p className="text-sm text-slate-400">Current plan</p>
        <p className="text-lg font-semibold text-white">{subscription.plan.name}</p>
        <p className="text-sm text-slate-300">
          {subscription.plan.price.toLocaleString(undefined, {
            style: 'currency',
            currency: subscription.plan.currency,
            maximumFractionDigits: 0,
          })}{' '}
          / {subscription.plan.interval === 'month' ? 'month' : 'year'}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Badge variant="outline" className="border-amber-500 text-amber-300">
          {statusLabel}
        </Badge>
      </div>
    </div>
  );
}

interface PeriodInfoProps {
  subscription: any;
  formatDate: (value?: string) => string;
}

function PeriodInfo({ subscription, formatDate }: PeriodInfoProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div>
        <p className="text-sm text-slate-400">Current period</p>
        <p className="text-sm text-slate-200">
          {formatDate(subscription.currentPeriodStart)} – {formatDate(subscription.currentPeriodEnd)}
        </p>
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
    </div>
  );
}

interface ScheduledChangeInfoProps {
  subscription: any;
  formatDate: (value?: string) => string;
  isCancellingChange: boolean;
  onCancelScheduledChange: () => Promise<void>;
}

function ScheduledChangeInfo({
  subscription,
  formatDate,
  isCancellingChange,
  onCancelScheduledChange,
}: ScheduledChangeInfoProps) {
  return (
    <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-sm text-amber-200">
      <p className="font-semibold">Scheduled plan change at renewal</p>
      <p className="mt-1">
        Will switch to{' '}
        <span className="font-semibold">{subscription.pendingPlan?.name || 'new plan'}</span> on{' '}
        {formatDate(subscription.pendingPlanEffectiveDate || subscription.currentPeriodEnd)}.
      </p>
      <div className="mt-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onCancelScheduledChange}
          disabled={isCancellingChange}
          className="border-amber-400 text-amber-200 hover:bg-amber-500/20"
        >
          {isCancellingChange ? 'Cancelling...' : 'Cancel scheduled change'}
        </Button>
      </div>
    </div>
  );
}

interface StatusMessagesProps {
  subscription: any;
  hasActiveSubscription: boolean;
  isInTrial: boolean;
  isCanceledWithAccess: boolean;
  formatDate: (value?: string) => string;
}

function StatusMessages({
  subscription,
  hasActiveSubscription,
  isInTrial,
  isCanceledWithAccess,
  formatDate,
}: StatusMessagesProps) {
  return (
    <>
      {hasActiveSubscription && !isCanceledWithAccess && (
        <p className="text-sm text-emerald-300">
          {isInTrial ? 'Your trial is active.' : 'Your subscription is active.'} Recurring billing
          is enabled.
        </p>
      )}

      {isCanceledWithAccess && (
        <p className="text-sm text-amber-300">
          Your subscription will end on {formatDate(subscription.currentPeriodEnd)}. You still have
          access until then, but it won&apos;t renew automatically.
        </p>
      )}

      {subscription.status === 'past_due' && (
        <Alert variant="destructive">
          <AlertDescription>
            Your last payment attempt failed. Please update your subscription to restore full
            access.
          </AlertDescription>
        </Alert>
      )}

      {subscription.status === 'unpaid' && (
        <Alert variant="destructive">
          <AlertDescription>
            Your subscription is unpaid. Please create a new subscription to regain access.
          </AlertDescription>
        </Alert>
      )}

      {!hasActiveSubscription && subscription.status === 'expired' && (
        <Alert variant="destructive">
          <AlertDescription>
            Your subscription has expired. Create a new subscription to regain access.
          </AlertDescription>
        </Alert>
      )}
    </>
  );
}

interface SubscriptionActionsProps {
  subscription: any;
  showCancel: boolean;
  isCancelling: boolean;
  onCancel: () => Promise<void>;
  onChangePlan: () => void;
}

function SubscriptionActions({
  subscription,
  showCancel,
  isCancelling,
  onCancel,
  onChangePlan,
}: SubscriptionActionsProps) {
  return (
    <div className="flex flex-wrap gap-3 pt-2">
      <Button
        variant="outline"
        className="border-slate-600 text-slate-200 hover:bg-slate-700"
        onClick={onChangePlan}
      >
        {subscription ? 'Change plan' : 'Choose a plan'}
      </Button>

      {showCancel && (
        <Button variant="destructive" onClick={onCancel} disabled={isCancelling}>
          {isCancelling ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Cancelling...
            </>
          ) : (
            'Cancel subscription'
          )}
        </Button>
      )}
    </div>
  );
}

interface BillingInfoCardProps {
  billingInfo: any;
  loading: boolean;
  error: string | null;
  isSaving: boolean;
  reload: () => Promise<void>;
  onSave: (data: {
    fullName: string;
    country: string;
    addressLine1: string;
    addressLine2?: string;
    postalCode: string;
    city: string;
    taxIdType?: string;
    taxIdValue?: string;
  }) => Promise<void>;
}

function BillingInfoCard({
  billingInfo,
  loading,
  error,
  isSaving,
  reload,
  onSave,
}: BillingInfoCardProps) {
  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <div>
          <CardTitle className="text-white">Billing information</CardTitle>
          <CardDescription className="text-slate-400">
            Details used on your invoices and tax receipts. Make sure they match your legal business or personal information.
          </CardDescription>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="border-slate-600 text-slate-200 hover:bg-slate-700"
          onClick={() => {
            void reload();
          }}
          disabled={loading}
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            'Refresh'
          )}
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {loading && !billingInfo ? (
          <div className="flex items-center justify-center py-6 text-slate-300">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            <span>Loading billing information...</span>
          </div>
        ) : (
          <BillingForm
            initialData={billingInfo || undefined}
            onSubmit={onSave}
            isSubmitting={isSaving}
            submitLabel="Save billing information"
          />
        )}
      </CardContent>
    </Card>
  );
}
