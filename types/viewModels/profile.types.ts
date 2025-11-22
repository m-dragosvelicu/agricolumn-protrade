// ViewModel State
export interface ProfileState {
  user: {
    email: string;
    role?: string;
    firstName?: string;
    lastName?: string;
  } | null;
  subscription: {
    status: string;
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
  isChangePasswordDialogOpen: boolean;
  isLoading: boolean;
  error: string | null;
  success: boolean;
}

// ViewModel Computed Values
export interface ProfileComputed {
  initials: string;
  isCanceledWithAccess: boolean;
  hasScheduledChange: boolean;
  hasActiveSubscription: boolean;
  isInTrial: boolean;
}

// ViewModel Actions
export interface ProfileActions {
  openChangePasswordDialog: () => void;
  closeChangePasswordDialog: () => void;
  handleChangePassword: () => Promise<void>;
  logout: () => void;
  navigateBack: () => void;
  navigateToBilling: () => void;
  formatDate: (value?: string) => string;
}

// Complete ViewModel interface
export interface ProfileViewModel extends ProfileState, ProfileComputed, ProfileActions {}
