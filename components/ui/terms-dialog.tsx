'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';

interface TermsDialogProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  triggerText?: string;
  required?: boolean;
}

export function TermsDialog({
  checked,
  onCheckedChange,
  triggerText = 'View Terms & Conditions',
  required = true,
}: TermsDialogProps) {
  const [open, setOpen] = useState(false);

  const handleAccept = () => {
    onCheckedChange(true);
    setOpen(false);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-start space-x-3">
        <Checkbox
          id="acceptTerms"
          checked={checked}
          onCheckedChange={(checked) => onCheckedChange(checked === true)}
          required={required}
        />
        <div className="grid gap-1.5 leading-none">
          <Label
            htmlFor="acceptTerms"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            I accept the terms and conditions {required && '*'}
          </Label>
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger render={<Button variant="outline" type="button" className="w-full" />}>
          {triggerText}
        </DialogTrigger>
        <DialogContent className="max-w-full sm:max-w-2xl md:max-w-3xl lg:max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Terms and Conditions</DialogTitle>
            <DialogDescription>
              Please read and accept the following terms and conditions
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 text-sm">
            <p className="font-semibold">
              You are receiving this device on the understanding that you comply with the following
              terms, conditions and responsibilities:
            </p>

            <ul className="space-y-3 list-disc pl-6">
              <li>
                Any such IT equipment always remains under the ownership of SECAD Partnership CLG
                and will be returned upon request no later than the agreed return date.
              </li>
              <li>
                All IT equipment must be maintained and safeguarded in a safe and secure manner.
              </li>
              <li>Any distribution of the IT equipment to another person is not permitted.</li>
            </ul>

            <p className="font-semibold">Learner / borrowers are responsible for:</p>

            <ul className="space-y-2 list-disc pl-6">
              <li>Protecting the IT equipment from loss or damage,</li>
              <li>
                Not using IT equipment in an unreasonable or illegal manner, such as:
                <ul className="space-y-1 list-circle pl-6 mt-2">
                  <li>Improper use and servicing of the equipment.</li>
                  <li>Improper installation and/or upgrade of ancillary hardware.</li>
                  <li>Installation of any software not relevant to educational purposes,</li>
                </ul>
              </li>
              <li>
                Reporting, within 48 hours, any problems with the equipment (i.e. loss / theft /
                damage / device malfunction) during the loan period to: SECAD 021-461 34 32 or by
                emailing{' '}
                <a href="mailto:info@secad.ie" className="text-primary underline">
                  info@secad.ie
                </a>
              </li>
            </ul>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setOpen(false)} type="button">
              Close
            </Button>
            <Button onClick={handleAccept} type="button">
              Accept Terms
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
