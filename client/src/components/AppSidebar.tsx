import { useApp } from '@/contexts/AppContext';
import { LEVELS } from '@/lib/store';
import {
  Map, Target, LayoutDashboard, Users, FileText,
  DollarSign, BookOpen, Heart, Shield, Settings,
  Zap, BarChart3, UsersRound, GraduationCap,
  Handshake, Star, UserPlus, Award, Wrench,
} from 'lucide-react';
import { useLocation, Link } from 'wouter';
import { trpc } from '@/lib/trpc';

const NAV_ITEMS = [
  {
    section: 'JOURNEY',
    items: [
      { label: 'My Journey', icon: Map, path: '/journey', accent: true },
      { label: 'Current Level', icon: Target, path: '/level', accent: true },
    ],
  },
  {
    section: 'OPERATIONS',
    items: [
      { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
      { label: 'Pipeline', icon: Users, path: '/pipeline' },
      { label: 'Transactions', icon: FileText, path: '/transactions' },
      { label: 'Financials', icon: DollarSign, path: '/financials' },
      { label: 'Analytics', icon: BarChart3, path: '/analytics' },
    ],
  },
  {
    section: 'TEAM',
    items: [
      { label: 'Team OS', icon: UsersRound, path: '/team' },
      { label: 'Recruiting', icon: UserPlus, path: '/recruiting' },
      { label: 'Coach Hub', icon: GraduationCap, path: '/coach' },
      { label: 'Certification', icon: Award, path: '/certification' },
    ],
  },
  {
    section: 'GROWTH',
    items: [
      { label: 'Referrals', icon: Handshake, path: '/referrals' },
      { label: 'Reviews', icon: Star, path: '/reviews' },
    ],
  },
  {
    section: 'FOUNDATION',
    items: [
      { label: 'Knowledge Library', icon: BookOpen, path: '/library' },
      { label: 'Culture OS', icon: Heart, path: '/culture' },
      { label: 'Compliance', icon: Shield, path: '/compliance' },
      { label: 'AI Tools', icon: Wrench, path: '/tools' },
    ],
  },
];

export function AppSidebar() {
  const [location] = useLocation();
  const { state } = useApp();
  const user = state.user;
  const draftsQuery = trpc.journey.getDrafts.useQuery(undefined, {
    refetchInterval: 60000,
  });
  const draftCount = draftsQuery.data?.length ?? 0;
  const currentLevel = user?.currentLevel ?? 1;
  const levelData = LEVELS[currentLevel - 1];
  const progressPercent = ((currentLevel - 1) / 6) * 100;

  return (
    <div
      className="flex flex-col h-full w-full"
      style={{ background: 'oklch(0.075 0.01 250)' }}
    >
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 pt-5 pb-3 shrink-0">
        <Link href="/journey" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#DC143C] flex items-center justify-center shrink-0">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span
            className="text-base font-bold tracking-tight"
            style={{ color: 'oklch(0.95 0.005 250)', fontFamily: 'var(--font-display)' }}
          >
            AgentOS
          </span>
        </Link>
      </div>

      {/* Progress spine */}
      <div className="px-4 pb-3 shrink-0">
        <div
          className="h-1 rounded-full overflow-hidden"
          style={{ background: 'rgba(255,255,255,0.1)' }}
        >
          <div
            className="h-full rounded-full bg-[#DC143C] transition-all duration-700 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <div className="mt-1.5 flex items-center justify-between">
          <span
            className="text-[10px] font-mono"
            style={{ color: 'oklch(0.5 0.01 250)' }}
          >
            LVL {currentLevel}
          </span>
          <span
            className="text-[10px] font-mono"
            style={{ color: 'oklch(0.5 0.01 250)' }}
          >
            {levelData?.name}
          </span>
        </div>
      </div>

      {/* Nav — scrollable */}
      <nav className="flex-1 overflow-y-auto px-2 pb-2"
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
                const isActive = location === item.path;
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
                        {item.path === '/journey' && draftCount > 0 && (
                          <span className="ml-auto text-[9px] font-mono bg-[#DC143C] text-white
                            rounded-full w-4 h-4 flex items-center justify-center shrink-0">
                            {draftCount}
                          </span>
                        )}
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
