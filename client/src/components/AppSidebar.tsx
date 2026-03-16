// Design: "Command Center" — Near-black sidebar as the command rail
// Journey-first navigation: My Journey and Current Level are primary
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  SidebarRail,
} from '@/components/ui/sidebar';
import { useApp } from '@/contexts/AppContext';
import { LEVELS } from '@/lib/store';
import {
  Map,
  Target,
  LayoutDashboard,
  Users,
  FileText,
  DollarSign,
  BookOpen,
  Heart,
  Shield,
  Settings,
  ChevronUp,
  Zap,
} from 'lucide-react';
import { useLocation, Link } from 'wouter';

const NAV_ITEMS = [
  { section: 'Journey', items: [
    { label: 'My Journey', icon: Map, path: '/journey', accent: true },
    { label: 'Current Level', icon: Target, path: '/level', accent: true },
  ]},
  { section: 'Operations', items: [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { label: 'Pipeline', icon: Users, path: '/pipeline' },
    { label: 'Transactions', icon: FileText, path: '/transactions' },
    { label: 'Financials', icon: DollarSign, path: '/financials' },
  ]},
  { section: 'Foundation', items: [
    { label: 'Knowledge Library', icon: BookOpen, path: '/library' },
    { label: 'Culture OS', icon: Heart, path: '/culture' },
    { label: 'Compliance', icon: Shield, path: '/compliance' },
  ]},
];

export function AppSidebar() {
  const [location] = useLocation();
  const { state } = useApp();
  const user = state.user;
  const currentLevel = user?.currentLevel ?? 1;
  const levelData = LEVELS[currentLevel - 1];

  // Calculate progress spine height based on level
  const progressPercent = ((currentLevel - 1) / 6) * 100;

  return (
    <Sidebar collapsible="icon" className="border-r-0">
      <SidebarHeader className="p-4 pb-2">
        <Link href="/journey" className="flex items-center gap-2.5 group-data-[collapsible=icon]:justify-center">
          <div className="w-8 h-8 rounded-lg bg-[#DC143C] flex items-center justify-center shrink-0">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <div className="group-data-[collapsible=icon]:hidden">
            <span className="font-display text-base font-bold text-white tracking-tight">AgentOS</span>
          </div>
        </Link>
      </SidebarHeader>

      {/* Progress Spine — thin crimson line showing level progress */}
      <div className="relative mx-4 mb-2 group-data-[collapsible=icon]:mx-auto group-data-[collapsible=icon]:w-1">
        <div className="h-1 rounded-full bg-white/10 overflow-hidden">
          <div
            className="h-full rounded-full bg-[#DC143C] transition-all duration-1000 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <div className="mt-1.5 flex items-center justify-between group-data-[collapsible=icon]:hidden">
          <span className="text-[10px] font-mono text-sidebar-foreground/50">LVL {currentLevel}</span>
          <span className="text-[10px] font-mono text-sidebar-foreground/50">{levelData?.name}</span>
        </div>
      </div>

      <SidebarContent>
        {NAV_ITEMS.map((group) => (
          <SidebarGroup key={group.section}>
            <SidebarGroupLabel className="text-[10px] uppercase tracking-[0.15em] text-sidebar-foreground/40 font-medium">
              {group.section}
            </SidebarGroupLabel>
            <SidebarMenu>
              {group.items.map((item) => {
                const isActive = location === item.path;
                const Icon = item.icon;
                return (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.label}
                      className={
                        isActive
                          ? 'bg-[#DC143C]/15 text-[#DC143C] font-medium border-l-2 border-[#DC143C] rounded-l-none'
                          : 'text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-white/5'
                      }
                    >
                      <Link href={item.path}>
                        <Icon className="w-4 h-4 shrink-0" />
                        <span className="text-[13px]">{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="p-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={location === '/settings'}
              tooltip="Settings"
              className="text-sidebar-foreground/50 hover:text-sidebar-foreground hover:bg-white/5"
            >
              <Link href="/settings">
                <Settings className="w-4 h-4" />
                <span className="text-[13px]">Settings</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        {user && (
          <div className="mt-2 px-2 py-2 rounded-lg bg-white/5 group-data-[collapsible=icon]:hidden">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-[#DC143C]/20 flex items-center justify-center text-[11px] font-bold text-[#DC143C]">
                {user.name?.charAt(0) || 'A'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-sidebar-foreground truncate">{user.name}</p>
                <p className="text-[10px] text-sidebar-foreground/50 truncate">{user.brokerage}</p>
              </div>
            </div>
          </div>
        )}
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
