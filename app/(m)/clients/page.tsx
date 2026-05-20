import { ClientsTable } from '@/components/clients/clients-table';

export default function ClientsPage() {
  return (
    <div className="container mx-auto max-w-7xl p-4 sm:p-6 md:p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Clients</h1>
        <p className="text-muted-foreground mt-2">
          View all clients with their loan information and associated assets
        </p>
      </div>
      <ClientsTable />
    </div>
  );
}
