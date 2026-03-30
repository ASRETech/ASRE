/**
 * WealthInsights.tsx — Sprint D
 *
 * Upgraded from static coaching insights to the Next Best Move engine.
 * Shows: prioritized single next action, why it matters, + 2 supporting insights.
 */
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, RefreshCw, ArrowRight, Lightbulb } from 'lucide-react';
import { trpc } from '@/lib/trpc';

export function WealthInsights() {
  const { data, isLoading, refetch, isFetching } = trpc.wealth.getNextBestMove.useQuery(undefined, {
    staleTime: 5 * 60 * 1000,
  });

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-[#DC143C]" />
            Next Best Move
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs"
            onClick={() => refetch()}
            disabled={isFetching}
          >
            <RefreshCw className={`h-3 w-3 mr-1 ${isFetching ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          AI coaching based on your current wealth journey. Not financial advice — consult your CPA and advisors.
        </p>
      </CardHeader>
      <CardContent>
        {isLoading || isFetching ? (
          <div className="space-y-3">
            <div className="h-16 rounded-lg bg-muted/40 animate-pulse" />
            <div className="h-10 rounded-lg bg-muted/30 animate-pulse" />
            <div className="h-10 rounded-lg bg-muted/30 animate-pulse" />
          </div>
        ) : data ? (
          <div className="space-y-4">
            {/* Primary Next Best Move */}
            <div className="rounded-xl border border-[#DC143C]/20 bg-[#DC143C]/[0.03] p-4 space-y-2">
              <div className="flex items-start gap-2">
                <div className="w-6 h-6 rounded-full bg-[#DC143C] flex items-center justify-center shrink-0 mt-0.5">
                  <ArrowRight className="w-3.5 h-3.5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-semibold text-[#DC143C] uppercase tracking-wider mb-1">
                    Your Next Best Move
                  </p>
                  <p className="text-sm font-semibold text-foreground leading-snug">
                    {data.nextMove}
                  </p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed pl-8">
                {data.why}
              </p>
            </div>

            {/* Supporting insights */}
            {data.insights && data.insights.length > 0 && (
              <div className="space-y-2">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Supporting Insights
                </p>
                {data.insights.map((insight: string, i: number) => (
                  <div
                    key={i}
                    className="flex gap-3 p-3 rounded-lg bg-muted/30 border border-border/50"
                  >
                    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-muted flex items-center justify-center">
                      <Lightbulb className="w-3 h-3 text-muted-foreground" />
                    </div>
                    <p className="text-xs leading-relaxed text-foreground">{insight}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-6 text-muted-foreground text-sm">
            <Sparkles className="h-8 w-8 mx-auto mb-2 opacity-30" />
            <p>Complete a few milestones to get personalized coaching insights.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
