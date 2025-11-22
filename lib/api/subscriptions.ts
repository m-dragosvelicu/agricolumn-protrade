import api from '@/lib/api/client';
import type {
  Subscription,
  SubscriptionPlan,
  BillingInfo,
  CreateBillingInfoDto,
} from '@/types/subscription';

export interface AdminSubscriberStats {
  totalSubscribers: number;
  byStatus: Record<string, number>;
}

export const subscriptionsApi = {
  async getPlans(): Promise<SubscriptionPlan[]> {
    const response = await api.get<SubscriptionPlan[]>('/subscriptions/plans');
    return response.data;
  },

  async getCurrentSubscription(): Promise<Subscription | null> {
    const response = await api.get<{ subscription: Subscription | null }>(
      '/subscriptions/me',
    );
    return response.data.subscription;
  },

  async createSubscription(
    planId: string,
    billingInfo?: CreateBillingInfoDto,
  ): Promise<{ paymentUrl: string }> {
    const payload: Record<string, unknown> = { planId };
    if (billingInfo) {
      payload.billingInfo = billingInfo;
    }
    const response = await api.post<{ paymentUrl: string }>(
      '/subscriptions',
      payload,
    );
    return response.data;
  },

  async cancelSubscription(): Promise<Subscription> {
    const response = await api.delete<Subscription>('/subscriptions/me');
    return response.data;
  },

  async schedulePlanChange(planId: string): Promise<Subscription> {
    // Schedule a plan change to take effect at the next renewal
    // Backend route: POST /subscriptions/me/pending-plan
    const response = await api.post<Subscription>(
      '/subscriptions/me/pending-plan',
      {
        planId,
      },
    );
    return response.data;
  },

  async cancelScheduledChange(): Promise<Subscription> {
    // Backend route: DELETE /subscriptions/me/pending-plan
    const response = await api.delete<Subscription>(
      '/subscriptions/me/pending-plan',
    );
    return response.data;
  },

  async getBillingInfo(): Promise<BillingInfo | null> {
    const response = await api.get<{ billingInfo: BillingInfo | null }>(
      '/subscriptions/billing-info',
    );
    return response.data.billingInfo;
  },

  async upsertBillingInfo(
    data: CreateBillingInfoDto,
  ): Promise<BillingInfo> {
    const response = await api.put<{ billingInfo: BillingInfo }>(
      '/subscriptions/billing-info',
      data,
    );
    return response.data.billingInfo;
  },

  async getAdminSubscriberStats(): Promise<AdminSubscriberStats> {
    const response = await api.get<AdminSubscriberStats>(
      '/subscriptions/admin/stats',
    );
    return response.data;
  },
};
