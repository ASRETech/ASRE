/**
 * WealthWidget — compact wealth progress for Execution HQ
 * Shows Freedom Number, % progress, and milestone count.
 */

import { trpc } from '@/lib/trpc';
import { TrendingUp, ArrowRight } from 'lucide-react';
import { Link } from 'wouter';

export function WealthWidget() {
  const { data, isLoading } = trpc.wealth.getJourney.useQuery(undefined, {
    staleTime: 120_000,
  });

  const milestones = data?.milestones ?? [];
  const totalMilestones = milestones.length;
  const doneMilestones = milestones.filter((m: any) => m.status === 'done').length;
  const progressPct = totalMilestones > 0
    ? Math.round((doneMilestones / totalMilestones) * 100)
    : 0;

  const profile = data?.profile as any;
  const freedomNumber = profile?.freedomNumber ?? null;
  const currentPassiveIncome = profile?.currentPassiveIncome ?? 0;
  const freedomPct = freedomNumber && freedomNumber > 0
    ? Math.min(100, Math.round((currentPassiveIncome / freedomNumber) * 100))
    : null;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-semibold">Wealth Journey</span>
        </div>
        <Link href="/vision/wealth">
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
        <div className="flex-1 flex flex-col gap-3">
          {/* Freedom Number */}
          {freedomNumber ? (
            <div className="flex flex-col gap-1">
              <span className="text-[11px] text-muted-foreground">Freedom Number</span>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-bold text-foreground">
                  ${(freedomNumber / 100).toLocaleString()}
                  <span className="text-xs font-normal text-muted-foreground">/mo</span>
                </span>
              </div>
              {freedomPct !== null && (
                <div className="flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-muted-foreground">Passive income progress</span>
                    <span className="text-[10px] font-medium" style={{ color: '#DC143C' }}>{freedomPct}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${freedomPct}%`, background: '#DC143C' }}
                    />
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-1">
              <span className="text-[11px] text-muted-foreground">Freedom Number</span>
              <Link href="/vision/wealth">
                <span className="text-xs text-[#DC143C] hover:underline cursor-pointer">
                  Set your freedom number →
                </span>
              </Link>
            </div>
          )}

          {/* Milestone progress */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-muted-foreground">Milestones</span>
              <span className="text-[11px] font-medium text-foreground">
                {doneMilestones}/{totalMilestones}
              </span>
            </div>
            <div className="h-1.5 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${progressPct}%`,
                  background: progressPct >= 70 ? '#10b981' : progressPct >= 30 ? '#f59e0b' : '#DC143C',
                }}
              />
            </div>
            <span className="text-[10px] text-muted-foreground">{progressPct}% complete</span>
          </div>
        </div>
      )}
    </div>
  );
}
