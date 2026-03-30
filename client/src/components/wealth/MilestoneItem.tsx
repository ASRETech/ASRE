/**
 * MilestoneItem.tsx — Sprint D
 *
 * Enhanced with:
 * - Context cards: "Why It Matters" and "First Step" from MILESTONE_META
 * - Blocker note field for in_progress milestones
 * - Wealth Win capture on milestone completion
 */
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import {
  CheckCircle2, Circle, Clock, ChevronDown, ChevronUp,
  Lightbulb, ArrowRight, AlertTriangle, Trophy,
} from 'lucide-react';
import { MILESTONE_META } from '@/lib/wealthConstants';
import { trpc } from '@/lib/trpc';
import { nanoid } from 'nanoid';
import { toast } from 'sonner';

type MilestoneStatus = 'not_started' | 'in_progress' | 'done';

interface MilestoneItemProps {
  milestoneKey: string;
  status: MilestoneStatus | null;
  notes?: string | null;
  completedDate?: string | null;
  blockerNote?: string | null;
  onUpdate: (key: string, status: MilestoneStatus, notes?: string, date?: string, blockerNote?: string | null) => void;
  isPending?: boolean;
}

const STATUS_CYCLE: Record<string, MilestoneStatus> = {
  not_started: 'in_progress',
  in_progress: 'done',
  done: 'not_started',
};

export function MilestoneItem({
  milestoneKey, status, notes, completedDate, blockerNote, onUpdate, isPending,
}: MilestoneItemProps) {
  const [expanded, setExpanded] = useState(false);
  const [localNotes, setLocalNotes] = useState(notes ?? '');
  const [localDate, setLocalDate] = useState(completedDate ?? '');
  const [localBlocker, setLocalBlocker] = useState(blockerNote ?? '');
  const [showContext, setShowContext] = useState(false);
  const currentStatus = status ?? 'not_started';
  const meta = MILESTONE_META[milestoneKey];

  // Wealth Win mutation — fires when milestone is marked done
  const addWealthWin = trpc.wealth.addWealthWin.useMutation({
    onSuccess: () => toast.success('Wealth Win logged to your Journey!'),
  });

  const handleStatusClick = () => {
    const next = STATUS_CYCLE[currentStatus];
    onUpdate(milestoneKey, next, localNotes || undefined, localDate || undefined, localBlocker || null);

    // Auto-log a Wealth Win when completing a milestone
    if (next === 'done' && meta) {
      addWealthWin.mutate({
        title: `Completed: ${meta.label}`,
        category: 'milestone',
        milestoneKey,
      });
    }
  };

  const handleSaveNotes = () => {
    onUpdate(
      milestoneKey,
      currentStatus,
      localNotes || undefined,
      localDate || undefined,
      localBlocker || null,
    );
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

  const statusLabel = currentStatus === 'done'
    ? 'Done'
    : currentStatus === 'in_progress'
    ? 'In Progress'
    : 'Not Started';

  return (
    <div className={`rounded-lg border transition-colors ${
      currentStatus === 'done'
        ? 'border-emerald-500/20 bg-emerald-500/5'
        : currentStatus === 'in_progress'
        ? 'border-amber-500/20 bg-amber-500/5'
        : 'border-border bg-card'
    }`}>
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
            <div className="flex-1 min-w-0">
              <div className={`text-sm font-medium ${currentStatus === 'done' ? 'line-through text-muted-foreground' : ''}`}>
                {meta?.label ?? milestoneKey}
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">{meta?.description}</div>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              {/* Context card toggle */}
              {meta?.whyItMatters && (
                <button
                  onClick={() => setShowContext(c => !c)}
                  className="p-1 rounded text-muted-foreground hover:text-[#DC143C] transition-colors"
                  title="Why it matters + First step"
                >
                  <Lightbulb className="h-3.5 w-3.5" />
                </button>
              )}
              <button
                onClick={() => setExpanded(!expanded)}
                className="flex-shrink-0 text-muted-foreground hover:text-foreground p-1"
              >
                {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {currentStatus === 'done' && completedDate && (
            <div className="flex items-center gap-1.5 mt-1">
              <Trophy className="w-3 h-3 text-emerald-500" />
              <span className="text-xs text-muted-foreground">Completed: {completedDate}</span>
            </div>
          )}
          {notes && !expanded && (
            <div className="text-xs text-muted-foreground mt-1 italic truncate">"{notes}"</div>
          )}
          {/* Blocker badge */}
          {currentStatus === 'in_progress' && blockerNote && !expanded && (
            <div className="flex items-center gap-1 mt-1">
              <AlertTriangle className="w-3 h-3 text-amber-500 shrink-0" />
              <span className="text-xs text-amber-600 dark:text-amber-400 truncate">{blockerNote}</span>
            </div>
          )}
        </div>
      </div>

      {/* Context Card — Why It Matters + First Step */}
      {showContext && meta?.whyItMatters && (
        <div className="mx-3 mb-3 rounded-lg border border-[#DC143C]/15 bg-[#DC143C]/[0.03] p-3 space-y-3">
          <div>
            <p className="text-[10px] font-semibold text-[#DC143C] uppercase tracking-wider mb-1">
              Why It Matters
            </p>
            <p className="text-xs text-foreground leading-relaxed">{meta.whyItMatters}</p>
          </div>
          {meta.firstStep && (
            <div>
              <p className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                <ArrowRight className="w-3 h-3" /> First Step
              </p>
              <p className="text-xs text-foreground leading-relaxed">{meta.firstStep}</p>
            </div>
          )}
        </div>
      )}

      {/* Expanded edit panel */}
      {expanded && (
        <div className="px-3 pb-3 border-t border-border/50 pt-3 space-y-3">
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
            <label className="text-xs text-muted-foreground mb-1 block">
              Notes (for your CPA / advisor conversation)
            </label>
            <Textarea
              value={localNotes}
              onChange={e => setLocalNotes(e.target.value)}
              placeholder="Add notes about this milestone..."
              className="text-xs min-h-[60px]"
            />
          </div>
          {/* Blocker note — only shown for in_progress */}
          {currentStatus === 'in_progress' && (
            <div>
              <label className="text-xs text-amber-600 dark:text-amber-400 mb-1 block flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> Blocker (optional)
              </label>
              <Input
                value={localBlocker}
                onChange={e => setLocalBlocker(e.target.value)}
                placeholder="What's blocking progress? e.g. 'Waiting on CPA appointment'"
                className="h-7 text-xs border-amber-500/30 focus:border-amber-500"
                maxLength={500}
              />
            </div>
          )}
          <Button size="sm" className="h-7 text-xs" onClick={handleSaveNotes} disabled={isPending}>
            Save
          </Button>
        </div>
      )}
    </div>
  );
}
