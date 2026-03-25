/**
 * ExecutionHome — ASRE Command Center
 *
 * Primary screen of the application.
 * Combines: Execution Score, Streak, Action List, Pipeline Snapshot,
 * Weekly Pulse, Financial Snapshot, and Wealth Progress.
 *
 * Widget layout is drag-and-drop reorderable via @dnd-kit.
 * Layout preference persisted to localStorage.
 */

import { useAuth } from '@/_core/hooks/useAuth';
import { trpc } from '@/lib/trpc';
import { ExecutionScoreCard } from '@/components/execution/ExecutionScoreCard';
import { StreakTracker } from '@/components/execution/StreakTracker';
import { Leaderboard } from '@/components/execution/Leaderboard';
import { ActionList } from '@/components/execution/ActionList';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, LayoutGrid } from 'lucide-react';
import { WidgetGrid, WidgetConfig } from '@/components/widgets/WidgetGrid';
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

  // ── Widget definitions for the bottom grid ──
  const WIDGETS: WidgetConfig[] = [
    {
      id: 'pipeline',
      title: 'Pipeline',
      component: <PipelineWidget />,
      span: 1,
    },
    {
      id: 'weekly-pulse',
      title: 'Weekly Pulse',
      component: <WeeklyPulseWidget />,
      span: 1,
    },
    {
      id: 'financials',
      title: 'Financials',
      component: <FinancialWidget />,
      span: 1,
    },
    {
      id: 'wealth',
      title: 'Wealth Journey',
      component: <WealthWidget />,
      span: 1,
    },
  ];

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
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
          <h1 className="text-xl font-bold text-foreground">
            {user?.name ? `Good morning, ${user.name.split(' ')[0]}` : 'Execution HQ'}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <LayoutGrid className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Drag widgets to rearrange</span>
        </div>
      </div>

      {/* ── Top Row: Score + Streak + Leaderboard ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <ExecutionScoreCard
          score={summary?.score ?? 0}
          completedActionsToday={summary?.completedActionsToday ?? 0}
          qualifiesForStreakToday={summary?.qualifiesForStreakToday ?? false}
          isLoading={isLoading}
        />
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
      </div>

      {/* ── Action List ── */}
      <div>
        <h2 className="text-sm font-semibold text-foreground mb-3">Today's Actions</h2>
        <ActionList
          actions={summary?.actions ?? []}
          isLoading={isLoading}
        />
      </div>

      {/* ── Modular Widget Grid ── */}
      <div>
        <h2 className="text-sm font-semibold text-foreground mb-3">Dashboard</h2>
        <WidgetGrid widgets={WIDGETS} />
      </div>
    </div>
  );
}
