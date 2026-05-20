'use client';

import { useEffect, useMemo } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { SidebarProvider, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import { ScrollToTop } from '@/components/scroll-to-top';
import { useSession } from '@/lib/hooks/use-session';
import { useStaffStore } from '@/lib/stores/staff-store';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Routes that require IT or FOH role
const RESTRICTED_ROUTES = [
  '/inventory',
  '/issue-laptop',
  '/loan-list',
  '/return-laptop',
  '/clients',
];

// Allowed roles for restricted routes
const ALLOWED_ROLES = ['IT', 'FOH'];

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const { user, loading: sessionLoading } = useSession();
  const { staff, loading: staffLoading, fetchStaff } = useStaffStore();

  // Fetch staff data on mount
  useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);

  // Find current user's role from staff list
  const userRole = useMemo(() => {
    if (!user?.email || staff.length === 0) return null;
    const staffMember = staff.find((s) => s.User.Email.toLowerCase() === user.email.toLowerCase());
    return staffMember?.Role?.Value || null;
  }, [user, staff]);

  // Check if current route is restricted
  const isRestrictedRoute = RESTRICTED_ROUTES.some((route) => pathname.startsWith(route));

  // Check if user has access
  const hasAccess = !isRestrictedRoute || (userRole && ALLOWED_ROLES.includes(userRole));

  // Show loading state while checking session and staff
  if (sessionLoading || staffLoading) {
    return (
      <>
        <SidebarProvider>
          <AppSidebar />
          <SidebarInset>
            <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
              <SidebarTrigger className="-ml-1" />
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="font-semibold">Laptop Management System</span>
              </div>
            </header>
            <div className="flex flex-1 flex-col items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          </SidebarInset>
        </SidebarProvider>
        <ScrollToTop />
      </>
    );
  }

  return (
    <>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger className="-ml-1" />
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="font-semibold">Laptop Management System</span>
            </div>
          </header>
          <div className="flex flex-1 flex-col">
            {!hasAccess ? (
              <div className="flex flex-1 items-center justify-center p-6">
                <div className="max-w-md w-full">
                  <div className="rounded-lg border-2 border-destructive/50 bg-destructive/10 p-6 text-center space-y-4">
                    <div className="flex justify-center">
                      <AlertCircle className="h-12 w-12 text-destructive" />
                    </div>
                    <div className="space-y-2">
                      <h2 className="text-xl font-semibold text-foreground">Access Restricted</h2>
                      {userRole ? (
                        <>
                          <p className="text-sm text-muted-foreground">
                            You don&apos;t have permission to access this page. Only IT and FOH
                            staff can access this area.
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Your current role: <span className="font-semibold">{userRole}</span>
                          </p>
                        </>
                      ) : (
                        <>
                          <p className="text-sm text-muted-foreground">
                            Your account is not found in the staff directory or doesn&apos;t have an
                            assigned role. Please contact IT support for access.
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Logged in as: <span className="font-semibold">{user?.email}</span>
                          </p>
                        </>
                      )}
                    </div>
                    <Link href="/dashboard">
                      <Button className="w-full">Go to Dashboard</Button>
                    </Link>
                  </div>
                </div>
              </div>
            ) : (
              children
            )}
          </div>
        </SidebarInset>
      </SidebarProvider>
      <ScrollToTop />
    </>
  );
}
