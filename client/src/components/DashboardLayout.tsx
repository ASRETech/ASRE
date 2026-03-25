import { useState } from 'react';
import { AppSidebar } from '@/components/AppSidebar';
import { useLocation } from 'wouter';
import { PanelLeft } from 'lucide-react';

// PAGE_TITLES — matches App.tsx canonical nested routes exactly
const PAGE_TITLES: Record<string, string> = {
  // PILLAR 1: EXECUTION
  '/execution':                   'Execution HQ',
  '/execution/pipeline':          'Pipeline',
  '/execution/action-engine':     'Action Engine',
  '/execution/schedule':          'Schedule Creator',
  '/execution/transactions':      'Transactions',
  // PILLAR 2: PERFORMANCE
  '/performance/financials':      'Financials',
  '/performance/analytics':       'Analytics',
  '/performance/dashboard':       'Dashboard',
  // PILLAR 3: GROWTH (KW order: Vision → Growth → Execution → Performance)
  '/growth/current-level':        'Current Level',
  '/growth/coaching':             'Coach Hub',
  '/growth/team':                 'Team OS',
  // PILLAR 4: VISION
  '/vision/big-why':              'Big Why',
  '/vision/wealth':               'Wealth Journey',
  // SYSTEM
  '/settings':                    'Settings',
  // LEGACY (backward compat — no sidebar links)
  '/journey':                     'My Journey',
  '/level':                       'Current Level',
  '/library':                     'Model Library',
  '/culture':                     'Culture OS',
  '/tools':                       'AI Tools Directory',
  '/recruiting':                  'Recruiting Pipeline',
};

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const pageTitle = PAGE_TITLES[location] || '';

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      {/* Sidebar */}
      <div
        className={`
          flex-shrink-0 transition-all duration-200 ease-in-out
          ${sidebarOpen ? 'w-[224px]' : 'w-0 overflow-hidden'}
        `}
      >
        <AppSidebar />
      </div>

      {/* Main content area */}
      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        {/* Top bar */}
        <header className="flex h-12 shrink-0 items-center gap-2 border-b border-border/50 px-4 bg-background">
          <button
            onClick={() => setSidebarOpen(s => !s)}
            className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            aria-label="Toggle sidebar"
          >
            <PanelLeft className="w-4 h-4" />
          </button>
          <div className="h-4 w-px bg-border mx-1" />
          <h1 className="font-display text-sm font-semibold tracking-tight text-foreground">
            {pageTitle}
          </h1>
        </header>

        {/* Page content */}
        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
