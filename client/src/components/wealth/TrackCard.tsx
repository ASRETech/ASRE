import { Progress } from '@/components/ui/progress';
import { Lock } from 'lucide-react';
import { TRACK_MILESTONE_COUNTS, TRACK_NAMES } from '@/lib/wealthConstants';

interface TrackCardProps {
  trackNumber: number;
  milestones: Array<{ milestoneKey: string; status: string | null }>;
  unlocked: boolean;
  selected: boolean;
  onClick: () => void;
}

const TRACK_COLORS: Record<number, string> = {
  1: 'border-blue-500/40 bg-blue-500/5',
  2: 'border-violet-500/40 bg-violet-500/5',
  3: 'border-amber-500/40 bg-amber-500/5',
  4: 'border-emerald-500/40 bg-emerald-500/5',
  5: 'border-rose-500/40 bg-rose-500/5',
};

const TRACK_ACCENT: Record<number, string> = {
  1: 'text-blue-400',
  2: 'text-violet-400',
  3: 'text-amber-400',
  4: 'text-emerald-400',
  5: 'text-rose-400',
};

export function TrackCard({ trackNumber, milestones, unlocked, selected, onClick }: TrackCardProps) {
  const total = TRACK_MILESTONE_COUNTS[trackNumber] ?? 0;
  const trackMilestones = milestones.filter(m => m.milestoneKey.startsWith(`t${trackNumber}_`));
  const done = trackMilestones.filter(m => m.status === 'done').length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  const name = TRACK_NAMES[trackNumber] ?? `Track ${trackNumber}`;

  return (
    <button
      onClick={onClick}
      disabled={!unlocked}
      className={`
        relative w-full rounded-xl border p-3 text-left transition-all
        ${unlocked ? 'cursor-pointer hover:border-primary/50' : 'cursor-not-allowed opacity-50'}
        ${selected && unlocked ? 'ring-2 ring-primary border-primary/60' : ''}
        ${TRACK_COLORS[trackNumber] ?? 'border-border bg-card'}
      `}
    >
      {!unlocked && (
        <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-background/60 backdrop-blur-[1px]">
          <Lock className="h-5 w-5 text-muted-foreground" />
        </div>
      )}
      <div className={`text-xs font-bold mb-1 ${TRACK_ACCENT[trackNumber]}`}>T{trackNumber}</div>
      <div className="text-xs font-semibold leading-tight mb-2">{name}</div>
      <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
        <span>{done}/{total}</span>
        <span>{pct}%</span>
      </div>
      <Progress value={pct} className="h-1" />
    </button>
  );
}
