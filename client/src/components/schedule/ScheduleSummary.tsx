import { useMemo } from "react";
import { BarChart3 } from "lucide-react";

interface Bucket {
  key: string;
  label: string;
  color: string;
}

interface ScheduleSummaryProps {
  grid: string[][];
  buckets: Bucket[];
}

export function ScheduleSummary({ grid, buckets }: ScheduleSummaryProps) {
  const summary = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const day of grid) {
      for (const slot of day) {
        if (slot) counts[slot] = (counts[slot] ?? 0) + 1;
      }
    }
    // Convert 30-min slots to hours
    return Object.entries(counts)
      .map(([key, slots]) => ({ key, hours: slots * 0.5 }))
      .sort((a, b) => b.hours - a.hours);
  }, [grid]);

  const totalHours = summary.reduce((sum, s) => sum + s.hours, 0);

  if (summary.length === 0) {
    return (
      <div className="text-center py-6 text-muted-foreground/70 text-sm">
        <BarChart3 className="w-6 h-6 mx-auto mb-2 opacity-30" />
        Paint your schedule to see the summary.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Weekly Hours</p>
        <span className="text-xs text-muted-foreground/70">{totalHours}h total</span>
      </div>
      {summary.map(({ key, hours }) => {
        const bucket = buckets.find(b => b.key === key);
        if (!bucket) return null;
        const pct = totalHours > 0 ? (hours / totalHours) * 100 : 0;
        return (
          <div key={key}>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: bucket.color }} />
                <span className="text-xs text-foreground/80">{bucket.label}</span>
              </div>
              <span className="text-xs text-muted-foreground">{hours}h</span>
            </div>
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${pct}%`, backgroundColor: bucket.color }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
