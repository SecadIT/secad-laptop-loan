import { InventoryTable } from '@/components/inventory/inventory-table';

export default function InventoryPage() {
  return (
    <div className="container mx-auto max-w-7xl p-8">
      <h1 className="text-3xl font-bold mb-2">Inventory</h1>
      <p className="text-muted-foreground mb-6">
        View and manage the current inventory of laptops, including available stock and details of
        each item.
      </p>
      <InventoryTable />
    </div>
  );
}
