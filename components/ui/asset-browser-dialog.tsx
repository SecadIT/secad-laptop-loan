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
import { useAssetStore, type AssetRecord } from '@/lib/stores/asset-store';
import { Search } from 'lucide-react';

interface AssetBrowserDialogProps {
  onSelectAsset: (asset: AssetRecord) => void;
  assetType?: string; // Filter by asset type, default to 'Laptop'
  statusFilter?: string; // Filter by status, default to 'Available'
}

export function AssetBrowserDialog({
  onSelectAsset,
  assetType = 'Laptop',
  statusFilter = 'Available',
}: AssetBrowserDialogProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { assets, loading, fetchAssets } = useAssetStore();

  // Fetch assets when dialog opens
  useEffect(() => {
    if (open) {
      fetchAssets();
    }
  }, [open, fetchAssets]);

  const handleSelectAsset = (asset: AssetRecord) => {
    onSelectAsset(asset);
    setOpen(false);
  };

  // Filter assets based on type, status, and search query
  const filteredAssets = assets.filter((asset) => {
    // Filter by asset type
    if (assetType && asset.AssetType?.Value !== assetType) {
      return false;
    }

    // Filter by status
    if (statusFilter && asset.Status?.Value !== statusFilter) {
      return false;
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      return (
        asset.SerialNumber?.toLowerCase().includes(query) ||
        asset.Manufacturer?.Value?.toLowerCase().includes(query) ||
        asset.Color?.Value?.toLowerCase().includes(query) ||
        asset.ConditionNotes?.toLowerCase().includes(query)
      );
    }

    return true;
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={<Button type="button" variant="link" className="h-auto p-0 text-sm" />}
      >
        Browse inventory
      </DialogTrigger>
      <DialogContent className="max-w-5xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Select a {assetType} ({statusFilter})
          </DialogTitle>
        </DialogHeader>

        {/* Search Input */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by Serial Number, Manufacturer, Color, or Condition..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Asset List Table */}
        {loading ? (
          <div className="flex justify-center py-8">
            <p className="text-muted-foreground">Loading assets...</p>
          </div>
        ) : filteredAssets.length === 0 ? (
          <div className="flex justify-center py-8">
            <p className="text-muted-foreground">
              {searchQuery
                ? 'No assets found matching your search'
                : `No ${statusFilter} ${assetType}s available`}
            </p>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Serial Number</TableHead>
                  <TableHead>Manufacturer</TableHead>
                  <TableHead>Color</TableHead>
                  <TableHead>Condition</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAssets.map((asset) => (
                  <TableRow key={asset.ID}>
                    <TableCell className="font-mono font-medium">
                      {asset.SerialNumber || 'N/A'}
                    </TableCell>
                    <TableCell>{asset.Manufacturer?.Value || 'N/A'}</TableCell>
                    <TableCell>{asset.Color?.Value || 'N/A'}</TableCell>
                    <TableCell className="text-sm">{asset.ConditionNotes || 'N/A'}</TableCell>
                    <TableCell className="text-right">
                      <Button type="button" size="sm" onClick={() => handleSelectAsset(asset)}>
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
