export type SubscriptionStatus =
  | 'trialing'
  | 'active'
  | 'past_due'
  | 'canceled'
  | 'unpaid'
  | 'expired';

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  interval: 'month' | 'year';
  description?: string;
}

export interface Subscription {
  id: string;
  status: SubscriptionStatus;
  plan: SubscriptionPlan;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd?: boolean;
  // Optional scheduled change to apply at the next renewal
  pendingPlan?: SubscriptionPlan;
  pendingPlanEffectiveDate?: string;
}

export type TaxIdType = 'EU_VAT' | 'RO_TAX_ID' | 'EU_OSS_VAT';

export interface BillingInfo {
  id: string;
  fullName: string;
  country: string;
  addressLine1: string;
  addressLine2?: string;
  postalCode: string;
  city: string;
  taxIdType?: TaxIdType;
  taxIdValue?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBillingInfoDto {
  fullName: string;
  country: string;
  addressLine1: string;
  addressLine2?: string;
  postalCode: string;
  city: string;
  taxIdType?: TaxIdType;
  taxIdValue?: string;
}

export const TAX_ID_OPTIONS: Array<{ value: TaxIdType; label: string }> = [
  { value: 'EU_VAT', label: 'European VAT number' },
  { value: 'RO_TAX_ID', label: 'Romanian tax ID number' },
  { value: 'EU_OSS_VAT', label: 'European One Stop Shop VAT number' },
];
