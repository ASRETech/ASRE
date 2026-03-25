/**
 * WeeklyPulseWidget — compact weekly leading indicators for Execution HQ
 * Shows this week's contacts, appointments, listings, closings vs goals.
 */

import { trpc } from '@/lib/trpc';
import { Activity, ArrowRight } from 'lucide-react';
import { Link } from 'wouter';

const METRICS = [
  { key: 'contacts',     label: 'Contacts',     goal: 40 },
  { key: 'appointments', label: 'Appts',         goal: 6 },
  { key: 'listings',     label: 'Listings',      goal: 2 },
  { key: 'closings',     label: 'Closings',      goal: 1 },
];

export function WeeklyPulseWidget() {
  const { data, isLoading } = trpc.execution.getWeeklyStats.useQuery(undefined, {
    staleTime: 60_000,
  });

  const current = data?.current;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-semibold">Weekly Pulse</span>
        </div>
        <Link href="/performance/analytics">
          <span className="text-xs text-[#DC143C] hover:underline cursor-pointer flex items-center gap-1">
            Details <ArrowRight className="w-3 h-3" />
          </span>
        </Link>
      </div>

      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-[#DC143C] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="flex-1 grid grid-cols-2 gap-2">
          {METRICS.map(({ key, label, goal }) => {
            const val = current ? (current as any)[key] ?? 0 : 0;
            const pct = Math.min(100, Math.round((val / goal) * 100));
            const onTrack = pct >= 60;
            return (
              <div
                key={key}
                className="flex flex-col gap-1 p-2 rounded-lg border border-border/50 bg-muted/20"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-muted-foreground">{label}</span>
                  <span
                    className="text-[10px] font-medium"
                    style={{ color: onTrack ? '#10b981' : '#f59e0b' }}
                  >
                    {pct}%
                  </span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-lg font-bold text-foreground">{val}</span>
                  <span className="text-[10px] text-muted-foreground">/ {goal}</span>
                </div>
                <div className="h-1 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${pct}%`,
                      background: onTrack ? '#10b981' : '#f59e0b',
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
