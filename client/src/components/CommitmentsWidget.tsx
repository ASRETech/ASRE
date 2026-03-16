// CommitmentsWidget — Agent-side view of coaching commitments (Phase 6)
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Circle, ClipboardList } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';

export function CommitmentsWidget() {
  const commitmentsQuery = trpc.coachPortal.myCommitments.useQuery();
  const completeMutation = trpc.coachPortal.completeCommitment.useMutation({
    onSuccess: () => {
      commitmentsQuery.refetch();
      toast.success('Commitment marked complete!');
    },
  });

  const commitments = commitmentsQuery.data || [];
  const pending = commitments.filter((c: any) => !c.isComplete);
  const completed = commitments.filter((c: any) => c.isComplete);

  if (commitments.length === 0) {
    return (
      <Card className="p-5">
        <div className="flex items-center gap-2 mb-3">
          <ClipboardList className="w-4 h-4 text-[#DC143C]" />
          <h3 className="font-display text-sm font-semibold">Coaching Commitments</h3>
        </div>
        <p className="text-xs text-muted-foreground text-center py-4">
          No commitments yet. Your coach will assign commitments after sessions.
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <ClipboardList className="w-4 h-4 text-[#DC143C]" />
          <h3 className="font-display text-sm font-semibold">Coaching Commitments</h3>
        </div>
        <Badge variant="outline" className="text-[10px]">
          {completed.length}/{commitments.length} done
        </Badge>
      </div>

      <div className="space-y-2">
        {pending.map((c: any) => (
          <div key={c.commitmentId}
            className="flex items-start gap-2 p-2 rounded-lg hover:bg-muted/30 transition-colors group">
            <button
              className="mt-0.5 shrink-0"
              onClick={() => completeMutation.mutate({ commitmentId: c.commitmentId })}
              disabled={completeMutation.isPending}>
              <Circle className="w-4 h-4 text-muted-foreground group-hover:text-[#DC143C] transition-colors" />
            </button>
            <div className="flex-1">
              <p className="text-xs">{c.text}</p>
              {c.dueDate && (
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  Due: {new Date(c.dueDate).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
        ))}
        {completed.slice(0, 3).map((c: any) => (
          <div key={c.commitmentId}
            className="flex items-start gap-2 p-2 rounded-lg opacity-60">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
            <p className="text-xs line-through">{c.text}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}
