'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ClipboardList,
  Laptop,
  FileSignature,
  RotateCcw,
  ListChecks,
  Package,
  LogOut,
  Mail,
  User,
  Sun,
  Moon,
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { BrandingLogo } from './branding/logo';
import { useSession } from '@/lib/hooks/use-session';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useTheme } from 'next-themes';

const navItems = [
  {
    name: 'Request Laptop Loan',
    href: '/request-laptop-loan',
    icon: ClipboardList,
  },
  { name: 'Issue Laptop', href: '/issue-laptop', icon: Laptop },
  { name: 'Request Signature', href: '/request-signature', icon: FileSignature },
  { name: 'Return Laptop', href: '/return-laptop', icon: RotateCcw },
  { name: 'Loan List', href: '/loan-list', icon: ListChecks },
  { name: 'Inventory', href: '/inventory', icon: Package },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { user, logout } = useSession(false);
  const { theme, setTheme, resolvedTheme } = useTheme();

  const handleLogout = async () => {
    await logout();
  };

  const toggleTheme = () => {
    if (theme === 'system' || resolvedTheme === 'dark') {
      setTheme('light');
    } else {
      setTheme('dark');
    }
  };

  return (
    <Sidebar>
      <SidebarHeader className="border-b p-4 h-16 bg-black/5 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <BrandingLogo />
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Laptop Management</SidebarGroupLabel>
          <SidebarGroupContent className="mt-4">
            <SidebarMenu className="space-y-4">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      render={(props) => <Link href={item.href} {...props} />}
                      isActive={isActive}
                    >
                      <Icon />
                      <span>{item.name}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t bg-black/5 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-4">
        {user && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 px-2">
              <div className="h-8 w-8 rounded-full bg-accent-blue/10 flex items-center justify-center">
                <User className="h-4 w-4 text-accent-blue" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Mail className="h-3 w-3 shrink-0" />
                  <span className="truncate">{user.email}</span>
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleTheme}
                className="w-full justify-start"
              >
                <span className="inline-flex h-4 w-4 mr-2">
                  <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                  <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                </span>
                Toggle Theme
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="w-full justify-start"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
