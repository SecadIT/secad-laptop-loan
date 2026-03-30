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
import { useAssetStore, type AssetRecord } from '@/lib/stores/asset-store';
import { AssetFilter } from './asset-filter';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

export function InventoryTable() {
  const router = useRouter();

  const getStatusColor = (status: string | undefined) => {
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
  const { assets, loading, error, fetchAssets } = useAssetStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [filterField, setFilterField] = useState('');
  const [filterValue, setFilterValue] = useState('');

  // Filter assets based on search query and filter
  const filteredAssets = useMemo(() => {
    let filtered = assets;

    // Apply field filter first
    if (filterField && filterValue) {
      filtered = filtered.filter((asset) => {
        switch (filterField) {
          case 'status':
            return asset.Status?.Value === filterValue;
          case 'assetType':
            return asset.AssetType?.Value === filterValue;
          case 'manufacturer':
            return asset.Manufacturer?.Value === filterValue;
          case 'color':
            return asset.Color?.Value === filterValue;
          case 'condition':
            return asset.Condition?.Value === filterValue;
          default:
            return true;
        }
      });
    }

    // Apply search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (asset) =>
          asset.SerialNumber?.toLowerCase().includes(query) ||
          asset.AssetType?.Value?.toLowerCase().includes(query) ||
          asset.Manufacturer?.Value?.toLowerCase().includes(query) ||
          asset.Status?.Value?.toLowerCase().includes(query) ||
          asset.Color?.Value?.toLowerCase().includes(query) ||
          asset.Condition?.Value?.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [assets, searchQuery, filterField, filterValue]);

  // Paginate filtered assets
  const paginatedAssets = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredAssets.slice(startIndex, endIndex);
  }, [filteredAssets, currentPage, itemsPerPage]);

  // Calculate total pages
  const totalPages = Math.ceil(filteredAssets.length / itemsPerPage);

  // Reset to page 1 when search query, items per page, or filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, itemsPerPage, filterField, filterValue]);

  useEffect(() => {
    fetchAssets();
  }, [fetchAssets]);

  const handleRowClick = (asset: AssetRecord) => {
    router.push(`/inventory/${asset.ID}`);
  };

  const handleClearFilter = () => {
    setFilterField('');
    setFilterValue('');
  };

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

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading...</CardTitle>
          <CardDescription>Fetching asset data from SharePoint</CardDescription>
        </CardHeader>
        <CardContent className="py-8">
          <LoadingSpinner text="Loading assets..." />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Error</CardTitle>
          <CardDescription>Failed to load asset data</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-red-600 dark:text-red-400 mb-4">{error}</div>
          <Button onClick={() => fetchAssets(true)} variant="outline">
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
            <CardTitle>Asset Inventory</CardTitle>
            <CardDescription>
              {assets.length} {assets.length === 1 ? 'asset' : 'assets'} total
              {filteredAssets.length !== assets.length && ` • ${filteredAssets.length} filtered`}
            </CardDescription>
          </div>
          <Button onClick={() => fetchAssets(true)} variant="outline" disabled={loading} size="sm">
            {loading ? 'Refreshing...' : 'Refresh'}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filter Component */}
        <AssetFilter
          assets={assets}
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
            placeholder="Search by serial number, type, manufacturer, status, or color..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="rounded border overflow-x-auto">
          <Table>
            <TableCaption>List of all assets</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Asset Type</TableHead>
                <TableHead>Manufacturer</TableHead>
                <TableHead>Serial Number</TableHead>
                <TableHead>Color</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Condition</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAssets.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
                    {searchQuery ? 'No assets match your search' : 'No assets found'}
                  </TableCell>
                </TableRow>
              ) : (
                paginatedAssets.map((asset) => (
                  <TableRow
                    role="button"
                    key={asset.ID}
                    className="hover:bg-muted/50 transition-colors cursor-pointer hover:text-primary text-xs text-muted-foreground"
                    onClick={() => handleRowClick(asset)}
                  >
                    <TableCell className="">{asset.ID}</TableCell>
                    <TableCell>{asset.AssetType?.Value || 'N/A'}</TableCell>
                    <TableCell>{asset.Manufacturer?.Value || 'N/A'}</TableCell>
                    <TableCell>{asset.SerialNumber || 'N/A'}</TableCell>
                    <TableCell>{asset.Color?.Value || 'N/A'}</TableCell>
                    <TableCell>
                      <span
                        className={`text-xs px-2 py-1 rounded font-medium ${getStatusColor(
                          asset.Status?.Value
                        )}`}
                      >
                        {asset.Status?.Value || 'N/A'}
                      </span>
                    </TableCell>
                    <TableCell>{asset.Condition?.Value || 'N/A'}</TableCell>
                    <TableCell>{formatDate(asset.Created)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination Controls */}
        {filteredAssets.length > 0 && (
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
                {Math.min(currentPage * itemsPerPage, filteredAssets.length)} of{' '}
                {filteredAssets.length}
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
