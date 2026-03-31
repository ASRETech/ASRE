// client/src/pages/vision/BusinessJourney.tsx
// Business Excellence Journey — Tracks 10–13 (35 milestones incl. 3 capstones)

import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Lock, ChevronDown, ChevronRight, CheckCircle2, Circle, Clock, Star } from 'lucide-react';
import {
  BUSINESS_MILESTONES,
  BUSINESS_TRACK_NAMES,
  MilestoneMeta,
  getMilestonesByTrack,
  computeTrackProgress,
  isTrackUnlocked,
} from '@/lib/milestonesConstants';

const BUSINESS_TRACKS = [10, 11, 12, 13];

type MilestoneStatus = 'not_started' | 'in_progress' | 'done';

function statusIcon(status: MilestoneStatus) {
  if (status === 'done') return <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />;
  if (status === 'in_progress') return <Clock className="h-4 w-4 text-amber-500 shrink-0" />;
  return <Circle className="h-4 w-4 text-muted-foreground shrink-0" />;
}

function statusBadge(status: MilestoneStatus) {
  if (status === 'done') return <Badge className="bg-green-100 text-green-700 border-green-200">Done</Badge>;
  if (status === 'in_progress') return <Badge className="bg-amber-100 text-amber-700 border-amber-200">In Progress</Badge>;
  return <Badge variant="outline" className="text-muted-foreground">Not Started</Badge>;
}

interface MilestoneRowProps {
  meta: MilestoneMeta;
  completion?: { status: MilestoneStatus; notes?: string | null };
  onUpdate: (key: string, status: MilestoneStatus, notes?: string) => void;
  isUpdating: boolean;
}

function MilestoneRow({ meta, completion, onUpdate, isUpdating }: MilestoneRowProps) {
  const [open, setOpen] = useState(false);
  const [notes, setNotes] = useState(completion?.notes ?? '');
  const status: MilestoneStatus = (completion?.status as MilestoneStatus) ?? 'not_started';

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger asChild>
        <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors">
          {statusIcon(status)}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <p className="text-sm font-medium leading-tight">{meta.label}</p>
              {meta.isCapstone && (
                <Star className="h-3 w-3 text-amber-500 shrink-0" aria-label="Stretch Capstone" />
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{meta.description}</p>
          </div>
          {statusBadge(status)}
          {open ? <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" /> : <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />}
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="px-3 pb-4 space-y-3">
          <div className="bg-muted/40 rounded-md p-3 text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">Done when: </span>{meta.doneCriterion}
          </div>
          <Select
            value={status}
            onValueChange={(val) => onUpdate(meta.key, val as MilestoneStatus, notes)}
            disabled={isUpdating}
          >
            <SelectTrigger className="w-36 h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="not_started">Not Started</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="done">Done</SelectItem>
            </SelectContent>
          </Select>
          <Textarea
            placeholder="Notes (optional)..."
            className="text-xs min-h-[60px] resize-none"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            onBlur={() => {
              if (notes !== (completion?.notes ?? '')) {
                onUpdate(meta.key, status, notes);
              }
            }}
          />
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

export default function BusinessJourney() {
  const { toast } = useToast();
  const { data, isLoading, refetch } = trpc.businessJourney.getJourney.useQuery();
  const updateMutation = trpc.businessJourney.updateMilestone.useMutation({
    onSuccess: () => refetch(),
    onError: (e) => toast({ title: 'Error', description: e.message, variant: 'destructive' }),
  });

  const completions: Array<{ milestoneKey: string; status: string | null; notes?: string | null }> = data?.milestones ?? [];
  const healthScore = data?.healthScore ?? 0;

  const getCompletion = (key: string) => {
    const m = completions.find(c => c.milestoneKey === key);
    return m ? { status: m.status as MilestoneStatus, notes: m.notes } : undefined;
  };

  const handleUpdate = (key: string, status: MilestoneStatus, notes?: string) => {
    updateMutation.mutate({ milestoneKey: key, status, notes });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground text-sm">
        Loading Business Journey...
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">Business Excellence Journey</h1>
        <p className="text-muted-foreground text-sm">
          35 milestones across 4 tracks, including 3 stretch capstones. Track 12 requires $100K GCI + 4 Track 11 completions to unlock.
        </p>
      </div>

      {/* Overall score */}
      <Card>
        <CardContent className="pt-5 pb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Business Health Score</span>
            <span className="text-2xl font-bold">{healthScore}<span className="text-base font-normal text-muted-foreground">/100</span></span>
          </div>
          <Progress value={healthScore} className="h-2" />
          <div className="flex items-center justify-between mt-2">
            <p className="text-xs text-muted-foreground">
              {completions.filter(m => m.status === 'done').length} of 35 milestones completed
            </p>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Star className="h-3 w-3 text-amber-500" />
              <span>= Stretch Capstone</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tracks */}
      {BUSINESS_TRACKS.map((track) => {
        const trackMilestones = getMilestonesByTrack(BUSINESS_MILESTONES, track);
        const progress = computeTrackProgress(BUSINESS_MILESTONES, completions, track);
        const unlocked = isTrackUnlocked('business', track, completions);

        // Separate capstones from regular milestones for Track 13
        const regularMilestones = trackMilestones.filter(m => !m.isCapstone);
        const capstoneMilestones = trackMilestones.filter(m => m.isCapstone);

        return (
          <Card key={track} className={!unlocked ? 'opacity-60' : ''}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {!unlocked && <Lock className="h-4 w-4 text-muted-foreground" />}
                  <CardTitle className="text-base">
                    Track {track} — {BUSINESS_TRACK_NAMES[track]}
                  </CardTitle>
                </div>
                <div className="text-right">
                  <span className="text-sm font-semibold">{progress.done}/{progress.total}</span>
                  <span className="text-xs text-muted-foreground ml-1">done</span>
                </div>
              </div>
              <Progress value={progress.pct} className="h-1.5 mt-2" />
              {!unlocked && track === 12 && (
                <p className="text-xs text-muted-foreground mt-1">
                  Requires ≥ 4 Track 11 milestones done AND $100K GCI achieved.
                </p>
              )}
              {!unlocked && track !== 12 && (
                <p className="text-xs text-muted-foreground mt-1">
                  Complete ≥ 4 milestones in Track {track - 1} to unlock this track.
                </p>
              )}
            </CardHeader>
            {unlocked && (
              <CardContent className="pt-0">
                <div className="divide-y divide-border">
                  {regularMilestones.map((meta) => (
                    <MilestoneRow
                      key={meta.key}
                      meta={meta}
                      completion={getCompletion(meta.key)}
                      onUpdate={handleUpdate}
                      isUpdating={updateMutation.isPending}
                    />
                  ))}
                </div>

                {capstoneMilestones.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-amber-200/60">
                    <div className="flex items-center gap-1.5 mb-2 px-3">
                      <Star className="h-3.5 w-3.5 text-amber-500" />
                      <span className="text-xs font-semibold text-amber-700">Stretch Capstones</span>
                    </div>
                    <div className="divide-y divide-border">
                      {capstoneMilestones.map((meta) => (
                        <MilestoneRow
                          key={meta.key}
                          meta={meta}
                          completion={getCompletion(meta.key)}
                          onUpdate={handleUpdate}
                          isUpdating={updateMutation.isPending}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            )}
          </Card>
        );
      })}
    </div>
  );
}
