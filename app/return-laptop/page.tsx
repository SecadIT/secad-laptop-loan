import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ReturnLaptopForm } from '@/components/return-form/return-laptop-form';

export default function ReturnLaptopPage() {
  return (
    <div className="container mx-auto py-8 px-4 max-w-3xl">
      <Card>
        <CardHeader>
          <CardTitle>Return Laptop</CardTitle>
          <CardDescription>Process equipment returns and update asset availability</CardDescription>
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
  );
}
