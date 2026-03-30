/**
 * WealthTimeline.tsx — Sprint D
 *
 * Visual timeline of completed wealth milestones and Wealth Wins,
 * merged and sorted by completion date descending.
 * Displayed on the Wealth Journey page as a "Your Story So Far" section.
 */
import { trpc } from '@/lib/trpc';
import { Trophy, CheckCircle2, TrendingUp } from 'lucide-react';
import { MILESTONE_META } from '@/lib/wealthConstants';

const CATEGORY_COLORS: Record<string, string> = {
  milestone: '#DC143C',
  income: '#10b981',
  debt: '#3b82f6',
  investment: '#8b5cf6',
  protection: '#f59e0b',
  mindset: '#06b6d4',
};
const CATEGORY_LABELS: Record<string, string> = {
  milestone: 'Milestone',
  income: 'Income',
  debt: 'Debt',
  investment: 'Investment',
  protection: 'Protection',
  mindset: 'Mindset',
};

interface TimelineItem {
  id: string;
  type: 'milestone' | 'win';
  title: string;
  subtitle?: string;
  date: Date;
  color: string;
  category?: string;
}

export function WealthTimeline() {
  const journeyQuery = trpc.wealth.getJourney.useQuery(undefined, { staleTime: 120_000 });
  const winsQuery = trpc.wealth.listWealthWins.useQuery(undefined, { staleTime: 120_000 });

  const milestones = journeyQuery.data?.milestones ?? [];
  const wins = winsQuery.data ?? [];

  // Build unified timeline
  const items: TimelineItem[] = [];

  // Completed milestones
  milestones
    .filter(m => m.status === 'done' && m.completedDate)
    .forEach(m => {
      const meta = (MILESTONE_META as any)[m.milestoneKey];
      items.push({
        id: `milestone-${m.milestoneKey}`,
        type: 'milestone',
        title: meta?.label ?? m.milestoneKey,
        subtitle: meta?.track ? `Track ${meta.track}` : undefined,
        date: new Date(m.completedDate!),
        color: '#DC143C',
      });
    });

  // Wealth wins
  wins.forEach(w => {
    items.push({
      id: `win-${w.winId}`,
      type: 'win',
      title: w.title,
      subtitle: w.description ?? undefined,
      date: new Date(w.createdAt),
      color: CATEGORY_COLORS[w.category] ?? '#888',
      category: w.category,
    });
  });

  // Sort newest first
  items.sort((a, b) => b.date.getTime() - a.date.getTime());

  const isLoading = journeyQuery.isLoading || winsQuery.isLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="w-6 h-6 border-2 border-[#DC143C] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 gap-3 text-center">
        <div className="w-10 h-10 rounded-full bg-[#DC143C]/10 flex items-center justify-center">
          <TrendingUp className="w-5 h-5 text-[#DC143C]" />
        </div>
        <div>
          <p className="text-sm font-medium text-foreground">Your story starts here</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Complete your first milestone or log a wealth win to begin your timeline.
          </p>
        </div>
      </div>
    );
  }

  // Group by month-year
  const groups: Map<string, TimelineItem[]> = new Map();
  items.forEach(item => {
    const key = item.date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(item);
  });

  return (
    <div className="space-y-6">
      {Array.from(groups.entries()).map(([monthYear, groupItems]) => (
        <div key={monthYear}>
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            {monthYear}
          </p>
          <div className="space-y-2 pl-4 border-l-2 border-border/40">
            {groupItems.map(item => (
              <div
                key={item.id}
                className="relative flex items-start gap-3 pb-2"
              >
                {/* Timeline dot */}
                <div
                  className="absolute -left-[1.35rem] top-1 w-3 h-3 rounded-full border-2 border-background"
                  style={{ background: item.color }}
                />

                {/* Icon */}
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                  style={{ background: item.color + '18' }}
                >
                  {item.type === 'milestone' ? (
                    <CheckCircle2 className="w-3.5 h-3.5" style={{ color: item.color }} />
                  ) : (
                    <Trophy className="w-3.5 h-3.5" style={{ color: item.color }} />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-medium text-foreground">{item.title}</p>
                    {item.category && (
                      <span
                        className="text-[10px] px-1.5 py-0.5 rounded-full font-medium"
                        style={{
                          background: item.color + '18',
                          color: item.color,
                        }}
                      >
                        {CATEGORY_LABELS[item.category] ?? item.category}
                      </span>
                    )}
                    {item.subtitle && item.type === 'milestone' && (
                      <span className="text-[10px] text-muted-foreground">{item.subtitle}</span>
                    )}
                  </div>
                  {item.subtitle && item.type === 'win' && (
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{item.subtitle}</p>
                  )}
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    {item.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
