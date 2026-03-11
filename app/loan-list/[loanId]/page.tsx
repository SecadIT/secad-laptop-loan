'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLoanStore, type LoanRecord } from '@/lib/stores/loan-store';
import { DownloadLoanPdf } from '@/components/loan-list/download-loan-pdf';
import { ChevronLeft } from 'lucide-react';

interface LoanDetailPageProps {
  params: Promise<{
    loanId: string;
  }>;
}

export default function LoanDetailPage({ params }: LoanDetailPageProps) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { loans, loading, fetchLoans } = useLoanStore();
  const [loan, setLoan] = useState<LoanRecord | null>(null);

  useEffect(() => {
    if (loans.length === 0) {
      fetchLoans();
    }
  }, [loans.length, fetchLoans]);

  useEffect(() => {
    if (loans.length > 0) {
      const foundLoan = loans.find((l) => l.ID.toString() === resolvedParams.loanId);
      setLoan(foundLoan || null);
    }
  }, [loans, resolvedParams.loanId]);

  if (loading) {
    return (
      <div className="container mx-auto py-10">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center">Loading loan details...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!loan) {
    return (
      <div className="container mx-auto py-10">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-red-500">Loan not found</p>
            <div className="mt-4 text-center">
              <Button onClick={() => router.push('/loan-list')}>Back to Loan List</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <div className="mb-6">
        <Button variant="ghost" onClick={() => router.push('/loan-list')}>
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to List
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Loan Details - ID: {loan.ID}</CardTitle>
          <CardDescription>Complete information for this laptop loan</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Client Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Client Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Client Name</label>
                <p className="text-sm">{loan.ClientName || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Client Email</label>
                <p className="text-sm">{loan.ClientEmail || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Program Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Program Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Program</label>
                <p className="text-sm">{loan.Program || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Course Name</label>
                <p className="text-sm">{loan.CourseName || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Course Provider</label>
                <p className="text-sm">{loan.CourseProvider || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Course Qualification
                </label>
                <p className="text-sm">{loan.CourseQualification || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Course Duration</label>
                <p className="text-sm">{loan.CourseDuration || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Loan Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Loan Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Development Officer
                </label>
                <p className="text-sm">{loan.DevelopmentOfficerName || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Approved By</label>
                <p className="text-sm">{loan.SelectedApprover || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Identity and Status
                </label>
                <p className="text-sm">{loan.IdentityandStatus?.Value || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Equipment Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Equipment Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Make and Model</label>
                <p className="text-sm">{loan.MakeandModelofDevice || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Serial Number</label>
                <p className="text-sm">{loan.SerialNumber || 'N/A'}</p>
              </div>
              <div className="md:col-span-2">
                <label className="text-sm font-medium text-muted-foreground">Items Included</label>
                <p className="text-sm">{loan.ItemsIncluded || 'N/A'}</p>
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

          {/* Additional Notes */}
          {loan.AdditionalNotes && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">Additional Notes</h3>
              <p className="text-sm">{loan.AdditionalNotes}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4 border-t">
            <Button variant="outline">Edit Loan</Button>
            <Button variant="destructive">Delete Loan</Button>
            <DownloadLoanPdf loan={loan} variant="default" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
