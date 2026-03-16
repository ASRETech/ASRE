// Design: "Command Center" — Fixed left command rail with content workspace
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { useApp } from '@/contexts/AppContext';
import { Separator } from '@/components/ui/separator';
import { useLocation } from 'wouter';

const PAGE_TITLES: Record<string, string> = {
  '/journey': 'My Journey',
  '/level': 'Current Level',
  '/dashboard': 'Dashboard',
  '/pipeline': 'Pipeline',
  '/transactions': 'Transactions',
  '/financials': 'Financials',
  '/library': 'Knowledge Library',
  '/culture': 'Culture OS',
  '/compliance': 'Compliance',
  '/settings': 'Settings',
};

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const pageTitle = PAGE_TITLES[location] || '';

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-12 shrink-0 items-center gap-2 border-b border-border/50 px-4">
          <SidebarTrigger className="-ml-1 text-muted-foreground" />
          <Separator orientation="vertical" className="mx-1 h-4" />
          <h1 className="font-display text-sm font-semibold tracking-tight text-foreground">
            {pageTitle}
          </h1>
        </header>
        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
