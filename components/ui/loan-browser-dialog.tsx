'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { useLoanStore } from '@/lib/stores/loan-store';
import { Search } from 'lucide-react';

interface LoanBrowserDialogProps {
  onSelectLoan: (loanId: string) => void;
  statusFilter?: string; // Filter loans by status (e.g., "Waiting IT Issue")
}

export function LoanBrowserDialog({ onSelectLoan, statusFilter }: LoanBrowserDialogProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { loans, loading, fetchLoans } = useLoanStore();

  // Fetch loans when dialog opens - always fetch fresh data to avoid stale cache
  useEffect(() => {
    if (open) {
      fetchLoans(true); // Force refresh to get latest data from SharePoint
    }
  }, [open, fetchLoans]);

  const handleSelectLoan = (loanId: string) => {
    onSelectLoan(loanId);
    setOpen(false);
  };

  // Filter loans based on search query and status
  const filteredLoans = loans.filter((loan) => {
    // Filter by status if specified
    if (statusFilter && loan.IdentityandStatus?.Value !== statusFilter) {
      return false;
    }

    // Filter by search query
    const query = searchQuery.toLowerCase();
    return (
      loan.ID.toString().includes(query) ||
      loan.ClientName?.toLowerCase().includes(query) ||
      loan.DevelopmentOfficerName?.toLowerCase().includes(query)
    );
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={<Button type="button" variant="link" className="h-auto p-0 text-sm" />}
      >
        Browse loans
      </DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Select a Loan</DialogTitle>
          {statusFilter && (
            <p className="text-sm text-muted-foreground mt-1">
              Showing only loans with status: <strong>{statusFilter}</strong>
            </p>
          )}
        </DialogHeader>

        {/* Search Input */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by Loan ID, Client Name, or Development Officer..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Loan List Table */}
        {loading ? (
          <div className="flex justify-center py-8">
            <p className="text-muted-foreground">Loading loans...</p>
          </div>
        ) : filteredLoans.length === 0 ? (
          <div className="flex justify-center py-8">
            <p className="text-muted-foreground">
              {searchQuery
                ? 'No loans found matching your search'
                : statusFilter
                  ? `No loans with status "${statusFilter}"`
                  : 'No loans available'}
            </p>
          </div>
        ) : (
          <div className="rounded border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Loan ID</TableHead>
                  <TableHead>Client Name</TableHead>
                  <TableHead>Development Officer</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLoans.map((loan) => (
                  <TableRow key={loan.ID}>
                    <TableCell className="font-medium">{loan.ID}</TableCell>
                    <TableCell>{loan.ClientName || 'N/A'}</TableCell>
                    <TableCell>{loan.DevelopmentOfficerName || 'N/A'}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => handleSelectLoan(loan.ID.toString())}
                      >
                        Select
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
