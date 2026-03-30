'use client';
import { useState, useEffect } from 'react';
import { fetchApi } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useStaffStore } from '@/lib/stores/staff-store';
import { useLoanStore } from '@/lib/stores/loan-store';
import { useAssetStore } from '@/lib/stores/asset-store';
import { LoanBrowserDialog } from '@/components/ui/loan-browser-dialog';

interface ReturnLaptopFormProps {
  onSuccess?: () => void;
}

const CONDITION_OPTIONS = [
  { value: 'Good', label: 'Good - No visible damage' },
  { value: 'Fair', label: 'Fair - Minor wear and tear' },
  { value: 'Damaged', label: 'Damaged - Requires attention' },
];

const ITEMS_CHECKLIST = [
  'Laptop',
  'Charger',
  'Power Cable',
  'Laptop Bag',
  'Mouse',
  'Other Accessories',
];

export function ReturnLaptopForm({ onSuccess }: ReturnLaptopFormProps) {
  const [status, setStatus] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedWitness, setSelectedWitness] = useState<string>('');
  const [loanId, setLoanId] = useState<string>('');
  const [serialNumber, setSerialNumber] = useState<string>('');
  const [condition, setCondition] = useState<string>('');
  const [damageNotes, setDamageNotes] = useState<string>('');
  const [returnDate, setReturnDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [itemsReturned, setItemsReturned] = useState<Set<string>>(new Set(['Laptop']));
  const [confirmReturn, setConfirmReturn] = useState(false);

  const { staff, loading: staffLoading, fetchStaff } = useStaffStore();
  const { fetchLoans: refreshLoans } = useLoanStore();
  const { fetchAssets: refreshAssets } = useAssetStore();

  // Fetch staff on component mount
  useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);

  // Get all staff (IT + FOH)
  const allStaff = staff.filter((s) => s.Role?.Value === 'IT' || s.Role?.Value === 'FOH');

  const handleItemToggle = (item: string, checked: boolean) => {
    const newItems = new Set(itemsReturned);
    if (checked) {
      newItems.add(item);
    } else {
      newItems.delete(item);
    }
    setItemsReturned(newItems);
  };

  // Fetch serial number when loan ID changes
  useEffect(() => {
    async function fetchLoanDetails() {
      if (!loanId || isSubmitting) return;

      try {
        const response = await fetchApi('/api/validate-loan', {
          method: 'POST',
          body: JSON.stringify({ loanId }),
        });

        const result = await response.json();

        if (result.ok && result.exists && result.loan?.SerialNumber) {
          setSerialNumber(result.loan.SerialNumber);
        }
      } catch (error) {
        console.error('Failed to fetch loan details:', error);
      }
    }

    fetchLoanDetails();
  }, [loanId, isSubmitting]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    setIsSubmitting(true);
    setStatus('');

    const formData = new FormData(form);
    const loanId = String(formData.get('loanId') ?? '');

    // Validate witness selection
    if (!selectedWitness) {
      setStatus('❌ Please select a witness for the return');
      setIsSubmitting(false);
      return;
    }

    // Validate condition
    if (!condition) {
      setStatus('❌ Please select the equipment condition');
      setIsSubmitting(false);
      return;
    }

    // Validate items returned
    if (itemsReturned.size === 0) {
      setStatus('❌ Please select at least one item returned');
      setIsSubmitting(false);
      return;
    }

    // Validate confirmation
    if (!confirmReturn) {
      setStatus('❌ Please confirm the return details');
      setIsSubmitting(false);
      return;
    }

    // Validate damage notes if damaged
    if (condition === 'Damaged' && !damageNotes.trim()) {
      setStatus('❌ Please describe the damage');
      setIsSubmitting(false);
      return;
    }

    // Get witness details
    const witnessDetails = staff.find((s) => s.User.Email === selectedWitness);

    if (!witnessDetails) {
      setStatus('❌ Witness not found');
      setIsSubmitting(false);
      return;
    }

    try {
      // Step 1: Validate loan ID exists
      setStatus('🔍 Validating loan ID...');
      const validationResponse = await fetchApi('/api/validate-loan', {
        method: 'POST',
        body: JSON.stringify({ loanId }),
      });

      const validationResult = await validationResponse.json();

      if (!validationResult.ok || !validationResult.exists) {
        setStatus(`❌ Loan ID "${loanId}" not found. Please check and try again.`);
        setIsSubmitting(false);
        return;
      }

      const loanData = validationResult.loan;

      // Validate loan status
      const loanStatus = loanData?.IdentityandStatus?.Value;
      if (loanStatus !== 'Client Confirmed') {
        setStatus(
          `❌ This loan cannot be returned. Current status: "${loanStatus}". Only loans with status "Loaned Out" can be returned.`
        );
        setIsSubmitting(false);
        return;
      }

      // Extract serial number from loan
      const loanSerialNumber = loanData?.SerialNumber;
      if (!loanSerialNumber) {
        setStatus('❌ Serial number not found in loan record');
        setIsSubmitting(false);
        return;
      }

      // Step 2: Process the return
      setStatus('📥 Processing laptop return...');

      const returnResponse = await fetchApi('/api/return-laptop', {
        method: 'POST',
        body: JSON.stringify({
          loanId,
          serialNumber: loanSerialNumber,
          returnDate: new Date(returnDate).toISOString(),
          condition,
          damageNotes: condition === 'Damaged' ? damageNotes : '',
          itemsReturned: Array.from(itemsReturned).join(', '),
          witnessName: witnessDetails.User.DisplayName,
          witnessEmail: witnessDetails.User.Email,
        }),
      });

      const returnResult = await returnResponse.json();

      if (!returnResponse.ok) {
        setStatus(`❌ ${returnResult.error || 'Failed to process return'}`);
        setIsSubmitting(false);
        return;
      }

      // Step 3: Refresh data
      setStatus('🔄 Refreshing data...');
      await Promise.all([refreshLoans(true), refreshAssets(true)]);

      setStatus('✅ Laptop return processed successfully!');
      setIsSubmitting(false);

      // Reset form
      setTimeout(() => {
        form.reset();
        setLoanId('');
        setSerialNumber('');
        setCondition('');
        setDamageNotes('');
        setSelectedWitness('');
        setItemsReturned(new Set(['Laptop']));
        setConfirmReturn(false);
        setReturnDate(new Date().toISOString().split('T')[0]);
        setStatus('');
        if (onSuccess) onSuccess();
      }, 2000);
    } catch (error) {
      console.error('Return error:', error);
      setStatus('❌ An error occurred. Please try again.');
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Loan Selection */}
      <div className="space-y-2">
        <Label htmlFor="loanId">
          Loan ID <span className="text-red-500">*</span>
        </Label>
        <div className="flex gap-2">
          <Input
            id="loanId"
            name="loanId"
            type="text"
            placeholder="Enter loan ID"
            value={loanId}
            onChange={(e) => setLoanId(e.target.value)}
            required
            disabled={isSubmitting}
          />
          <LoanBrowserDialog
            onSelectLoan={(loanId) => {
              setLoanId(loanId);
              // Serial number will be fetched during validation
            }}
            statusFilter="Client Confirmed"
          />
        </div>
        {serialNumber && (
          <p className="text-sm text-muted-foreground">
            Serial Number: <span className="font-medium">{serialNumber}</span>
          </p>
        )}
      </div>

      {/* Return Date */}
      <div className="space-y-2">
        <Label htmlFor="returnDate">
          Return Date <span className="text-red-500">*</span>
        </Label>
        <Input
          id="returnDate"
          name="returnDate"
          type="date"
          value={returnDate}
          required
          disabled
          className="bg-muted"
        />
      </div>

      {/* Equipment Condition */}
      <div className="space-y-2">
        <Label htmlFor="condition">
          Equipment Condition <span className="text-red-500">*</span>
        </Label>
        <Select
          value={condition}
          onValueChange={(value) => setCondition(value || '')}
          disabled={isSubmitting}
        >
          <SelectTrigger id="condition">
            <SelectValue placeholder="Select equipment condition" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {CONDITION_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      {/* Damage Notes (Conditional) */}
      {condition === 'Damaged' && (
        <div className="space-y-2">
          <Label htmlFor="damageNotes">
            Damage Description <span className="text-red-500">*</span>
          </Label>
          <Textarea
            id="damageNotes"
            name="damageNotes"
            placeholder="Describe the damage in detail..."
            value={damageNotes}
            onChange={(e) => setDamageNotes(e.target.value)}
            required={condition === 'Damaged'}
            disabled={isSubmitting}
            rows={3}
          />
        </div>
      )}

      {/* Items Returned Checklist */}
      <div className="space-y-3">
        <Label>
          Items Returned <span className="text-red-500">*</span>
        </Label>
        <div className="space-y-2 border rounded p-4">
          {ITEMS_CHECKLIST.map((item) => (
            <div key={item} className="flex items-center space-x-2">
              <Checkbox
                id={`item-${item}`}
                checked={itemsReturned.has(item)}
                onCheckedChange={(checked) => handleItemToggle(item, checked as boolean)}
                disabled={isSubmitting || item === 'Laptop'}
              />
              <Label htmlFor={`item-${item}`} className="text-sm font-normal cursor-pointer">
                {item}
                {item === 'Laptop' && (
                  <span className="text-muted-foreground ml-1">(Required)</span>
                )}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Return Witness */}
      <div className="space-y-2">
        <Label htmlFor="witness">
          Return Witnessed By <span className="text-red-500">*</span>
        </Label>
        <Select
          value={selectedWitness}
          onValueChange={(value) => value && setSelectedWitness(value)}
          disabled={staffLoading || isSubmitting}
        >
          <SelectTrigger id="witness">
            <SelectValue placeholder="Select witness (IT or Front House staff)" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {allStaff.map((staffMember) => (
                <SelectItem key={staffMember.ID} value={staffMember.User.Email}>
                  {staffMember.User.DisplayName} - {staffMember.Role?.Value}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      {/* Confirmation */}
      <div className="flex items-start space-x-2 border rounded p-4 bg-muted/50">
        <Checkbox
          id="confirmReturn"
          checked={confirmReturn}
          onCheckedChange={(checked) => setConfirmReturn(checked as boolean)}
          disabled={isSubmitting}
        />
        <Label htmlFor="confirmReturn" className="text-sm font-normal cursor-pointer leading-tight">
          I confirm that I have inspected the returned equipment and the information above is
          accurate.
        </Label>
      </div>

      {/* Status Message */}
      {status && (
        <div
          className={`p-4 rounded ${
            status.includes('✅')
              ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200'
              : status.includes('❌')
                ? 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200'
                : 'bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200'
          }`}
        >
          {status}
        </div>
      )}

      {/* Submit Button */}
      <Button type="submit" disabled={isSubmitting} className="w-full" size="lg">
        {isSubmitting ? 'Processing Return...' : 'Process Laptop Return'}
      </Button>
    </form>
  );
}
