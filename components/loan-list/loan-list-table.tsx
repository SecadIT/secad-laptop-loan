'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { useLoanStore, type LoanRecord } from '@/lib/stores/loan-store';
import { LoanFilter } from './loan-filter';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

export function LoanListTable() {
  const router = useRouter();
  const { loans, loading, error, fetchLoans } = useLoanStore();

  const getStatusColor = (status: string | undefined) => {
    switch (status) {
      case 'Draft':
        return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200';
      case 'Submitted':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'Approved':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'Waiting IT Issue':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'Ready For Collection':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'Client Confirmed':
        return 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200';
      case 'Returned':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
      case 'Rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    }
  };

  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [filterField, setFilterField] = useState('');
  const [filterValue, setFilterValue] = useState('');

  const handleRowClick = (loan: LoanRecord) => {
    router.push(`/loan-list/${loan.ID}`);
  };

  const handleClearFilter = () => {
    setFilterField('');
    setFilterValue('');
  };

  // Filter loans based on search query and filter
  const filteredLoans = useMemo(() => {
    let filtered = loans;

    // Apply field filter first
    if (filterField && filterValue) {
      filtered = filtered.filter((loan) => {
        switch (filterField) {
          case 'status':
            return loan.IdentityandStatus?.Value === filterValue;
          case 'program':
            return loan.Program === filterValue;
          case 'officer':
            return loan.DevelopmentOfficerName === filterValue;
          default:
            return true;
        }
      });
    }

    // Apply search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (loan) =>
          loan.ClientName.toLowerCase().includes(query) ||
          loan.Program.toLowerCase().includes(query) ||
          loan.CourseName.toLowerCase().includes(query) ||
          loan.DevelopmentOfficerName.toLowerCase().includes(query) ||
          loan.SelectedApprover.toLowerCase().includes(query) ||
          loan.IdentityandStatus?.Value.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [loans, searchQuery, filterField, filterValue]);

  // Paginate filtered loans
  const paginatedLoans = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredLoans.slice(startIndex, endIndex);
  }, [filteredLoans, currentPage, itemsPerPage]);

  // Calculate total pages
  const totalPages = Math.ceil(filteredLoans.length / itemsPerPage);

  // Reset to page 1 when search query, items per page, or filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, itemsPerPage, filterField, filterValue]);

  useEffect(() => {
    fetchLoans();
  }, [fetchLoans]);

  function formatDate(dateString: string) {
    try {
      return new Date(dateString).toLocaleDateString('en-IE', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  }

  function getProgramLabel(programValue: string) {
    // If the program value is already descriptive, return as-is
    // Otherwise map the known values
    const programMap: Record<string, string> = {
      'sicap-employment': 'SICAP Employment',
      'sicap-community': 'SICAP Community',
      'tus-rss': 'Tus/RSS',
      amif: 'AMIF',
    };
    return programMap[programValue.toLowerCase()] || programValue;
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading...</CardTitle>
          <CardDescription>Fetching loan data from SharePoint</CardDescription>
        </CardHeader>
        <CardContent className="py-8">
          <LoadingSpinner text="Loading loans..." />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Error</CardTitle>
          <CardDescription>Failed to load loan data</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-red-600 dark:text-red-400 mb-4">{error}</div>
          <Button onClick={() => fetchLoans(true)} variant="outline">
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Laptop Loans</CardTitle>
            <CardDescription>
              {loans.length} {loans.length === 1 ? 'loan' : 'loans'} total
              {filteredLoans.length !== loans.length && ` • ${filteredLoans.length} filtered`}
            </CardDescription>
          </div>
          <Button onClick={() => fetchLoans(true)} variant="outline" disabled={loading} size="sm">
            {loading ? 'Refreshing...' : 'Refresh'}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filter Component */}
        <LoanFilter
          loans={loans}
          filterField={filterField}
          filterValue={filterValue}
          onFilterFieldChange={setFilterField}
          onFilterValueChange={setFilterValue}
          onClearFilter={handleClearFilter}
        />

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search by client, program, course, officer, or status..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="rounded border overflow-x-auto">
          <Table>
            <TableCaption>List of all laptop loans</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Client Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Program</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Officer</TableHead>
                <TableHead>Loan Date</TableHead>
                <TableHead>Return Date</TableHead>
                <TableHead>Approver</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLoans.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
                    {searchQuery ? 'No loans match your search' : 'No loans found'}
                  </TableCell>
                </TableRow>
              ) : (
                paginatedLoans.map((loan) => (
                  <TableRow
                    role="button"
                    key={loan.ID}
                    className="hover:bg-muted/50 transition-colors text-xs text-muted-foreground cursor-pointer hover:text-primary"
                    onClick={() => handleRowClick(loan)}
                  >
                    <TableCell className="">{loan.ClientName}</TableCell>
                    <TableCell>
                      <span
                        className={`text-xs px-2 py-1 rounded font-medium ${getStatusColor(loan.IdentityandStatus?.Value)}`}
                      >
                        {loan.IdentityandStatus?.Value || 'N/A'}
                      </span>
                    </TableCell>
                    <TableCell>{getProgramLabel(loan.Program)}</TableCell>
                    <TableCell>{loan.CourseName}</TableCell>
                    <TableCell>{loan.DevelopmentOfficerName}</TableCell>
                    <TableCell>{formatDate(loan.Equipmentloandate)}</TableCell>
                    <TableCell>{formatDate(loan.Agreedequipmentreturndate)}</TableCell>
                    <TableCell>{loan.SelectedApprover}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination Controls */}
        {filteredLoans.length > 0 && (
          <div className="flex items-center justify-between pt-4">
            <div className="hidden md:flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Rows per page:</span>
              <Select
                value={itemsPerPage.toString()}
                onValueChange={(value) => setItemsPerPage(Number(value))}
              >
                <SelectTrigger className="w-[70px] h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
              <span className="hidden md:inline text-sm text-muted-foreground">
                Page {currentPage} of {totalPages} • Showing {(currentPage - 1) * itemsPerPage + 1}-
                {Math.min(currentPage * itemsPerPage, filteredLoans.length)} of{' '}
                {filteredLoans.length}
              </span>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span className="hidden sm:inline">Previous</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  <span className="hidden sm:inline">Next</span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
