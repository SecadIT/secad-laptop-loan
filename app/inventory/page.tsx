import { InventoryTable } from '@/components/inventory/inventory-table';

export default function InventoryPage() {
  return (
    <div className="container mx-auto max-w-7xl p-8">
      <h1 className="text-3xl font-bold mb-8">Inventory</h1>
      <InventoryTable />
    </div>
  );
}
