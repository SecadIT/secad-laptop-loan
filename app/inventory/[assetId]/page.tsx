'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription } from '@/components/ui/empty';
import { useAssetStore, type AssetRecord } from '@/lib/stores/asset-store';
import type { LoanRecord } from '@/lib/stores/loan-store';
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
  const [loanData, setLoanData] = useState<LoanRecord | null>(null);
  const [loanLoading, setLoanLoading] = useState(false);
  const [loanError, setLoanError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

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

  async function fetchLoanDetails(loanId: string) {
    setLoanLoading(true);
    setLoanError(null);

    try {
      const response = await fetch('/api/validate-loan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ loanId }),
      });

      const result = await response.json();

      if (result.ok && result.loan) {
        setLoanData(result.loan);
      } else {
        setLoanError('Loan not found');
      }
    } catch (error) {
      setLoanError('Failed to fetch loan details');
      console.error('Error fetching loan:', error);
    } finally {
      setLoanLoading(false);
    }
  }

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
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Assigned Loan ID
                </label>
                <p className="text-sm">{asset.AssignedLoanId || 'N/A'}</p>
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
          {asset.Condition?.Value && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">Condition</h3>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Condition</label>
                <p className="text-sm">{asset.Condition.Value}</p>
              </div>
            </div>
          )}

          {/* Condition Notes */}
          {asset.ConditionNotes && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">Condition Notes</h3>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Notes</label>
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

            <Button
              variant="default"
              onClick={() => {
                const assignedLoanId = asset.AssignedLoanId;
                console.log('Assigned loan ID:', assignedLoanId);
                setDialogOpen(true);
                if (assignedLoanId) {
                  fetchLoanDetails(assignedLoanId);
                } else {
                  console.log('No assigned loan ID found in asset');
                }
              }}
            >
              Show Assigned Loan
            </Button>

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogContent className="max-w-6xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Attached Loan Details</DialogTitle>
                  <DialogDescription>Loan information associated with this asset</DialogDescription>
                </DialogHeader>

                {loanLoading ? (
                  <div className="py-8">
                    <LoadingSpinner text="Loading loan details..." />
                  </div>
                ) : loanData ? (
                  <div className="space-y-6">
                    {/* Client Information */}
                    <div className="space-y-3">
                      <h3 className="text-sm font-semibold border-b pb-2">Client Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="text-muted-foreground">Loan ID:</span>
                          <p className="font-medium">{loanData.ID}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Client Name:</span>
                          <p className="font-medium">{loanData.ClientName}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Email:</span>
                          <p>{loanData.ClientEmail || 'N/A'}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Address:</span>
                          <p>{loanData.ClientAddress || 'N/A'}</p>
                        </div>
                      </div>
                    </div>

                    {/* Course Information */}
                    <div className="space-y-3">
                      <h3 className="text-sm font-semibold border-b pb-2">Course Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="text-muted-foreground">Program:</span>
                          <p>{loanData.Program}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Course Name:</span>
                          <p>{loanData.CourseName}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Duration:</span>
                          <p>{loanData.CourseDuration || 'N/A'}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Qualification:</span>
                          <p>{loanData.CourseQualification || 'N/A'}</p>
                        </div>
                      </div>
                    </div>

                    {/* Loan Dates */}
                    <div className="space-y-3">
                      <h3 className="text-sm font-semibold border-b pb-2">Loan Timeline</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="text-muted-foreground">Loan Date:</span>
                          <p>{formatDate(loanData.Equipmentloandate)}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Expected Return Date:</span>
                          <p>{formatDate(loanData.Agreedequipmentreturndate)}</p>
                        </div>
                      </div>
                    </div>

                    {/* Equipment Details (if issued) */}
                    {loanData.MakeandModelofDevice && (
                      <div className="space-y-3">
                        <h3 className="text-sm font-semibold border-b pb-2">Equipment Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                          <div>
                            <span className="text-muted-foreground">Make & Model:</span>
                            <p>{loanData.MakeandModelofDevice}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Serial Number:</span>
                            <p className="font-mono">{loanData.SerialNumber || 'N/A'}</p>
                          </div>
                          <div className="md:col-span-2">
                            <span className="text-muted-foreground">Items Included:</span>
                            <p>{loanData.ItemsIncluded || 'N/A'}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Staff Information */}
                    <div className="space-y-3">
                      <h3 className="text-sm font-semibold border-b pb-2">Staff Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="text-muted-foreground">Development Officer:</span>
                          <p>{loanData.DevelopmentOfficerName}</p>
                          <p className="text-xs text-muted-foreground">
                            {loanData.DevelopmentOfficerEmail}
                          </p>
                        </div>
                        {loanData.NameSecadITAssistant && (
                          <div>
                            <span className="text-muted-foreground">IT Assistant:</span>
                            <p>{loanData.NameSecadITAssistant}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Additional Notes */}
                    {loanData.AdditionalNotes && (
                      <div className="space-y-3">
                        <h3 className="text-sm font-semibold border-b pb-2">Additional Notes</h3>
                        <p className="text-sm bg-muted p-3 rounded">{loanData.AdditionalNotes}</p>
                      </div>
                    )}
                  </div>
                ) : loanError ? (
                  <div className="py-8">
                    <Empty>
                      <EmptyHeader>
                        <EmptyTitle>Error Loading Loan</EmptyTitle>
                        <EmptyDescription>{loanError}</EmptyDescription>
                      </EmptyHeader>
                    </Empty>
                  </div>
                ) : (
                  <div className="py-8">
                    <Empty>
                      <EmptyHeader>
                        <EmptyTitle>No Loan Attached</EmptyTitle>
                        <EmptyDescription>
                          This asset is not currently assigned to any loan.
                        </EmptyDescription>
                      </EmptyHeader>
                    </Empty>
                  </div>
                )}
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
