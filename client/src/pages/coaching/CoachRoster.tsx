/**
 * Coach Roster Dashboard — /growth/roster
 *
 * Powered by coachPortal.getRosterSnapshots which returns PCxAgentSnapshot[]
 * built from ASRE-native data. This is the primary coaching view for Trevor's
 * 23-agent beta cohort.
 *
 * Color coding:
 *   - Streak = 0 → amber flag
 *   - Last Pulse > 7 days → red flag
 *   - Goal Pace < 50% past Q1 → amber flag
 *   - Deliverables % = 0 with level > 1 → amber flag
 *
 * These are coaching conversation triggers, not automated alerts.
 */

import { useState, useMemo } from 'react';
import { trpc } from '@/lib/trpc';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Users,
  Search,
  ArrowUpDown,
  AlertTriangle,
  CheckCircle2,
  Zap,
  TrendingUp,
  Calendar,
  RefreshCw,
} from 'lucide-react';

// ── Types ─────────────────────────────────────────────────────────────────────

type Snapshot = {
  asreUserId: number;
  pcxAgentId: string | null;
  agentName: string;
  marketCenter: string;
  mrealLevel: number;
  deliverablesPct: number;
  currentStreak: number;
  longestStreak: number;
  weeklyContacts: number;
  gciYTD: number;
  incomeGoal: number;
  goalPacePercent: number;
  lastWeeklyPulseDate: string | null;
  lastSessionDate: string | null;
  wealthHealthScore: number | null;
  pcxSyncEnabled: boolean;
  snapshotGeneratedAt: string;
  // Sprint D Group 3
  actionsThisWeek?: number;
  pulseSubmittedThisWeek?: boolean;
  heartbeatStatus?: 'active' | 'light' | 'inactive' | 'dark';
};

type SortKey = keyof Pick<
  Snapshot,
  | 'agentName'
  | 'mrealLevel'
  | 'deliverablesPct'
  | 'currentStreak'
  | 'weeklyContacts'
  | 'gciYTD'
  | 'goalPacePercent'
>;

// ── Helpers ───────────────────────────────────────────────────────────────────

function daysSince(dateStr: string | null): number | null {
  if (!dateStr) return null;
  const ms = Date.now() - new Date(dateStr).getTime();
  return Math.floor(ms / (1000 * 60 * 60 * 24));
}

function formatCurrency(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n}`;
}

function isQ1Past(): boolean {
  const now = new Date();
  return now.getMonth() >= 3; // April onward = Q1 is past
}

// ── Flag logic ────────────────────────────────────────────────────────────────

function getFlags(s: Snapshot): { label: string; severity: 'red' | 'amber' }[] {
  const flags: { label: string; severity: 'red' | 'amber' }[] = [];
  const pulseAge = daysSince(s.lastWeeklyPulseDate);

  if (pulseAge === null || pulseAge > 7) {
    flags.push({ label: 'No recent pulse', severity: 'red' });
  }
  if (s.currentStreak === 0) {
    flags.push({ label: 'Streak broken', severity: 'amber' });
  }
  if (isQ1Past() && s.goalPacePercent < 50) {
    flags.push({ label: 'Behind goal pace', severity: 'amber' });
  }
  if (s.mrealLevel > 1 && s.deliverablesPct === 0) {
    flags.push({ label: 'No deliverables', severity: 'amber' });
  }
  return flags;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function CoachRoster() {
  const { data: snapshots, isLoading, refetch, isFetching } =
    trpc.coachPortal.getRosterSnapshots.useQuery(undefined, {
      staleTime: 5 * 60 * 1000, // 5-minute cache — snapshots are expensive to build
    });

  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('agentName');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [levelFilter, setLevelFilter] = useState<string>('all');

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(d => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const filtered = useMemo(() => {
    if (!snapshots) return [];
    return snapshots
      .filter(s => {
        const matchesSearch =
          s.agentName.toLowerCase().includes(search.toLowerCase()) ||
          s.marketCenter.toLowerCase().includes(search.toLowerCase());
        const matchesLevel =
          levelFilter === 'all' || String(s.mrealLevel) === levelFilter;
        return matchesSearch && matchesLevel;
      })
      .sort((a, b) => {
        const av = a[sortKey];
        const bv = b[sortKey];
        if (typeof av === 'string' && typeof bv === 'string') {
          return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
        }
        const an = Number(av);
        const bn = Number(bv);
        return sortDir === 'asc' ? an - bn : bn - an;
      });
  }, [snapshots, search, sortKey, sortDir, levelFilter]);

  const SortHeader = ({
    label,
    field,
  }: {
    label: string;
    field: SortKey;
  }) => (
    <button
      onClick={() => handleSort(field)}
      className="flex items-center gap-1 text-white/60 hover:text-white transition-colors text-xs uppercase tracking-wider font-mono"
    >
      {label}
      <ArrowUpDown className="w-3 h-3" />
    </button>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64 text-white/40">
        <RefreshCw className="w-5 h-5 animate-spin mr-2" />
        Building roster snapshots…
      </div>
    );
  }

  const totalAgents = snapshots?.length ?? 0;
  const flaggedCount = (snapshots ?? []).filter(s => getFlags(s).some(f => f.severity === 'red')).length;
  const avgGoalPace = totalAgents > 0
    ? Math.round((snapshots ?? []).reduce((sum, s) => sum + s.goalPacePercent, 0) / totalAgents)
    : 0;

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto">
      {/* ── Header ── */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 rounded-xl bg-[#DC143C] flex items-center justify-center">
              <Users className="w-4.5 h-4.5 text-white" />
            </div>
            <h1 className="font-display text-2xl font-bold text-white">Coach Roster</h1>
          </div>
          <p className="text-white/40 text-sm ml-12">
            {totalAgents} active agent{totalAgents !== 1 ? 's' : ''} · PCx port-ready data layer
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={isFetching}
          className="border-white/10 text-white/60 hover:text-white hover:border-white/20 gap-2"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* ── KPI strip ── */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white/[0.03] border border-white/10 rounded-xl p-4">
          <div className="text-white/40 text-xs uppercase tracking-wider mb-1 font-mono">Total Agents</div>
          <div className="text-2xl font-bold text-white font-display">{totalAgents}</div>
        </div>
        <div className="bg-white/[0.03] border border-white/10 rounded-xl p-4">
          <div className="text-white/40 text-xs uppercase tracking-wider mb-1 font-mono">Needs Attention</div>
          <div className={`text-2xl font-bold font-display ${flaggedCount > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
            {flaggedCount}
          </div>
        </div>
        <div className="bg-white/[0.03] border border-white/10 rounded-xl p-4">
          <div className="text-white/40 text-xs uppercase tracking-wider mb-1 font-mono">Avg Goal Pace</div>
          <div className={`text-2xl font-bold font-display ${avgGoalPace >= 80 ? 'text-emerald-400' : avgGoalPace >= 50 ? 'text-amber-400' : 'text-red-400'}`}>
            {avgGoalPace}%
          </div>
        </div>
      </div>

      {/* ── Filters ── */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search agents or market center…"
            className="pl-9 bg-white/5 border-white/10 text-white placeholder:text-white/20 h-9"
          />
        </div>
        <Select value={levelFilter} onValueChange={setLevelFilter}>
          <SelectTrigger className="w-40 bg-white/5 border-white/10 text-white h-9">
            <SelectValue placeholder="All levels" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All levels</SelectItem>
            {[1, 2, 3, 4, 5, 6, 7].map(l => (
              <SelectItem key={l} value={String(l)}>Level {l}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="text-white/30 text-sm font-mono">
          {filtered.length} of {totalAgents}
        </span>
      </div>

      {/* ── Table ── */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-white/30">
          {totalAgents === 0
            ? 'No active agents assigned. Invite agents from the Coach Hub.'
            : 'No agents match your filters.'}
        </div>
      ) : (
        <div className="border border-white/10 rounded-xl overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-white/10 hover:bg-transparent">
                <TableHead className="w-[200px]">
                  <SortHeader label="Agent" field="agentName" />
                </TableHead>
                <TableHead>
                  <SortHeader label="Level" field="mrealLevel" />
                </TableHead>
                <TableHead>
                  <SortHeader label="Deliverables" field="deliverablesPct" />
                </TableHead>
                <TableHead>
                  <SortHeader label="Streak" field="currentStreak" />
                </TableHead>
                <TableHead>
                  <SortHeader label="Contacts" field="weeklyContacts" />
                </TableHead>
                <TableHead>
                  <SortHeader label="GCI YTD" field="gciYTD" />
                </TableHead>
                <TableHead>
                  <SortHeader label="Goal Pace" field="goalPacePercent" />
                </TableHead>
                <TableHead className="text-white/60 text-xs uppercase tracking-wider font-mono">
                  Activity
                </TableHead>
                <TableHead className="text-white/60 text-xs uppercase tracking-wider font-mono">
                  Last Pulse
                </TableHead>
                <TableHead className="text-white/60 text-xs uppercase tracking-wider font-mono">
                  Flags
                </TableHead>
                <TableHead className="text-white/60 text-xs uppercase tracking-wider font-mono">
                  Pre-Brief
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(s => {
                const flags = getFlags(s);
                const pulseAge = daysSince(s.lastWeeklyPulseDate);
                const hasRedFlag = flags.some(f => f.severity === 'red');
                const hasAmberFlag = flags.some(f => f.severity === 'amber');

                return (
                  <TableRow
                    key={s.asreUserId}
                    className="border-white/[0.06] hover:bg-white/[0.03] transition-colors cursor-default"
                  >
                    {/* Agent name */}
                    <TableCell>
                      <div className="font-medium text-white text-sm">{s.agentName}</div>
                      {s.marketCenter && (
                        <div className="text-white/30 text-xs mt-0.5">{s.marketCenter}</div>
                      )}
                    </TableCell>

                    {/* MREA Level */}
                    <TableCell>
                      <Badge
                        variant="outline"
                        className="border-white/20 text-white/70 font-mono text-xs"
                      >
                        L{s.mrealLevel}
                      </Badge>
                    </TableCell>

                    {/* Deliverables % */}
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-white/10 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#DC143C] rounded-full"
                            style={{ width: `${s.deliverablesPct}%` }}
                          />
                        </div>
                        <span className="text-white/60 text-xs font-mono">{s.deliverablesPct}%</span>
                      </div>
                    </TableCell>

                    {/* Streak */}
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <Zap className={`w-3.5 h-3.5 ${s.currentStreak > 0 ? 'text-amber-400' : 'text-white/20'}`} />
                        <span className={`text-sm font-mono ${s.currentStreak > 0 ? 'text-white' : 'text-white/30'}`}>
                          {s.currentStreak}d
                        </span>
                      </div>
                    </TableCell>

                    {/* Weekly contacts */}
                    <TableCell>
                      <span className="text-white/70 text-sm font-mono">{s.weeklyContacts}</span>
                    </TableCell>

                    {/* GCI YTD */}
                    <TableCell>
                      <span className="text-white/70 text-sm font-mono">{formatCurrency(s.gciYTD)}</span>
                    </TableCell>

                    {/* Goal pace */}
                    <TableCell>
                      <span
                        className={`text-sm font-mono font-medium ${
                          s.goalPacePercent >= 80
                            ? 'text-emerald-400'
                            : s.goalPacePercent >= 50
                            ? 'text-amber-400'
                            : 'text-red-400'
                        }`}
                      >
                        {s.goalPacePercent}%
                      </span>
                    </TableCell>

                    {/* Heartbeat status */}
                    <TableCell>
                      {(() => {
                        const hb = s.heartbeatStatus;
                        const dotColor =
                          hb === 'active'   ? 'bg-emerald-500' :
                          hb === 'light'    ? 'bg-amber-400' :
                          hb === 'inactive' ? 'bg-red-500' :
                          'bg-zinc-600';
                        const label =
                          hb === 'active'   ? 'Active' :
                          hb === 'light'    ? 'Light' :
                          hb === 'inactive' ? 'None' :
                          'Dark';
                        return (
                          <div className="flex items-center gap-1.5">
                            <span className={`w-2 h-2 rounded-full shrink-0 ${dotColor}`} />
                            <span className="text-white/50 text-xs font-mono">{label}</span>
                          </div>
                        );
                      })()}
                    </TableCell>

                    {/* Last pulse */}
                    <TableCell>
                      {pulseAge === null ? (
                        <span className="text-red-400 text-xs font-mono">Never</span>
                      ) : pulseAge > 7 ? (
                        <span className="text-red-400 text-xs font-mono">{pulseAge}d ago</span>
                      ) : (
                        <span className="text-white/50 text-xs font-mono">{pulseAge}d ago</span>
                      )}
                    </TableCell>

                    {/* Flags */}
                    <TableCell>
                      {flags.length === 0 ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <Tooltip>
                          <TooltipTrigger>
                            <div className="flex items-center gap-1">
                              <AlertTriangle
                                className={`w-4 h-4 ${hasRedFlag ? 'text-red-400' : 'text-amber-400'}`}
                              />
                              <span className={`text-xs font-mono ${hasRedFlag ? 'text-red-400' : 'text-amber-400'}`}>
                                {flags.length}
                              </span>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent className="bg-[#1a1a1a] border-white/10 text-white">
                            <ul className="space-y-1 text-xs">
                              {flags.map((f, i) => (
                                <li key={i} className={f.severity === 'red' ? 'text-red-400' : 'text-amber-400'}>
                                  · {f.label}
                                </li>
                              ))}
                            </ul>
                          </TooltipContent>
                        </Tooltip>
                      )}
                    </TableCell>

                    {/* Pre-brief button */}
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 text-white/40 hover:text-white hover:bg-white/5 text-xs gap-1"
                        onClick={() => {
                          // Navigate to coach portal with this agent pre-selected
                          window.location.href = `/growth/coaching?agent=${s.asreUserId}`;
                        }}
                      >
                        <Calendar className="w-3 h-3" />
                        Brief
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {/* ── PCx integration status footer ── */}
      <div className="flex items-center gap-2 text-white/20 text-xs font-mono pt-2 border-t border-white/[0.06]">
        <TrendingUp className="w-3 h-3" />
        <span>
          PCx port-ready · {(snapshots ?? []).filter(s => s.pcxSyncEnabled).length} of {totalAgents} agents opted in to sync ·
          API not yet live
        </span>
      </div>
    </div>
  );
}
