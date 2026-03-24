import { LayoutDashboard, Users, Workflow, CalendarDays, FileText, DollarSign, BarChart3, GraduationCap, Award, UsersRound, TrendingUp, Settings, Zap } from 'lucide-react';
import { useLocation, Link } from 'wouter';

const NAV_ITEMS = [
  { section: 'EXECUTION', items: [
    { label: 'Execution HQ', icon: LayoutDashboard, path: '/app' },
    { label: 'Pipeline', icon: Users, path: '/execution/pipeline' },
    { label: 'Action Engine', icon: Workflow, path: '/execution/action-engine' },
    { label: 'Schedule', icon: CalendarDays, path: '/execution/schedule' },
    { label: 'Transactions', icon: FileText, path: '/execution/transactions' },
  ]},
  { section: 'PERFORMANCE', items: [
    { label: 'Financials', icon: DollarSign, path: '/performance/financials' },
    { label: 'Analytics', icon: BarChart3, path: '/performance/analytics' },
  ]},
  { section: 'GROWTH', items: [
    { label: 'Coaching', icon: GraduationCap, path: '/growth/coaching' },
    { label: 'Certification', icon: Award, path: '/growth/certification' },
    { label: 'Team OS', icon: UsersRound, path: '/growth/team' },
  ]},
  { section: 'VISION', items: [
    { label: 'Wealth', icon: TrendingUp, path: '/vision/wealth' },
  ]},
];

export function AppSidebarReplacement() {
  const [location] = useLocation();

  return (
    <div className="flex flex-col h-full w-full" style={{ background: 'oklch(0.075 0.01 250)' }}>
      <div className="flex items-center gap-2.5 px-4 pt-5 pb-3 shrink-0">
        <Link href="/app" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#DC143C] flex items-center justify-center shrink-0">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="text-base font-bold tracking-tight" style={{ color: 'oklch(0.95 0.005 250)', fontFamily: 'var(--font-display)' }}>AgentOS</span>
        </Link>
      </div>
      <nav className="flex-1 overflow-y-auto px-2 pb-2">
        {NAV_ITEMS.map((group) => (
          <div key={group.section} className="mb-1">
            <div className="px-2 pt-3 pb-1 text-[10px] font-medium tracking-[0.15em]" style={{ color: 'oklch(0.4 0.01 250)' }}>{group.section}</div>
            <ul className="flex flex-col gap-0.5">
              {group.items.map((item) => {
                const isActive = location === item.path;
                const Icon = item.icon;
                return (
                  <li key={item.path}>
                    <Link href={item.path}>
                      <div className={`flex items-center gap-2 px-2 py-2 rounded-md text-[13px] transition-colors duration-100 cursor-pointer ${isActive ? 'border-l-2 border-[#DC143C] rounded-l-none font-medium' : 'border-l-2 border-transparent'}`} style={{ color: isActive ? '#DC143C' : 'oklch(0.7 0.005 250)', background: isActive ? 'rgba(220,20,60,0.12)' : 'transparent' }}>
                        <Icon className="w-4 h-4 shrink-0" />
                        <span>{item.label}</span>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
      <div className="shrink-0 px-3 pb-3 pt-2" style={{ borderTop: '1px solid oklch(0.2 0.01 250)' }}>
        <Link href="/settings">
          <div className={`flex items-center gap-2 px-2 py-2 rounded-md text-[13px] transition-colors duration-100 cursor-pointer mb-2 ${location === '/settings' ? 'border-l-2 border-[#DC143C] rounded-l-none font-medium' : 'border-l-2 border-transparent'}`} style={{ color: location === '/settings' ? '#DC143C' : 'oklch(0.5 0.01 250)', background: location === '/settings' ? 'rgba(220,20,60,0.12)' : 'transparent' }}>
            <Settings className="w-4 h-4 shrink-0" />
            <span>Settings</span>
          </div>
        </Link>
      </div>
    </div>
  );
}
