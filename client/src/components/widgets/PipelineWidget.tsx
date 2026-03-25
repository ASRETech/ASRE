/**
 * PipelineWidget — compact pipeline snapshot for Execution HQ
 * Shows stage counts and total pipeline value at a glance.
 */

import { trpc } from '@/lib/trpc';
import { Users, ArrowRight } from 'lucide-react';
import { Link } from 'wouter';

const STAGE_COLORS: Record<string, string> = {
  new:         '#6366f1',
  contacted:   '#f59e0b',
  nurturing:   '#3b82f6',
  appointment: '#8b5cf6',
  active:      '#10b981',
  under_contract: '#DC143C',
  closed:      '#22c55e',
};

export function PipelineWidget() {
  const { data, isLoading } = trpc.pipeline.getAll.useQuery(undefined, {
    staleTime: 60_000,
  });

  const leads = data ?? [];
  const total = leads.length;

  // Stage counts
  const stageCounts = leads.reduce<Record<string, number>>((acc, lead) => {
    const s = (lead as any).stage ?? 'new';
    acc[s] = (acc[s] ?? 0) + 1;
    return acc;
  }, {});

  const activeStages = Object.entries(stageCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-semibold">Pipeline</span>
        </div>
        <Link href="/execution/pipeline">
          <span className="text-xs text-[#DC143C] hover:underline cursor-pointer flex items-center gap-1">
            View all <ArrowRight className="w-3 h-3" />
          </span>
        </Link>
      </div>

      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-[#DC143C] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : total === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-xs text-muted-foreground">No leads yet</p>
        </div>
      ) : (
        <div className="flex-1 flex flex-col gap-2">
          {/* Total */}
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-foreground">{total}</span>
            <span className="text-xs text-muted-foreground">total leads</span>
          </div>

          {/* Stage breakdown */}
          <div className="flex flex-col gap-1.5 mt-1">
            {activeStages.map(([stage, count]) => (
              <div key={stage} className="flex items-center gap-2">
                <div
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ background: STAGE_COLORS[stage] ?? '#6b7280' }}
                />
                <div className="flex-1 flex items-center justify-between">
                  <span className="text-xs text-muted-foreground capitalize">
                    {stage.replace(/_/g, ' ')}
                  </span>
                  <span className="text-xs font-medium text-foreground">{count}</span>
                </div>
                {/* Mini bar */}
                <div className="w-16 h-1.5 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${Math.round((count / total) * 100)}%`,
                      background: STAGE_COLORS[stage] ?? '#6b7280',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
