/**
 * AppSidebar.tsx — ASRE 4-Pillar Navigation
 *
 * All paths EXACTLY match App.tsx canonical nested routes.
 * No dead links. No FOUNDATION section. Logo → /execution.
 *
 * Pillar order (KW philosophy): VISION → GROWTH → EXECUTION → PERFORMANCE
 *   VISION      → /vision/big-why, /vision/wealth
 *   GROWTH      → /growth/current-level, /growth/coaching, /growth/team
 *   EXECUTION   → /execution, /execution/pipeline, /execution/action-engine, /execution/schedule
 *   PERFORMANCE → /performance/financials, /performance/analytics
 *
 * v12: Dashboard removed from nav; Certification moved to footer above Settings
 * Sprint D Group 2: Added streak counter below level badge
 */

import React from 'react';
import { useApp } from '@/contexts/AppContext';
import { LEVELS } from '@/lib/store';
import { trpc } from '@/lib/trpc';
import {
  Users,
  DollarSign,
  Zap, BarChart3, UsersRound, GraduationCap,
  TrendingUp, Heart, Briefcase, Building2,
  CalendarDays, Flame, Settings, Star, BookOpen, LayoutList,
} from 'lucide-react';
import { useLocation, Link } from 'wouter';

// ── 4-PILLAR NAV — KW philosophy order: Vision → Growth → Execution → Performance ──
const NAV_ITEMS = [
  {
    section: 'VISION',
    items: [
      { label: 'Big Why',           icon: Heart,      path: '/vision/big-why' },
      { label: 'Wealth Journey',    icon: TrendingUp, path: '/vision/wealth' },
      { label: 'Agent Journey',     icon: Briefcase,  path: '/vision/agent-journey' },
      { label: 'Business Journey',  icon: Building2,  path: '/vision/business-journey' },
    ],
  },
  {
    section: 'GROWTH',
    items: [
      { label: 'Current MREA Level', icon: Star,         path: '/growth/current-level' },
      { label: 'Coaching',           icon: GraduationCap, path: '/growth/coaching' },
      { label: 'Coach Roster',       icon: LayoutList,    path: '/growth/roster' },
      { label: 'Team OS',            icon: UsersRound,    path: '/growth/team' },
    ],
  },
  {
    section: 'EXECUTION',
    items: [
      { label: 'Execution HQ',    icon: Flame,        path: '/execution' },
      { label: 'Pipeline',         icon: Users,        path: '/execution/pipeline' },
      { label: 'Action Engine',    icon: Zap,          path: '/execution/action-engine' },
      { label: 'Schedule Creator', icon: CalendarDays, path: '/execution/schedule' },
    ],
  },
  {
    section: 'PERFORMANCE',
    items: [
      { label: 'Financials', icon: DollarSign, path: '/performance/financials' },
      { label: 'Analytics',  icon: BarChart3,  path: '/performance/analytics' },
    ],
  },
];

// ── Reusable nav item inner content ──
function NavItemInner({ isActive, Icon, label, badge }: { isActive: boolean; Icon: React.ElementType; label: string; badge?: string }) {
  return (
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
        color: isActive ? '#DC143C' : 'oklch(0.7 0.005 250)',
        background: isActive ? 'rgba(220,20,60,0.12)' : 'transparent',
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
      <span className="flex-1 truncate">{label}</span>
      {badge && (
        <span
          className="text-[9px] font-bold px-1 py-0.5 rounded shrink-0"
          style={{ background: 'rgba(220,20,60,0.2)', color: '#DC143C' }}
        >
          {badge}
        </span>
      )}
    </div>
  );
}

export function AppSidebar() {
  const [location] = useLocation();
  const { state } = useApp();
  const user = state.user;

  const currentLevel = user?.currentLevel ?? 1;
  const levelData = LEVELS[currentLevel - 1];

  // Sprint D Group 2: streak data for sidebar display
  // Reuses getStreakSummary (lightweight — no duplicate heavy queries)
  const { data: streakData } = trpc.execution.getStreakSummary.useQuery(undefined, {
    staleTime: 60_000,
    retry: 1,
  });
  const currentStreak = streakData?.currentStreak ?? 0;

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

      {/* Sprint D Group 2: Streak Counter — compact, below level badge, above nav */}
      <div className="shrink-0 mx-3 mb-2 px-2 py-1 flex items-center gap-1.5">
        {currentStreak > 0 ? (
          <>
            <Flame className="w-3.5 h-3.5 shrink-0" style={{ color: '#DC143C' }} />
            <span className="text-[12px] font-bold" style={{ color: 'oklch(0.88 0.005 250)' }}>
              {currentStreak}
            </span>
            <span className="text-[12px]" style={{ color: 'oklch(0.45 0.01 250)' }}>
              day streak
            </span>
          </>
        ) : (
          <>
            <span
              className="w-1.5 h-1.5 rounded-full shrink-0"
              style={{ background: 'oklch(0.35 0.01 250)' }}
            />
            <span className="text-[12px]" style={{ color: 'oklch(0.45 0.01 250)' }}>
              Start your streak
            </span>
          </>
        )}
      </div>

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
                // External links are never "active"
                const isExternal = (item as any).external === true;
                const badge = (item as any).badge as string | undefined;
                const isActive = !isExternal && (
                  location === item.path ||
                  (item.path !== '/execution' && location.startsWith(item.path + '/'))
                );
                const Icon = item.icon;
                return (
                  <li key={item.path}>
                    {isExternal ? (
                      <a href={item.path} target="_blank" rel="noopener noreferrer">
                        <NavItemInner isActive={isActive} Icon={Icon} label={item.label} badge={badge} />
                      </a>
                    ) : (
                      <Link href={item.path}>
                        <NavItemInner isActive={isActive} Icon={Icon} label={item.label} badge={badge} />
                      </Link>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Footer — Certification + Settings + User */}
      <div
        className="shrink-0 px-3 pb-3 pt-2"
        style={{ borderTop: '1px solid oklch(0.2 0.01 250)' }}
      >
        {/* ASRE Coach Certification — sits directly above Settings */}
        <Link href="/settings/certification-interest">
          <div
            className={`
              flex items-center gap-2 px-2 py-2 rounded-md text-[13px]
              transition-colors duration-100 cursor-pointer mb-1
              ${location === '/settings/certification-interest'
                ? 'border-l-2 border-[#DC143C] rounded-l-none font-medium'
                : 'border-l-2 border-transparent'
              }
            `}
            style={{
              color: location === '/settings/certification-interest' ? '#DC143C' : 'oklch(0.6 0.005 250)',
              background: location === '/settings/certification-interest' ? 'rgba(220,20,60,0.12)' : 'transparent',
            }}
            onMouseEnter={(e) => {
              if (location !== '/settings/certification-interest') {
                (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.05)';
                (e.currentTarget as HTMLDivElement).style.color = 'oklch(0.9 0.005 250)';
              }
            }}
            onMouseLeave={(e) => {
              if (location !== '/settings/certification-interest') {
                (e.currentTarget as HTMLDivElement).style.background = 'transparent';
                (e.currentTarget as HTMLDivElement).style.color = 'oklch(0.6 0.005 250)';
              }
            }}
          >
            <BookOpen className="w-4 h-4 shrink-0" />
            <span className="flex-1 truncate">ASRE Certification</span>
            <span
              className="text-[9px] font-bold px-1 py-0.5 rounded shrink-0"
              style={{ background: 'rgba(220,20,60,0.2)', color: '#DC143C' }}
            >
              Exclusive
            </span>
          </div>
        </Link>

        {/* Settings */}
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
