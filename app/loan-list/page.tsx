import { LoanListTable } from '@/components/loan-list/loan-list-table';
import { Navigation } from '@/components/navigation';

export default function LoanListPage() {
  return (
    <>
      <main className="p-4 sm:p-6 md:p-10">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold">Laptop Loan Overview</h1>
            <p className="text-muted-foreground mt-2">
              View all current and past laptop loans from SharePoint
            </p>
          </div>

          <LoanListTable />
        </div>
      </main>
    </>
  );
}
