'use client';

import React, { useState, FormEvent } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { BillingInfo, CreateBillingInfoDto, TaxIdType } from '@/types/subscription';
import { TAX_ID_OPTIONS } from '@/types/subscription';

interface BillingFormProps {
  initialData?: BillingInfo;
  onSubmit: (data: CreateBillingInfoDto) => Promise<void> | void;
  onCancel?: () => void;
  isSubmitting?: boolean;
  submitLabel?: string;
}

export function BillingForm({
  initialData,
  onSubmit,
  onCancel,
  isSubmitting,
  submitLabel = 'Save and continue',
}: BillingFormProps) {
  const [fullName, setFullName] = useState(initialData?.fullName ?? '');
  const [country, setCountry] = useState(initialData?.country ?? 'RO');
  const [addressLine1, setAddressLine1] = useState(initialData?.addressLine1 ?? '');
  const [addressLine2, setAddressLine2] = useState(initialData?.addressLine2 ?? '');
  const [postalCode, setPostalCode] = useState(initialData?.postalCode ?? '');
  const [city, setCity] = useState(initialData?.city ?? '');
  const [taxIdType, setTaxIdType] = useState<TaxIdType | 'NONE'>(
    initialData?.taxIdType ?? 'NONE',
  );
  const [taxIdValue, setTaxIdValue] = useState(initialData?.taxIdValue ?? '');

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    const payload: CreateBillingInfoDto = {
      fullName,
      country,
      addressLine1,
      addressLine2: addressLine2 || undefined,
      postalCode,
      city,
      taxIdType: taxIdType === 'NONE' ? undefined : taxIdType,
      taxIdValue: taxIdType === 'NONE' ? undefined : taxIdValue || undefined,
    };

    await onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="fullName">Full name (person or company)</Label>
        <Input
          id="fullName"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
          maxLength={200}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="country">Country</Label>
        <Select
          value={country}
          onValueChange={(value) => setCountry(value)}
        >
          <SelectTrigger id="country">
            <SelectValue placeholder="Select country" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="RO">Romania</SelectItem>
            <SelectItem value="DE">Germany</SelectItem>
            <SelectItem value="FR">France</SelectItem>
            <SelectItem value="BG">Bulgaria</SelectItem>
            <SelectItem value="HU">Hungary</SelectItem>
            <SelectItem value="PL">Poland</SelectItem>
            <SelectItem value="OTHER">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="addressLine1">Address line 1</Label>
        <Input
          id="addressLine1"
          value={addressLine1}
          onChange={(e) => setAddressLine1(e.target.value)}
          required
          maxLength={255}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="addressLine2">Address line 2 (optional)</Label>
        <Input
          id="addressLine2"
          value={addressLine2}
          onChange={(e) => setAddressLine2(e.target.value)}
          maxLength={255}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="postalCode">Postal code</Label>
          <Input
            id="postalCode"
            value={postalCode}
            onChange={(e) => setPostalCode(e.target.value)}
            required
            maxLength={20}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="city">City</Label>
          <Input
            id="city"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            required
            maxLength={100}
          />
        </div>
      </div>

      <div className="space-y-3 border-t border-slate-700/60 pt-4 mt-2">
        <div>
          <p className="text-sm font-medium text-white">Business tax ID (optional)</p>
          <p className="text-xs text-slate-400">
            If you provide a tax ID, the full name above should be your business&apos;s name.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="taxIdType">Tax ID type</Label>
          <Select
            value={taxIdType}
            onValueChange={(value) => setTaxIdType(value as TaxIdType | 'NONE')}
          >
            <SelectTrigger id="taxIdType">
              <SelectValue placeholder="Select tax ID type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="NONE">No tax ID</SelectItem>
              {TAX_ID_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {taxIdType && taxIdType !== 'NONE' && (
          <div className="space-y-2">
            <Label htmlFor="taxIdValue">Tax ID value</Label>
            <Input
              id="taxIdValue"
              value={taxIdValue}
              onChange={(e) => setTaxIdValue(e.target.value)}
              required={!!taxIdType}
              maxLength={50}
              placeholder="e.g., RO1234567891"
            />
          </div>
        )}
      </div>

      <div className="flex justify-end gap-3 pt-4">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
