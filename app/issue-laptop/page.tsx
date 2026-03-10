'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Navigation } from '@/components/navigation';
import { IssueLaptopForm } from '@/components/issue-form/issue-laptop-form';

export default function IssueLaptopPage() {
  return (
    <>
      <main className="min-h-screen p-4 sm:p-6 md:p-10 ">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Issue Laptop</CardTitle>
              <CardDescription>
                Record device and personnel information when issuing a laptop.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <IssueLaptopForm />
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}
