'use client';

import { useEffect, useMemo } from 'react';
import { useAssetStore } from '@/lib/stores/asset-store';
import { useLoanStore } from '@/lib/stores/loan-store';
import { useStaffStore } from '@/lib/stores/staff-store';
import { StatsCard } from '@/components/dashboard/stats-card';
import { BarChartCard } from '@/components/dashboard/bar-chart-card';
import { BreakdownListCard } from '@/components/dashboard/breakdown-list-card';
import { RecentActivityCard } from '@/components/dashboard/recent-activity-card';
import {
  Package,
  CheckCircle2,
  XCircle,
  Clock,
  FileText,
  Users,
  Laptop,
  Wrench,
  Shield,
  Monitor,
  Archive,
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function DashboardPage() {
  const { assets, fetchAssets, loading: assetsLoading } = useAssetStore();
  const { loans, fetchLoans, loading: loansLoading } = useLoanStore();
  const { fetchStaff } = useStaffStore();

  // Fetch all data on mount
  useEffect(() => {
    fetchAssets();
    fetchLoans();
    fetchStaff();
  }, [fetchAssets, fetchLoans, fetchStaff]);

  // Asset Stats
  const assetStats = useMemo(() => {
    const total = assets.length;
    const available = assets.filter((a) => a.Status?.Value === 'Available').length;
    const loanedOut = assets.filter((a) => a.Status?.Value === 'Loaned Out').length;
    const inUse = assets.filter((a) => a.Status?.Value === 'In Use').length;
    const inRepair = assets.filter((a) => a.Status?.Value === 'In Maintainance').length;
    const retired = assets.filter((a) => a.Status?.Value === 'Retired').length;
    const reservedForLoan = assets.filter((a) => a.Status?.Value === 'Reserved For Loan').length;

    return { total, available, loanedOut, inUse, inRepair, retired, reservedForLoan };
  }, [assets]);

  // Loan Stats
  const loanStats = useMemo(() => {
    const total = loans.length;
    const submitted = loans.filter((l) => l.IdentityandStatus?.Value === 'Submitted').length;
    const approved = loans.filter((l) => l.IdentityandStatus?.Value === 'Approved').length;
    const waitingItIssue = loans.filter(
      (l) => l.IdentityandStatus?.Value === 'Waiting IT Issue'
    ).length;
    const readyForCollection = loans.filter(
      (l) => l.IdentityandStatus?.Value === 'Ready For Collection'
    ).length;
    const clientConfirmed = loans.filter(
      (l) => l.IdentityandStatus?.Value === 'Client Confirmed'
    ).length;
    const returned = loans.filter((l) => l.IdentityandStatus?.Value === 'Returned').length;

    return {
      total,
      submitted,
      approved,
      waitingItIssue,
      readyForCollection,
      clientConfirmed,
      returned,
    };
  }, [loans]);

  // Assets by Type
  const assetsByType = useMemo(() => {
    const typeMap = new Map<string, number>();
    assets.forEach((asset) => {
      const type = asset.AssetType?.Value || 'Unknown';
      typeMap.set(type, (typeMap.get(type) || 0) + 1);
    });

    return Array.from(typeMap.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [assets]);

  // Assets by Status
  const assetsByStatus = useMemo(() => {
    const statusMap = new Map<string, number>();
    assets.forEach((asset) => {
      const status = asset.Status?.Value || 'Unknown';
      statusMap.set(status, (statusMap.get(status) || 0) + 1);
    });

    const total = assets.length || 1;
    return Array.from(statusMap.entries())
      .map(([label, count]) => ({
        label,
        count,
        percentage: (count / total) * 100,
      }))
      .sort((a, b) => b.count - a.count);
  }, [assets]);

  // Loans by Program
  const loansByProgram = useMemo(() => {
    const programMap = new Map<string, number>();
    loans.forEach((loan) => {
      const program = loan.Program || 'Unknown';
      programMap.set(program, (programMap.get(program) || 0) + 1);
    });

    return Array.from(programMap.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [loans]);

  // Loans by Status
  const loansByStatus = useMemo(() => {
    const statusMap = new Map<string, number>();
    loans.forEach((loan) => {
      const status = loan.IdentityandStatus?.Value || 'Unknown';
      statusMap.set(status, (statusMap.get(status) || 0) + 1);
    });

    const total = loans.length || 1;
    return Array.from(statusMap.entries())
      .map(([label, count]) => ({
        label,
        count,
        percentage: (count / total) * 100,
      }))
      .sort((a, b) => b.count - a.count);
  }, [loans]);

  // Recent Activity
  const recentActivity = useMemo(() => {
    const assetActivities = assets
      .slice()
      .sort((a, b) => new Date(b.Modified).getTime() - new Date(a.Modified).getTime())
      .slice(0, 3)
      .map((asset) => ({
        id: asset.ID,
        title: `${asset.AssetType?.Value || 'Asset'} Updated`,
        description: `${asset.Manufacturer?.Value || 'Unknown'} - ${asset.SerialNumber} - Status: ${asset.Status?.Value}`,
        timestamp: asset.Modified,
        type: 'asset' as const,
        href: `/inventory/${asset.ItemInternalId}`,
      }));

    const loanActivities = loans
      .slice()
      .sort(
        (a, b) => new Date(b.Equipmentloandate).getTime() - new Date(a.Equipmentloandate).getTime()
      )
      .slice(0, 2)
      .map((loan) => ({
        id: loan.ID,
        title: 'New Loan Created',
        description: `${loan.ClientName} - ${loan.Program}`,
        timestamp: loan.Equipmentloandate,
        type: 'loan' as const,
        href: `/loan-list/${loan.ID}`,
      }));

    return [...assetActivities, ...loanActivities]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 5);
  }, [assets, loans]);

  const loading = assetsLoading || loansLoading;

  return (
    <div className="container mx-auto px-4 py-6 space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Overview of inventory and loan management</p>
        </div>
        <div className="flex gap-2">
          <Link href="/request-laptop-loan">
            <Button variant="outline">Request New Loan</Button>
          </Link>
          <Link href="/issue-laptop">
            <Button className="gap-2">
              <Laptop className="w-4 h-4" />
              Issue Laptop
            </Button>
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent-blue" />
        </div>
      ) : (
        <>
          {/* Asset Stats */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Asset Overview</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <StatsCard title="Available" value={assetStats.available} icon={CheckCircle2} />
              <StatsCard title="Loaned Out" value={assetStats.loanedOut} icon={Shield} />
              <StatsCard title="In Use" value={assetStats.inUse} icon={Monitor} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <StatsCard title="In Maintenance" value={assetStats.inRepair} icon={Wrench} />
              <StatsCard title="Retired" value={assetStats.retired} icon={Archive} />
              <StatsCard
                title="Reserved For Loan"
                value={assetStats.reservedForLoan}
                icon={Package}
              />
            </div>
            <Link href="/inventory">
              <Button variant="outline">View All Assets</Button>
            </Link>
          </div>

          {/* Loan Stats */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Loan Overview</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <StatsCard title="Submitted" value={loanStats.submitted} icon={Clock} />
              <StatsCard title="Approved" value={loanStats.approved} icon={CheckCircle2} />
              <StatsCard title="Waiting IT Issue" value={loanStats.waitingItIssue} icon={Laptop} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <StatsCard
                title="Ready For Collection"
                value={loanStats.readyForCollection}
                icon={Package}
              />
              <StatsCard title="Client Confirmed" value={loanStats.clientConfirmed} icon={Users} />
              <StatsCard title="Returned" value={loanStats.returned} icon={CheckCircle2} />
            </div>
            <Link href="/loan-list">
              <Button variant="outline">View All Loans</Button>
            </Link>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <BarChartCard
              title="Assets by Type"
              description="Distribution of assets across different categories"
              data={assetsByType}
            />
            <BarChartCard
              title="Loans by Program"
              description="Active loans grouped by program"
              data={loansByProgram}
            />
          </div>

          {/* Breakdown Lists */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <BreakdownListCard
              title="Assets by Status"
              description="Current status distribution of all assets"
              items={assetsByStatus}
              total={assetStats.total}
            />
            <BreakdownListCard
              title="Loans by Status"
              description="Current status distribution of all loans"
              items={loansByStatus}
              total={loanStats.total}
            />
          </div>

          {/* Recent Activity */}
          <RecentActivityCard
            title="Recent Activity"
            description="Latest updates across assets and loans"
            items={recentActivity}
            maxItems={5}
          />

          {/* Quick Links */}
          <div className="flex flex-wrap gap-4">
            <Link href="/request-laptop-loan">
              <Button variant="outline">Request New Loan</Button>
            </Link>
            <Link href="/issue-laptop">
              <Button className="gap-2">
                <Laptop className="w-4 h-4" />
                Issue Laptop
              </Button>
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
