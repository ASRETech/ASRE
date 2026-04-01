/**
 * GciPaceCard.tsx — Sprint D Group 1
 *
 * Displays YTD GCI vs annual goal with projected annual pace.
 * All data is manually entered by the agent — no automation.
 */
import { trpc } from '@/lib/trpc';
import { Skeleton } from '@/components/ui/skeleton';

function fmt(n: number): string {
  return '$' + Math.floor(n).toLocaleString('en-US');
}

export function GciPaceCard() {
  const { data, isLoading, isError } = trpc.execution.getGciPace.useQuery(undefined, {
    staleTime: 60_000,
    retry: 1,
  });

  if (isError) return null;

  if (isLoading) {
    return (
      <div className="space-y-2 mb-3">
        <Skeleton className="h-4 w-full rounded" />
        <Skeleton className="h-2 w-full rounded-full" />
        <Skeleton className="h-4 w-3/4 rounded" />
      </div>
    );
  }

  if (!data || data.incomeGoal === 0) return null;

  const pct = Math.min(100, data.percentComplete);
  const ahead = data.projectedGap <= 0;
  const gapAbs = Math.abs(data.projectedGap);

  return (
    <div className="mb-3 space-y-2">
      {/* Top row: label + pace badge */}
      <div className="flex items-center justify-between">
        <span
          className="font-medium tracking-widest"
          style={{ fontSize: '10px', textTransform: 'uppercase', color: 'oklch(0.5 0.01 250)' }}
        >
          GCI Progress
        </span>
        <span
          className="text-[10px] font-semibold px-1.5 py-0.5 rounded"
          style={{
            background: data.onPace ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)',
            color: data.onPace ? '#10b981' : '#f59e0b',
          }}
        >
          {data.onPace ? 'On Pace ✓' : 'Behind Pace ⚠'}
        </span>
      </div>

      {/* Progress bar */}
      <div>
        <div className="h-2 w-full rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{ width: `${pct}%`, background: '#DC143C' }}
          />
        </div>
        <div className="flex items-center justify-between mt-1">
          <span className="text-[11px] text-muted-foreground">
            {fmt(data.ytdGci)} / {fmt(data.incomeGoal)}
          </span>
          <span className="text-[11px] text-muted-foreground">
            {pct.toFixed(1)}%
          </span>
        </div>
      </div>

      {/* Bottom stats row */}
      <div className="flex items-center justify-between">
        <span className="text-[11px] text-muted-foreground">
          Projected: {fmt(data.projectedYtd)}
        </span>
        <span
          className="text-[11px] font-medium"
          style={{ color: ahead ? '#10b981' : '#f59e0b' }}
        >
          {ahead ? `Ahead: ${fmt(gapAbs)}` : `Gap: ${fmt(gapAbs)}`}
        </span>
      </div>
    </div>
  );
}
