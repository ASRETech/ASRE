// CurrentLevel — Visual MREA level indicator with progress ring (Phase 6)
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { trpc } from '@/lib/trpc';

const LEVEL_NAMES = [
  'Solo Agent', 'First Admin Hire', "First Buyer's Agent",
  "Multiple Buyer's Agents", 'Listings Specialist', 'Full Team', 'Business Owner',
];

const LEVEL_COLORS = [
  '#6B7280', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444', '#DC143C', '#10B981',
];

export function CurrentLevel() {
  const profileQuery = trpc.profile.get.useQuery();
  const deliverablesQuery = trpc.deliverables.list.useQuery();

  const profile = profileQuery.data;
  const deliverables = deliverablesQuery.data || [];
  const level = profile?.currentLevel ?? 1;
  const levelName = LEVEL_NAMES[level - 1] || 'Unknown';
  const levelColor = LEVEL_COLORS[level - 1] || '#6B7280';

  // Calculate progress within current level
  const levelDeliverables = deliverables.filter((d: any) => d.level === level);
  const completedInLevel = levelDeliverables.filter((d: any) => d.isComplete).length;
  const totalInLevel = levelDeliverables.length || 1;
  const pct = Math.round((completedInLevel / totalInLevel) * 100);

  // SVG ring
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (pct / 100) * circumference;

  return (
    <Card className="p-5">
      <div className="flex items-center gap-4">
        <div className="relative w-20 h-20 shrink-0">
          <svg viewBox="0 0 88 88" className="w-full h-full -rotate-90">
            <circle cx="44" cy="44" r={radius} fill="none"
              stroke="currentColor" className="text-muted/30" strokeWidth="5" />
            <circle cx="44" cy="44" r={radius} fill="none"
              stroke={levelColor} strokeWidth="5"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
              className="transition-all duration-700" />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-mono text-xl font-bold" style={{ color: levelColor }}>
              {level}
            </span>
          </div>
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-display text-sm font-bold">MREA Level {level}</h3>
            <Badge variant="outline" className="text-[10px]" style={{
              borderColor: `${levelColor}40`, color: levelColor,
            }}>
              {levelName}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            {completedInLevel}/{totalInLevel} deliverables complete at this level
          </p>
          <p className="text-[10px] text-muted-foreground mt-1">
            {pct === 100 && level < 7
              ? 'Ready to advance to the next level!'
              : `${100 - pct}% remaining to complete Level ${level}`}
          </p>
        </div>
      </div>
    </Card>
  );
}
