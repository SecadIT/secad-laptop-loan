'use client';

import { useEffect, useState, useMemo } from 'react';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { useLoanStore, type LoanRecord } from '@/lib/stores/loan-store';

export function LoanListTable() {
  const { loans, loading, error, fetchLoans } = useLoanStore();
  const [selectedLoan, setSelectedLoan] = useState<LoanRecord | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const handleRowClick = (loan: LoanRecord) => {
    setSelectedLoan(loan);
    setDialogOpen(true);
  };

  // Filter loans based on search query
  const filteredLoans = useMemo(() => {
    if (!searchQuery.trim()) return loans;

    const query = searchQuery.toLowerCase();
    return loans.filter(
      (loan) =>
        loan.ClientName.toLowerCase().includes(query) ||
        loan.Program.toLowerCase().includes(query) ||
        loan.CourseName.toLowerCase().includes(query) ||
        loan.CourseProvider?.toLowerCase().includes(query) ||
        loan.DevelopmentOfficerName.toLowerCase().includes(query) ||
        loan.SelectedApprover.toLowerCase().includes(query) ||
        loan.IdentityandStatus?.Value.toLowerCase().includes(query)
    );
  }, [loans, searchQuery]);

  // Paginate filtered loans
  const paginatedLoans = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredLoans.slice(startIndex, endIndex);
  }, [filteredLoans, currentPage, itemsPerPage]);

  // Calculate total pages
  const totalPages = Math.ceil(filteredLoans.length / itemsPerPage);

  // Reset to page 1 when search query or items per page changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, itemsPerPage]);

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
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
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
    <>
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
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableCaption>List of all laptop loans</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Client Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Program</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Provider</TableHead>
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
                      key={loan.ID}
                      className="cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => handleRowClick(loan)}
                    >
                      <TableCell className="font-medium">{loan.ClientName}</TableCell>
                      <TableCell>
                        <span className="text-xs bg-muted px-2 py-1 rounded">
                          {loan.IdentityandStatus?.Value || 'N/A'}
                        </span>
                      </TableCell>
                      <TableCell>{getProgramLabel(loan.Program)}</TableCell>
                      <TableCell>{loan.CourseName}</TableCell>
                      <TableCell>{loan.CourseProvider}</TableCell>
                      <TableCell>{loan.DevelopmentOfficerName}</TableCell>
                      <TableCell>{formatDate(loan.Equipmentloandate)}</TableCell>
                      <TableCell>{formatDate(loan.Agreedequipmentreturndate)}</TableCell>
                      <TableCell className="text-sm">{loan.SelectedApprover}</TableCell>
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

              <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
                <span className="hidden md:inline text-sm text-muted-foreground">
                  Page {currentPage} of {totalPages} • Showing{' '}
                  {(currentPage - 1) * itemsPerPage + 1}-
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

      {/* Loan Details Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Loan Details</DialogTitle>
            <DialogDescription>Complete information for this laptop loan</DialogDescription>
          </DialogHeader>

          {selectedLoan && (
            <div className="space-y-6">
              {/* Client Information */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Client Information
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Client Name</p>
                    <p className="font-medium">{selectedLoan.ClientName}</p>
                  </div>
                  {selectedLoan.ClientEmail && (
                    <div>
                      <p className="text-sm text-muted-foreground">Client Email</p>
                      <p className="font-medium">{selectedLoan.ClientEmail}</p>
                    </div>
                  )}
                  {selectedLoan.ClientAddress && (
                    <div className="col-span-2">
                      <p className="text-sm text-muted-foreground">Client Address</p>
                      <p className="font-medium whitespace-pre-line">
                        {selectedLoan.ClientAddress}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Loan Status */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Loan Status
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <span className="inline-block text-sm bg-muted px-3 py-1 rounded">
                      {selectedLoan.IdentityandStatus?.Value || 'N/A'}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Loan ID</p>
                    <p className="font-medium">#{selectedLoan.ID}</p>
                  </div>
                </div>
              </div>

              {/* Program & Course Information */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Program & Course Details
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Program</p>
                    <p className="font-medium">{getProgramLabel(selectedLoan.Program)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Course Name</p>
                    <p className="font-medium">{selectedLoan.CourseName}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-muted-foreground">Course Provider</p>
                    <p className="font-medium">{selectedLoan.CourseProvider}</p>
                  </div>
                  {selectedLoan.CourseDuration && (
                    <div>
                      <p className="text-sm text-muted-foreground">Course Duration</p>
                      <p className="font-medium">{selectedLoan.CourseDuration}</p>
                    </div>
                  )}
                  {selectedLoan.CourseQualification && (
                    <div>
                      <p className="text-sm text-muted-foreground">Course Qualification</p>
                      <p className="font-medium">{selectedLoan.CourseQualification}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Dates */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Loan Dates
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Equipment Loan Date</p>
                    <p className="font-medium">{formatDate(selectedLoan.Equipmentloandate)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Agreed Return Date</p>
                    <p className="font-medium">
                      {formatDate(selectedLoan.Agreedequipmentreturndate)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Equipment Details (if available) */}
              {(selectedLoan.MakeandModelofDevice ||
                selectedLoan.SerialNumber ||
                selectedLoan.ItemsIncluded) && (
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                    Equipment Details
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    {selectedLoan.MakeandModelofDevice && (
                      <div>
                        <p className="text-sm text-muted-foreground">Make & Model</p>
                        <p className="font-medium">{selectedLoan.MakeandModelofDevice}</p>
                      </div>
                    )}
                    {selectedLoan.SerialNumber && (
                      <div>
                        <p className="text-sm text-muted-foreground">Serial Number</p>
                        <p className="font-medium font-mono text-sm">{selectedLoan.SerialNumber}</p>
                      </div>
                    )}
                    {selectedLoan.ItemsIncluded && (
                      <div className="col-span-2">
                        <p className="text-sm text-muted-foreground">Items Included</p>
                        <p className="font-medium whitespace-pre-line">
                          {selectedLoan.ItemsIncluded}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Collection/Issuing Details (if available) */}
              {(selectedLoan.NameDOCollectingEquipment || selectedLoan.NameSecadITAssistant) && (
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                    Collection & Issuing
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    {selectedLoan.NameDOCollectingEquipment && (
                      <div>
                        <p className="text-sm text-muted-foreground">Collecting Officer</p>
                        <p className="font-medium">{selectedLoan.NameDOCollectingEquipment}</p>
                      </div>
                    )}
                    {selectedLoan.NameSecadITAssistant && (
                      <div>
                        <p className="text-sm text-muted-foreground">SECAD IT Assistant</p>
                        <p className="font-medium">{selectedLoan.NameSecadITAssistant}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Officer & Approver Information */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Officer & Approver
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Development Officer</p>
                    <p className="font-medium">{selectedLoan.DevelopmentOfficerName}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {selectedLoan.DevelopmentOfficerEmail}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Approver</p>
                    <p className="font-medium">{selectedLoan.SelectedApprover}</p>
                  </div>
                </div>
              </div>

              {/* Additional Notes (if available) */}
              {selectedLoan.AdditionalNotes && (
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                    Additional Notes
                  </h3>
                  <div className="bg-muted/50 rounded-md p-4">
                    <p className="whitespace-pre-line">{selectedLoan.AdditionalNotes}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
