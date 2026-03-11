'use client';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useStaffStore } from '@/lib/stores/staff-store';
import { LoanBrowserDialog } from '@/components/ui/loan-browser-dialog';
import { AssetBrowserDialog } from '@/components/ui/asset-browser-dialog';
import type { AssetRecord } from '@/lib/stores/asset-store';

interface IssueLaptopFormProps {
  onSuccess?: () => void;
}

export function IssueLaptopForm({ onSuccess }: IssueLaptopFormProps) {
  const [status, setStatus] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedDO, setSelectedDO] = useState<string>('');
  const [selectedIT, setSelectedIT] = useState<string>('');
  const [loanId, setLoanId] = useState<string>('');
  const [makeAndModel, setMakeAndModel] = useState<string>('');
  const [serialNumber, setSerialNumber] = useState<string>('');

  const { staff, loading: staffLoading, fetchStaff, getStaffByRole } = useStaffStore();

  // Fetch staff on component mount
  useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);

  // Get staff by role
  const developmentOfficers = getStaffByRole('DO');
  const itStaff = getStaffByRole('IT');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    setIsSubmitting(true);
    setStatus('');

    const formData = new FormData(form);
    const loanId = String(formData.get('loanId') ?? '');

    // Validate staff selections
    if (!selectedDO || !selectedIT) {
      setStatus('❌ Please select both development officer and IT assistant');
      setIsSubmitting(false);
      return;
    }

    // Get selected staff details
    const doDetails = staff.find((s) => s.User.Email === selectedDO);
    const itDetails = staff.find((s) => s.User.Email === selectedIT);

    if (!doDetails || !itDetails) {
      setStatus('❌ Staff members not found');
      setIsSubmitting(false);
      return;
    }

    try {
      // Step 1: Validate loan ID exists
      setStatus('🔍 Validating loan ID...');
      const validationResponse = await fetch('/api/validate-loan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ loanId }),
      });

      const validationResult = await validationResponse.json();

      if (!validationResult.ok || !validationResult.exists) {
        setStatus(`❌ Loan ID "${loanId}" not found. Please check and try again.`);
        setIsSubmitting(false);
        return;
      }

      // Step 2: Proceed with issue laptop submission
      setStatus('📤 Submitting issue laptop form...');
      const submitData = {
        loanId,
        makeAndModelOfDevice: String(formData.get('makeAndModelOfDevice') ?? ''),
        serialNumber: String(formData.get('serialNumber') ?? ''),
        itemsIncluded: String(formData.get('itemsIncluded') ?? ''),
        nameDOCollectingEquipment: doDetails.User.DisplayName,
        nameSecadITAssistant: itDetails.User.DisplayName,
      };

      const response = await fetch('/api/issue-laptop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData),
      });

      const result = await response.json();

      if (result.ok) {
        setStatus('✅ Form submitted successfully!');
        form.reset();
        setSelectedDO('');
        setSelectedIT('');
        setLoanId('');
        setMakeAndModel('');
        setSerialNumber('');
        onSuccess?.();
      } else {
        setStatus(`❌ Error: ${result.error || 'Failed to submit'}`);
        console.error('Submission error:', result);
      }
    } catch (error) {
      setStatus('❌ Network error - check console');
      console.error('Network error:', error);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      {/* Loan ID Section */}
      <div className="space-y-2">
        <Label htmlFor="loanId">Loan ID</Label>
        <Input
          id="loanId"
          name="loanId"
          type="text"
          placeholder="Enter loan ID"
          value={loanId}
          onChange={(e) => setLoanId(e.target.value)}
          required
        />
        <LoanBrowserDialog onSelectLoan={setLoanId} />
      </div>

      {/* Device Information Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Device Information</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="makeAndModelOfDevice">Make and Model of Device</Label>
            <Input
              id="makeAndModelOfDevice"
              name="makeAndModelOfDevice"
              type="text"
              placeholder="e.g., Dell Latitude 5420"
              value={makeAndModel}
              onChange={(e) => setMakeAndModel(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="serialNumber">Serial Number</Label>
            <Input
              id="serialNumber"
              name="serialNumber"
              type="text"
              placeholder="Enter serial number"
              value={serialNumber}
              onChange={(e) => setSerialNumber(e.target.value)}
              required
            />
            <AssetBrowserDialog
              onSelectAsset={(asset: AssetRecord) => {
                setSerialNumber(asset.SerialNumber || '');
                setMakeAndModel(
                  `${asset.Manufacturer?.Value || ''} ${asset.AssetType?.Value || ''}`.trim()
                );
              }}
              assetType="Laptop"
              statusFilter="Available"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="itemsIncluded">Items Included</Label>
          <Textarea
            id="itemsIncluded"
            name="itemsIncluded"
            placeholder="List all items included (e.g., charger, laptop bag, mouse)"
            required
            rows={4}
          />
        </div>
      </div>

      {/* Personnel Information Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Personnel Information</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Development Officer (Collecting Equipment)</Label>
            <Select value={selectedDO} onValueChange={(value) => setSelectedDO(value || '')}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select development officer" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {staffLoading ? (
                    <SelectItem value="loading" disabled>
                      Loading staff...
                    </SelectItem>
                  ) : developmentOfficers.length === 0 ? (
                    <SelectItem value="none" disabled>
                      No development officers found
                    </SelectItem>
                  ) : (
                    developmentOfficers.map((officer) => (
                      <SelectItem key={officer.ID} value={officer.User.Email}>
                        {officer.User.DisplayName}
                      </SelectItem>
                    ))
                  )}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>SECAD IT Assistant</Label>
            <Select value={selectedIT} onValueChange={(value) => setSelectedIT(value || '')}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select IT assistant" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {staffLoading ? (
                    <SelectItem value="loading" disabled>
                      Loading staff...
                    </SelectItem>
                  ) : itStaff.length === 0 ? (
                    <SelectItem value="none" disabled>
                      No IT staff found
                    </SelectItem>
                  ) : (
                    itStaff.map((staff) => (
                      <SelectItem key={staff.ID} value={staff.User.Email}>
                        {staff.User.DisplayName}
                      </SelectItem>
                    ))
                  )}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? 'Submitting...' : 'Submit'}
      </Button>

      {/* Status Message */}
      {status && (
        <div
          className={`p-4 rounded-md ${
            status.includes('✅')
              ? 'bg-green-50 text-green-800 border border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800'
              : 'bg-red-50 text-red-800 border border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800'
          }`}
        >
          {status}
        </div>
      )}
    </form>
  );
}
