'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { DatePicker } from '@/components/ui/date-picker';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface LaptopRequestFormProps {
  onSuccess?: () => void;
}

export function LaptopRequestForm({ onSuccess }: LaptopRequestFormProps) {
  const [status, setStatus] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [equipmentLoanDate, setEquipmentLoanDate] = useState<Date>();
  const [returnDate, setReturnDate] = useState<Date>();
  const [selectedProgram, setSelectedProgram] = useState<string>('');
  const [selectedApprover, setSelectedApprover] = useState<string>('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    setIsSubmitting(true);
    setStatus('');

    const formData = new FormData(form);

    // Validate dates
    if (!equipmentLoanDate || !returnDate) {
      setStatus('❌ Please select both equipment loan date and return date');
      setIsSubmitting(false);
      return;
    }

    // Validate select fields
    if (!selectedProgram || !selectedApprover) {
      setStatus('❌ Please select both program and approver');
      setIsSubmitting(false);
      return;
    }

    const submitData = {
      developmentOfficerEmail: String(formData.get('developmentOfficerEmail') ?? ''),
      developmentOfficerName: String(formData.get('developmentOfficerName') ?? ''),
      clientName: String(formData.get('clientName') ?? ''),
      clientEmail: String(formData.get('clientEmail') ?? ''),
      clientAddress: String(formData.get('clientAddress') ?? ''),
      courseProvider: String(formData.get('courseProvider') ?? ''),
      courseName: String(formData.get('courseName') ?? ''),
      courseDuration: String(formData.get('courseDuration') ?? ''),
      courseQualification: String(formData.get('courseQualification') ?? ''),
      selectedApprover: selectedApprover,
      additionalNotes: String(formData.get('additionalNotes') ?? ''),
      program: selectedProgram,
      equipmentLoanDate: equipmentLoanDate.toISOString(),
      agreedEquipmentReturnDate: returnDate.toISOString(),
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
        setEquipmentLoanDate(undefined);
        setReturnDate(undefined);
        setSelectedProgram('');
        setSelectedApprover('');
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
      {/* Development Officer Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Development Officer Information</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-muted-foreground" htmlFor="developmentOfficerName">
              Development Officer Name
            </Label>
            <Input
              id="developmentOfficerName"
              name="developmentOfficerName"
              type="text"
              placeholder="Enter officer name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label className="text-muted-foreground" htmlFor="developmentOfficerEmail">
              Development Officer Email
            </Label>
            <Input
              id="developmentOfficerEmail"
              name="developmentOfficerEmail"
              type="email"
              placeholder="officer@example.com"
              required
            />
          </div>
        </div>
      </div>

      {/* Client Information Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Client Information</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-muted-foreground" htmlFor="clientName">
              Client Name
            </Label>
            <Input
              id="clientName"
              name="clientName"
              type="text"
              placeholder="Enter client name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label className="text-muted-foreground" htmlFor="clientEmail">
              Client Email
            </Label>
            <Input
              id="clientEmail"
              name="clientEmail"
              type="email"
              placeholder="client@example.com"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-muted-foreground" htmlFor="clientAddress">
            Client Address
          </Label>
          <Textarea
            id="clientAddress"
            name="clientAddress"
            placeholder="Enter client address"
            required
            rows={3}
          />
        </div>
      </div>

      {/* Course Information Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Course Information</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-muted-foreground" htmlFor="courseProvider">
              Course Provider
            </Label>
            <Input
              id="courseProvider"
              name="courseProvider"
              type="text"
              placeholder="Enter course provider"
              required
            />
          </div>

          <div className="space-y-2">
            <Label className="text-muted-foreground" htmlFor="courseName">
              Course Name
            </Label>
            <Input
              id="courseName"
              name="courseName"
              type="text"
              placeholder="Enter course name"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-muted-foreground" htmlFor="courseDuration">
              Course Duration
            </Label>
            <Input
              id="courseDuration"
              name="courseDuration"
              type="text"
              placeholder="e.g., 6 months"
              required
            />
          </div>

          <div className="space-y-2">
            <Label className="text-muted-foreground" htmlFor="courseQualification">
              Course Qualification
            </Label>
            <Input
              id="courseQualification"
              name="courseQualification"
              type="text"
              placeholder="Enter qualification"
              required
            />
          </div>
        </div>
      </div>

      {/* Program and Approver Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Program Details</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-muted-foreground">Program</Label>
            <Select
              value={selectedProgram}
              onValueChange={(value) => setSelectedProgram(value || '')}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a program" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="sicap-employment">
                    SICAP Employment Supports & Training
                  </SelectItem>
                  <SelectItem value="sicap-community">SICAP Community & Wellbeing</SelectItem>
                  <SelectItem value="tus-rss">Tus/RSS</SelectItem>
                  <SelectItem value="amif">AMIF</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-muted-foreground">Selected Approver</Label>
            <Select
              value={selectedApprover}
              onValueChange={(value) => setSelectedApprover(value || '')}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select an approver" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="saad.abdillahi@secad.ie">saad.abdillahi@secad.ie</SelectItem>
                  <SelectItem value="mmontagne@secad.ie">mmontagne@secad.ie</SelectItem>
                  <SelectItem value="info@secad.ie">info@secad.ie</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Equipment Loan Dates Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Equipment Loan Period</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-muted-foreground">Equipment Loan Date</Label>
            <DatePicker
              date={equipmentLoanDate}
              onDateChange={setEquipmentLoanDate}
              placeholder="Select loan date"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-muted-foreground">Agreed Equipment Return Date</Label>
            <DatePicker
              date={returnDate}
              onDateChange={setReturnDate}
              placeholder="Select return date"
            />
          </div>
        </div>
      </div>

      {/* Additional Notes Section */}
      <div className="space-y-2">
        <Label className="text-muted-foreground" htmlFor="additionalNotes">
          Additional Notes
        </Label>
        <Textarea
          id="additionalNotes"
          name="additionalNotes"
          placeholder="Enter any additional notes or comments"
          rows={4}
        />
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
