import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, RefreshCw } from 'lucide-react';
import { trpc } from '@/lib/trpc';

export function WealthInsights() {
  const { data, isLoading, refetch, isFetching } = trpc.wealth.getAIInsights.useQuery(undefined, {
    staleTime: 5 * 60 * 1000, // cache for 5 minutes
  });

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            Coaching Insights
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
          AI-generated coaching questions based on your current wealth journey status.
          Not financial advice — always consult your CPA and advisors.
        </p>
      </CardHeader>
      <CardContent>
        {isLoading || isFetching ? (
          <div className="space-y-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-12 rounded-lg bg-muted/40 animate-pulse" />
            ))}
          </div>
        ) : data?.insights && data.insights.length > 0 ? (
          <div className="space-y-3">
            {data.insights.map((insight: string, i: number) => (
              <div key={i} className="flex gap-3 p-3 rounded-lg bg-muted/30 border border-border/50">
                <div className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                  {i + 1}
                </div>
                <p className="text-sm leading-relaxed">{insight}</p>
              </div>
            ))}
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
