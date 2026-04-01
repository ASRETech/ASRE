/**
 * CoachingNudge.tsx — Sprint D Group 1
 *
 * Displays an AI-generated 1-2 sentence coaching observation on Execution HQ.
 * Calls getCoachingNudge tRPC procedure (cached per user per day).
 */
import { Sparkles } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { trpc } from '@/lib/trpc';

export function CoachingNudge() {
  const { data, isLoading, isError } = trpc.execution.getCoachingNudge.useQuery(undefined, {
    staleTime: 5 * 60 * 1000, // 5 minutes — cached server-side per day anyway
    retry: 1,
  });

  if (isError || (!isLoading && !data?.nudge)) return null;

  if (isLoading) {
    return (
      <div className="w-full">
        <Skeleton className="h-12 w-full rounded-lg" />
      </div>
    );
  }

  return (
    <div
      className="w-full rounded-lg p-3 bg-muted/30"
      style={{ borderLeft: '2px solid rgba(220,20,60,0.4)' }}
    >
      <div className="flex items-center gap-1.5 mb-1.5">
        <Sparkles
          className="w-3.5 h-3.5 shrink-0"
          style={{ color: 'rgba(220,20,60,0.6)' }}
        />
        <span
          className="font-medium tracking-widest"
          style={{
            fontSize: '10px',
            textTransform: 'uppercase',
            color: 'oklch(0.5 0.01 250)',
          }}
        >
          ASRE Insight
        </span>
      </div>
      <p
        className="text-muted-foreground leading-snug"
        style={{ fontSize: '13px' }}
      >
        {data?.nudge}
      </p>
    </div>
  );
}
