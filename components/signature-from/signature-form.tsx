'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { DatePicker } from '@/components/ui/date-picker';
import { SignatureCanvas } from '@/components/ui/signature-canvas';

interface SignatureFormProps {
  onSuccess?: () => void;
}

export function SignatureForm({ onSuccess }: SignatureFormProps) {
  const [status, setStatus] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [signatureDate, setSignatureDate] = useState<Date>();
  const [confirmReceipt, setConfirmReceipt] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreeSignature, setAgreeSignature] = useState(false);
  const [signatureData, setSignatureData] = useState<string>('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    setIsSubmitting(true);
    setStatus('');

    const formData = new FormData(form);

    // Validate checkboxes
    if (!confirmReceipt || !agreeTerms || !agreeSignature) {
      setStatus('❌ Please check all required checkboxes');
      setIsSubmitting(false);
      return;
    }

    // Validate date
    if (!signatureDate) {
      setStatus('❌ Please select signature date');
      setIsSubmitting(false);
      return;
    }

    const submitData = {
      loanId: String(formData.get('loanId') ?? ''),
      confirmReceipt: confirmReceipt,
      agreeTerms: agreeTerms,
      printedName: String(formData.get('printedName') ?? ''),
      agreeSignature: agreeSignature,
      signatureDate: signatureDate.toISOString(),
      signatureImage: signatureData, // Canvas signature data
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
        setSignatureDate(undefined);
        setConfirmReceipt(false);
        setAgreeTerms(false);
        setAgreeSignature(false);
        setSignatureData('');
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

      {/* Confirmation of Receipt Section */}
      <div className="space-y-4  pt-4">
        <h3 className="text-lg font-semibold">Confirm Receipt of Equipment</h3>

        <div className="flex items-start space-x-3">
          <Checkbox
            id="confirmReceipt"
            checked={confirmReceipt}
            onCheckedChange={(checked) => setConfirmReceipt(checked === true)}
          />
          <div className="grid gap-1.5 leading-none">
            <Label
              htmlFor="confirmReceipt"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              I Confirm receipt of equipment
            </Label>
          </div>
        </div>
      </div>

      {/* Client Agreement Section */}
      <div className="space-y-4  pt-4">
        <h3 className="text-lg font-semibold">
          Client Agreement - Request for Loan of Equipment by Learner/Client
        </h3>

        <div className="flex items-start space-x-3">
          <Checkbox
            id="agreeTerms"
            checked={agreeTerms}
            onCheckedChange={(checked) => setAgreeTerms(checked === true)}
          />
          <div className="grid gap-1.5 leading-none">
            <Label
              htmlFor="agreeTerms"
              className="text-sm font-normal leading-relaxed peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              I hereby agree and certify the terms, conditions and responsibilities when borrowing
              ICT equipment. I assume all risks of loss or damage and commit to returning equipment
              on or before agreed return date.
            </Label>
          </div>
        </div>
      </div>

      {/* Signature Section */}
      <div className="space-y-4  pt-4">
        <h3 className="text-lg font-semibold">Signature</h3>

        <div className="space-y-2">
          <Label htmlFor="printedName">Print Your Name</Label>
          <Input
            id="printedName"
            name="printedName"
            type="text"
            placeholder="Enter your full name"
            required
          />
        </div>

        {/* Signature Canvas Component */}
        <SignatureCanvas
          value={signatureData}
          onChange={setSignatureData}
          label="Draw Your Signature (Test)"
          height={200}
          showClearButton={true}
        />

        <div className="flex items-start space-x-3">
          <Checkbox
            id="agreeSignature"
            checked={agreeSignature}
            onCheckedChange={(checked) => setAgreeSignature(checked === true)}
          />
          <div className="grid gap-1.5 leading-none">
            <Label
              htmlFor="agreeSignature"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              I agree that my typed name serves as my electronic signature
            </Label>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Signature Date</Label>
          <DatePicker
            date={signatureDate}
            onDateChange={setSignatureDate}
            placeholder="Select signature date"
          />
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
