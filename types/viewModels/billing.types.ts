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
  billingInfo: {
    id: string;
    fullName: string;
    country: string;
    addressLine1: string;
    addressLine2?: string;
    postalCode: string;
    city: string;
    taxIdType?: string;
    taxIdValue?: string;
  } | null;
  billingInfoLoading: boolean;
  billingInfoError: string | null;
  isSavingBillingInfo: boolean;
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
  reloadBillingInfo: () => Promise<void>;
  saveBillingInfo: (data: {
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

// Complete ViewModel interface
export interface BillingViewModel extends BillingState, BillingComputed, BillingActions {}
