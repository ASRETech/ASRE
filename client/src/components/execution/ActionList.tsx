/**
 * ActionList.tsx
 *
 * Renders the prioritized action list with completion buttons.
 * Drives the behavior loop: See Actions → Execute → Complete → Score ↑
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Circle, ChevronRight, Zap } from 'lucide-react';
import { toast } from 'sonner';
import { trpc } from '@/lib/trpc';

interface ExecutionAction {
  id: string;
  type: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  points: number;
  completed?: boolean;
}

interface ActionListProps {
  actions: ExecutionAction[];
  isLoading?: boolean;
  onActionCompleted?: () => void;
}

const PRIORITY_STYLES: Record<string, string> = {
  high: 'bg-red-500/10 text-red-500 border-red-500/20',
  medium: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  low: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
};

const PRIORITY_LABELS: Record<string, string> = {
  high: 'High',
  medium: 'Medium',
  low: 'Low',
};

function ActionItem({
  action,
  onComplete,
}: {
  action: ExecutionAction;
  onComplete: (action: ExecutionAction) => void;
}) {
  const [optimisticDone, setOptimisticDone] = useState(false);
  const isDone = action.completed || optimisticDone;

  const handleComplete = () => {
    if (isDone) return;
    setOptimisticDone(true);
    onComplete(action);
  };

  return (
    <div
      className={`flex items-start gap-3 p-3 rounded-lg border transition-all duration-200 ${
        isDone
          ? 'bg-muted/30 border-border/30 opacity-60'
          : 'bg-card border-border hover:border-primary/30 hover:bg-primary/5 cursor-pointer'
      }`}
      onClick={!isDone ? handleComplete : undefined}
    >
      {/* Completion icon */}
      <div className="mt-0.5 shrink-0">
        {isDone ? (
          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
        ) : (
          <Circle className="w-5 h-5 text-muted-foreground/50" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start gap-2 flex-wrap">
          <span
            className={`text-sm font-medium leading-snug ${
              isDone ? 'line-through text-muted-foreground' : 'text-foreground'
            }`}
          >
            {action.title}
          </span>
          <Badge
            variant="outline"
            className={`text-[10px] px-1.5 py-0 shrink-0 ${PRIORITY_STYLES[action.priority]}`}
          >
            {PRIORITY_LABELS[action.priority]}
          </Badge>
        </div>
        {!isDone && (
          <p className="text-xs text-muted-foreground mt-0.5 leading-snug">
            {action.description}
          </p>
        )}
      </div>

      {/* Points + chevron */}
      <div className="flex items-center gap-1.5 shrink-0 mt-0.5">
        <div className="flex items-center gap-0.5 text-xs font-semibold text-primary">
          <Zap className="w-3 h-3" />
          <span>+{action.points}</span>
        </div>
        {!isDone && <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/50" />}
      </div>
    </div>
  );
}

export function ActionList({ actions, isLoading = false, onActionCompleted }: ActionListProps) {
  const utils = trpc.useUtils();
  const completeAction = trpc.execution.completeAction.useMutation({
    onSuccess: (result) => {
      if (result.streakUpdated) {
        toast.success('Streak updated! Keep it going.', { icon: '🔥' });
      } else if (result.qualifiesForStreak) {
        toast.success('Day qualified for streak!', { icon: '✅' });
      } else {
        toast.success('Action completed. Keep executing.', { icon: '⚡' });
      }
      // Invalidate summary to refresh score + streak
      utils.execution.getSummary.invalidate();
      onActionCompleted?.();
    },
    onError: () => {
      toast.error('Failed to record action. Please try again.');
    },
  });

  const handleComplete = (action: ExecutionAction) => {
    completeAction.mutate({
      actionId: action.id,
      actionType: action.type,
      points: action.points,
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-48">
          <div className="animate-pulse text-muted-foreground text-sm">Loading actions...</div>
        </CardContent>
      </Card>
    );
  }

  const incomplete = actions.filter((a) => !a.completed);
  const completed = actions.filter((a) => a.completed);

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Do This Now
          </span>
          <Badge variant="secondary" className="ml-auto text-xs">
            {incomplete.length} remaining
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {incomplete.length === 0 && completed.length > 0 && (
          <div className="text-center py-4">
            <p className="text-sm font-medium text-emerald-500">All actions complete for today!</p>
            <p className="text-xs text-muted-foreground mt-1">
              Come back tomorrow to keep your streak alive.
            </p>
          </div>
        )}

        {incomplete.map((action) => (
          <ActionItem key={action.id} action={action} onComplete={handleComplete} />
        ))}

        {completed.length > 0 && incomplete.length > 0 && (
          <div className="pt-2 border-t border-border/50">
            <p className="text-xs text-muted-foreground mb-2 font-medium">Completed Today</p>
            {completed.map((action) => (
              <ActionItem key={action.id} action={action} onComplete={handleComplete} />
            ))}
          </div>
        )}

        {completed.length > 0 && incomplete.length === 0 && (
          <div className="pt-2 border-t border-border/50">
            <p className="text-xs text-muted-foreground mb-2 font-medium">Completed Today</p>
            {completed.map((action) => (
              <ActionItem key={action.id} action={action} onComplete={handleComplete} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
