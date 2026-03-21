import { MilestoneItem } from './MilestoneItem';
import { MILESTONE_META, TRACK_NAMES } from '@/lib/wealthConstants';

type MilestoneStatus = 'not_started' | 'in_progress' | 'done';

interface MilestoneListProps {
  trackNumber: number;
  milestones: Array<{
    milestoneKey: string;
    status: string | null;
    notes?: string | null;
    completedDate?: string | null;
  }>;
  onUpdate: (key: string, status: MilestoneStatus, notes?: string, date?: string) => void;
  isPending?: boolean;
}

export function MilestoneList({ trackNumber, milestones, onUpdate, isPending }: MilestoneListProps) {
  // Get all milestone keys for this track from the metadata
  const trackKeys = Object.keys(MILESTONE_META).filter(k => MILESTONE_META[k].track === trackNumber);
  const trackName = TRACK_NAMES[trackNumber] ?? `Track ${trackNumber}`;

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-sm">Track {trackNumber} — {trackName}</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Click the status icon to cycle: Not Started → In Progress → Done
          </p>
        </div>
        <div className="text-xs text-muted-foreground">
          {milestones.filter(m => m.milestoneKey.startsWith(`t${trackNumber}_`) && m.status === 'done').length}/{trackKeys.length} done
        </div>
      </div>

      <div className="space-y-2">
        {trackKeys.map(key => {
          const saved = milestones.find(m => m.milestoneKey === key);
          return (
            <MilestoneItem
              key={key}
              milestoneKey={key}
              status={(saved?.status as MilestoneStatus) ?? 'not_started'}
              notes={saved?.notes}
              completedDate={saved?.completedDate}
              onUpdate={onUpdate}
              isPending={isPending}
            />
          );
        })}
      </div>

      <div className="mt-4 p-3 rounded-lg bg-muted/30 border border-border/50">
        <p className="text-xs text-muted-foreground italic">
          <strong>Coaching boundary:</strong> ASRE surfaces wealth milestones as coaching conversation triggers.
          Always refer to your CPA, estate attorney, or fee-only financial advisor for specific decisions.
        </p>
      </div>
    </div>
  );
}
