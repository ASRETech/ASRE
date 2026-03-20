// Screen 4: Dashboard — OPERATIONAL PULSE
// AI-powered Today's Focus + KPI strip + Weekly Pulse
import { useState, useEffect } from 'react';
import { useApp } from '@/contexts/AppContext';
import { trpc } from '@/lib/trpc';
import { LEVELS } from '@/lib/store';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DollarSign, Users, TrendingUp, Activity,
  Phone, Calendar, FileText, ChevronRight,
  ArrowUpRight, ArrowDownRight, MapPin,
  Mail, Shield, BarChart3, RefreshCw, Loader2,
  CheckSquare, Sparkles, FolderSync
} from 'lucide-react';
import { Link } from 'wouter';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { CurrentLevel } from '@/components/CurrentLevel';
import { CommitmentsWidget } from '@/components/CommitmentsWidget';

interface FocusItem {
  name: string;
  action: string;
  type: 'call' | 'email' | 'calendar' | 'task';
  urgent: boolean;
}

export default function Dashboard() {
  const { state } = useApp();
  const user = state.user;
  const leads = state.leads;
  const transactions = state.transactions;
  const financials = state.financials;
  const currentLevel = user?.currentLevel ?? 1;
  const levelData = LEVELS[currentLevel - 1];

  // AI Focus state
  const [aiFocus, setAiFocus] = useState<FocusItem[]>([]);
  const [focusLoading, setFocusLoading] = useState(false);
  const coachMutation = trpc.coaching.ask.useMutation();
  // Google Drive sync
  const { data: driveStatus } = trpc.drive.getStatus.useQuery(undefined, { retry: false });
  const syncDrive = trpc.drive.syncNow.useMutation({
    onSuccess: () => toast.success('Synced to Google Drive'),
    onError: () => toast.error('Drive sync failed — is Drive connected in Settings?'),
  });

  // Calculate KPIs
  const gciThisMonth = financials
    .filter(f => f.type === 'income' && new Date(f.date).getMonth() === new Date().getMonth())
    .reduce((sum, f) => sum + f.amount, 0);
  const gciGoal = (user?.incomeGoal ?? 250000) / 12;
  const activePipelineValue = leads
    .filter(l => ['Active', 'Under Contract', 'Appt Held', 'Qualified'].includes(l.stage))
    .reduce((sum, l) => sum + l.budget, 0);
  const activePipelineCount = leads.filter(l => !['Closed', 'Dead', 'Nurture'].includes(l.stage)).length;
  const newLeadsThisWeek = leads.filter(l => {
    const d = new Date(l.createdAt);
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    return d >= weekAgo;
  }).length;

  const healthScore = Math.min(100, Math.round(
    (user?.operationalScore ?? 0) * 8 +
    Math.min(20, activePipelineCount * 2) +
    Math.min(20, (gciThisMonth / gciGoal) * 20)
  ));

  // Generate AI Focus items
  const generateFocus = () => {
    if (leads.length === 0 && transactions.length === 0) {
      setAiFocus([
        { name: 'Build your database', action: 'Add 5 contacts today', type: 'task', urgent: true },
        { name: 'Lead generation', action: 'Set up 2 lead sources', type: 'task', urgent: true },
        { name: 'Time blocking', action: 'Create weekly calendar', type: 'calendar', urgent: false },
        { name: 'MREA Journey', action: 'Complete next deliverable', type: 'task', urgent: false },
      ]);
      return;
    }
    setFocusLoading(true);

    const overdueLeads = leads
      .filter(l => l.stage === 'New Lead' || l.stage === 'Contacted')
      .slice(0, 3)
      .map(l => `${l.firstName} ${l.lastName} (${l.source})`);

    const closingSoon = transactions
      .filter(t => t.closeDate && t.status !== 'closed' && t.status !== 'cancelled')
      .map(t => `${t.propertyAddress} closing ${t.closeDate}`);

    const prompt = `Generate exactly 4 prioritized tasks for today as a JSON array. Each task: {"name": "contact name or task context", "action": "specific action under 40 chars", "type": "call"|"email"|"calendar"|"task", "urgent": true|false}. Base on: Overdue leads: ${overdueLeads.join(', ') || 'none'}. Closing soon: ${closingSoon.join(', ') || 'none'}. Total pipeline: ${leads.length} leads. Return ONLY the JSON array, no markdown.`;

    coachMutation.mutate(
      { context: 'dashboard-focus', prompt, agentLevel: currentLevel },
      {
        onSuccess: (data) => {
          try {
            const cleaned = data.response.replace(/```json?\n?/g, '').replace(/```/g, '').trim();
            const parsed = JSON.parse(cleaned);
            setAiFocus(Array.isArray(parsed) ? parsed.slice(0, 4) : []);
          } catch {
            setAiFocus(overdueLeads.slice(0, 4).map(name => ({
              name, action: 'Follow up', type: 'call' as const, urgent: true
            })));
          }
          setFocusLoading(false);
        },
        onError: () => {
          setFocusLoading(false);
          toast.error('Could not generate focus items');
        },
      }
    );
  };

  useEffect(() => {
    generateFocus();
  }, [leads.length, transactions.length]);

  // Weekly pulse data
  const weeklyPulse = [
    { label: 'Contacts Made', current: 12, goal: 25, icon: Phone },
    { label: 'Appointments Set', current: 3, goal: 5, icon: Calendar },
    { label: 'Appointments Held', current: 2, goal: 4, icon: Users },
    { label: 'Offers Written', current: 1, goal: 2, icon: FileText },
  ];

  const totalIncome = financials.filter(f => f.type === 'income').reduce((s, f) => s + f.amount, 0);
  const totalExpenses = financials.filter(f => f.type === 'expense').reduce((s, f) => s + f.amount, 0);

  const focusIcon = (type: string) => {
    if (type === 'call') return Phone;
    if (type === 'email') return Mail;
    if (type === 'calendar') return Calendar;
    return CheckSquare;
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Journey context banner */}
        <Link href="/level">
          <div className="mb-6 p-3 rounded-xl bg-[#DC143C]/[0.04] border border-[#DC143C]/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 cursor-pointer hover:bg-[#DC143C]/[0.06] transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#DC143C]/10 flex items-center justify-center shrink-0">
                <MapPin className="w-4 h-4 text-[#DC143C]" />
              </div>
              <div>
                <span className="text-xs text-muted-foreground">Level {currentLevel} — </span>
                <span className="text-xs font-medium text-foreground">{levelData?.name}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 ml-11 sm:ml-0">
              <span className="text-xs text-muted-foreground font-mono truncate max-w-[200px] sm:max-w-none">
                Next: {levelData?.deliverables.find(d => !state.deliverables.find(dd => dd.id === d.id)?.isComplete)?.title || 'All complete'}
              </span>
              <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
            </div>
          </div>
        </Link>
        {/* Sync to Drive button — only shown when Drive is connected */}
        {driveStatus?.connected && (
          <div className="flex justify-end mb-3">
            <Button
              variant="outline"
              size="sm"
              className="text-xs h-7 gap-1.5"
              onClick={() => syncDrive.mutate()}
              disabled={syncDrive.isPending}
            >
              <FolderSync className="h-3 w-3" />
              {syncDrive.isPending ? 'Syncing...' : 'Sync to Drive'}
            </Button>
          </div>
        )}
        {/* KPI Strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          {[
            {
              label: 'GCI This Month',
              value: `$${gciThisMonth.toLocaleString()}`,
              subtext: `Goal: $${Math.round(gciGoal).toLocaleString()}`,
              icon: DollarSign,
              trend: gciThisMonth >= gciGoal ? 'up' : 'down',
              trendValue: `${Math.round((gciThisMonth / gciGoal) * 100)}%`,
            },
            {
              label: 'Active Pipeline',
              value: `$${(activePipelineValue / 1000).toFixed(0)}K`,
              subtext: `${activePipelineCount} active leads`,
              icon: TrendingUp,
              trend: 'up' as const,
              trendValue: `${activePipelineCount}`,
            },
            {
              label: 'Leads This Week',
              value: newLeadsThisWeek.toString(),
              subtext: 'New opportunities',
              icon: Users,
              trend: newLeadsThisWeek > 3 ? 'up' : 'neutral',
              trendValue: newLeadsThisWeek > 3 ? '+' + newLeadsThisWeek : '' + newLeadsThisWeek,
            },
            {
              label: 'Health Score',
              value: healthScore.toString(),
              subtext: '/100',
              icon: Activity,
              trend: healthScore >= 60 ? 'up' : 'down',
              trendValue: healthScore >= 60 ? 'Good' : 'Needs work',
            },
          ].map((kpi, i) => (
            <motion.div key={kpi.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                    <kpi.icon className="w-4 h-4 text-muted-foreground" />
                  </div>
                  {kpi.trend === 'up' && (
                    <div className="flex items-center gap-0.5 text-emerald-500">
                      <ArrowUpRight className="w-3.5 h-3.5" />
                      <span className="text-[10px] font-mono">{kpi.trendValue}</span>
                    </div>
                  )}
                  {kpi.trend === 'down' && (
                    <div className="flex items-center gap-0.5 text-amber-500">
                      <ArrowDownRight className="w-3.5 h-3.5" />
                      <span className="text-[10px] font-mono">{kpi.trendValue}</span>
                    </div>
                  )}
                </div>
                <div className="font-mono text-2xl font-bold text-foreground">{kpi.value}</div>
                <div className="text-[11px] text-muted-foreground mt-0.5">{kpi.subtext}</div>
                <div className="text-[10px] text-muted-foreground/60 mt-1 uppercase tracking-wider">{kpi.label}</div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Middle Row */}
        <div className="grid md:grid-cols-2 lg:grid-cols-[1fr_280px_280px] gap-4 mb-6">
          {/* Pipeline Snapshot */}
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-sm font-semibold text-foreground">Pipeline Snapshot</h3>
              <Link href="/pipeline">
                <Button variant="ghost" size="sm" className="text-xs text-muted-foreground h-7 px-2">
                  View All <ChevronRight className="w-3 h-3 ml-1" />
                </Button>
              </Link>
            </div>
            <div className="flex gap-1.5 overflow-x-auto pb-2">
              {['New Lead', 'Contacted', 'Qualified', 'Appt Set', 'Active', 'Under Contract'].map((stage) => {
                const count = leads.filter(l => l.stage === stage).length;
                const value = leads.filter(l => l.stage === stage).reduce((s, l) => s + l.budget, 0);
                return (
                  <div key={stage} className="flex-1 min-w-[80px] p-2.5 rounded-lg bg-muted/50 text-center">
                    <div className="font-mono text-lg font-bold text-foreground">{count}</div>
                    <div className="text-[9px] text-muted-foreground uppercase tracking-wider truncate">{stage}</div>
                    {value > 0 && (
                      <div className="text-[10px] font-mono text-muted-foreground mt-0.5">${(value / 1000).toFixed(0)}K</div>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>

          {/* AI Today's Focus */}
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-sm font-semibold text-foreground flex items-center gap-1.5">
                Today's Focus
              </h3>
              <div className="flex items-center gap-1">
                <Badge variant="outline" className="text-[10px] font-mono h-5 px-2 text-[#DC143C] border-[#DC143C]/20">
                  <Sparkles className="w-2.5 h-2.5 mr-0.5" /> AI
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={generateFocus}
                  disabled={focusLoading}
                >
                  <RefreshCw className={`w-3 h-3 ${focusLoading ? 'animate-spin' : ''}`} />
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              {focusLoading ? (
                [1, 2, 3, 4].map(i => (
                  <div key={i} className="flex items-center gap-2.5 p-2">
                    <Skeleton className="w-7 h-7 rounded-lg" />
                    <div className="flex-1">
                      <Skeleton className="h-3 w-24 mb-1" />
                      <Skeleton className="h-2.5 w-32" />
                    </div>
                  </div>
                ))
              ) : aiFocus.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">
                  <Sparkles className="w-6 h-6 mx-auto mb-2 opacity-30" />
                  <p className="text-xs">Add leads or transactions to get AI-powered focus items</p>
                </div>
              ) : (
                aiFocus.map((item, i) => {
                  const Icon = focusIcon(item.type);
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -5 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.08 }}
                      className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-muted/50 transition-colors group"
                    >
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                        item.urgent ? 'bg-[#DC143C]/10 text-[#DC143C]' : 'bg-muted text-muted-foreground'
                      }`}>
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-medium text-foreground truncate">{item.name}</div>
                        <div className="text-[10px] text-muted-foreground">{item.action}</div>
                      </div>
                      {item.urgent && (
                        <Badge variant="outline" className="text-[8px] font-mono text-[#DC143C] border-[#DC143C]/20 h-4 px-1">
                          URGENT
                        </Badge>
                      )}
                    </motion.div>
                  );
                })
              )}
            </div>
          </Card>

          {/* Weekly Pulse */}
          <Card className="p-5">
            <h3 className="font-display text-sm font-semibold text-foreground mb-4">Weekly Pulse</h3>
            <div className="space-y-3">
              {weeklyPulse.map((item) => {
                const pct = Math.round((item.current / item.goal) * 100);
                return (
                  <div key={item.label}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-muted-foreground">{item.label}</span>
                      <span className="text-xs font-mono text-foreground">{item.current}/{item.goal}</span>
                    </div>
                    <Progress value={Math.min(100, pct)} className="h-1.5" />
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Bottom Row */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Cash Flow */}
          <Card className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <DollarSign className="w-4 h-4 text-muted-foreground" />
              <h3 className="font-display text-sm font-semibold text-foreground">Cash Flow</h3>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">Income MTD</span>
                <span className="font-mono text-sm font-semibold text-emerald-500">${totalIncome.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">Expenses MTD</span>
                <span className="font-mono text-sm font-semibold text-foreground">${totalExpenses.toLocaleString()}</span>
              </div>
              <div className="border-t border-border pt-2 flex justify-between items-center">
                <span className="text-xs font-medium text-foreground">Net</span>
                <span className={`font-mono text-sm font-bold ${totalIncome - totalExpenses >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                  ${(totalIncome - totalExpenses).toLocaleString()}
                </span>
              </div>
            </div>
          </Card>

          {/* Marketing */}
          <Card className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="w-4 h-4 text-muted-foreground" />
              <h3 className="font-display text-sm font-semibold text-foreground">Marketing</h3>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">Leads Added (30 days)</span>
                <span className="font-mono text-sm text-foreground">{leads.filter(l => new Date(l.createdAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">Active Leads</span>
                <span className="font-mono text-sm text-foreground">{activePipelineCount}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">Pipeline Value</span>
                <span className="font-mono text-sm text-foreground">${(activePipelineValue / 1000).toFixed(0)}K</span>
              </div>
            </div>
          </Card>

          {/* MREA Level Progress (Phase 6) */}
          <CurrentLevel />

          {/* Coaching Commitments (Phase 6) */}
          <CommitmentsWidget />

        </div>
      </div>
    </div>
  );
}
