// ViewModel State
export interface BillingState {
  subscription: {
    status: string;
    currentPeriodStart: string;
    currentPeriodEnd: string;
    plan: {
      name: string;
      price: number;
      currency: string;
      interval: string;
    };
    pendingPlan?: { id: string; name: string } | null;
    pendingPlanEffectiveDate?: string | null;
  } | null;
  isCancelling: boolean;
  isCancellingChange: boolean;
  localError: string | null;
}

// ViewModel Computed Values
export interface BillingComputed {
  statusLabel: string;
  showCancel: boolean;
  isCanceledWithAccess: boolean;
  hasScheduledChange: boolean;
  hasActiveSubscription: boolean;
  isInTrial: boolean;
}

// ViewModel Actions
export interface BillingActions {
  handleCancel: () => Promise<void>;
  handleCancelScheduledChange: () => Promise<void>;
  navigateBack: () => void;
  navigateToPricing: () => void;
  formatDate: (value?: string) => string;
}

// Complete ViewModel interface
export interface BillingViewModel extends BillingState, BillingComputed, BillingActions {}
