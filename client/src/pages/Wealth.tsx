/**
 * Wealth.tsx — v12
 *
 * Full T1–T5 roadmap always visible. Locked tracks are previewable but not interactive.
 * Landscape-optimized layout.
 */
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { WealthHero } from '@/components/wealth/WealthHero';
import { MilestoneList } from '@/components/wealth/MilestoneList';
import { FICalculator } from '@/components/wealth/FICalculator';
import { WealthInsights } from '@/components/wealth/WealthInsights';
import { InvestmentProperties } from '@/components/wealth/InvestmentProperties';
import { Progress } from '@/components/ui/progress';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';
import { Lock, CheckCircle2 } from 'lucide-react';
import { TRACK_NAMES, TRACK_MILESTONE_COUNTS } from '@/lib/wealthConstants';

type MilestoneStatus = 'not_started' | 'in_progress' | 'done';

const TRACK_THEMES: Record<number, string> = {
  1: 'Protect your income, separate finances, and build your safety net.',
  2: 'Structure your business for liability protection and tax efficiency.',
  3: 'Maximize legal deductions and build a wealth allocation system.',
  4: 'Invest systematically and build passive income toward FI.',
  5: 'Achieve financial independence and build a lasting legacy.',
};

const TRACK_UNLOCK: Record<number, string> = {
  1: 'Always unlocked — start here',
  2: 'Complete T1 foundation milestones',
  3: 'Reach $80K income + T2 progress',
  4: 'Reach $100K income + T2 complete',
  5: 'Reach $250K income + T1 mastery',
};

const TRACK_COLORS: Record<number, { accent: string; bg: string; border: string; ring: string }> = {
  1: { accent: '#3b82f6', bg: 'rgba(59,130,246,0.07)', border: 'rgba(59,130,246,0.25)', ring: 'rgba(59,130,246,0.5)' },
  2: { accent: '#8b5cf6', bg: 'rgba(139,92,246,0.07)', border: 'rgba(139,92,246,0.25)', ring: 'rgba(139,92,246,0.5)' },
  3: { accent: '#f59e0b', bg: 'rgba(245,158,11,0.07)', border: 'rgba(245,158,11,0.25)', ring: 'rgba(245,158,11,0.5)' },
  4: { accent: '#10b981', bg: 'rgba(16,185,129,0.07)', border: 'rgba(16,185,129,0.25)', ring: 'rgba(16,185,129,0.5)' },
  5: { accent: '#f43f5e', bg: 'rgba(244,63,94,0.07)', border: 'rgba(244,63,94,0.25)', ring: 'rgba(244,63,94,0.5)' },
};

export default function Wealth() {
  const utils = trpc.useUtils();
  const [selectedTrack, setSelectedTrack] = useState(1);
  const { data: journey, isLoading } = trpc.wealth.getJourney.useQuery();

  const updateMutation = trpc.wealth.updateMilestone.useMutation({
    onMutate: async (input) => {
      await utils.wealth.getJourney.cancel();
      const prev = utils.wealth.getJourney.getData();
      if (prev) {
        utils.wealth.getJourney.setData(undefined, {
          ...prev,
          milestones: prev.milestones.map(m =>
            m.milestoneKey === input.milestoneKey
              ? { ...m, status: input.status }
              : m
          ),
        });
      }
      return { prev };
    },
    onError: (_err, _input, ctx) => {
      if (ctx?.prev) utils.wealth.getJourney.setData(undefined, ctx.prev);
      toast.error('Failed to update milestone.');
    },
    onSettled: () => {
      utils.wealth.getJourney.invalidate();
    },
  });

  const handleUpdate = (key: string, status: MilestoneStatus, notes?: string, date?: string) => {
    updateMutation.mutate({ milestoneKey: key, status, notes, completedDate: date });
  };

  if (isLoading) {
    return (
      <div className="asre-page asre-page-enter">
        <div className="h-32 rounded-xl bg-muted/40 animate-pulse mb-4" />
        <div className="grid grid-cols-5 gap-3 mb-4">
          {[1,2,3,4,5].map(i => <div key={i} className="h-28 rounded-xl bg-muted/40 animate-pulse" />)}
        </div>
      </div>
    );
  }

  const unlockedTracks = journey?.unlockedTracks ?? [1];
  const milestones = journey?.milestones ?? [];

  return (
    <div className="asre-page asre-page-enter">
      <WealthHero journey={journey} />

      <Tabs defaultValue="milestones" className="space-y-5">
        <TabsList className="bg-muted/50 h-auto">
          <TabsTrigger value="milestones" className="text-sm">Milestones</TabsTrigger>
          <TabsTrigger value="calculator" className="text-sm">FI Calculator</TabsTrigger>
          <TabsTrigger value="properties" className="text-sm">Properties</TabsTrigger>
          <TabsTrigger value="insights" className="text-sm">Insights</TabsTrigger>
        </TabsList>

        {/* MILESTONES TAB */}
        <TabsContent value="milestones">
          {/* Full 5-track roadmap — always visible, locked tracks previewable */}
          <div className="grid grid-cols-5 gap-2.5 mb-5">
            {[1, 2, 3, 4, 5].map(n => {
              const isUnlocked = unlockedTracks.includes(n);
              const isSelected = selectedTrack === n;
              const total = TRACK_MILESTONE_COUNTS[n] ?? 0;
              const trackMilestones = milestones.filter(m => m.milestoneKey.startsWith(`t${n}_`));
              const done = trackMilestones.filter(m => m.status === 'done').length;
              const pct = total > 0 ? Math.round((done / total) * 100) : 0;
              const colors = TRACK_COLORS[n];
              const isComplete = isUnlocked && done === total && total > 0;

              return (
                <button
                  key={n}
                  onClick={() => setSelectedTrack(n)}
                  className="relative w-full rounded-xl border p-3 text-left transition-all duration-150"
                  style={{
                    background: isSelected ? colors.bg : 'rgba(255,255,255,0.02)',
                    borderColor: isSelected ? colors.border : 'rgba(255,255,255,0.08)',
                    boxShadow: isSelected ? `0 0 0 2px ${colors.ring}` : 'none',
                    opacity: isUnlocked ? 1 : 0.65,
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div
                      className="text-xs font-black px-1.5 py-0.5 rounded"
                      style={{ background: colors.bg, color: colors.accent, border: `1px solid ${colors.border}` }}
                    >
                      T{n}
                    </div>
                    {!isUnlocked ? (
                      <Lock className="w-3 h-3 text-muted-foreground" />
                    ) : isComplete ? (
                      <CheckCircle2 className="w-3.5 h-3.5" style={{ color: colors.accent }} />
                    ) : null}
                  </div>
                  <div className="text-xs font-semibold text-foreground leading-tight mb-1">
                    {TRACK_NAMES[n]}
                  </div>
                  <div className="text-[10px] text-muted-foreground leading-tight mb-2 hidden sm:block">
                    {TRACK_THEMES[n]}
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-1">
                    <span>{done}/{total} done</span>
                    <span style={{ color: isUnlocked ? colors.accent : undefined }}>{pct}%</span>
                  </div>
                  <Progress value={pct} className="h-1" />
                  {!isUnlocked && (
                    <div className="mt-2 text-[9px] text-muted-foreground leading-tight">
                      {TRACK_UNLOCK[n]}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Detail panel — always shows selected track content */}
          {(() => {
            const isUnlocked = unlockedTracks.includes(selectedTrack);
            const colors = TRACK_COLORS[selectedTrack];
            const total = TRACK_MILESTONE_COUNTS[selectedTrack] ?? 0;
            const trackMilestones = milestones.filter(m => m.milestoneKey.startsWith(`t${selectedTrack}_`));
            const done = trackMilestones.filter(m => m.status === 'done').length;

            return (
              <div className="rounded-xl border border-border overflow-hidden">
                {/* Panel header */}
                <div
                  className="flex items-center justify-between px-5 py-4 border-b border-border"
                  style={{ background: colors.bg }}
                >
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <span
                        className="text-xs font-black px-1.5 py-0.5 rounded"
                        style={{ background: colors.bg, color: colors.accent, border: `1px solid ${colors.border}` }}
                      >
                        T{selectedTrack}
                      </span>
                      <h3 className="font-display font-bold text-foreground" style={{ fontSize: '1rem' }}>
                        {TRACK_NAMES[selectedTrack]}
                      </h3>
                      {!isUnlocked && (
                        <span className="flex items-center gap-1 text-[10px] text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full">
                          <Lock className="w-2.5 h-2.5" /> Locked — preview only
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{TRACK_THEMES[selectedTrack]}</p>
                  </div>
                  <div className="text-right shrink-0 ml-4">
                    <div className="font-mono font-bold" style={{ color: colors.accent, fontSize: '1.25rem' }}>
                      {done}/{total}
                    </div>
                    <div className="text-[10px] text-muted-foreground uppercase tracking-wider">milestones</div>
                  </div>
                </div>

                {/* Locked preview notice */}
                {!isUnlocked && (
                  <div className="px-5 py-3 border-b border-border bg-muted/20 flex items-center gap-3">
                    <Lock className="w-4 h-4 text-muted-foreground shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Track {selectedTrack} is locked</p>
                      <p className="text-xs text-muted-foreground">
                        Unlock criteria: {TRACK_UNLOCK[selectedTrack]}. Milestones are visible for planning purposes.
                      </p>
                    </div>
                  </div>
                )}

                {/* Milestone list — always rendered, pointer-events disabled if locked */}
                <div className={!isUnlocked ? 'opacity-55 pointer-events-none select-none' : ''}>
                  <MilestoneList
                    trackNumber={selectedTrack}
                    milestones={milestones.map(m => ({
                      ...m,
                      completedDate: m.completedDate ? String(m.completedDate) : null,
                    }))}
                    onUpdate={handleUpdate}
                    isPending={updateMutation.isPending}
                  />
                </div>
              </div>
            );
          })()}
        </TabsContent>

        {/* FI CALCULATOR TAB */}
        <TabsContent value="calculator">
          <FICalculator />
        </TabsContent>

        {/* PROPERTIES TAB */}
        <TabsContent value="properties">
          <InvestmentProperties />
        </TabsContent>

        {/* INSIGHTS TAB */}
        <TabsContent value="insights">
          <WealthInsights />
        </TabsContent>
      </Tabs>
    </div>
  );
}
