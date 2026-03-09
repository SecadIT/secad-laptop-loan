'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface IssueLaptopFormProps {
  onSuccess?: () => void;
}

export function IssueLaptopForm({ onSuccess }: IssueLaptopFormProps) {
  const [status, setStatus] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    setIsSubmitting(true);
    setStatus('');

    const formData = new FormData(form);

    const submitData = {
      loanId: String(formData.get('loanId') ?? ''),
      makeAndModelOfDevice: String(formData.get('makeAndModelOfDevice') ?? ''),
      serialNumber: String(formData.get('serialNumber') ?? ''),
      itemsIncluded: String(formData.get('itemsIncluded') ?? ''),
      nameDOCollectingEquipment: String(formData.get('nameDOCollectingEquipment') ?? ''),
      nameSecadITAssistant: String(formData.get('nameSecadITAssistant') ?? ''),
    };

    try {
      const response = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData),
      });

      const result = await response.json();

      if (result.ok) {
        setStatus('✅ Form submitted successfully!');
        form.reset();
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
        <Input id="loanId" name="loanId" type="text" placeholder="Enter loan ID" required />
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
              required
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
            <Label htmlFor="nameDOCollectingEquipment">Name (DO Collecting Equipment)</Label>
            <Input
              id="nameDOCollectingEquipment"
              name="nameDOCollectingEquipment"
              type="text"
              placeholder="Enter DO name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="nameSecadITAssistant">Name (SECAD IT Assistant)</Label>
            <Input
              id="nameSecadITAssistant"
              name="nameSecadITAssistant"
              type="text"
              placeholder="Enter IT assistant name"
              required
            />
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
