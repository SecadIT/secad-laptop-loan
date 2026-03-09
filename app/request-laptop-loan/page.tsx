'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Navigation } from '@/components/navigation';
import { LaptopRequestForm } from '@/components/request-form/laptop-request-form';

export default function RequestLaptopLoanPage() {
  return (
    <>
      <Navigation />
      <main className="min-h-screen p-4 sm:p-6 md:p-10 ">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Equipment Loan Request Form</CardTitle>
              <CardDescription>
                Please fill out all required fields to submit your equipment loan request.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LaptopRequestForm />
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}
