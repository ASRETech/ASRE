/**
 * FinancialWidget — compact financial snapshot for Execution HQ
 * Shows GCI YTD, projected annual, and Profit First allocations.
 */

import { trpc } from '@/lib/trpc';
import { DollarSign, ArrowRight } from 'lucide-react';
import { Link } from 'wouter';

function fmt(cents: number) {
  const dollars = cents / 100;
  if (dollars >= 1_000_000) return `$${(dollars / 1_000_000).toFixed(1)}M`;
  if (dollars >= 1_000) return `$${(dollars / 1_000).toFixed(0)}K`;
  return `$${dollars.toFixed(0)}`;
}

export function FinancialWidget() {
  const { data, isLoading } = trpc.wealth.getJourney.useQuery(undefined, {
    staleTime: 120_000,
  });

  // Pull GCI from weekly stats for a quick snapshot
  const { data: weeklyData } = trpc.execution.getWeeklyStats.useQuery(undefined, {
    staleTime: 60_000,
  });

  // Sum GCI from last 12 weeks as YTD proxy
  const gciYTDCents = weeklyData?.history?.reduce((sum, w) => sum + (w.gciCents ?? 0), 0) ?? 0;
  const closings = weeklyData?.history?.reduce((sum, w) => sum + (w.closings ?? 0), 0) ?? 0;

  const healthScore = data?.healthScore ?? 0;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-semibold">Financials</span>
        </div>
        <Link href="/performance/financials">
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
          {/* GCI YTD */}
          <div className="flex flex-col">
            <span className="text-[11px] text-muted-foreground">GCI (12-wk)</span>
            <span className="text-2xl font-bold text-foreground">
              {gciYTDCents > 0 ? fmt(gciYTDCents) : '—'}
            </span>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col p-2 rounded-lg border border-border/50 bg-muted/20">
              <span className="text-[10px] text-muted-foreground">Closings</span>
              <span className="text-lg font-bold text-foreground">{closings}</span>
            </div>
            <div className="flex flex-col p-2 rounded-lg border border-border/50 bg-muted/20">
              <span className="text-[10px] text-muted-foreground">Wealth Health</span>
              <span
                className="text-lg font-bold"
                style={{ color: healthScore >= 70 ? '#10b981' : healthScore >= 40 ? '#f59e0b' : '#ef4444' }}
              >
                {healthScore}
              </span>
            </div>
          </div>

          {/* Health bar */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-muted-foreground">Wealth Health Score</span>
              <span className="text-[10px] font-medium text-foreground">{healthScore}/100</span>
            </div>
            <div className="h-1.5 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${healthScore}%`,
                  background: healthScore >= 70 ? '#10b981' : healthScore >= 40 ? '#f59e0b' : '#ef4444',
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
