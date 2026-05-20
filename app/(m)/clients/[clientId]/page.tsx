'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLoanStore, type LoanRecord } from '@/lib/stores/loan-store';
import { useAssetStore, type AssetRecord } from '@/lib/stores/asset-store';
import { ChevronLeft } from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface ClientDetailPageProps {
  params: Promise<{
    clientId: string;
  }>;
}

export default function ClientDetailPage({ params }: ClientDetailPageProps) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { loans, loading: loansLoading, fetchLoans } = useLoanStore();
  const { assets, loading: assetsLoading, fetchAssets } = useAssetStore();
  const [loan, setLoan] = useState<LoanRecord | null>(null);
  const [asset, setAsset] = useState<AssetRecord | null>(null);

  const loading = loansLoading || assetsLoading;

  useEffect(() => {
    if (loans.length === 0) {
      fetchLoans();
    }
    if (assets.length === 0) {
      fetchAssets();
    }
  }, [loans.length, assets.length, fetchLoans, fetchAssets]);

  useEffect(() => {
    if (loans.length > 0) {
      // Extract loan ID from clientId (format: loan-{loanId})
      const loanId = resolvedParams.clientId.replace('loan-', '');
      const foundLoan = loans.find((l) => l.ID.toString() === loanId);
      setLoan(foundLoan || null);

      // Find matching asset
      if (foundLoan && assets.length > 0) {
        let matchedAsset: AssetRecord | undefined;

        // Try to match by serial number
        if (foundLoan.SerialNumber) {
          matchedAsset = assets.find(
            (a) => a.SerialNumber?.toLowerCase() === foundLoan.SerialNumber?.toLowerCase()
          );
        }

        // Try to match by loan ID
        if (!matchedAsset) {
          matchedAsset = assets.find((a) => a.AssignedLoanId === foundLoan.ID.toString());
        }

        setAsset(matchedAsset || null);
      }
    }
  }, [loans, assets, resolvedParams.clientId]);

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

  function formatDateTime(dateString: string) {
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

  function getProgramLabel(programValue: string) {
    const programMap: Record<string, string> = {
      'sicap-employment': 'SICAP Employment',
      'sicap-community': 'SICAP Community',
      'tus-rss': 'Tus/RSS',
      amif: 'AMIF',
    };
    return programMap[programValue?.toLowerCase()] || programValue;
  }

  if (loading) {
    return (
      <main className="min-h-screen p-4 sm:p-6 md:p-10">
        <div className="max-w-6xl mx-auto">
          <Card>
            <CardContent className="pt-6 py-8">
              <LoadingSpinner text="Loading client details..." />
            </CardContent>
          </Card>
        </div>
      </main>
    );
  }

  if (!loan) {
    return (
      <main className="min-h-screen p-4 sm:p-6 md:p-10">
        <div className="max-w-6xl mx-auto">
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-red-500">Client not found</p>
              <div className="mt-4 text-center">
                <Button onClick={() => router.push('/clients')}>Back to Clients</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-4 sm:p-6 md:p-10">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="mb-6">
          <Button variant="ghost" onClick={() => router.push('/clients')}>
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Clients
          </Button>
        </div>

        <div className="mb-6">
          <h1 className="text-3xl font-bold">Client Details</h1>
          <p className="text-muted-foreground mt-2">Complete information for {loan.ClientName}</p>
        </div>

        {/* Section 1: Client Information */}
        <Card>
          <CardHeader>
            <CardTitle>Client Information</CardTitle>
            <CardDescription>Personal and contact details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Client Name</label>
                <p className="text-sm font-semibold">{loan.ClientName || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Client Email</label>
                <p className="text-sm">{loan.ClientEmail || 'N/A'}</p>
              </div>
              <div className="md:col-span-2">
                <label className="text-sm font-medium text-muted-foreground">Client Address</label>
                <p className="text-sm">{loan.ClientAddress || 'N/A'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section 2: Loan Information */}
        <Card>
          <CardHeader>
            <CardTitle>Loan Information</CardTitle>
            <CardDescription>Loan details, program, and status - ID: {loan.ID}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Status and Dates */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">Status & Timeline</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Status</label>
                  <p className="text-sm">
                    <span
                      className={`inline-block text-xs px-2 py-1 rounded-sm font-medium ${
                        loan.IdentityandStatus?.Value === 'Approved'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : loan.IdentityandStatus?.Value === 'Returned'
                            ? 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
                            : loan.IdentityandStatus?.Value === 'Rejected'
                              ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                              : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                      }`}
                    >
                      {loan.IdentityandStatus?.Value || 'N/A'}
                    </span>
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Loan Date</label>
                  <p className="text-sm">{formatDate(loan.Equipmentloandate)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Return Date</label>
                  <p className="text-sm">{formatDate(loan.Agreedequipmentreturndate)}</p>
                </div>
              </div>
            </div>

            {/* Program Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">Program Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Program</label>
                  <p className="text-sm">{getProgramLabel(loan.Program) || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Course Name</label>
                  <p className="text-sm">{loan.CourseName || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Course Provider
                  </label>
                  <p className="text-sm">{loan.CourseProvider || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Course Duration
                  </label>
                  <p className="text-sm">{loan.CourseDuration || 'N/A'}</p>
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    Course Qualification
                  </label>
                  <p className="text-sm">{loan.CourseQualification || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Staff Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">Staff & Approval</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Development Officer
                  </label>
                  <p className="text-sm">{loan.DevelopmentOfficerName || 'N/A'}</p>
                  <p className="text-xs text-muted-foreground">
                    {loan.DevelopmentOfficerEmail || ''}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Approved By</label>
                  <p className="text-sm">{loan.SelectedApprover || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    DO Collecting Equipment
                  </label>
                  <p className="text-sm">{loan.NameDOCollectingEquipment || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    SECAD IT Assistant
                  </label>
                  <p className="text-sm">{loan.NameSecadITAssistant || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Equipment Details from Loan */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">Equipment Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Make and Model
                  </label>
                  <p className="text-sm">{loan.MakeandModelofDevice || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Serial Number</label>
                  <p className="text-sm font-mono bg-muted px-2 py-1 rounded-sm inline-block">
                    {loan.SerialNumber || 'N/A'}
                  </p>
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    Items Included
                  </label>
                  <p className="text-sm">{loan.ItemsIncluded || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Additional Notes */}
            {loan.AdditionalNotes && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">Additional Notes</h3>
                <p className="text-sm">{loan.AdditionalNotes}</p>
              </div>
            )}

            {/* Client Signature */}
            {loan.SignatureImage && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">Client Signature</h3>
                <div className="bg-muted/30 p-4 rounded-sm border-2 border-border inline-block">
                  <img
                    src={loan.SignatureImage}
                    alt="Client Signature"
                    className="max-w-md w-full h-auto"
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Section 3: Asset Information */}
        {asset ? (
          <Card>
            <CardHeader>
              <CardTitle>Asset Information</CardTitle>
              <CardDescription>Details about the assigned asset - ID: {asset.ID}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Basic Asset Info */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">Asset Details</h3>
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
                    <label className="text-sm font-medium text-muted-foreground">Asset Title</label>
                    <p className="text-sm">{asset.Title || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Asset Type</label>
                    <p className="text-sm">{asset.AssetType?.Value || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Manufacturer
                    </label>
                    <p className="text-sm">{asset.Manufacturer?.Value || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Serial Number
                    </label>
                    <p className="text-sm font-mono bg-muted px-2 py-1 rounded-sm inline-block">
                      {asset.SerialNumber || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Asset Tag</label>
                    <p className="text-sm">{asset.AssetTag || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Owner Program
                    </label>
                    <p className="text-sm">{asset.OwnerProgram?.Value || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Status & Condition */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">Status & Condition</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Asset Status
                    </label>
                    <p className="text-sm">
                      <span
                        className={`inline-block text-xs px-2 py-1 rounded-sm font-medium ${
                          asset.Status?.Value === 'Available'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : asset.Status?.Value === 'Loaned Out'
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
                        }`}
                      >
                        {asset.Status?.Value || 'N/A'}
                      </span>
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Condition</label>
                    <p className="text-sm">{asset.Condition?.Value || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Assigned Loan ID
                    </label>
                    <p className="text-sm">{asset.AssignedLoanId || 'N/A'}</p>
                  </div>
                  {asset.ConditionNotes && (
                    <div className="md:col-span-2">
                      <label className="text-sm font-medium text-muted-foreground">
                        Condition Notes
                      </label>
                      <p className="text-sm">{asset.ConditionNotes}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Metadata */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">Record Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Created</label>
                    <p className="text-sm">{formatDateTime(asset.Created)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Last Modified
                    </label>
                    <p className="text-sm">{formatDateTime(asset.Modified)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Created By</label>
                    <p className="text-sm">{asset.Author?.DisplayName || 'N/A'}</p>
                    <p className="text-xs text-muted-foreground">{asset.Author?.Email || ''}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Last Edited By
                    </label>
                    <p className="text-sm">{asset.Editor?.DisplayName || 'N/A'}</p>
                    <p className="text-xs text-muted-foreground">{asset.Editor?.Email || ''}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Asset Information</CardTitle>
              <CardDescription>No asset matched to this loan</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                No asset found matching serial number: {loan.SerialNumber || 'N/A'}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  );
}
