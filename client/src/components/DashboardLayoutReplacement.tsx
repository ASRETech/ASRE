import { useState } from 'react';
import { AppSidebarReplacement as AppSidebar } from '@/components/AppSidebarReplacement';
import { useLocation } from 'wouter';
import { PanelLeft } from 'lucide-react';

const PAGE_TITLES: Record<string, string> = {
  '/app': 'Execution HQ',
  '/execution/pipeline': 'Pipeline',
  '/execution/action-engine': 'Action Engine',
  '/execution/schedule': 'Schedule',
  '/execution/transactions': 'Transactions',
  '/performance/financials': 'Financials',
  '/performance/analytics': 'Analytics',
  '/growth/coaching': 'Coaching',
  '/growth/certification': 'Certification',
  '/growth/team': 'Team OS',
  '/vision/wealth': 'Wealth',
  '/settings': 'Settings',
};

export function DashboardLayoutReplacement({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const pageTitle = PAGE_TITLES[location] || 'AgentOS';

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      <div className={`flex-shrink-0 transition-all duration-200 ease-in-out ${sidebarOpen ? 'w-[220px]' : 'w-0 overflow-hidden'}`}>
        <AppSidebar />
      </div>
      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        <header className="flex h-12 shrink-0 items-center gap-2 border-b border-border/50 px-4 bg-background">
          <button
            onClick={() => setSidebarOpen(s => !s)}
            className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            aria-label="Toggle sidebar"
          >
            <PanelLeft className="w-4 h-4" />
          </button>
          <div className="h-4 w-px bg-border mx-1" />
          <h1 className="font-display text-sm font-semibold tracking-tight text-foreground">{pageTitle}</h1>
        </header>
        <div className="flex-1 overflow-auto">{children}</div>
      </div>
    </div>
  );
}
