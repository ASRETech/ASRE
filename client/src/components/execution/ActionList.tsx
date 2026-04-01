/**
 * ActionList.tsx
 *
 * Renders the prioritized action list with completion buttons.
 * Drives the behavior loop: See Actions → Execute → Complete → Score ↑
 *
 * Sprint D Group 3: Action completion microanimations
 *   - Card border flashes #DC143C on complete (checking phase)
 *   - Checkmark scales in via framer-motion
 *   - Card fades out + collapses (framer-motion AnimatePresence)
 *   - "+N XP" pulse indicator fires concurrently
 *   - "All done for today 🔥" banner when last action is completed
 */
import { useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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

// ── XP Pulse indicator — floats up and fades out ──
function XpPulse({ points, onDone }: { points: number; onDone: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 0 }}
      animate={{ opacity: [0, 1, 1, 0], y: [0, -8, -12, -16] }}
      transition={{ duration: 0.9, times: [0, 0.15, 0.7, 1] }}
      onAnimationComplete={onDone}
      style={{
        position: 'absolute',
        top: '-4px',
        right: '12px',
        pointerEvents: 'none',
        zIndex: 50,
        color: '#10b981',
        fontWeight: 700,
        fontSize: '13px',
        letterSpacing: '0.02em',
      }}
    >
      +{points} XP
    </motion.div>
  );
}

// ── Single action card with completion animation ──
function ActionItem({
  action,
  onComplete,
  onXpPulse,
}: {
  action: ExecutionAction;
  onComplete: (action: ExecutionAction) => void;
  onXpPulse: (points: number) => void;
}) {
  // phase: idle → checking (400ms) → exiting (300ms) → done
  const [phase, setPhase] = useState<'idle' | 'checking' | 'exiting' | 'done'>(
    action.completed ? 'done' : 'idle'
  );

  const isDone = action.completed || phase !== 'idle';

  const handleComplete = useCallback(() => {
    if (phase !== 'idle') return;
    setPhase('checking');
    onXpPulse(action.points);
    setTimeout(() => {
      setPhase('exiting');
      onComplete(action);
    }, 400);
    setTimeout(() => setPhase('done'), 750);
  }, [phase, action, onComplete, onXpPulse]);

  const borderColor =
    phase === 'checking'
      ? '#DC143C'
      : isDone
      ? undefined
      : undefined;

  const containerClass = isDone
    ? 'bg-muted/30 border-border/30 opacity-60'
    : 'bg-card border-border hover:border-primary/30 hover:bg-primary/5 cursor-pointer';

  return (
    <motion.div
      layout
      animate={
        phase === 'exiting'
          ? { opacity: 0, maxHeight: 0, marginBottom: 0 }
          : { opacity: 1, maxHeight: 200 }
      }
      transition={{ duration: 0.3, ease: 'easeOut' }}
      style={{ overflow: 'hidden' }}
    >
      <div
        className={`flex items-start gap-3 p-3 rounded-lg border transition-all duration-200 ${containerClass}`}
        style={borderColor ? { borderColor } : undefined}
        onClick={phase === 'idle' ? handleComplete : undefined}
      >
        {/* Completion icon */}
        <div className="mt-0.5 shrink-0">
          {isDone ? (
            <motion.div
              initial={phase === 'checking' ? { scale: 0 } : { scale: 1 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.2, ease: 'backOut' }}
            >
              <CheckCircle2
                className="w-5 h-5"
                style={{ color: phase === 'checking' ? '#DC143C' : '#10b981' }}
              />
            </motion.div>
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
    </motion.div>
  );
}

// ── Main ActionList component ──
export function ActionList({ actions, isLoading = false, onActionCompleted }: ActionListProps) {
  const utils = trpc.useUtils();

  // XP pulse state
  const [xpPulse, setXpPulse] = useState<{ id: number; points: number } | null>(null);

  // "All done" celebration banner
  const [showAllDone, setShowAllDone] = useState(false);

  const completeAction = trpc.execution.completeAction.useMutation({
    onSuccess: (result) => {
      if (result.streakUpdated) {
        toast.success('Streak updated! Keep it going.', { icon: '🔥' });
      } else if (result.qualifiesForStreak) {
        toast.success('Day qualified for streak!', { icon: '✅' });
      } else {
        toast.success('Action completed. Keep executing.', { icon: '⚡' });
      }
      utils.execution.getSummary.invalidate();
      onActionCompleted?.();
    },
    onError: () => {
      toast.error('Failed to record action. Please try again.');
    },
  });

  const handleComplete = useCallback(
    (action: ExecutionAction) => {
      // Check if this was the last incomplete action
      const remainingAfter = actions.filter((a) => !a.completed && a.id !== action.id);
      if (remainingAfter.length === 0) {
        setTimeout(() => {
          setShowAllDone(true);
          setTimeout(() => setShowAllDone(false), 4000);
        }, 500);
      }

      completeAction.mutate({
        actionId: action.id,
        actionType: action.type,
        points: action.points,
      });
    },
    [actions, completeAction]
  );

  const handleXpPulse = useCallback((points: number) => {
    setXpPulse({ id: Date.now(), points });
  }, []);

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
    <Card className="relative">
      {/* XP Pulse overlay */}
      <AnimatePresence>
        {xpPulse && (
          <XpPulse
            key={xpPulse.id}
            points={xpPulse.points}
            onDone={() => setXpPulse(null)}
          />
        )}
      </AnimatePresence>

      <CardHeader className="pb-2">
        {/* "All done" celebration banner */}
        <AnimatePresence>
          {showAllDone && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="mb-2 rounded-md px-3 py-2 text-sm font-semibold text-foreground"
              style={{
                background: 'linear-gradient(90deg, rgba(220,20,60,0.1) 0%, transparent 100%)',
              }}
            >
              All done for today 🔥
            </motion.div>
          )}
        </AnimatePresence>

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
        {incomplete.length === 0 && completed.length > 0 && !showAllDone && (
          <div className="text-center py-4">
            <p className="text-sm font-medium text-emerald-500">All actions complete for today!</p>
            <p className="text-xs text-muted-foreground mt-1">
              Come back tomorrow to keep your streak alive.
            </p>
          </div>
        )}

        <AnimatePresence initial={false}>
          {incomplete.map((action) => (
            <ActionItem
              key={action.id}
              action={action}
              onComplete={handleComplete}
              onXpPulse={handleXpPulse}
            />
          ))}
        </AnimatePresence>

        {completed.length > 0 && (
          <div className="pt-2 border-t border-border/50">
            <p className="text-xs text-muted-foreground mb-2 font-medium">Completed Today</p>
            {completed.map((action) => (
              <ActionItem
                key={action.id}
                action={action}
                onComplete={handleComplete}
                onXpPulse={handleXpPulse}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
