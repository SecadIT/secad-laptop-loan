'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Navigation } from '@/components/navigation';
import { IssueLaptopForm } from '@/components/issue-form/issue-laptop-form';

export default function IssueLaptopPage() {
  return (
    <>
      <main className="min-h-screen p-4 sm:p-6 md:p-10 ">
        <div className="max-w-5xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold">Issue Laptop</h1>
            <p className="text-muted-foreground mt-2">
              Record device and personnel information when issuing a laptop.
            </p>
          </div>
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
