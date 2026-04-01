/**
 * ExecutionHome — ASRE Command Center
 *
 * Primary screen of the application. 12-column grid layout:
 * Row 1: Score (4col) | Today's Actions (8col)
 * [Sprint D] Coaching Nudge — full width between Row 1 and Row 2
 * Row 2: Streak (4col) | Leaderboard (4col) | Pipeline (4col)
 * Row 3: Vision (1col) | Weekly Pulse (1col) | Financials+GCI (1col) | Wealth (1col)
 *
 * Sprint D additions:
 *   - CoachingNudge: AI-generated 1-2 sentence observation (Group 1)
 *   - GciPaceCard: YTD GCI vs goal progress bar (Group 1)
 *   - StreakAtRiskAlert: afternoon alert when streak is at risk (Group 2)
 */
import { useState } from 'react';
import { useAuth } from '@/_core/hooks/useAuth';
import { trpc } from '@/lib/trpc';
import { ExecutionScoreCard } from '@/components/execution/ExecutionScoreCard';
import { StreakTracker } from '@/components/execution/StreakTracker';
import { Leaderboard } from '@/components/execution/Leaderboard';
import { ActionList } from '@/components/execution/ActionList';
import { CoachingNudge } from '@/components/execution/CoachingNudge';
import { GciPaceCard } from '@/components/execution/GciPaceCard';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Flame, X } from 'lucide-react';
import { PipelineWidget } from '@/components/widgets/PipelineWidget';
import { WeeklyPulseWidget } from '@/components/widgets/WeeklyPulseWidget';
import { FinancialWidget } from '@/components/widgets/FinancialWidget';
import { WealthWidget } from '@/components/widgets/WealthWidget';
import { VisionAnchorWidget } from '@/components/widgets/VisionAnchorWidget';

export default function ExecutionHome() {
  const { user } = useAuth();
  const summaryQuery = trpc.execution.getSummary.useQuery(undefined, {
    staleTime: 30_000,
    refetchInterval: 60_000,
    retry: 2,
  });
  const { data: summary, isLoading, isError } = summaryQuery;

  // Sprint D Group 2: streak-at-risk alert dismiss state
  const [streakAlertDismissed, setStreakAlertDismissed] = useState(false);

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  // Sprint D Group 2: streak-at-risk conditions
  const now = new Date();
  const isAfternoon = now.getHours() > 15 || (now.getHours() === 15 && now.getMinutes() >= 30);
  const showStreakAlert =
    !streakAlertDismissed &&
    isAfternoon &&
    (summary?.currentStreak ?? 0) > 0 &&
    (summary?.completedActionsToday ?? 0) === 0;

  const scrollToActions = () => {
    const el = document.getElementById('action-list-section');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="p-4 md:p-6 max-w-[1400px] mx-auto space-y-5">

      {/* ── Streak-at-Risk Alert (Sprint D Group 2) ── */}
      {showStreakAlert && (
        <div
          className="flex items-center gap-3 rounded-lg border px-4 py-3 text-sm"
          style={{
            background: 'rgba(220,20,60,0.08)',
            borderColor: 'rgba(220,20,60,0.3)',
          }}
        >
          <Flame className="h-4 w-4 shrink-0" style={{ color: '#DC143C' }} />
          <span className="flex-1 text-foreground">
            Log at least one action to keep your{' '}
            <strong>{summary?.currentStreak}-day streak</strong> alive today.
          </span>
          <button
            onClick={scrollToActions}
            className="text-xs font-semibold shrink-0 hover:underline"
            style={{ color: '#DC143C' }}
          >
            Log Action →
          </button>
          <button
            onClick={() => setStreakAlertDismissed(true)}
            className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Dismiss"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* ── Error Banner ── */}
      {isError && (
        <Alert variant="destructive" className="border-destructive/50">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Could not load execution data. Your progress is safe — refresh to retry.
          </AlertDescription>
        </Alert>
      )}

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {user?.name ? `${greeting()}, ${user.name.split(' ')[0]}` : 'Execution HQ'}
          </h1>
          <p className="text-base text-muted-foreground mt-0.5">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-[11px] text-muted-foreground bg-muted/40 rounded-md px-3 py-1.5 border border-border/50">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Live
        </div>
      </div>

      {/* ── Row 1: Score (left) + Actions (right) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Score Card — 4 cols */}
        <div className="lg:col-span-4">
          <ExecutionScoreCard
            score={summary?.score ?? 0}
            completedActionsToday={summary?.completedActionsToday ?? 0}
            qualifiesForStreakToday={summary?.qualifiesForStreakToday ?? false}
            isLoading={isLoading}
          />
        </div>
        {/* Today's Actions — 8 cols */}
        <div className="lg:col-span-8" id="action-list-section">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-base font-semibold text-foreground">Today's Actions</h2>
            <span className="text-[11px] text-muted-foreground">
              {summary?.completedActionsToday ?? 0} / {(summary?.actions ?? []).length} complete
            </span>
          </div>
          <ActionList
            actions={summary?.actions ?? []}
            isLoading={isLoading}
          />
        </div>
      </div>

      {/* ── Coaching Nudge (Sprint D Group 1) — full width ── */}
      <CoachingNudge />

      {/* ── Row 2: Streak + Leaderboard + Pipeline ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StreakTracker
          currentStreak={summary?.currentStreak ?? 0}
          longestStreak={summary?.longestStreak ?? 0}
          qualifiesForStreakToday={summary?.qualifiesForStreakToday ?? false}
          completedActionsToday={summary?.completedActionsToday ?? 0}
          isLoading={isLoading}
        />
        <Leaderboard
          entries={summary?.leaderboard ?? []}
          currentUserId={user?.id}
          isLoading={isLoading}
        />
        <PipelineWidget />
      </div>

      {/* ── Row 3: Vision + Weekly Pulse + Financials + Wealth ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-border bg-card p-4">
          <VisionAnchorWidget />
        </div>
        <WeeklyPulseWidget />
        {/* Financials column: GCI Pace Card (Sprint D) above existing FinancialWidget */}
        <div className="rounded-xl border border-border bg-card p-4 flex flex-col">
          <GciPaceCard />
          <FinancialWidget />
        </div>
        <WealthWidget />
      </div>

    </div>
  );
}
