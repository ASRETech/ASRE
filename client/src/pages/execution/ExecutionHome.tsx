/**
 * ExecutionHome.tsx
 *
 * The primary screen of ASRE — the Daily Execution Operating System.
 * Shows: Score → Actions → Streak → Leaderboard
 *
 * All data is live from the backend. No mock data.
 */

import { useAuth } from '@/_core/hooks/useAuth';
import { trpc } from '@/lib/trpc';
import { ExecutionScoreCard } from '@/components/execution/ExecutionScoreCard';
import { StreakTracker } from '@/components/execution/StreakTracker';
import { Leaderboard } from '@/components/execution/Leaderboard';
import { ActionList } from '@/components/execution/ActionList';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

export default function ExecutionHome() {
  const { user } = useAuth();

  const summaryQuery = trpc.execution.getSummary.useQuery(undefined, {
    refetchInterval: 60_000,
    retry: 2,
  });

  const { data: summary, isLoading, isError, error } = summaryQuery;

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Execution HQ</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Your daily operating system for revenue-producing activity.
          {user?.name ? ` Welcome back, ${user.name.split(' ')[0]}.` : ''}
        </p>
      </div>

      {/* Error state */}
      {isError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {(error as any)?.message ?? 'Failed to load execution data. Please refresh.'}
          </AlertDescription>
        </Alert>
      )}

      {/* Top row: Score + Streak */}
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
      </div>

      {/* Middle row: Actions + Leaderboard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <ActionList
            actions={summary?.actions ?? []}
            isLoading={isLoading}
          />
        </div>
        <div>
          <Leaderboard
            entries={summary?.leaderboard ?? []}
            currentUserId={user?.id}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
}
