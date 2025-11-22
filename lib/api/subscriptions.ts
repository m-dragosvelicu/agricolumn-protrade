import api from '@/lib/api/client';
import type {
  Subscription,
  SubscriptionPlan,
} from '@/types/subscription';

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
  ): Promise<{ paymentUrl: string }> {
    const response = await api.post<{ paymentUrl: string }>(
      '/subscriptions',
      { planId },
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
};
