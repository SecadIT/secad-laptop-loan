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
import { ChevronLeft, ChevronRight, Search, X } from 'lucide-react';
import { useLoanStore } from '@/lib/stores/loan-store';
import { useAssetStore } from '@/lib/stores/asset-store';
import { useClientData, type ClientRecord } from '@/lib/stores/client-store';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

export function ClientsTable() {
  const router = useRouter();
  const { loans, loading: loansLoading, error: loansError, fetchLoans } = useLoanStore();
  const { assets, loading: assetsLoading, error: assetsError, fetchAssets } = useAssetStore();
  const clients = useClientData();

  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [filterField, setFilterField] = useState('');
  const [filterValue, setFilterValue] = useState('');

  const loading = loansLoading || assetsLoading;
  const error = loansError || assetsError;

  const getLoanStatusColor = (status: string | undefined) => {
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

  const getAssetStatusColor = (status: string | undefined) => {
    switch (status) {
      case 'Available':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'Loaned Out':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'In Use':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200';
      case 'In Repair':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'Retired':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'Reserved For Loan':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    }
  };

  const handleRowClick = (client: ClientRecord) => {
    // Navigate to client details page
    router.push(`/clients/${client.id}`);
  };

  const handleClearFilter = () => {
    setFilterField('');
    setFilterValue('');
  };

  // Get unique values for filters
  const filterOptions = useMemo(() => {
    const programs = new Set<string>();
    const loanStatuses = new Set<string>();
    const assetStatuses = new Set<string>();

    clients.forEach((client) => {
      if (client.program) programs.add(client.program);
      if (client.loanStatus) loanStatuses.add(client.loanStatus);
      if (client.assetStatus) assetStatuses.add(client.assetStatus);
    });

    return {
      programs: Array.from(programs).sort(),
      loanStatuses: Array.from(loanStatuses).sort(),
      assetStatuses: Array.from(assetStatuses).sort(),
    };
  }, [clients]);

  // Filter clients based on search query and filter
  const filteredClients = useMemo(() => {
    let filtered = clients;

    // Apply field filter first
    if (filterField && filterValue) {
      filtered = filtered.filter((client) => {
        switch (filterField) {
          case 'program':
            return client.program === filterValue;
          case 'loanStatus':
            return client.loanStatus === filterValue;
          case 'assetStatus':
            return client.assetStatus === filterValue;
          default:
            return true;
        }
      });
    }

    // Apply search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (client) =>
          client.clientName.toLowerCase().includes(query) ||
          client.clientEmail.toLowerCase().includes(query) ||
          client.program.toLowerCase().includes(query) ||
          client.course.toLowerCase().includes(query) ||
          client.assetTitle?.toLowerCase().includes(query) ||
          client.assetSerialNumber?.toLowerCase().includes(query) ||
          client.officer.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [clients, searchQuery, filterField, filterValue]);

  // Paginate filtered clients
  const paginatedClients = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredClients.slice(startIndex, endIndex);
  }, [filteredClients, currentPage, itemsPerPage]);

  // Calculate total pages
  const totalPages = Math.ceil(filteredClients.length / itemsPerPage);

  // Reset to page 1 when search query, items per page, or filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, itemsPerPage, filterField, filterValue]);

  useEffect(() => {
    fetchLoans();
    fetchAssets();
  }, [fetchLoans, fetchAssets]);

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
          <CardDescription>Fetching client data from SharePoint</CardDescription>
        </CardHeader>
        <CardContent className="py-8">
          <LoadingSpinner text="Loading clients..." />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Error</CardTitle>
          <CardDescription>Failed to load client data</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-red-600 dark:text-red-400 mb-4">{error}</div>
          <Button
            onClick={() => {
              fetchLoans(true);
              fetchAssets(true);
            }}
            variant="outline"
          >
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
            <CardTitle>Clients</CardTitle>
            <CardDescription>
              {clients.length} {clients.length === 1 ? 'client' : 'clients'} total
              {filteredClients.length !== clients.length && ` • ${filteredClients.length} filtered`}
            </CardDescription>
          </div>
          <Button
            onClick={() => {
              fetchLoans(true);
              fetchAssets(true);
            }}
            variant="outline"
            disabled={loading}
            size="sm"
          >
            {loading ? 'Refreshing...' : 'Refresh'}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          <Select value={filterField} onValueChange={(value) => setFilterField(value || '')}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="program">Program</SelectItem>
              <SelectItem value="loanStatus">Loan Status</SelectItem>
              <SelectItem value="assetStatus">Asset Status</SelectItem>
            </SelectContent>
          </Select>

          {filterField && (
            <Select value={filterValue} onValueChange={(value) => setFilterValue(value || '')}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select value..." />
              </SelectTrigger>
              <SelectContent>
                {filterField === 'program' &&
                  filterOptions.programs.map((prog) => (
                    <SelectItem key={prog} value={prog}>
                      {getProgramLabel(prog)}
                    </SelectItem>
                  ))}
                {filterField === 'loanStatus' &&
                  filterOptions.loanStatuses.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                {filterField === 'assetStatus' &&
                  filterOptions.assetStatuses.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          )}

          {filterField && filterValue && (
            <Button variant="outline" size="sm" onClick={handleClearFilter}>
              <X className="h-4 w-4 mr-1" />
              Clear Filter
            </Button>
          )}
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search by name, email, program, course, asset..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="rounded border overflow-x-auto">
          <Table>
            <TableCaption>List of all clients with loan and asset information</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Client Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Program</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Loan Status</TableHead>
                <TableHead>Asset Title</TableHead>
                <TableHead>Serial Number</TableHead>
                <TableHead>Asset Status</TableHead>
                <TableHead>Officer</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClients.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
                    {searchQuery ? 'No clients match your search' : 'No clients found'}
                  </TableCell>
                </TableRow>
              ) : (
                paginatedClients.map((client) => (
                  <TableRow
                    role="button"
                    key={client.id}
                    className="hover:bg-muted/50 transition-colors text-xs text-muted-foreground cursor-pointer hover:text-primary"
                    onClick={() => handleRowClick(client)}
                  >
                    <TableCell className="font-medium">{client.clientName}</TableCell>
                    <TableCell>{client.clientEmail}</TableCell>
                    <TableCell>{getProgramLabel(client.program)}</TableCell>
                    <TableCell>{client.course}</TableCell>
                    <TableCell>
                      <span
                        className={`text-xs px-2 py-1 rounded-sm font-medium ${getLoanStatusColor(client.loanStatus)}`}
                      >
                        {client.loanStatus}
                      </span>
                    </TableCell>
                    <TableCell>{client.assetTitle || 'N/A'}</TableCell>
                    <TableCell className="font-mono text-xs">
                      {client.assetSerialNumber || 'N/A'}
                    </TableCell>
                    <TableCell>
                      {client.assetStatus ? (
                        <span
                          className={`text-xs px-2 py-1 rounded-sm font-medium ${getAssetStatusColor(client.assetStatus)}`}
                        >
                          {client.assetStatus}
                        </span>
                      ) : (
                        'N/A'
                      )}
                    </TableCell>
                    <TableCell>{client.officer}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination Controls */}
        {filteredClients.length > 0 && (
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
                {Math.min(currentPage * itemsPerPage, filteredClients.length)} of{' '}
                {filteredClients.length}
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
