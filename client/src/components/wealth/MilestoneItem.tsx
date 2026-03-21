import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { CheckCircle2, Circle, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import { MILESTONE_META } from '@/lib/wealthConstants';

type MilestoneStatus = 'not_started' | 'in_progress' | 'done';

interface MilestoneItemProps {
  milestoneKey: string;
  status: MilestoneStatus | null;
  notes?: string | null;
  completedDate?: string | null;
  onUpdate: (key: string, status: MilestoneStatus, notes?: string, date?: string) => void;
  isPending?: boolean;
}

const STATUS_CYCLE: Record<string, MilestoneStatus> = {
  not_started: 'in_progress',
  in_progress: 'done',
  done: 'not_started',
};

export function MilestoneItem({ milestoneKey, status, notes, completedDate, onUpdate, isPending }: MilestoneItemProps) {
  const [expanded, setExpanded] = useState(false);
  const [localNotes, setLocalNotes] = useState(notes ?? '');
  const [localDate, setLocalDate] = useState(completedDate ?? '');
  const currentStatus = status ?? 'not_started';
  const meta = MILESTONE_META[milestoneKey];

  const handleStatusClick = () => {
    const next = STATUS_CYCLE[currentStatus];
    onUpdate(milestoneKey, next, localNotes || undefined, localDate || undefined);
  };

  const handleSaveNotes = () => {
    onUpdate(milestoneKey, currentStatus, localNotes || undefined, localDate || undefined);
    setExpanded(false);
  };

  const StatusIcon = currentStatus === 'done'
    ? CheckCircle2
    : currentStatus === 'in_progress'
    ? Clock
    : Circle;

  const statusColor = currentStatus === 'done'
    ? 'text-emerald-400'
    : currentStatus === 'in_progress'
    ? 'text-amber-400'
    : 'text-muted-foreground';

  const statusLabel = currentStatus === 'done' ? 'Done' : currentStatus === 'in_progress' ? 'In Progress' : 'Not Started';

  return (
    <div className={`rounded-lg border transition-colors ${currentStatus === 'done' ? 'border-emerald-500/20 bg-emerald-500/5' : currentStatus === 'in_progress' ? 'border-amber-500/20 bg-amber-500/5' : 'border-border bg-card'}`}>
      <div className="flex items-start gap-3 p-3">
        <button
          onClick={handleStatusClick}
          disabled={isPending}
          className={`mt-0.5 flex-shrink-0 transition-colors hover:opacity-80 ${statusColor}`}
          title={`Click to advance: ${statusLabel} → ${STATUS_CYCLE[currentStatus]}`}
        >
          <StatusIcon className="h-5 w-5" />
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className={`text-sm font-medium ${currentStatus === 'done' ? 'line-through text-muted-foreground' : ''}`}>
                {meta?.label ?? milestoneKey}
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">{meta?.description}</div>
            </div>
            <button
              onClick={() => setExpanded(!expanded)}
              className="flex-shrink-0 text-muted-foreground hover:text-foreground"
            >
              {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
          </div>

          {currentStatus === 'done' && completedDate && (
            <div className="text-xs text-muted-foreground mt-1">Completed: {completedDate}</div>
          )}
          {notes && !expanded && (
            <div className="text-xs text-muted-foreground mt-1 italic truncate">"{notes}"</div>
          )}
        </div>
      </div>

      {expanded && (
        <div className="px-3 pb-3 border-t border-border/50 pt-3 space-y-2">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Completed Date</label>
            <Input
              type="date"
              value={localDate}
              onChange={e => setLocalDate(e.target.value)}
              className="h-7 text-xs"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Notes (for your CPA / advisor conversation)</label>
            <Textarea
              value={localNotes}
              onChange={e => setLocalNotes(e.target.value)}
              placeholder="Add notes about this milestone..."
              className="text-xs min-h-[60px]"
            />
          </div>
          <Button size="sm" className="h-7 text-xs" onClick={handleSaveNotes} disabled={isPending}>
            Save Notes
          </Button>
        </div>
      )}
    </div>
  );
}
