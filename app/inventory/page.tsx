import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from '@/components/ui/empty';
import { Package } from 'lucide-react';

export default function InventoryPage() {
  return (
    <div className="container mx-auto max-w-7xl p-8">
      <h1 className="text-3xl font-bold mb-8">Inventory</h1>
      <Empty className="border">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Package />
          </EmptyMedia>
          <EmptyTitle>Coming Soon</EmptyTitle>
          <EmptyDescription>
            The inventory management system is currently under development. Check back soon for
            updates.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    </div>
  );
}
