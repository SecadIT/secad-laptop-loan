import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ReturnLaptopForm } from '@/components/return-form/return-laptop-form';

export default function ReturnLaptopPage() {
  return (
    <main className="min-h-screen p-4 sm:p-6 md:p-10 ">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Return Laptop</h1>
          <p className="text-muted-foreground mt-2">
            Process equipment returns and update asset availability.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Return Laptop</CardTitle>
            <CardDescription>
              Process equipment returns and update asset availability
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ReturnLaptopForm />
          </CardContent>
        </Card>

        <div className="mt-6 p-4 border rounded-md bg-muted/30">
          <h3 className="font-semibold mb-2 text-sm">Return Process</h3>
          <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
            <li>Select the loan to return (must have status "Client Confirmed")</li>
            <li>Inspect the equipment and record its condition</li>
            <li>Check all items being returned</li>
            <li>If damaged, describe the damage in detail</li>
            <li>Select the staff member witnessing the return</li>
            <li>Confirm and submit the return</li>
          </ol>
          <p className="text-xs text-muted-foreground mt-3">
            This will update the loan status to "Returned" and mark the asset as "Available" in the
            inventory.
          </p>
        </div>
      </div>
    </main>
  );
}
