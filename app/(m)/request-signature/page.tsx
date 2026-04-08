'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Navigation } from '@/components/navigation';
import { SignatureForm } from '@/components/signature-from/signature-form';

export default function RequestSignaturePage() {
  return (
    <>
      <main className="min-h-screen p-4 sm:p-6 md:p-10 ">
        <div className="max-w-6xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold">Request Signature</h1>
            <p className="text-muted-foreground mt-2">
              Please review and sign the equipment loan agreement.
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>
                Confirmation of Receipt of Equipment Loan from SECAD by Learner/Client
              </CardTitle>
              <CardDescription>
                Please review and sign the equipment loan agreement.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SignatureForm />
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}
