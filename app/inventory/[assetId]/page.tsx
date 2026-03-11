'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAssetStore, type AssetRecord } from '@/lib/stores/asset-store';
import { ChevronLeft } from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface AssetDetailPageProps {
  params: Promise<{
    assetId: string;
  }>;
}

export default function AssetDetailPage({ params }: AssetDetailPageProps) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { assets, loading, fetchAssets } = useAssetStore();
  const [asset, setAsset] = useState<AssetRecord | null>(null);

  useEffect(() => {
    if (assets.length === 0) {
      fetchAssets();
    }
  }, [assets.length, fetchAssets]);

  useEffect(() => {
    if (assets.length > 0) {
      const foundAsset = assets.find((a) => a.ID.toString() === resolvedParams.assetId);
      setAsset(foundAsset || null);
    }
  }, [assets, resolvedParams.assetId]);

  function formatDate(dateString: string) {
    try {
      return new Date(dateString).toLocaleString('en-IE', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateString;
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto py-10">
        <Card>
          <CardContent className="pt-6 py-8">
            <LoadingSpinner text="Loading asset details..." />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!asset) {
    return (
      <div className="container mx-auto py-10">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-red-500">Asset not found</p>
            <div className="mt-4 text-center">
              <Button onClick={() => router.push('/inventory')}>Back to Inventory</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <div className="mb-6">
        <Button variant="ghost" onClick={() => router.push('/inventory')}>
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to Inventory
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Asset Details - ID: {asset.ID}</CardTitle>
          <CardDescription>Complete information for this asset</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Asset ID</label>
                <p className="text-sm font-semibold">{asset.ID}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Internal ID</label>
                <p className="text-sm">{asset.ItemInternalId || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Asset Type</label>
                <p className="text-sm">{asset.AssetType?.Value || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Status</label>
                <span
                  className={`inline-block text-xs px-2 py-1 rounded ${
                    asset.Status?.Value === 'Available'
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : 'bg-muted'
                  }`}
                >
                  {asset.Status?.Value || 'N/A'}
                </span>
              </div>
            </div>
          </div>

          {/* Device Specifications */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Device Specifications</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Manufacturer</label>
                <p className="text-sm">{asset.Manufacturer?.Value || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Color</label>
                <p className="text-sm">{asset.Color?.Value || 'N/A'}</p>
              </div>
              <div className="md:col-span-2">
                <label className="text-sm font-medium text-muted-foreground">Serial Number</label>
                <p className="text-sm font-mono bg-muted px-2 py-1 rounded inline-block">
                  {asset.SerialNumber || 'N/A'}
                </p>
              </div>
            </div>
          </div>

          {/* Condition Information */}
          {asset.ConditionNotes && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">Condition Information</h3>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Condition Notes</label>
                <p className="text-sm">{asset.ConditionNotes}</p>
              </div>
            </div>
          )}

          {/* Audit Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Audit Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Created By</label>
                <p className="text-sm">{asset.Author?.DisplayName || 'N/A'}</p>
                <p className="text-xs text-muted-foreground">{asset.Author?.Email || ''}</p>
                {asset.Author?.Department && (
                  <p className="text-xs text-muted-foreground">{asset.Author.Department}</p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Created Date</label>
                <p className="text-sm">{formatDate(asset.Created)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Last Modified By
                </label>
                <p className="text-sm">{asset.Editor?.DisplayName || 'N/A'}</p>
                <p className="text-xs text-muted-foreground">{asset.Editor?.Email || ''}</p>
                {asset.Editor?.Department && (
                  <p className="text-xs text-muted-foreground">{asset.Editor.Department}</p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Last Modified Date
                </label>
                <p className="text-sm">{formatDate(asset.Modified)}</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4 border-t">
            <Button variant="outline" onClick={() => router.push('/inventory')}>
              Back to List
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
