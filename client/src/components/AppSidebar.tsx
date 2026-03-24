/**
 * AppSidebar.tsx — ASRE 4-Pillar Navigation
 *
 * All paths EXACTLY match App.tsx canonical nested routes.
 * No dead links. No FOUNDATION section. Logo → /execution.
 *
 * Pillars:
 *   EXECUTION   → /execution, /execution/pipeline, /execution/action-engine,
 *                 /execution/schedule, /execution/transactions
 *   PERFORMANCE → /performance/financials, /performance/analytics, /performance/dashboard
 *   GROWTH      → /growth/coaching, /growth/certification, /growth/team,
 *                 /growth/referrals, /growth/reviews
 *   VISION      → /vision/wealth
 */

import { useApp } from '@/contexts/AppContext';
import { LEVELS } from '@/lib/store';
import {
  LayoutDashboard, Users,
  DollarSign, Settings,
  Zap, BarChart3, UsersRound, GraduationCap,
  Handshake, Star, Award, TrendingUp,
  CalendarDays, Flame, Receipt,
} from 'lucide-react';
import { useLocation, Link } from 'wouter';

// ── 4-PILLAR NAV — paths match App.tsx canonical nested routes exactly ──
const NAV_ITEMS = [
  {
    section: 'EXECUTION',
    items: [
      { label: 'Execution HQ',    icon: Flame,        path: '/execution' },
      { label: 'Pipeline',         icon: Users,        path: '/execution/pipeline' },
      { label: 'Action Engine',    icon: Zap,          path: '/execution/action-engine' },
      { label: 'Schedule Creator', icon: CalendarDays, path: '/execution/schedule' },
      { label: 'Transactions',     icon: Receipt,      path: '/execution/transactions' },
    ],
  },
  {
    section: 'PERFORMANCE',
    items: [
      { label: 'Financials', icon: DollarSign,     path: '/performance/financials' },
      { label: 'Analytics',  icon: BarChart3,       path: '/performance/analytics' },
      { label: 'Dashboard',  icon: LayoutDashboard, path: '/performance/dashboard' },
    ],
  },
  {
    section: 'GROWTH',
    items: [
      { label: 'Coach Hub',     icon: GraduationCap, path: '/growth/coaching' },
      { label: 'Certification', icon: Award,         path: '/growth/certification' },
      { label: 'Team OS',       icon: UsersRound,    path: '/growth/team' },
      { label: 'Referrals',     icon: Handshake,     path: '/growth/referrals' },
      { label: 'Reviews',       icon: Star,          path: '/growth/reviews' },
    ],
  },
  {
    section: 'VISION',
    items: [
      { label: 'Wealth Journey', icon: TrendingUp, path: '/vision/wealth' },
    ],
  },
];

export function AppSidebar() {
  const [location] = useLocation();
  const { state } = useApp();
  const user = state.user;

  const currentLevel = user?.currentLevel ?? 1;
  const levelData = LEVELS[currentLevel - 1];

  return (
    <div
      className="flex flex-col h-full w-56 shrink-0"
      style={{ background: 'oklch(0.13 0.01 250)' }}
    >
      {/* Logo / Brand — routes to /execution */}
      <Link href="/execution">
        <div
          className="shrink-0 px-4 py-4 flex items-center gap-2 cursor-pointer select-none"
          style={{ borderBottom: '1px solid oklch(0.2 0.01 250)' }}
        >
          <div
            className="w-7 h-7 rounded-md flex items-center justify-center shrink-0"
            style={{ background: '#DC143C' }}
          >
            <span className="text-white text-xs font-black">A</span>
          </div>
          <div className="flex flex-col">
            <span
              className="text-[13px] font-bold leading-none"
              style={{ color: 'oklch(0.95 0.005 250)' }}
            >
              ASRE
            </span>
            <span
              className="text-[9px] leading-none mt-0.5 tracking-wide"
              style={{ color: 'oklch(0.45 0.01 250)' }}
            >
              EXECUTION OS
            </span>
          </div>
        </div>
      </Link>

      {/* Level badge */}
      {levelData && (
        <div
          className="shrink-0 mx-3 mt-3 mb-1 px-2 py-1.5 rounded-md flex items-center gap-2"
          style={{ background: 'rgba(220,20,60,0.08)', border: '1px solid rgba(220,20,60,0.15)' }}
        >
          <div
            className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0"
            style={{ background: 'rgba(220,20,60,0.2)', color: '#DC143C' }}
          >
            {currentLevel}
          </div>
          <span
            className="text-[11px] font-medium truncate"
            style={{ color: 'oklch(0.7 0.005 250)' }}
          >
            {levelData?.name}
          </span>
        </div>
      )}

      {/* Nav — scrollable */}
      <nav
        className="flex-1 overflow-y-auto px-2 pb-2"
        style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.1) transparent' }}
      >
        {NAV_ITEMS.map((group) => (
          <div key={group.section} className="mb-1">
            {/* Section label */}
            <div
              className="px-2 pt-3 pb-1 text-[10px] font-medium tracking-[0.15em]"
              style={{ color: 'oklch(0.4 0.01 250)' }}
            >
              {group.section}
            </div>
            {/* Section items */}
            <ul className="flex flex-col gap-0.5">
              {group.items.map((item) => {
                // Active: exact match OR location starts with path (for nested sub-routes)
                // Exception: /execution exact only (to avoid matching all /execution/* as HQ active)
                const isActive =
                  location === item.path ||
                  (item.path !== '/execution' && location.startsWith(item.path + '/'));
                const Icon = item.icon;
                return (
                  <li key={item.path}>
                    <Link href={item.path}>
                      <div
                        className={`
                          flex items-center gap-2 px-2 py-2 rounded-md text-[13px]
                          transition-colors duration-100 cursor-pointer
                          ${isActive
                            ? 'border-l-2 border-[#DC143C] rounded-l-none font-medium'
                            : 'border-l-2 border-transparent'
                          }
                        `}
                        style={{
                          color: isActive
                            ? '#DC143C'
                            : 'oklch(0.7 0.005 250)',
                          background: isActive
                            ? 'rgba(220,20,60,0.12)'
                            : 'transparent',
                        }}
                        onMouseEnter={(e) => {
                          if (!isActive) {
                            (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.05)';
                            (e.currentTarget as HTMLDivElement).style.color = 'oklch(0.9 0.005 250)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isActive) {
                            (e.currentTarget as HTMLDivElement).style.background = 'transparent';
                            (e.currentTarget as HTMLDivElement).style.color = 'oklch(0.7 0.005 250)';
                          }
                        }}
                      >
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

      {/* Footer */}
      <div
        className="shrink-0 px-3 pb-3 pt-2"
        style={{ borderTop: '1px solid oklch(0.2 0.01 250)' }}
      >
        <Link href="/settings">
          <div
            className={`
              flex items-center gap-2 px-2 py-2 rounded-md text-[13px]
              transition-colors duration-100 cursor-pointer mb-2
              ${location === '/settings'
                ? 'border-l-2 border-[#DC143C] rounded-l-none font-medium'
                : 'border-l-2 border-transparent'
              }
            `}
            style={{
              color: location === '/settings' ? '#DC143C' : 'oklch(0.5 0.01 250)',
              background: location === '/settings' ? 'rgba(220,20,60,0.12)' : 'transparent',
            }}
          >
            <Settings className="w-4 h-4 shrink-0" />
            <span>Settings</span>
          </div>
        </Link>
        {user && (
          <div
            className="flex items-center gap-2 px-2 py-2 rounded-lg"
            style={{ background: 'rgba(255,255,255,0.05)' }}
          >
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0"
              style={{ background: 'rgba(220,20,60,0.2)', color: '#DC143C' }}
            >
              {user.name?.charAt(0) || 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <p
                className="text-xs font-medium truncate"
                style={{ color: 'oklch(0.88 0.005 250)' }}
              >
                {user.name}
              </p>
              <p
                className="text-[10px] truncate"
                style={{ color: 'oklch(0.4 0.01 250)' }}
              >
                {user.brokerage}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
