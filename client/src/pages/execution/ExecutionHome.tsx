/**
 * ExecutionHome — ASRE Command Center
 *
 * Primary screen of the application. 12-column grid layout:
 * Row 1: Score (4col) | Today's Actions (8col)
 * Row 2: Streak (4col) | Leaderboard (4col) | Pipeline (4col)
 * Row 3: Weekly Pulse (4col) | Financials (4col) | Wealth (4col)
 */
import { useAuth } from '@/_core/hooks/useAuth';
import { trpc } from '@/lib/trpc';
import { ExecutionScoreCard } from '@/components/execution/ExecutionScoreCard';
import { StreakTracker } from '@/components/execution/StreakTracker';
import { Leaderboard } from '@/components/execution/Leaderboard';
import { ActionList } from '@/components/execution/ActionList';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { PipelineWidget } from '@/components/widgets/PipelineWidget';
import { WeeklyPulseWidget } from '@/components/widgets/WeeklyPulseWidget';
import { FinancialWidget } from '@/components/widgets/FinancialWidget';
import { WealthWidget } from '@/components/widgets/WealthWidget';

export default function ExecutionHome() {
  const { user } = useAuth();
  const summaryQuery = trpc.execution.getSummary.useQuery(undefined, {
    staleTime: 30_000,
    refetchInterval: 60_000,
    retry: 2,
  });
  const { data: summary, isLoading, isError } = summaryQuery;

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="p-4 md:p-6 max-w-[1400px] mx-auto space-y-5">

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
        <div className="lg:col-span-8">
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

      {/* ── Row 3: Weekly Pulse + Financials + Wealth ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <WeeklyPulseWidget />
        <FinancialWidget />
        <WealthWidget />
      </div>

    </div>
  );
}
