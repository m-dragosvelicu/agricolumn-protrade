'use client';

import React from 'react';
import type { BillingInfo } from '@/types/subscription';
import { Button } from '@/components/ui/button';

interface BillingSummaryProps {
  billingInfo: BillingInfo;
  isSubmitting?: boolean;
  onEdit: () => void;
  onContinue: () => void;
}

export function BillingSummary({
  billingInfo,
  isSubmitting,
  onEdit,
  onContinue,
}: BillingSummaryProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-1 text-sm text-slate-200">
        <p className="font-medium text-white">{billingInfo.fullName}</p>
        <p>{billingInfo.addressLine1}</p>
        {billingInfo.addressLine2 && <p>{billingInfo.addressLine2}</p>}
        <p>
          {billingInfo.postalCode} {billingInfo.city}, {billingInfo.country}
        </p>
        {billingInfo.taxIdType && billingInfo.taxIdValue && (
          <p className="mt-2 text-xs text-slate-300">
            <span className="font-medium">Tax ID:</span>{' '}
            {billingInfo.taxIdValue} ({billingInfo.taxIdType})
          </p>
        )}
      </div>

      <p className="text-xs text-slate-400">
        We use this information on your invoices and tax receipts. Make sure it matches your legal
        business or personal details.
      </p>

      <div className="flex justify-end gap-3 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={onEdit}
          disabled={isSubmitting}
        >
          Edit details
        </Button>
        <Button
          type="button"
          onClick={onContinue}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Redirecting…' : 'Continue to payment'}
        </Button>
      </div>
    </div>
  );
}

